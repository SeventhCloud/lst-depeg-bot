import { DexPairRequest } from "../app/services/DexscreenerService";

const poolList: DexPairRequest[] = [
    {
        symbol: 'stETH',
        chainId: 'ethereum',
        pairAddress: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022', // wstETH/WETH,
        threshold: 0.005 // Depeg threshold
    },
    {
        symbol: 'stETH',
        chainId: 'ethereum',
        pairAddress: '0x21E27a5E5513D6e65C4f830167390997aA84843a', // wstETH/WETH,
        threshold: 0.005
    }

];

export default poolList;