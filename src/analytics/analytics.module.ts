import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ChainModule } from 'src/chain/chain.module';
import { SummaryDatabaseFactory } from 'src/models/summary.model';
import { TransferEventDatabaseFactory } from 'src/models/transferEvent.model';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([SummaryDatabaseFactory]),
    DynamooseModule.forFeatureAsync([TransferEventDatabaseFactory]),
    ChainModule
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule {}
