import fs from 'fs';
import path from 'path';
import { ChainInfo, LSTToken } from '../../types/lst';

export class StorageService {
  private chains: ChainInfo[] = [];

  constructor(
    private chainFilePath: string = path.resolve(__dirname, '../../resources/pool-list.json'),
    private abiFolderPath: string = path.resolve(__dirname, '../../resources/abis')
  ) {
    this.load();
   }


  /**
   * Save chains back to the JSON file.
   * Optionally removes the ABI objects and keeps only the ABI names.
   */
  save(): void {
    // Create a copy and replace ABI objects with names (for cleaner JSON)
    const chainsToSave = this.chains.map(chain => ({
      ...chain,
      tokens: chain.tokens.map(token => ({
        ...token,
        abi: typeof token.abi === 'string' ? token.abi : token.symbol // save as ABI name
      }))
    }));

    fs.writeFileSync(this.chainFilePath, JSON.stringify(chainsToSave, null, 2), 'utf8');
  }


  /**
   * Load chains and ABIs from disk.
   */
  private load(): void {
    const rawData = fs.readFileSync(this.chainFilePath, 'utf8');
    this.chains = JSON.parse(rawData);
    // Load ABIs for each token
    this.chains.forEach(chain => {
      chain.tokens.forEach(token => {
        if (typeof token.abi === 'string') {
          const abiPath = path.resolve(this.abiFolderPath, `${token.abi}.json`);
          if (fs.existsSync(abiPath)) {
            token.abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
          } else {
            throw new Error(`ABI file not found: ${abiPath}`);
          }
        }
      });
    });
  }

  /**
   * Get all chains.
   */
  getChains(): ChainInfo[] {
    return this.chains;
  }

  /**
   * Get a chain by name.
   */
  getChain(chainName: string): ChainInfo | undefined {
    return this.chains.find(c => c.chainName === chainName);
  }

  /**
   * Get a token by chain name and symbol.
   */
  getToken(chainName: string, symbol: string): LSTToken | undefined {
    const chain = this.getChain(chainName);
    return chain?.tokens.find(t => t.symbol === symbol);
  }

  /**
   * Get the ABI for a token.
   */
  getTokenAbi(chainName: string, symbol: string): any[] | undefined {
    return this.getToken(chainName, symbol)?.abi as any[] | undefined;
  }
}