import { ethers } from "ethers";
import { ERC20 } from "./typechain-types";

export interface ChainProvider {
  provider: ethers.InfuraProvider;
  erc20Token: ERC20;
}
