import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_CHAT_ID: z.string(),
  POLL_INTERVAL_SECONDS: z.coerce.number().min(10).default(60),
  DEPEG_THRESHOLD: z.coerce.number().min(0).max(1).default(0.02),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const config = envSchema.parse(process.env);
