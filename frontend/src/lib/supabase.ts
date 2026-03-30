import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gltdkplfukjfpajwftzd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YaDcgMbj6oTeQtcYrX1yUA_MYs_CthT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
