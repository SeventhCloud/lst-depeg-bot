import fs from 'fs';
import path from 'path';
import { ChainInfoLifi, LSTTokenLifi } from '../../types/lst';

export class StorageService {
  private chainList: ChainInfoLifi[] = [];
  private tokenList: LSTTokenLifi[] = [];

  constructor(
    private abiFolderPath: string = path.resolve(__dirname, '../../resources/abis'),
    private chainListPath: string = path.resolve(__dirname, '../../resources/chain-info.json'),
    private tokenListPath: string = path.resolve(__dirname, '../../resources/tokens.json')
  ) {
    this.load();
  }


  /**
   * Save chains back to the JSON file.
   * Optionally removes the ABI objects and keeps only the ABI names.
   */
  /*   save(): void {
      // Create a copy and replace ABI objects with names (for cleaner JSON)
      const chainsToSave = this.chains.map(chain => ({
        ...chain,
        tokens: chain.tokens.map(token => ({
          ...token,
          abi: typeof token.abi === 'string' ? token.abi : token.symbol // save as ABI name
        }))
      }));
  
      fs.writeFileSync(this.chainFilePath, JSON.stringify(chainsToSave, null, 2), 'utf8');
    } */

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



  /**
   * Load chains and ABIs from disk.
   */
  /*   private load(): void {
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
    } */

  private load(): void {
    const rawData = fs.readFileSync(this.chainListPath, 'utf8');
    this.chainList = JSON.parse(rawData);
    this.tokenList = JSON.parse(fs.readFileSync(this.tokenListPath, 'utf8'));

    // Process tokenListData as needed
    this.tokenList.forEach((token: LSTTokenLifi) => {
      const abiPath = path.resolve(this.abiFolderPath, `${token.abi}.json`);
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
  getChains(): ChainInfoLifi[] {
    return this.chainList;
  }

  /**
   * Get a chain by name.
   */
  /*   getChain(chainName: string): ChainInfo | undefined {
      return this.chains.find(c => c.chainName === chainName);
    } */

  getTokenList(): LSTTokenLifi[] {
    return this.tokenList;
  }

  /**
   * Get a token by chain name and symbol.
   */
/*   getToken(chainName: string, symbol: string): LSTTokenLifi | undefined {
    const chain = this.chainList.find(c => c.chainName === chainName);
    return chain?.tokens.find(t => t.symbol === symbol);
  } */

  /**
   * Get the ABI for a token.
   */
/*   getTokenAbi(chainName: string, symbol: string): any[] | undefined {
    return this.getToken(chainName, symbol)?.abi as any[] | undefined;
  } */
}