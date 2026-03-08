import { Markup, Scenes } from "telegraf";
import { WizardScene } from "telegraf/scenes";
import { StorageService } from "../../services/SotrageService";
import { ChainList, LSTTokenLifi } from "../../../types/lst";


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
      const chainList: ChainList[] = ctx.wizard.state.chainList;
      const tokenList: LSTTokenLifi[] = ctx.wizard.state.tokenList;

      const buttons = tokenList.map(token => Markup.button.callback(
        `${token.symbol} : ${token.alert ? '✅' : '❌'}`,
        JSON.stringify({ symbol: token.symbol, alert: !!token.alert })
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
      const tokenList: LSTTokenLifi[] = ctx.wizard.state.tokenList;

      const selectedToken: MonitorState = JSON.parse(ctx.callbackQuery.data);
      const token = tokenList.find(t => t.symbol === selectedToken.symbol);

      if (!token) {
        await ctx.reply("Token not found. Aborting wizard.");
        return ctx.scene.leave();
      }

      // Activate/Deactivate Observation for that TOKEN on ALL Chains -> save changes
      token.alert = !token.alert;
      storageService.save();
      await ctx.answerCbQuery(`${selectedToken.symbol} monitoring triggered!`);
      await ctx.reply(`${!selectedToken.alert ? '✅ Activated' : '❌ Deactivated'} monitoring ${selectedToken.symbol}`);

      return ctx.scene.leave();
    }
  );
};

export default monitorWizard;
