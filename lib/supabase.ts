
import { createClient } from '@supabase/supabase-js';

/**
 * NEURAL LINK CONFIGURATION
 * Checks both standard process.env (shimmed by Vite) and Vite's native import.meta.env
 */
const supabaseUrl = process.env.SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ensamjjjdbcgffwcolhw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Create client. If the key is missing, Supabase will throw an error only when a request is made.
export const supabase = createClient(supabaseUrl, supabaseKey || 'placeholder-key');

/**
 * Checks if the Supabase service is fully authenticated and configured.
 */
export const isSupabaseConnected = () => {
  const key = process.env.SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  return !!key && key !== 'placeholder-key' && key !== '';
};
