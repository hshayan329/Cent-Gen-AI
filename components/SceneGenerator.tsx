
import React, { useState, useEffect } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { Button } from './ui/Button';
import { GenerationSettings, Scene, UserCredits, PlanType, FileFormat, GeneratedImage } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { generateImage } from '../services/geminiService';

/**
 * Robust utility to convert and download generated assets.
 * Uses Blob-based approach for high-performance with large 2K/4K assets.
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
    img.onerror = () => reject(new Error("Image data could not be loaded for conversion"));
    img.src = dataUrl;
  });
};

interface SceneGeneratorProps {
  credits: UserCredits;
  onDeduct: () => Promise<boolean>;
}

export const SceneGenerator: React.FC<SceneGeneratorProps> = ({ credits, onDeduct }) => {
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [scenes, setScenes] = useState<Scene[]>([
    { id: '1', prompt: '', loading: false },
    { id: '2', prompt: '', loading: false },
    { id: '3', prompt: '', loading: false },
  ]);
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    const saved = localStorage.getItem('centgen_history_scenes');
    return saved ? JSON.parse(saved) : [];
  });
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [activeAdSceneId, setActiveAdSceneId] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  useEffect(() => {
    localStorage.setItem('centgen_history_scenes', JSON.stringify(history));
  }, [history]);

  const checkApiKey = async (activeSettings: GenerationSettings): Promise<boolean> => {
    // Pro model check for 2K/4K/Search
    const isProRequired = activeSettings.useSearch || activeSettings.imageSize === "2K" || activeSettings.imageSize === "4K";
    if (!isProRequired) return true;

    // Safety check for standalone deployments
    if (typeof (window as any).aistudio === 'undefined') {
      return true;
    }

    try {
      const aistudio = (window as any).aistudio;
      if (!(await aistudio.hasSelectedApiKey())) {
        await aistudio.openSelectKey();
      }
      return true;
    } catch (e) {
      return true;
    }
  };

  const generateScene = async (index: number, overridePrompt?: string, overrideSettings?: GenerationSettings) => {
    const scene = scenes[index];
    const activePrompt = overridePrompt !== undefined ? overridePrompt : scene.prompt;
    const activeSettings = overrideSettings !== undefined ? overrideSettings : settings;

    if (!activePrompt.trim()) return;
    if (credits.remaining <= 0) {
      setGlobalError("Insufficient credits for neural synthesis.");
      return;
    }

    const keyReady = await checkApiKey(activeSettings);
    if (!keyReady) return;

    setGlobalError(null);
    setScenes(prev => prev.map((s, i) => i === index ? { ...s, loading: true, error: undefined } : s));

    try {
      const willBeWatermarked = credits.plan === PlanType.FREE && (credits.watermarkFreeRemaining || 0) <= 0;
      const { url } = await generateImage(activePrompt, activeSettings, credits.plan);
      
      const success = await onDeduct();
      if (!success) throw new Error("Sync failed.");

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt: activePrompt,
        timestamp: Date.now(),
        settings: { ...activeSettings },
        isWatermarked: willBeWatermarked
      };

      setScenes(prev => prev.map((s, i) => i === index ? { 
        ...s, 
        loading: false, 
        prompt: activePrompt, 
        image: newImage
      } : s));

      setHistory(prev => [newImage, ...prev.slice(0, 24)]); // Keep last 25 scene images
    } catch (err: any) {
      const isRpcError = err.message?.includes('500') || err.message?.includes('Rpc') || err.message?.includes('6');
      setScenes(prev => prev.map((s, i) => i === index ? { 
        ...s, loading: false, error: isRpcError ? "Nodes saturated. Retry sync." : (err.message || "Failed") 
      } : s));
    }
  };

  const handleGenerateAll = async () => {
    const validScenes = scenes.filter(s => s.prompt.trim() && !s.loading);
    if (validScenes.length === 0) return;
    
    if (credits.remaining < validScenes.length) {
      setGlobalError(`Insufficient credits. You need ${validScenes.length} credits.`);
      return;
    }

    const keyReady = await checkApiKey(settings);
    if (!keyReady) return;

    setIsGeneratingAll(true);
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].prompt.trim()) {
        await generateScene(i);
      }
    }
    setIsGeneratingAll(false);
  };

  const handleWatchAd = (sceneId: string) => {
    setActiveAdSceneId(sceneId);
    setIsAdPlaying(true);
    setAdTimer(5);
    const interval = setInterval(() => {
      setAdTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsAdPlaying(false);
          setScenes(current => current.map(s => {
            if (s.id === sceneId && s.image) {
              const updated = { ...s.image, isWatermarked: false };
              setHistory(h => h.map(item => item.id === s.image?.id ? updated : item));
              return { ...s, image: updated };
            }
            return s;
          }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDownload = (img: GeneratedImage, format?: FileFormat) => {
    convertAndDownload(img.url, format || img.settings.format, `scene-${img.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold mb-4 uppercase tracking-tighter text-white">Storyboard Console</h2>
        <p className="text-slate-400">Sequence neural frames with 5 precision aspect ratios and unified style guidance.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-start">
        <div className="flex-1 w-full">
           <SettingsPanel settings={settings} onChange={setSettings} plan={credits.plan} />
        </div>
        <div className="glass p-6 rounded-3xl w-full md:w-64 flex flex-col gap-4 border-blue-500/10">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Controls</h3>
           <Button 
            onClick={handleGenerateAll} 
            isLoading={isGeneratingAll} 
            disabled={isGeneratingAll || !scenes.some(s => s.prompt.trim())}
            className="w-full rounded-2xl"
           >
             Generate All
           </Button>
           <Button 
            variant="outline" 
            onClick={() => setScenes(scenes.map(s => ({ ...s, prompt: '' })))}
            className="w-full rounded-2xl"
           >
             Reset All
           </Button>
        </div>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl text-center text-xs font-black uppercase tracking-widest animate-pulse">
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {scenes.map((scene, idx) => (
          <div key={scene.id} className="glass p-6 rounded-[40px] flex flex-col h-full border-white/5 hover:border-blue-500/30 transition-all shadow-xl group/card relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black bg-slate-950 text-blue-500 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-[0.2em]">NODE {idx + 1}</span>
              <button onClick={() => setScenes(scenes.filter(s => s.id !== scene.id))} className="text-slate-700 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="aspect-video bg-slate-950 rounded-3xl mb-4 overflow-hidden relative flex items-center justify-center group border border-white/5">
              {scene.loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] text-blue-500 font-black uppercase animate-pulse">Neural Render...</span>
                </div>
              ) : scene.image ? (
                <>
                  <img src={scene.image.url} className={`w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000 ${scene.image.isWatermarked ? 'filter grayscale-[0.2]' : ''}`} />
                  {scene.image.isWatermarked && <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10"><div className="text-[3vw] font-black text-white -rotate-45 uppercase tracking-widest">CENT GEN</div></div>}
                  <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-6 backdrop-blur-sm">
                    <div className="flex flex-wrap justify-center gap-2 mb-2">
                       <Button variant="outline" size="sm" onClick={() => handleDownload(scene.image!, 'png')} className="bg-slate-900/80 font-bold">PNG</Button>
                       <Button variant="outline" size="sm" onClick={() => handleDownload(scene.image!, 'jpg')} className="bg-slate-900/80 font-bold">JPG</Button>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="bg-slate-900/80 font-bold disabled:opacity-25"
                         onClick={() => handleDownload(scene.image!, 'svg')}
                         disabled={credits.plan === PlanType.FREE}
                         title={credits.plan === PlanType.FREE ? "SVG export requires Pro or Ultimate plan" : "Download SVG version"}
                       >
                         SVG {credits.plan === PlanType.FREE ? '🔒' : ''}
                       </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button variant="primary" size="sm" className="w-full" onClick={() => handleDownload(scene.image!)}>Download</Button>
                      <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                          onClick={() => generateScene(idx, scene.image?.prompt, scene.image?.settings)}
                      >
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Regen
                      </Button>
                    </div>
                    {scene.image.isWatermarked && <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => handleWatchAd(scene.id)}>Remove Watermark (AD)</Button>}
                  </div>
                </>
              ) : (
                <div className="text-slate-800 font-black text-[10px] uppercase tracking-[0.3em] italic text-white/20">Waiting for Input...</div>
              )}
            </div>

            <div className="relative flex-grow mb-4">
              <textarea
                value={scene.prompt}
                onChange={(e) => setScenes(scenes.map(s => s.id === scene.id ? { ...s, prompt: e.target.value } : s))}
                placeholder="Visual description for this scene..."
                className="w-full h-32 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-slate-300 text-xs focus:border-blue-500 resize-none font-medium placeholder:text-slate-800"
              />
              {scene.prompt && (
                <button onClick={() => setScenes(scenes.map(s => s.id === scene.id ? { ...s, prompt: '' } : s))} className="absolute top-2 right-2 text-[9px] font-black text-slate-600 hover:text-red-500 uppercase">Clear</button>
              )}
            </div>

            {scene.error && <p className="mb-4 text-center text-red-500 text-[10px] font-black uppercase bg-red-500/10 py-2 rounded-xl border border-red-500/20">{scene.error}</p>}
            <Button onClick={() => generateScene(idx)} isLoading={scene.loading} disabled={!scene.prompt.trim() || scene.loading} size="sm" className="w-full rounded-2xl text-[10px] py-4">Generate Scene {idx + 1}</Button>
          </div>
        ))}
        <button onClick={() => setScenes([...scenes, { id: Date.now().toString(), prompt: '', loading: false }])} className="glass rounded-[40px] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-slate-700 hover:border-blue-500/40 hover:text-blue-500/60 transition-all min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <span className="font-black uppercase tracking-widest text-[10px]">Append Neural Node</span>
        </button>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8 px-4">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Scene Vault</h3>
            <button onClick={() => setHistory([])} className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest transition-colors">Reset Vault</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {history.map((item) => (
              <div key={item.id} className="group relative glass rounded-[32px] overflow-hidden border-white/5 aspect-video cursor-pointer hover:border-blue-500/30 transition-all shadow-lg">
                <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Vault Item" />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                  <Button size="sm" variant="primary" className="w-full text-[8px] py-2 rounded-xl" onClick={(e) => { e.stopPropagation(); handleDownload(item); }}>Download</Button>
                  <Button size="sm" variant="outline" className="w-full text-[8px] py-2 rounded-xl bg-slate-900/80" onClick={(e) => { 
                    e.stopPropagation(); 
                    const link = document.createElement('a');
                    link.href = item.url;
                    link.download = `vault-${item.id}.png`;
                    link.click();
                  }}>Quick Save</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdPlaying && (
        <div className="fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8">
           <div className="w-full max-w-xl aspect-video bg-slate-900 rounded-[40px] border border-blue-500/20 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-8 right-8 bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-black">REMAINING: {adTimer}s</div>
              <div className="text-center p-12">
                 <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter gradient-text">Cent Gen Premium</h2>
                 <p className="text-slate-400 text-sm mb-10 max-w-sm mx-auto">Skip ads and watermarks with Pro and Ultimate plans.</p>
                 <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden shadow-inner">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${((5 - adTimer) / 5) * 100}%` }}></div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
