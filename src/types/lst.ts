export interface LSTToken {
  symbol: string,
  name: string,
  fairValueAddress: string,
  abi: any,
  functionName: string
  pools: string[],
  threshold: number,
  alert?: boolean
}

// Request format for monitoring a DEX pair
export type ChainInfo = {
  chainName: string;      // Blockchain network ID
  chainId: number;
  rpc: string;
  nativeCurrency: {name: string, symbol: string, decimals: number};
  tokens: LSTToken[];     // Stacking Tokens 
};