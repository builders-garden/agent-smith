import { Ethereum } from "./ethereum";

export const getEthClient = (chainId: string) => {
  let rpcUrl = "https://rpc2.sepolia.org";
  if (chainId === "1") {
    rpcUrl = "https://eth.llamarpc.com";
  }
  return new Ethereum(rpcUrl, parseInt(chainId));
};
