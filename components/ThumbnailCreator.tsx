
import React, { useState, useRef } from 'react';
import { UserCredits } from '../types';
import { generateThumbnail } from '../services/geminiService';
import { Button } from './ui/Button';

export const ThumbnailCreator: React.FC<{ 
  credits: UserCredits, 
  // Updated onDeduct to return Promise<boolean> to match App.tsx implementation
  onDeduct: (amount: number) => Promise<boolean> 
}> = ({ credits, onDeduct }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube (16:9)');
  const [style, setStyle] = useState('Viral Cinematic');
  const [subjectImage, setSubjectImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadSubject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSubjectImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (credits.remaining < 3) {
      setError("INSUFFICIENT NEURAL BALANCE: Thumbnail synthesis requires 3 credits.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const url = await generateThumbnail(topic, platform, style, subjectImage || undefined);
      // Awaiting onDeduct because handleDeductCredit is asynchronous
      const success = await onDeduct(3);
      if (!success) throw new Error("Neural balance synchronization failure.");
      setResult(url);
    } catch (err: any) {
      setError(err.message || "Neural saturation reached. Please adjust your prompt and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const download = (format: 'png' | 'jpg') => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `cent-gen-thumbnail-${Date.now()}.${format}`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black uppercase tracking-tighter gradient-text">Viral Thumbnail Hub</h2>
        <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Neural Compositions for maximum CTR</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20">
          <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Cost: 3 Neural Credits</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="glass p-10 rounded-[48px] border-white/5 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Topic / Viral Hook</label>
              <input 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                placeholder="e.g. 24 Hours in a Tesla Cybertruck" 
                className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-sky-500 transition-all" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Platform Format</label>
                <select 
                  value={platform} 
                  onChange={e => setPlatform(e.target.value)} 
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-white font-bold text-xs"
                >
                  <option>YouTube (16:9)</option>
                  <option>Facebook Feed (16:9)</option>
                  <option>Instagram Square (1:1)</option>
                  <option>TikTok/Reels (9:16)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Visual Style</label>
                <select 
                  value={style} 
                  onChange={e => setStyle(e.target.value)} 
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 text-white font-bold text-xs"
                >
                  <option>Viral Cinematic</option>
                  <option>Hyper-Realistic Vlog</option>
                  <option>Anime Pop</option>
                  <option>Retro Gaming</option>
                  <option>Clean Tech</option>
                </select>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            isLoading={isLoading} 
            disabled={!topic.trim() || isLoading}
            className="w-full py-6 rounded-[28px] text-base font-black uppercase tracking-[0.2em] shadow-2xl"
          >
            Synthesize Thumbnail (3 Credits)
          </Button>

          {error && <p className="text-red-500 text-center text-[10px] font-black uppercase bg-red-500/10 py-3 rounded-2xl border border-red-500/20 leading-relaxed px-4">{error}</p>}
        </div>

        <div className="glass p-10 rounded-[48px] border-white/5 flex flex-col items-center">
          <label className="block w-full text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5">Subject Asset (Upload Person/Self)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full aspect-video md:aspect-square bg-slate-950/50 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
              subjectImage ? 'border-sky-500/50' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {subjectImage ? (
              <img src={subjectImage} className="w-full h-full object-contain p-4" alt="Subject" />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                   <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Upload Person/Object</p>
                <p className="text-[9px] text-slate-700 mt-2 italic">Integrate yourself into the AI design</p>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} hidden onChange={handleUploadSubject} accept="image/*" />
          {subjectImage && (
            <button 
              onClick={(e) => { e.stopPropagation(); setSubjectImage(null); }} 
              className="mt-4 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
            >
              Remove Subject
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="glass p-10 rounded-[64px] border-white/10 animate-in fade-in slide-in-from-bottom-12 duration-700 shadow-2xl">
           <div className="relative group rounded-[40px] overflow-hidden mb-10 border border-white/5 shadow-inner bg-slate-900">
             <img src={result} className="w-full h-auto object-contain max-h-[700px] transition-transform duration-1000 group-hover:scale-105" alt="Final Thumbnail" />
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-md p-10">
                <div className="flex gap-4">
                  <Button onClick={() => download('png')} size="lg" className="rounded-2xl px-8 py-5 font-black uppercase tracking-[0.2em] shadow-2xl">PNG</Button>
                  <Button onClick={() => download('jpg')} size="lg" className="rounded-2xl px-8 py-5 font-black uppercase tracking-[0.2em] shadow-2xl">JPG</Button>
                </div>
                <button onClick={() => setResult(null)} className="mt-8 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Discard Draft</button>
             </div>
           </div>
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
              <div className="text-left">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Neural Output Status</h4>
                <p className="text-green-500 font-black uppercase text-xs">Ready for Distribution</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => download('png')} variant="outline" className="rounded-xl font-bold py-3 text-xs">Save Asset</Button>
                <Button onClick={handleGenerate} variant="secondary" className="rounded-xl font-bold py-3 text-xs">Sync New Variant</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
