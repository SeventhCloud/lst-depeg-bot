export interface DexscreenerResponse {
  schemaVersion: string
  pairs: {
    chainId: string
    dexId: string
    url: string
    pairAddress: string
    labels: string[]
    baseToken: {
      address: string
      name: string
      symbol: string
      [k: string]: unknown
    }
    quoteToken: {
      address: string
      name: string
      symbol: string
      [k: string]: unknown
    }
    priceNative: string
    priceUsd: string
    txns: {
      m5: {
        buys: number
        sells: number
        [k: string]: unknown
      }
      h1: {
        buys: number
        sells: number
        [k: string]: unknown
      }
      h6: {
        buys: number
        sells: number
        [k: string]: unknown
      }
      h24: {
        buys: number
        sells: number
        [k: string]: unknown
      }
      [k: string]: unknown
    }
    volume: {
      h24: number
      h6: number
      h1: number
      m5: number
      [k: string]: unknown
    }
    priceChange: {
      m5: number
      h1: number
      h6: number
      h24: number
      [k: string]: unknown
    }
    liquidity: {
      usd: number
      base: number
      quote: number
      [k: string]: unknown
    }
    fdv: number
    marketCap: number
    pairCreatedAt: number
    info: {
      imageUrl: string
      header: string
      openGraph: string
      websites: {
        label: string
        url: string
        [k: string]: unknown
      }[]
      socials: {
        type: string
        url: string
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    [k: string]: unknown
  }[]
  pair: DexPair
  [k: string]: unknown
}

export interface DexPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  labels: string[]
  baseToken: {
    address: string
    name: string
    symbol: string
    [k: string]: unknown
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
    [k: string]: unknown
  }
  priceNative: string
  priceUsd: string
  txns: {
    m5: {
      buys: number
      sells: number
      [k: string]: unknown
    }
    h1: {
      buys: number
      sells: number
      [k: string]: unknown
    }
    h6: {
      buys: number
      sells: number
      [k: string]: unknown
    }
    h24: {
      buys: number
      sells: number
      [k: string]: unknown
    }
    [k: string]: unknown
  }
  volume: {
    h24: number
    h6: number
    h1: number
    m5: number
    [k: string]: unknown
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
    [k: string]: unknown
  }
  liquidity: {
    usd: number
    base: number
    quote: number
    [k: string]: unknown
  }
  fdv: number
  marketCap: number
  pairCreatedAt: number
  info: {
    imageUrl: string
    header: string
    openGraph: string
    websites: {
      label: string
      url: string
      [k: string]: unknown
    }[]
    socials: {
      type: string
      url: string
      [k: string]: unknown
    }[]
    [k: string]: unknown
  }
  [k: string]: unknown
}

