# ERC20 Transfer Event Indexer

## Description

The solution allows you to index and query any ERC20 compliant EVM smart contract.
When initiated it starts two processes:
1. That listens for any new Transfer events emitted by the ERC20 contract address you provided.
2. That starts to index any old block in the range of your provided index block "from" value upto the current block number returned by the node provider.

It also exposes two API endpoints:
1. **GET /analytics/total-transfer-amount**
Sums all of the token transfer amounts in the abovementioned block range
2. **GET /analytics/erc20-interaction/{transactionHash}**
Returns whether a transaction has interacted with the ERC20 contract this indexer is tracking

In case of any subsequent pauses/restarts, the indexer will check its data integrity and fill any potential gaps.

## Prerequisites

- Node with NPM - https://nodejs.org/en/download/current
- Docker - https://docs.docker.com/get-docker/

## Installation

```bash
$ npm install

$ docker-compose up
```

## Env vars configure

 - copy the `.env.example` and rename the copy to `.env.development`
 - replace the values within brackets with your own variables

## Running the app in dev mode

```bash
$ npm run dev
```

## Using the API

The solution will start on port 3000 by default.
Swagger documentation can be accessed on http://localhost:3000/api

## Stay in touch
- Author - [Ivan Kyuchukov](https://www.linkedin.com/in/ivan-kyuchukov/)