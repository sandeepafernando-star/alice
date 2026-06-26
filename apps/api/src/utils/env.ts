import { z } from 'zod';

const serverSchema = z.object({
  PORT: z.coerce.number(),
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const processEnv = {
  PORT: process.env.PORT,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

const parsed = serverSchema.safeParse(processEnv);

if (parsed.success === false) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'error. invalid or missing environment variables:\n',
    z.treeifyError(parsed.error)
  );

  throw new Error(
    'error. build terminated due to invalid environment variables.'
  );
}

export const env = parsed.data;
