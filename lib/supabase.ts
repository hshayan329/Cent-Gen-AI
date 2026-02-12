
import { createClient } from '@supabase/supabase-js';

/**
 * NEURAL LINK CONFIGURATION
 * These variables are injected at build-time or runtime.
 * If missing, the application defaults to Local Persistence Mode.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://ensamjjjdbcgffwcolhw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Create client regardless of key presence to avoid breaking hook initializations
// If key is empty, requests will simply return null/error which App.tsx handles
export const supabase = createClient(supabaseUrl, supabaseKey || 'placeholder-key');

/**
 * Checks if the Supabase service is fully authenticated and configured.
 */
export const isSupabaseConnected = () => {
  return !!supabaseKey && supabaseKey !== 'sb_publishable_placeholder' && supabaseKey !== '';
};
