
import React, { useState, useEffect } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { Button } from './ui/Button';
import { GenerationSettings, GeneratedImage, UserCredits, PlanType, FileFormat } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { generateImage } from '../services/geminiService';

/**
 * Utility to convert and download generated images in specified formats.
 */
const convertAndDownload = (dataUrl: string, targetFormat: FileFormat, filename: string) => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        if (targetFormat === 'svg') {
          const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
            <image href="${dataUrl}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
          </svg>`;
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context initialization failed");

        if (targetFormat === 'jpg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        
        const mime = targetFormat === 'jpg' ? 'image/jpeg' : 'image/png';
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create image blob"));
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.${targetFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        }, mime, 0.95);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Image data could not be loaded"));
    img.src = dataUrl;
  });
};

interface SingleGeneratorProps {
  credits: UserCredits;
  onDeduct: () => Promise<boolean>;
}

export const SingleGenerator: React.FC<SingleGeneratorProps> = ({ credits, onDeduct }) => {
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    const saved = localStorage.getItem('centgen_history_single');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<{message: string, isRpc: boolean} | null>(null);

  useEffect(() => {
    localStorage.setItem('centgen_history_single', JSON.stringify(history));
  }, [history]);

  const checkApiKey = async (activeSettings: GenerationSettings): Promise<boolean> => {
    const isProRequired = activeSettings.useSearch || activeSettings.imageSize === "2K" || activeSettings.imageSize === "4K";
    if (!isProRequired) return true;

    // Safety check for standalone deployments like Netlify
    if (typeof (window as any).aistudio === 'undefined') {
      return true;
    }

    try {
      const aistudio = (window as any).aistudio;
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
        return true; 
      }
      return true;
    } catch (e) {
      return true;
    }
  };

  const handleGenerate = async (overridePrompt?: string, overrideSettings?: GenerationSettings) => {
    const activePrompt = overridePrompt !== undefined ? overridePrompt : prompt;
    const activeSettings = overrideSettings !== undefined ? overrideSettings : settings;

    if (!activePrompt.trim()) return;
    if (credits.remaining <= 0) {
      setError({ message: "CREDIT DEPLETION: Please upgrade your tier for more neural credits.", isRpc: false });
      return;
    }

    const keyReady = await checkApiKey(activeSettings);
    if (!keyReady) return;

    setIsGenerating(true);
    setError(null);

    try {
      const willBeWatermarked = credits.plan === PlanType.FREE && (credits.watermarkFreeRemaining || 0) <= 0;
      const { url } = await generateImage(activePrompt, activeSettings, credits.plan);
      
      const success = await onDeduct();
      if (!success) throw new Error("Neural sync error.");

      const newResult: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt: activePrompt,
        timestamp: Date.now(),
        settings: { ...activeSettings },
        isWatermarked: willBeWatermarked
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev.slice(0, 19)]);
    } catch (err: any) {
      const errorMsg = err.message || "";
      const isRpcError = errorMsg.includes('500') || 
                         errorMsg.includes('Rpc') || 
                         errorMsg.includes('code: 6') || 
                         errorMsg.includes('deadline');

      if (errorMsg.includes("Requested entity was not found")) {
        setError({ message: "NEURAL LINK LOST: Please re-authenticate your API Key.", isRpc: false });
        if (typeof (window as any).aistudio !== 'undefined') {
          await (window as any).aistudio.openSelectKey();
        }
      } else if (isRpcError) {
        setError({ message: "NETWORK SATURATION: Nodes are busy. Auto-retrying...", isRpc: true });
        setTimeout(() => handleGenerate(activePrompt, activeSettings), 2000);
      } else {
        setError({ message: errorMsg || "Synthesis failed. Please adjust your prompt.", isRpc: false });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage, format?: FileFormat) => {
    const targetFormat = format || img.settings.format;
    convertAndDownload(img.url, targetFormat, `cent-gen-${img.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-8">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter gradient-text">Visionary Synthesis</h2>
        <p className="text-xl text-slate-300 font-semibold max-w-2xl mx-auto leading-relaxed">High-fidelity text-to-image generation with 5 precision aspect ratios and 4 neural quality levels.</p>
      </div>

      <SettingsPanel settings={settings} onChange={setSettings} plan={credits.plan} />

      <div className="glass p-8 md:p-12 rounded-[48px] mb-12 space-y-8 shadow-2xl border-white/10">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Prompt Input</label>
            <div className="flex items-center gap-6">
              <span className={`text-[11px] font-black uppercase tracking-widest ${prompt.length > 800 ? 'text-amber-500' : 'text-slate-500'}`}>
                {prompt.length} / 1000
              </span>
              {prompt && (
                <button onClick={() => setPrompt('')} className="text-[11px] font-black text-red-500/80 hover:text-red-500 uppercase tracking-widest">
                  Reset Node
                </button>
              )}
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic solarpunk city with lush vertical gardens, 8k resolution, cinematic lighting..."
            className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-3xl p-8 text-white text-xl md:text-2xl min-h-[220px] transition-all focus:border-sky-500 resize-none font-medium placeholder:text-slate-800 shadow-inner"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-8">
          <div className="text-left w-full md:w-auto">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
              Status: {isGenerating ? 'Encoding Prompt...' : 'Ready for Synthesis'}
            </p>
          </div>
          <Button onClick={() => handleGenerate()} isLoading={isGenerating} disabled={!prompt.trim() || isGenerating} size="lg" className="w-full md:w-auto min-w-[300px] py-6 rounded-[28px] text-xl font-black uppercase tracking-widest shadow-2xl">
            Synthesize Image
          </Button>
        </div>
        
        {error && (
          <div className={`mt-8 p-6 rounded-[32px] border-2 flex items-start gap-5 animate-in slide-in-from-top-4 ${error.isRpc ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
             <span className="text-3xl mt-1">{error.isRpc ? '⚡' : '⚠️'}</span>
             <div>
               <p className={`text-base font-black uppercase tracking-tight ${error.isRpc ? 'text-amber-500' : 'text-red-500'}`}>Neural Interruption</p>
               <p className="text-sm font-semibold text-slate-300 mt-1">{error.message}</p>
             </div>
          </div>
        )}
      </div>

      {result && (
        <div className="glass p-10 rounded-[64px] animate-in fade-in slide-in-from-bottom-12 duration-700 relative border-white/10 shadow-2xl mb-20">
          <div className="relative group rounded-[40px] overflow-hidden mb-10 bg-slate-900 border border-white/5 shadow-inner ring-1 ring-white/10">
            <img src={result.url} alt={result.prompt} className={`w-full h-auto object-contain max-h-[900px] transition-transform duration-1000 group-hover:scale-105 ${result.isWatermarked ? 'filter grayscale-[0.05]' : ''}`} />
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-8 backdrop-blur-md p-10">
               <div className="flex flex-wrap justify-center gap-6">
                 <Button onClick={() => handleDownload(result, 'png')} variant="outline" className="rounded-2xl bg-slate-950/90 font-black px-8 py-4 text-sm tracking-widest">Download PNG</Button>
                 <Button onClick={() => handleDownload(result, 'jpg')} variant="outline" className="rounded-2xl bg-slate-950/90 font-black px-8 py-4 text-sm tracking-widest">Download JPG</Button>
               </div>
               <div className="flex flex-col items-center gap-6 w-full max-w-lg">
                 <div className="grid grid-cols-2 gap-6 w-full">
                    <Button onClick={() => handleDownload(result)} variant="primary" className="rounded-[20px] w-full font-black py-5 uppercase text-base tracking-widest">Quick Save</Button>
                    <Button 
                       onClick={() => handleGenerate(result.prompt, result.settings)} 
                       isLoading={isGenerating} 
                       variant="outline" 
                       className="rounded-[20px] w-full border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-white font-black py-5 uppercase text-base tracking-widest"
                     >
                      Regenerate
                    </Button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
