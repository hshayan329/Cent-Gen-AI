
import { createClient } from '@supabase/supabase-js';

// Access variables from either Vite's import.meta.env or process.env (injected by vite.config.ts)
const getEnv = (key: string) => {
  return (import.meta as any).env?.[`VITE_${key}`] || 
         (import.meta as any).env?.[key] || 
         process.env[key] || 
         process.env[`VITE_${key}`];
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_ANON_KEY');

/**
 * Checks if the Supabase service is fully configured.
 */
export const isSupabaseConnected = () => {
  return !!supabaseUrl && !!supabaseKey && supabaseUrl !== '' && supabaseKey !== '';
};

// Initialize the client. 
// If keys are missing, we use a placeholder to prevent the app from crashing on load,
// but we handle the actual errors gracefully in the UI.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseKey || 'placeholder-key'
);
