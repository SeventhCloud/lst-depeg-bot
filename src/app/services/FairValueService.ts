import { createPublicClient, formatUnits, http, PublicClient } from "viem";
import { ChainInfoLifi, LSTTokenLifi } from "../../types/lst";
import logger from "../../infra/logger";

interface FairValueClient {
    publicClient: PublicClient,
    info: ChainInfoLifi
}



export class FairValueService {
    clients: Map<string, FairValueClient> = new Map();
    
    constructor(chainInfo: ChainInfoLifi[]) { 
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

    async getFairValue(lst: LSTTokenLifi): Promise<number> {
        logger.info(`Getting fair value for ${lst.symbol} on ${lst.chainName}`)
        const fairValueClient = this.clients.get(lst.chainName) as FairValueClient
        const fairValue = await fairValueClient.publicClient.readContract({
            abi: lst.abi,
            functionName: lst.functionName,
            address: lst.fairValueAddress as `0x${string}`,
            args: lst.args
        }) as bigint;

        return Number(formatUnits(fairValue, fairValueClient.info.nativeCurrency.decimals))
        
    }
}