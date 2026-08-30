import 'dotenv/config';
import { z } from 'zod';

const environment = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  ALLOWED_ORIGINS: z.string().default(''),
  // Session cookies from a logged-in LinkedIn browser (own account). Never commit real values.
  LINKEDIN_LI_AT: z.string().min(1).optional().or(z.literal('')),
  LINKEDIN_JSESSIONID: z.string().min(1).optional().or(z.literal(''))
});

const parsed = environment.safeParse(process.env);
if (!parsed.success) throw new Error(`Invalid environment configuration: ${parsed.error.message}`);

const liAt = parsed.data.LINKEDIN_LI_AT || undefined;
const jsessionid = parsed.data.LINKEDIN_JSESSIONID?.replace(/^"|"$/g, '') || undefined;

export const env = {
  ...parsed.data,
  LINKEDIN_LI_AT: liAt,
  jsessionid,
  allowedOrigins: parsed.data.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  linkedinConfigured: Boolean(liAt && jsessionid)
};
