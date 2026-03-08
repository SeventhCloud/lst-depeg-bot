export interface LSTToken {
  symbol: string,
  name: string,
  fairValueAddress: string,
  abi: any,
  functionName: string
  pools: string[],
  threshold: number,
  alert?: boolean,
  args: any[]
}

// Request format for monitoring a DEX pair
export type ChainInfo = {
  chainName: string;      // Blockchain network ID
  chainId: number;
  rpc: string;
  api?: boolean;        // Indicates if the RPC requires an API key
  nativeCurrency: { name: string, symbol: string, decimals: number };
  tokens: LSTToken[];     // Stacking Tokens 
};


export interface LSTTokenLifi {
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
export interface ChainInfoLifi {
  chainName: string,      // Blockchain network Name
  chainId: number,
  rpc: string,
  api?: boolean,        // Indicates if the RPC requires an API key
  nativeCurrency: { name: string, symbol: string, decimals: number },
     // Stacking Tokens 
};