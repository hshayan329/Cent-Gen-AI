
import React, { useState, useRef } from 'react';
import { PlanType } from '../types';
import { changeBackground } from '../services/geminiService';
import { Button } from './ui/Button';

export const BackgroundChanger: React.FC<{ 
  plan: PlanType, 
  // Updated onDeduct to return Promise<boolean> to match App.tsx implementation
  onDeduct: () => Promise<boolean> 
}> = ({ plan, onDeduct }) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
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
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!image || !prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      // Awaiting onDeduct because handleDeductCredit is asynchronous
      await onDeduct();
      const newImg = await changeBackground(image, prompt);
      setResult(newImg);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `cent-gen-background-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="glass p-8 rounded-[40px] border-blue-500/10">
          <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">BG Change</h2>
          <p className="text-slate-500 text-sm mb-6 uppercase tracking-widest font-bold">Image-to-Image Neural Modality</p>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              image ? 'border-blue-500/50' : 'border-slate-800 hover:border-slate-600'
            }`}
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover rounded-[22px]" alt="Source" />
            ) : (
              <div className="text-center p-8">
                <svg className="w-12 h-12 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Select Base Image</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleUpload} hidden accept="image/*" />
          </div>

          <div className="mt-8">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">New Background Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A cyberpunk city at night with neon signs..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-sm min-h-[100px] focus:border-blue-500"
            />
          </div>

          <Button 
            onClick={handleProcess} 
            isLoading={isLoading} 
            disabled={!image || !prompt.trim()}
            className="w-full mt-6 py-4"
          >
            Transform Background (1 Credit)
          </Button>
          {error && <p className="mt-4 text-red-500 text-center text-xs font-bold uppercase">{error}</p>}
        </div>
      </div>

      <div className="glass p-8 rounded-[40px] border-blue-500/10 flex flex-col">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Resulting Masterpiece</h3>
        <div className="flex-1 bg-slate-950 rounded-3xl flex items-center justify-center overflow-hidden relative min-h-[300px]">
          {result ? (
            <img src={result} className="w-full h-full object-contain animate-in fade-in duration-1000" alt="Result" />
          ) : (
            <div className="text-center opacity-20">
              <p className="text-4xl mb-4">🪄</p>
              <p className="font-bold uppercase tracking-widest text-xs">Waiting for processing</p>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Analyzing Pixels...</p>
            </div>
          )}
        </div>
        {result && (
          <div className="mt-6 flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => window.open(result, '_blank')}>
              Open Full Size
            </Button>
            <Button variant="primary" className="flex-1" onClick={downloadResult}>
              Download PNG
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
