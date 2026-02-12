
import React, { useState, useRef } from 'react';
import { UserCredits, PlanType } from '../types';
import { generateMockup } from '../services/geminiService';
import { Button } from './ui/Button';

export const MockupGenerator: React.FC<{ 
  credits: UserCredits, 
  // Updated onDeduct to return Promise<boolean> to match App.tsx implementation
  onDeduct: () => Promise<boolean> 
}> = ({ credits, onDeduct }) => {
  const [image, setImage] = useState<string | null>(null);
  const [product, setProduct] = useState('Minimalist T-Shirt');
  const [setting, setSetting] = useState('Studio Lighting');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRODUCTS = [
    'Minimalist T-Shirt',
    'Modern iPhone Screen',
    'Framed Wall Poster',
    'Coffee Mug',
    'MacBook Pro Screen',
    'Hoodie',
    'Outdoor Billboard'
  ];

  const SETTINGS = [
    'Studio Lighting',
    'Urban Street',
    'Cozy Living Room',
    'Creative Office',
    'Nature/Outdoor',
    'Luxury Retail'
  ];

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

  const handleGenerate = async () => {
    if (!image || isLoading) return;
    if (credits.mockupsRemaining <= 0) {
      setError("Mockup neural limit reached for this billing cycle.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Awaiting onDeduct because handleDeductCredit is asynchronous
      const success = await onDeduct();
      if (!success) throw new Error("Sync failed.");
      
      const newImg = await generateMockup(image, product, setting);
      setResult(newImg);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold mb-4 uppercase tracking-tighter">Mockup Lab</h2>
        <p className="text-slate-400">Transform your designs into realistic product visualizations.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
            Neural Balance: {credits.mockupsRemaining} / {credits.mockupsTotal} Mockups
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass p-8 rounded-[40px] border-white/5">
             <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Asset Input</h3>
             
             <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/50 ${
                image ? 'border-blue-500/50' : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              {image ? (
                <img src={image} className="w-full h-full object-contain p-4 rounded-[32px]" alt="Design" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Import Design Asset</p>
                  <p className="text-[9px] text-slate-600 mt-2 font-medium">PNG, JPG recommended</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleUpload} hidden accept="image/*" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Target Product</label>
                <select 
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-xs font-bold focus:border-blue-500"
                >
                  {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Setting Context</label>
                <select 
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-xs font-bold focus:border-blue-500"
                >
                  {SETTINGS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              isLoading={isLoading} 
              disabled={!image || isLoading}
              className="w-full mt-8 py-5 rounded-2xl shadow-xl shadow-blue-500/10"
            >
              Synthesize Mockup (1 Credit)
            </Button>
            {error && <p className="mt-4 text-red-500 text-center text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-2 rounded-xl">{error}</p>}
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Neural Visualization</h3>
            {result && <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full">Completed</span>}
          </div>
          
          <div className="flex-1 bg-slate-950 rounded-3xl flex items-center justify-center overflow-hidden border border-white/5 relative group">
            {result ? (
              <img src={result} className="w-full h-full object-contain animate-in zoom-in-95 duration-1000" alt="Mockup Result" />
            ) : (
              <div className="text-center opacity-10 flex flex-col items-center">
                 <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 border-2 border-white rounded-2xl animate-pulse"></div>
                    <div className="absolute inset-4 border border-white/40 rounded-lg"></div>
                 </div>
                 <p className="font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Synthesis</p>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute top-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Mapping Surface Nodes</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase">Calibrating Light Physics...</p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-8 flex gap-4 animate-in slide-in-from-bottom-4">
              <Button variant="outline" className="flex-1 py-4 rounded-2xl font-bold" onClick={() => window.open(result, '_blank')}>
                Preview Full
              </Button>
              <Button variant="primary" className="flex-1 py-4 rounded-2xl font-bold" onClick={() => {
                const link = document.createElement('a');
                link.href = result;
                link.download = `cent-gen-mockup-${Date.now()}.png`;
                link.click();
              }}>
                Download PNG
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
