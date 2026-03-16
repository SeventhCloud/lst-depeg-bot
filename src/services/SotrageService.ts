import fs from 'fs';
import path from 'path';
import logger from '../infra/logger';
import type { ChainInfo, LSTToken } from '../types/lst';

const BASE_RESOURCE_DIR = process.env.RESOURCE_DIR || path.join(process.cwd(), 'src/smart-contract-info');

export class StorageService {
  private chainList: ChainInfo[] = [];
  private tokenList: LSTToken[] = [];

  constructor(
    private abiFolderPath: string = path.resolve(BASE_RESOURCE_DIR, 'abis'),
    private chainListPath: string = path.resolve(BASE_RESOURCE_DIR, 'chain-info.json'),
    private tokenListPath: string = path.resolve(BASE_RESOURCE_DIR, 'tokens.json')
  ) {
    this.load();
  }

  /**
   * Save chains back to the JSON file.
   * Optionally removes the ABI objects and keeps only the ABI names.
   */
  save(): void {
    // Create a copy and replace ABI objects with names (for cleaner JSON)
    const tokenListToSave = this.tokenList.map(token => ({
      ...token,
      abi: typeof token.abi === 'string' ? token.abi : token.symbol // save as ABI name
    }));

    fs.writeFileSync(this.tokenListPath, JSON.stringify(tokenListToSave, null, 2), 'utf8');
  }

  private load(): void {
    const rawData = fs.readFileSync(this.chainListPath, 'utf8');
    this.chainList = JSON.parse(rawData);
    this.tokenList = JSON.parse(fs.readFileSync(this.tokenListPath, 'utf8'));

    // Process tokenListData as needed
    this.tokenList.forEach((token: LSTToken) => {
      const abiPath = path.resolve(this.abiFolderPath, `${token.abi.toLowerCase()}.json`);
      logger.info(`Loading token: ${token.symbol} with ABI: ${token.abi} from ${abiPath}`);
      if (fs.existsSync(abiPath)) {
        token.abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      } else {
        throw new Error(`ABI file not found: ${abiPath}`);
      }

    });
  }

  /**
   * Get all chains.
   */
  getChains(): ChainInfo[] {
    return this.chainList;
  }

  getTokenList(): LSTToken[] {
    return this.tokenList;
  }
}