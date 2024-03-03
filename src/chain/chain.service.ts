import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Timeout } from "@nestjs/schedule";
import { ContractUnknownEventPayload, ethers } from "ethers";
import { InjectModel, Model } from "nestjs-dynamoose";
import { IndexedBlock, IndexedBlockKey } from "src/models/indexedBlock.model";
import { Summary, SummaryKey } from "src/models/summary.model";
import { TransferEvent } from "src/types/typechain-types/@openzeppelin/contracts/token/ERC20/ERC20";
import { TypedEventLog } from "src/types/typechain-types/common";
import { EventTransfer, EventTransferKey } from "../models/transferEvent.model";
import { ChainProvider } from "../types/chain-provider";
import { CUSTOM_PROVIDERS } from "../utils/constants";

@Injectable()
export class ChainService {
  private readonly logger = new Logger(ChainService.name);

  constructor(
    @Inject(CUSTOM_PROVIDERS.chainProvider)
    private readonly chain: ChainProvider,
    @InjectModel("transfers") private transferEventModel: Model<EventTransfer, EventTransferKey>,
    @InjectModel("indexedBlocks") private indexedBlockModel: Model<IndexedBlock, IndexedBlockKey>,
    @InjectModel("summary") private summaryModel: Model<Summary, SummaryKey>,
    private readonly configService: ConfigService,
  ) { }

  @Timeout(2000)
  private async initLiveIndexing() {
    this.logger.log("Start transfer listener..");
    
    this.chain.erc20Token.on<TransferEvent.Event>(
      this.chain.erc20Token.filters.Transfer,
      async (from, to, amount, info) => {
 
        const { blockNumber, transactionHash, transactionIndex, index: logIndex } = (
          info as TypedEventLog<TransferEvent.Event> &
          ContractUnknownEventPayload
        ).log;

        this.logger.log(
          `Transfer event from: ${from} to: ${to} amount: ${amount} in block ${blockNumber}, tx: ${transactionHash}`
        );

        await this.createUpdateTransferEvent(transactionHash, logIndex, blockNumber, from, to, amount);
        await this.indexedBlockModel.update(
          { blockNumber },
          { $ADD: { txCount: 1 } } // $ADD is atomic operation, avoids dirty data
        );

        await this.calculateTotalTokenAmount();
      }
    );

    this.logger.log("Transfer listener started");
  }

  @Timeout(2000)
  private async initOldBlocksIndexing() {
    this.logger.log("Old blocks indexer started");

    const indexFromBlockNumber = parseInt(this.configService.get<string>("INDEX_FROM_BLOCK"));
    const indexToBlockNumber = await this.chain.provider.getBlockNumber();

    this.indexBlockRange(indexFromBlockNumber, indexToBlockNumber)
      .then(async () => {
        this.logger.log(`Block range ${indexFromBlockNumber}-${indexToBlockNumber} indexed`);
        await this.calculateTotalTokenAmount()
        this.logger.log(`Total amount calculated`);
      })
  }

  private async indexBlockRange(fromBlockNumber: number, toBlockNumber: number): Promise<void[]> {
    const promises = [];
    if (fromBlockNumber <= toBlockNumber) {
      this.logger.log(`Indexing ${toBlockNumber - fromBlockNumber} old blocks in range ${fromBlockNumber}-${toBlockNumber}..`);

      const erc20TokenContractAddress = ethers.getAddress(this.configService.get<string>("ERC20_TOKEN_CONTRACT_ADDRESS"));

      // get all transfer events in the range
      // if this request becomes too large, a manual pagination could be implemented
      // or manual going through all the blocks and their logs; not recommended
      // or maintaining own node :)
      const logs = await this.chain.provider.getLogs({
        fromBlock: fromBlockNumber,
        toBlock: toBlockNumber,
        topics: [ethers.id('Transfer(address,address,uint256)')],
        address: erc20TokenContractAddress
      });

      const indexedBlocks = await this.indexedBlockModel.scan().all().exec();

      for (let i = fromBlockNumber; i <= toBlockNumber; i++) {
        const blockLogs = logs
          .filter(
            log =>
              log.blockNumber === i
              && log.address === erc20TokenContractAddress
          );

        // skip already (fully) indexed
        if (indexedBlocks.find(block => block.blockNumber === i && block.txCount === blockLogs.length)) {
          this.logger.debug(`Block already indexed: ${i}`);
          continue;
        }

        // log discrepancy in indexed block
        // this could happen in case of reorganization or if this indexer was stopped in a middle of indexing
        // for the full support of reorganization handling a more complex logic is needed to store block hashes and compare them, track longest chain, etc.
        if (indexedBlocks.find(block => block.blockNumber === i && block.txCount !== blockLogs.length)) {
          const indexedBlock = indexedBlocks.find(block => block.blockNumber === i);
          this.logger.debug(`Correcting block ${i} logs. Indexed: ${indexedBlock.txCount} but ${blockLogs.length} found in node`);
        }

        // can batch insert these tx for better performance
        blockLogs.map(log => {
          promises.push(
            this.createUpdateTransferEvent(
              log.transactionHash,
              log.index,
              log.blockNumber,
              ethers.toBeHex(log.topics[1], 20),
              ethers.toBeHex(log.topics[2], 20),
              BigInt(log.data)
            )
          )
        })

        promises.push(
          this.indexedBlockModel
            .update({
              blockNumber: i,
              txCount: blockLogs.length,
              logs: JSON.stringify(blockLogs) // for debugging purposes
            })
        );
      }
    }

    return Promise.all(promises);
  }

  private async createUpdateTransferEvent(transactionHash: string, logIndex: number, blockNumber: number, from: string, to: string, amount: bigint) {
    try {
      await this.transferEventModel.update({
        id: `${transactionHash}-${logIndex}`,
        txHash: transactionHash,
        blockNumber,
        from,
        to,
        amount: amount.toString()
      });
    } catch (err) {
      this.logger.error(`Failed to UPDATE transfer event: ${err}, ${err.stack}`);
      throw new Error(`Failed to UPDATE transfer event: ${err.message}`);
    }
  }

  // could be ran as a cron job also; an idea - to provide last recalculation timestamp in the analytics 
  private async calculateTotalTokenAmount() {
    const transferEvents = await this.transferEventModel.scan().all().exec();

    // needed if there's data from old runs ran with different INDEX_FROM_BLOCK value; data could also be cleansed
    const fromBlockNumber = parseInt(this.configService.get<string>("INDEX_FROM_BLOCK"));

    const totalAmount = transferEvents
      .filter(transfer => transfer.blockNumber >= fromBlockNumber)
      .reduce((acc, curr) => acc + BigInt(curr.amount), BigInt(0));

    await this.summaryModel.update({
      id: "totalERC20Amount",
      totalTokenAmount: totalAmount.toString()
    });
  }

  async checkPastERC20Interaction(txHash: string): Promise<boolean> {
    // could also check the db first if the tx is already indexed
    // define what "transaction older than the program is possible" means
    const tx = await this.chain.provider.getTransaction(txHash);
    if (!tx) {
      throw new BadRequestException("Transaction not found");
    }
    const erc20ContractAddress = ethers.getAddress(this.configService.get<string>("ERC20_TOKEN_CONTRACT_ADDRESS"));

    // maybe only the "to"; define what "interacting" means
    return tx.to === erc20ContractAddress || tx.from === erc20ContractAddress;
  }
}