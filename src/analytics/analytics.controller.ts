import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { AnalyticsService } from 'src/analytics/analytics.service';
import { ChainService } from 'src/chain/chain.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly chainService: ChainService
  ) { }

  @Get("total-transfer-amount")
  @ApiOperation({
    summary: "Returns the total ERC20 token transfer amount since the start block of the indexer",
  })
  @ApiResponse({
    status: 200,
    description: "Successfuly retrieved total ERC20 token transfer amount",
    type: String
  })
  async getTotalTokenTransferAmount(): Promise<string> {
    return this.analyticsService.getTotalTokenTransferAmount();
  }

  @Get("erc20-interaction/:txHash")
  @ApiOperation({
    summary: "Returns whether a transaction has interacted with the ERC20 token this indexer is tracking",
  })
  @ApiResponse({
    status: 200,
    description: "Successfuly retrieved the result",
    type: Boolean
  })
  @ApiResponse({ status: 400, description: "Invalid transaction hash" })
  @ApiParam({ name: "txHash", type: "string" })
  async erc20Interaction(@Param() params: { txHash: string }): Promise<boolean> {
    return this.chainService.checkPastERC20Interaction(params.txHash);
  }
}
