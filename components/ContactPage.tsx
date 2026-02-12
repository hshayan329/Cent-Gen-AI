
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: insertError } = await supabase
        .from('contacts')
        .insert([{
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          user_id: session?.user?.id || null
        }]);

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to synchronize transmission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase gradient-text">Neural Support Hub</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Direct Transmission for Creators & Enterprise</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 glass p-10 rounded-[48px] border-white/5">
          {submitted ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-white uppercase">Message Synchronized</h3>
              <p className="text-slate-400 mt-2">Our agents will respond within 4 neural cycles (24h).</p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-8 rounded-xl">New Transmission</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-sky-500" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural ID (Email)</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-sky-500" placeholder="john@domain.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</label>
                <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-sky-500" placeholder="Support, Sales, or Collaboration" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transmission Payload</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-sky-500 resize-none" placeholder="Describe your inquiry..." />
              </div>
              {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
              <Button type="submit" isLoading={isSubmitting} className="w-full py-5 rounded-[24px] font-black uppercase tracking-widest">Initiate Transmission</Button>
            </form>
          )}
        </div>

        <div className="space-y-6">
           <div className="glass p-8 rounded-[40px] border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Secure Channels</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white uppercase">Email</p>
                       <p className="text-[9px] text-slate-500">support@centgenai.app</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass p-8 rounded-[40px] border-white/5 bg-blue-500/5">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Response Protocol</h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                 Our neural monitoring team evaluates all inbound transmissions. Expected response latency is 12-24 hours depending on network priority.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
