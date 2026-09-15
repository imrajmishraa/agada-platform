import { createBrowserClient } from '@agada/shared/supabase';
import { env } from './env';

export const supabase = createBrowserClient({
  supabaseUrl: env.SUPABASE_URL,
  supabaseKey: env.SUPABASE_PUBLISHABLE_KEY,
});
