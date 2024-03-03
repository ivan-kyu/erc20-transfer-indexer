import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Summary, SummaryKey } from 'src/models/summary.model';
import { EventTransfer, EventTransferKey } from 'src/models/transferEvent.model';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  
  constructor(
    @InjectModel("summary") private summaryModel: Model<Summary, SummaryKey>,
    @InjectModel("transfers") private transferEventModel: Model<EventTransfer, EventTransferKey>,
  ) {}

  async getTotalTokenTransferAmount(): Promise<string> {
    const summary = await this.summaryModel.get({ id: "totalERC20Amount" });

    // can use ethers.formatUnits to convert to human readable format using the token decimals
    // can provide last recalculation timestamp as well
    return summary?.totalTokenAmount || "-1"; // -1 indicates calculation hasn't run yet
  }
}
