export const CUSTOM_PROVIDERS = {
  chainProvider: 'CHAIN_PROVIDER',
};

export const DYNAMOOSE_SETTINGS = {
  timestamps: {
    createdAt: {
      created: {
        type: {
          value: Number,
        },
      },
    },
    updatedAt: {
      updated: {
        type: {
          value: Number,
        },
      },
    },
  },
};

export interface Timestamps {
  created?: number;
  updated?: number;
}