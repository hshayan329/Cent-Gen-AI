
// Import React to fix namespace errors
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { supabase, isSupabaseConnected } from '../lib/supabase';

// Added missing React import to fix 'Cannot find namespace React'
export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConnected()) {
      setError("CONFIGURATION ERROR: Supabase URL or Anon Key is missing in environment variables. Please check your .env file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert("Registration sequence initiated. Please check your email for verification.");
      }
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      // Map common Supabase errors to user-friendly messages
      let msg = err.message || "Neural handshake failed.";
      if (msg.includes("API key")) msg = "Invalid Supabase API Key. Please verify your Anon Key in settings.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="glass w-full max-w-md p-8 rounded-[40px] border-blue-500/20 animate-in zoom-in-95 duration-300 relative shadow-2xl">
        {!isSupabaseConnected() && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest text-center">
            ⚠️ Database Not Connected. Login Disabled.
          </div>
        )}
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-xl shadow-blue-500/30">C</div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">Access your personal neural workshop</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Identify (Email)</label>
             <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white focus:border-blue-500 transition-colors"
              placeholder="agent@centgen.ai"
             />
          </div>
          <div>
             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Access Code (Password)</label>
             <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white focus:border-blue-500 transition-colors"
              placeholder="••••••••"
             />
          </div>
          
          {error && <p className="text-red-500 text-[9px] font-black uppercase text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">{error}</p>}

          <Button 
            type="submit" 
            isLoading={loading} 
            disabled={!isSupabaseConnected()}
            className="w-full py-4 mt-4 text-sm font-black uppercase tracking-widest"
          >
            {isLogin ? 'Authenticate Identity' : 'Establish Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-widest transition-colors"
          >
            {isLogin ? 'New User? Create Account' : 'Returning Agent? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
