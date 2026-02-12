
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration.
 * Environment variables are preferred for security in production environments.
 * These are injected during the build process or runtime via process.env.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://awbsumdyeexgdiajkavb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_w70KmuBo9IQyVk8cUiM4BA_Ne3QLLdp';

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase configuration is missing. Ensure SUPABASE_URL and SUPABASE_KEY are set.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
