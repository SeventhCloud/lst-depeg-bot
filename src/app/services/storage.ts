
import { PrismaClient } from '../../generated/prisma/client';
import { DexPair } from "./types";

export class Storage {
    constructor(private prismaClient: PrismaClient) {}

    async savePrice(pair: DexPair) {
        const prismaData = mapPairToPrisma(pair);
        await this.prismaClient.dexPair.upsert({
            where: { id: pair.pairAddress },
            update: prismaData,
            create: prismaData
        });

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

        console.log(`Price saved for pair: ${pair.pairAddress} \nsymbol: ${pair.symbol} \nprice: ${pair.price}`);
    }

    async getPrices(pairId: string) {
        const lastPrices = await this.prismaClient.price.findMany({
            where: { dexPairId: pairId },
            orderBy: { timestamp: "desc" }, // newest first
            take: 500
        });
        return lastPrices;
    }
}

// utils for Storage Class
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
