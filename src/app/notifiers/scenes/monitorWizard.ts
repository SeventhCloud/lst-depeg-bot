import { Markup, Scenes } from "telegraf";
import { WizardScene } from "telegraf/scenes";
import { ChainInfo } from "../../../types/lst";
import { StorageService } from "../../services/SotrageService";


interface MonitorState {
  chainName: string;
  symbol: string;
  alert: boolean
}

const monitorWizard = (storageService: StorageService) => {
  return new WizardScene<Scenes.WizardContext>(
    "monitor-wizard",
    // Step 1: show buttons for all tokens
    async (ctx: any) => {
        const chainInfo: ChainInfo[] = ctx.wizard.state.chainInfo;

      const buttons = chainInfo.flatMap((chain: ChainInfo) =>
        chain.tokens.map(token =>
          Markup.button.callback(
            `${chain.chainName} - ${token.symbol} : ${token.alert ? '✅' : '❌'}`,
            JSON.stringify({ chainName: chain.chainName, symbol: token.symbol, alert: !!token.alert })
          )
        )
      );

      
      await ctx.reply(
        "Select an LST token to monitor:",
        Markup.inlineKeyboard(buttons.map((b: any) => [b]))
      );
      
      return ctx.wizard.next();
    },
    // Step 2: wait for callback (token selection)
    async (ctx: any) => {
      if (!ctx.callbackQuery?.data) {
        await ctx.reply("Please select a token using the buttons.");
        return ctx.wizard.selectStep(1);
      }
      const chainInfo: ChainInfo[] = ctx.wizard.state.chainInfo;

      const selectedToken: MonitorState = JSON.parse(ctx.callbackQuery.data);
      const chains = chainInfo.filter((c: ChainInfo) => c.tokens.some(token => token.symbol === selectedToken.symbol))
      const tokens = chains.map(c => c.tokens.find(t => t.symbol === selectedToken.symbol)).filter(t => !!t)
      
      if (tokens.length === 0) {
        await ctx.reply("Token not found. Aborting wizard.");
        return ctx.scene.leave();
      }
      
      // Activate/Deactivate Observation for that TOKEN on ALL Chains -> save changes
      tokens.forEach(t => t.alert = !t.alert)
      storageService.save();
      await ctx.answerCbQuery(`${selectedToken.symbol} monitoring triggered!`);
      await ctx.reply(`${!selectedToken.alert ? '✅ Activated' : '❌ Deactivated' } monitoring ${selectedToken.symbol}`);

      return ctx.scene.leave();
    }
  );
};

export default monitorWizard;
