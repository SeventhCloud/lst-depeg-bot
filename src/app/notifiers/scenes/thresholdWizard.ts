import { Markup, Scenes } from "telegraf";
import { WizardScene } from "telegraf/scenes";
import { ChainInfo, LSTToken } from "../../../types/lst";
import { StorageService } from "../../services/SotrageService";


interface ThresholdState {
    chainName: string;
    symbol: string;
    threshold: boolean
}

const thresholdWizard = (storageService: StorageService) => {
    return new WizardScene<Scenes.WizardContext>(
        "threshold-wizard",
        // Step 1: show buttons for all tokens
        async (ctx: any) => {
            const chainInfo: ChainInfo[] = ctx.wizard.state.chainInfo;

            const buttons = chainInfo.flatMap((chain: ChainInfo) =>
                chain.tokens.map(token =>
                    Markup.button.callback(
                        `${token.symbol} - threshold: ${token.threshold*100}%`,
                        JSON.stringify({ chainName: chain.chainName, symbol: token.symbol, threshold: token.threshold })
                    )
                )
            );

            await ctx.reply(
                "Select an LST token to change threshold:",
                Markup.inlineKeyboard(buttons.map((b: any) => [b]))
            );

            return ctx.wizard.next();
        },
        async (ctx: any) => {
            if (!ctx.callbackQuery?.data) {
                await ctx.reply("Please select a token using the buttons.");
                return ctx.wizard.selectStep(1);
            }
            const selectedToken: ThresholdState = JSON.parse(ctx.callbackQuery.data);

            ctx.wizard.state.selectedTokens = selectedToken;
            await ctx.reply("Input the threshold to change to in %:")
            return ctx.wizard.next();
        },
        async (ctx: any) => {
            if (!/^-?\d+(\.\d+)?$/.test(ctx.text)) {
                await ctx.reply("Invalid format. Aborting wizard.");
                return ctx.scene.leave();
            }
            const selectedToken = ctx.wizard.state.selectedTokens as ThresholdState
            
            const chainInfo: ChainInfo[] = ctx.wizard.state.chainInfo;
            const chains = chainInfo.filter((c: ChainInfo) => c.tokens.some(token => token.symbol === selectedToken.symbol))
            const tokens = chains.map(c => c.tokens.find(t => t.symbol === selectedToken.symbol)).filter(t => !!t)

            if (tokens.length === 0) {
                await ctx.reply("Token not found. Aborting wizard.");
                return ctx.scene.leave();
            }

            const threshold = (Number(ctx.text)/100);
            // Activate/Deactivate Observation for that TOKEN on ALL Chains -> save changes
            tokens.forEach(t => t.threshold = threshold)
            storageService.save();
            await ctx.reply(`Threshold changed to ${(threshold/100).toFixed(4)}%`);

            return ctx.scene.leave();
        }
    );
};

export default thresholdWizard;
