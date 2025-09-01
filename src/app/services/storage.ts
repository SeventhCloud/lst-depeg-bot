import { PrismaClient } from '../../generated/prisma/client';
import { DexPair } from "./types";

export class Storage {

    private latestStatus: PairStatus[] = [];


    constructor(private prismaClient: PrismaClient) { }

    /**
     * Saves or updates a DexPair in the database and records its price.
     * @param pair - The DexPair object containing all relevant data
     */
    async savePrice(pair: DexPair) {
        const prismaData = mapPairToPrisma(pair);

        // Upsert DexPair: create new or update existing record
        await this.prismaClient.dexPair.upsert({
            where: { id: pair.pairAddress },
            update: prismaData,
            create: prismaData
        });

        // Save a new price record for historical tracking
        await this.prismaClient.price.create({
            data: {
                dexPairId: pair.pairAddress,
                priceNative: parseFloat(pair.priceNative),
                priceUsd: parseFloat(pair.priceUsd),
                volume: pair.volume ? JSON.stringify(pair.volume) : undefined,
                priceChange: pair.priceChange ? JSON.stringify(pair.priceChange) : undefined,
                liquidity: pair.liquidity ? JSON.stringify(pair.liquidity) : undefined,
                txns: pair.txns ? JSON.stringify(pair.txns) : undefined
            }
        });
    }

    /**
     * Retrieves the latest price records for a given DexPair.
     * @param pairId - The pair address (ID) to fetch prices for
     * @returns Array of latest price entries (up to 500)
     */
    async getPrices(pairId: string) {
        const lastPrices = await this.prismaClient.price.findMany({
            where: { dexPairId: pairId },
            orderBy: { timestamp: "desc" }, // newest first
            take: 500
        });
        return lastPrices;
    }

    getStatus(): PairStatus[] {
        return this.latestStatus;
    }

    setStatus(status: PairStatus[]) {
        this.latestStatus = status;
    }

}

// Utility to map a DexPair object into Prisma-compatible format
function mapPairToPrisma(pair: DexPair) {
    return {
        id: pair.pairAddress,
        pairAddress: pair.pairAddress,
        chainId: pair.chainId,
        dexId: pair.dexId,
        url: pair.url,
        labels: pair.labels ? JSON.stringify(pair.labels) : undefined,
        baseAddress: pair.baseToken.address,
        baseName: pair.baseToken.name,
        baseSymbol: pair.baseToken.symbol,
        quoteAddress: pair.quoteToken.address,
        quoteName: pair.quoteToken.name,
        quoteSymbol: pair.quoteToken.symbol,
        fdv: pair.fdv,
        marketCap: pair.marketCap,
        pairCreatedAt: pair.pairCreatedAt,
        imageUrl: pair.info?.imageUrl,
        header: pair.info?.header,
        openGraph: pair.info?.openGraph,
        websites: pair.info?.websites ? JSON.stringify(pair.info.websites) : undefined,
        socials: pair.info?.socials ? JSON.stringify(pair.info.socials) : undefined
    };
}


export type PairStatus = {
    symbol: string;
    pairAddress: string;
    ratio: number;
    ema?: number;
    lastAlert?: string;
};
