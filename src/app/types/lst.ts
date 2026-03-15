export interface LSTToken {
  chainName: string,
  nativeSymbol: string,
  symbol: string,
  name: string,
  fairValueAddress: string,
  abi: any,
  functionName: string,
  threshold: number,
  alert?: boolean,
  args: any[]
}

// Request format for monitoring a DEX pair
export interface ChainInfo {
  chainName: string,      // Blockchain network Name
  chainId: number,
  rpc: string,
  api?: boolean,        // Indicates if the RPC requires an API key
  nativeCurrency: { name: string, symbol: string, decimals: number },
  // Stacking Tokens 
};