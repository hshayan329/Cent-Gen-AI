
import React, { useState, useRef } from 'react';
import { UserCredits } from '../types';
import { removeBackground } from '../services/geminiService';
import { Button } from './ui/Button';

export const BackgroundRemover: React.FC<{ 
  credits: UserCredits, 
  // Updated onDeduct to return Promise<boolean> to match App.tsx implementation
  onDeduct: () => Promise<boolean> 
}> = ({ credits, onDeduct }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    try {
      const b64 = await removeBackground(image);
      // Awaiting onDeduct because handleDeductCredit is asynchronous
      const success = await onDeduct();
      if (!success) throw new Error("Neural balance depleted.");
      setResult(b64);
    } catch (err: any) {
      setError(err.message || "Neural sync error. Try again with a different image.");
    } finally {
      setIsLoading(false);
    }
  };

  const download = (format: 'png' | 'jpg') => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `cent-gen-bg-removed-${Date.now()}.${format}`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black uppercase gradient-text">Neural BG Remover</h2>
        <p className="text-slate-400 mt-2">Isolate Subjects with Studio Quality</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/20">
          <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Cost: 1 Neural Credit</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col items-center">
          <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/30 transition-all overflow-hidden relative group">
             {image ? <img src={image} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" /> : (
               <div className="text-center p-8">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Import Asset</p>
               </div>
             )}
          </div>
          <input type="file" ref={fileInputRef} hidden onChange={handleUpload} accept="image/*" />
          <Button onClick={handleProcess} isLoading={isLoading} disabled={!image || isLoading} className="w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest">Remove Background (1 Credit)</Button>
          {error && <p className="mt-4 text-red-500 text-center text-[10px] font-black uppercase bg-red-500/10 py-3 px-6 rounded-xl border border-red-500/20 w-full text-center leading-relaxed">{error}</p>}
        </div>

        <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col items-center justify-center min-h-[400px] relative">
           {result ? (
             <div className="w-full h-full flex flex-col animate-in zoom-in-95 duration-500">
                <div className="w-full aspect-square bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] rounded-[32px] overflow-hidden border border-white/10 mb-6 bg-slate-900 shadow-inner">
                   <img src={result} className="w-full h-full object-contain" />
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => download('png')} className="flex-1 py-4 font-black uppercase tracking-widest">PNG</Button>
                  <Button onClick={() => download('jpg')} variant="secondary" className="flex-1 py-4 font-black uppercase tracking-widest">JPG</Button>
                </div>
             </div>
           ) : (
             <div className="text-center space-y-4 opacity-30">
               <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-full mx-auto flex items-center justify-center">
                 <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               </div>
               <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">{isLoading ? 'Synthesizing...' : 'Awaiting Analysis...'}</p>
             </div>
           )}
           
           {isLoading && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm rounded-[40px] flex flex-col items-center justify-center gap-4 z-10">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sky-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Isolating Foreground Nodes...</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
