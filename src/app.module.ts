import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { resolve } from 'path';
import { ChainModule } from './chain/chain.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, '..', `.env.development`),
      isGlobal: true,
    }),
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        local:
          true,
        table: {
          create:
            true,
          update:
            true,
          waitForActive:
          {
            enabled: true,
            check: {
              timeout: 180000,
              frequency: 1000,
            },
          }
        },
      }),
    }),
    ChainModule,
    AnalyticsModule
  ],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule { }
