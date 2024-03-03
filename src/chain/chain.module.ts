import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ethers } from 'ethers';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ChainService } from 'src/chain/chain.service';
import { IndexedBlockDatabaseFactory } from 'src/models/indexedBlock.model';
import { SummaryDatabaseFactory } from 'src/models/summary.model';
import { TransferEventDatabaseFactory } from 'src/models/transferEvent.model';
import { ChainProvider } from 'src/types/chain-provider';
import { ERC20__factory } from 'src/types/typechain-types';
import { CUSTOM_PROVIDERS } from 'src/utils/constants';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DynamooseModule.forFeatureAsync([TransferEventDatabaseFactory]),
    DynamooseModule.forFeatureAsync([IndexedBlockDatabaseFactory]),
    DynamooseModule.forFeatureAsync([SummaryDatabaseFactory])
  ],
  controllers: [],
  providers: [
    ChainService,
    {
      provide: CUSTOM_PROVIDERS.chainProvider,
      useFactory: (configService: ConfigService): ChainProvider => {
        const NETWORK = configService.get<string>('BLOCKCHAIN_NETWORK');
        const INFURA_PROJECT_ID =
          configService.get<string>('INFURA_PROJECT_ID');
        const ERC20_TOKEN_CONTRACT_ADDRESS = configService.get<string>(
          "ERC20_TOKEN_CONTRACT_ADDRESS"
        );
        const provider = new ethers.InfuraProvider(NETWORK, INFURA_PROJECT_ID);
        return {
          provider,
          erc20Token: ERC20__factory.connect(
            ERC20_TOKEN_CONTRACT_ADDRESS,
            provider
          )
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [ChainService]
})
export class ChainModule {}