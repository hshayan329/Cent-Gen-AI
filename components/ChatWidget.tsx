
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

interface ChatWidgetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialMessage?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, setIsOpen, initialMessage }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialMessage && !form.message) {
      setForm(prev => ({ ...prev, message: initialMessage }));
    }
  }, [isOpen, initialMessage]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: insertError } = await supabase
        .from('contacts')
        .insert([{
          name: form.name,
          email: form.email,
          subject: 'Support Widget Inquiry',
          message: form.message,
          user_id: session?.user?.id || null
        }]);

      if (insertError) throw insertError;
      
      setIsSubmitted(true);
      // Reset form after a delay or keep it for the success view
    } catch (err: any) {
      console.error("Transmission failed", err);
      setError("Handshake failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWidget = () => {
    setIsSubmitted(false);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="glass w-80 md:w-96 rounded-[40px] flex flex-col shadow-2xl border-blue-500/30 overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="gradient-bg p-6 flex justify-between items-center shadow-lg">
            <div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest">Support Core</h3>
              <p className="text-[10px] text-white/70 font-medium">Secure Neural Link</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white bg-white/10 p-2 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-slate-900/40 min-h-[400px]">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 py-10">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">Transmission Received</h4>
                <p className="text-slate-300 text-[11px] mt-4 leading-relaxed font-medium px-4">
                  Thank you for your query. Our synchronization team has received your message.
                </p>
                <p className="text-sky-400 text-[11px] mt-3 leading-relaxed font-black uppercase tracking-widest px-4">
                  A dedicated agent will review your request and reply to you via email within 10 to 24 hours.
                </p>
                <Button onClick={resetWidget} variant="outline" className="mt-8 rounded-2xl text-[10px] uppercase font-black tracking-widest px-8">
                  New Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-5 animate-in fade-in duration-500">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-center">Dispatch a secure inquiry</p>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input 
                    required 
                    type="text"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:border-sky-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input 
                    required 
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="agent@domain.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:border-sky-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Message Payload</label>
                  <textarea 
                    required 
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="Describe your query in detail..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:border-sky-500 transition-all outline-none resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-[9px] font-black uppercase text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                    {error}
                  </p>
                )}

                <Button 
                  type="submit" 
                  isLoading={isSubmitting} 
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                >
                  Initiate Transmission
                </Button>
                
                <p className="text-[8px] text-slate-600 text-center font-bold uppercase tracking-widest">
                  Secure TLS 1.3 Encryption Active
                </p>
              </form>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 gradient-bg rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-blue-500/20 group animate-bounce-slow"
        >
          <svg className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
        </button>
      )}
    </div>
  );
};
