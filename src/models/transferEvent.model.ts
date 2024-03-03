import { Schema } from "dynamoose";
import { DYNAMOOSE_SETTINGS, Timestamps } from "src/utils/constants";

export interface EventTransferKey {
  id: string;
}

export interface EventTransfer extends EventTransferKey, Timestamps {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  amount: string;
}

export const EventTransferSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true
    },
    txHash: {
      type: String,
      index: {
        name: "GSIEventTransferTxHash",
        type: "global",
        project: true,
      },
    },
    blockNumber: Number,
    from: String,
    to: String,
    amount: String,
  },
  DYNAMOOSE_SETTINGS
);

export const TransferEventDatabaseFactory = {
  name: "transfers",
  useFactory: (_) => {
    return {
      schema: EventTransferSchema,
      options: {
        tableName: "transfers",
      },
    };
  }
};
