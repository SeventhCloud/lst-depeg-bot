import { createConfig, getQuote, getTokens, TokenTag, type SDKBaseConfig, type Token, type TokensResponse } from "@lifi/sdk";
import { defaultIfEmpty, from, lastValueFrom, mergeMap, of } from "rxjs";
import { catchError } from "rxjs/internal/operators/catchError";
import { filter } from "rxjs/internal/operators/filter";
import { reduce } from "rxjs/internal/operators/reduce";
import { parseUnits } from "viem";
import logger from "../infra/logger";
import type { ChainInfo, LSTToken } from "../types/lst";


class LiFiService {
    private apiKey: string = "";
    private config: SDKBaseConfig = null as any;
    private chainList: ChainInfo[] = null as any;
    private chainTokens: Map<number, Map<string, Token>> = new Map<number, Map<string, Token>>();

    private constructor() { }

    static async create(chainInfo: ChainInfo[]) {
        const service = new LiFiService();
        service.apiKey = process.env.LI_FI_KEY || '';
        service.config = createConfig({
            integrator: "Quotes",
            apiKey: service.apiKey
        });
        service.chainList = chainInfo;
        const tokensResponse: TokensResponse = await getTokens({
            chains: service.chainList.map(chain => chain.chainId),
            minPriceUSD: 15
        });

        // Process the tokens response to create a map of chainId to token address to token details
        for (const [chainIdStr, tokens] of Object.entries(tokensResponse.tokens)) {
            const chainId = Number(chainIdStr);
            const tokenMap = new Map<string, Token>();
            for (const token of tokens) {
                if (tokenMap.has(token.symbol)) {
                    logger.warn(`Duplicate token symbol ${token.name} price: ${token.priceUSD}, skipping...`);
                    continue;
                }
                tokenMap.set(token.symbol, token);
            }
            service.chainTokens.set(chainId, tokenMap);
        }

        return service;
    }

    async getQuoteAllChains(lst: LSTToken, amount: string = parseUnits("1", 16).toString()) {
        const fromToken = lst.symbol;
        const toToken = lst.nativeSymbol;

        return lastValueFrom(from(this.chainList).pipe(
            // First, filter to only the chains that have both the from and to tokens
            filter(({ chainId }) => {
                const tokens = this.chainTokens.get(chainId);
                return !!tokens?.has(fromToken) && tokens?.has(toToken);
            }),
            // For each chain that has the required tokens, fetch the quote
            mergeMap(({ chainId }) => {
                const tokens = this.chainTokens.get(chainId)!;
                logger.info(`Fetching quote for ${lst.symbol} on ${chainId}...`)
                logger.info(`From token:${tokens.get(fromToken)?.symbol}  ${tokens.get(fromToken)!.address}, To token: ${tokens.get(toToken)!.address}, Amount: ${amount}`)
                return from(
                    getQuote({
                        fromChain: chainId,
                        toChain: chainId,
                        fromToken: tokens.get(fromToken)!.address,
                        toToken: tokens.get(toToken)!.address,
                        fromAmount: amount,
                        fromAddress: '0x7FF34Ff9c390440Feb54B6347E418154d435BFd4',
                    })
                ).pipe(
                    catchError(() => of(null)) // 🔴 ignore this chain
                );
            }),
            // Filter out any null quotes (failed chains)
            filter(quote => quote !== null),
            // Find the quote with the lowest toAmount across all chains
            reduce((best, quote) =>
                quote.estimate.toAmount < best.estimate.toAmount ? quote : best
            ),
            catchError(() => of(null)),
            defaultIfEmpty(null)
        ));
    }

    async getTokens(chainId: number) {
        return getTokens({
            chains: this.chainList.map(chain => chain.chainId)
        })
    }

    async getRoutes(fromChain: number, toChain: number, fromToken: string, toToken: string, amount: string) {
        const url = `https://li.quest/v1/route?fromChain=${fromChain}&toChain=${toChain}&fromToken=${fromToken}&toToken=${toToken}&amount=${amount}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch routes: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
}

export default LiFiService;