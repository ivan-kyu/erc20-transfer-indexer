import { Schema } from "dynamoose";
import { DYNAMOOSE_SETTINGS, Timestamps } from "src/utils/constants";

export interface SummaryKey {
  id: string;
}

export interface Summary extends SummaryKey, Timestamps {
  totalTokenAmount: string;
}

export const SummarySchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true
    },
    totalTokenAmount: String,
  },
  DYNAMOOSE_SETTINGS
);

export const SummaryDatabaseFactory = {
  name: "summary",
  useFactory: (_) => {
    return {
      schema: SummarySchema,
      options: {
        tableName: "summary",
      },
    };
  }
};
