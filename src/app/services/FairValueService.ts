import { createPublicClient, formatUnits, http, parseAbi, parseEther, parseUnits, PublicClient } from "viem";
import { ChainInfo, LSTToken } from "../../types/lst";

interface FairValueClient {
    publicClient: PublicClient,
    info: ChainInfo
}



export class FairValueService {
    clients: Map<string, FairValueClient> = new Map();
    
    constructor(chainInfo: ChainInfo[]) { 
        for (let chain of chainInfo) {
            const publicClient = createPublicClient({
                chain: {
                    id: chain.chainId,
                    name: chain.chainName,
                    nativeCurrency: chain.nativeCurrency,
                    rpcUrls: {
                        default: { http: [chain.api ? `${chain.rpc}/${process.env.RPC_KEY}` : chain.rpc] }
                    },
                },
                transport: http()
            })
            this.clients.set(chain.chainName, { publicClient: publicClient, info: chain })
        }
    }

    async getFairValue(chainInfo: ChainInfo, lst: LSTToken): Promise<number> {
        const fairValueClient = this.clients.get(chainInfo.chainName) as FairValueClient
        const fairValue = await fairValueClient.publicClient.readContract({
            abi: lst.abi,
            functionName: lst.functionName,
            address: lst.fairValueAddress as `0x${string}`,
            args: [parseUnits('1', chainInfo.nativeCurrency.decimals)]
        }) as bigint;

        return Number(formatUnits(fairValue, fairValueClient.info.nativeCurrency.decimals))
        
    }
}