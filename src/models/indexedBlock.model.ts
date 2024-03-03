import { Schema } from "dynamoose";
import { DYNAMOOSE_SETTINGS, Timestamps } from "../utils/constants";

export interface IndexedBlockKey {
  blockNumber: number;
}

export interface IndexedBlock extends IndexedBlockKey, Timestamps {
  txCount: number;
  logs?: string;
}

export const IndexedBlocksSchema = new Schema(
  {
    blockNumber: {
      type: Number,
      hashKey: true
    },
    txCount: Number,
    logs: String,
  },
  DYNAMOOSE_SETTINGS
);

export const IndexedBlockDatabaseFactory = {
  name: "indexedBlocks",
  useFactory: (_) => {
    return {
      schema: IndexedBlocksSchema,
      options: {
        tableName: "indexedBlocks",
      },
    };
  }
};
