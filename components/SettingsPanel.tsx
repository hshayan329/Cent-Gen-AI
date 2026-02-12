
import React, { useRef, useState } from 'react';
import { RESOLUTIONS, QUALITIES, FORMATS, STYLES, IMAGE_SIZES } from '../constants';
import { GenerationSettings, PlanType, FileFormat, AspectRatio, ImageStyle, ImageSize } from '../types';
import { Button } from './ui/Button';

interface SettingsPanelProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
  plan: PlanType;
}

const STYLE_PREVIEWS: Record<string, string> = {
  "Cinematic": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop",
  "Photographic": "https://images.unsplash.com/photo-1554080353-a576cf803bda?q=80&w=400&auto=format&fit=crop",
  "Digital Art": "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=400&auto=format&fit=crop",
  "Anime": "https://images.unsplash.com/photo-1578632738981-4330c709e63a?q=80&w=400&auto=format&fit=crop",
  "3D Render": "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=400&auto=format&fit=crop",
  "Oil Painting": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop",
  "Sketch": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400&auto=format&fit=crop",
  "Cyberpunk": "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400&auto=format&fit=crop"
};

const QUALITY_DESCRIPTIONS: Record<string, string> = {
  "Draft": "Fastest Render, Core Logic Only",
  "Fast": "Optimized Speed, Enhanced Clarity",
  "Standard": "Balanced Precision & Detail",
  "High": "Professional Grade Texturing & Realism"
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, plan }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [styleQuery, setStyleQuery] = useState('');

  const handleChange = (key: keyof GenerationSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('referenceImage', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearReference = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange('referenceImage', undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getAspectRatioVisual = (ar: AspectRatio) => {
    switch(ar) {
      case "1:1": return "w-4 h-4 border-2";
      case "16:9": return "w-6 h-3.5 border-2";
      case "9:16": return "w-3.5 h-6 border-2";
      case "4:3": return "w-5 h-4 border-2";
      case "3:4": return "w-4 h-5 border-2";
      default: return "w-4 h-4 border-2";
    }
  };

  const getQualityLevel = (q: string) => {
    const map: Record<string, number> = { "Draft": 1, "Fast": 2, "Standard": 3, "High": 4 };
    return map[q] || 3;
  };

  const filteredStyles = STYLES.filter(s => s.toLowerCase().includes(styleQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-8 mb-10 glass p-8 md:p-10 rounded-[40px] border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/5 blur-[100px] pointer-events-none"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
        {/* Resolutions (Aspect Ratios) */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">5 Neural Aspect Ratios</label>
          <div className="grid grid-cols-3 gap-3">
            {RESOLUTIONS.map((res) => (
              <button
                key={res}
                onClick={() => handleChange('aspectRatio', res)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border-2 group ${
                  settings.aspectRatio === res
                    ? 'bg-white border-white text-black shadow-xl shadow-white/10'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-500 hover:border-slate-600'
                }`}
              >
                <div className={`${getAspectRatioVisual(res)} rounded-[2px] mb-2 ${settings.aspectRatio === res ? 'border-black' : 'border-slate-700 group-hover:border-slate-500'}`}></div>
                <span className="text-[10px] font-black tracking-tight">{res}</span>
              </button>
            ))}
          </div>
          
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-8 mb-4">Neural Scale (Resolution)</label>
          <div className="flex gap-2">
            {IMAGE_SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => handleChange('imageSize', sz)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                  settings.imageSize === sz
                    ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-500 hover:border-slate-600'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
          <p className="text-[8px] text-slate-600 font-bold uppercase mt-2 tracking-widest">* 2K/4K requires Manual Neural Handshake</p>
        </div>

        {/* Qualities */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">4 Quality Depth Levels</label>
          </div>
          <div className="space-y-3">
            {QUALITIES.map((q) => {
              const level = getQualityLevel(q);
              const isActive = settings.quality === q;
              return (
                <button
                  key={q}
                  onClick={() => handleChange('quality', q)}
                  className={`w-full px-4 py-3 rounded-2xl transition-all border-2 flex flex-col items-start gap-2 group relative overflow-hidden ${
                    isActive
                      ? 'bg-sky-500/10 border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.1)]'
                      : 'bg-slate-950 border-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col items-start text-left">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-sky-400' : 'text-slate-400'}`}>{q}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 opacity-60 ${isActive ? 'text-sky-500' : 'text-slate-600'}`}>
                        {QUALITY_DESCRIPTIONS[q]}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 w-full h-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-full transition-all duration-700 ease-out ${
                          i <= level 
                            ? (isActive ? 'bg-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.8)] opacity-100' : 'bg-slate-700 opacity-60') 
                            : 'bg-slate-900 opacity-30'
                        }`}
                      ></div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style & Format */}
        <div className="flex flex-col">
           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Artistic Engine</label>
           
           <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-white/10 bg-slate-950 shadow-inner group/preview">
              <img 
                src={STYLE_PREVIEWS[settings.style] || STYLE_PREVIEWS["Cinematic"]} 
                alt={settings.style}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">Active: {settings.style}</span>
              </div>
           </div>

           <div className="relative mb-3 group/search">
             <input 
               type="text"
               value={styleQuery}
               onChange={(e) => setStyleQuery(e.target.value)}
               placeholder="Filter engines..."
               className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-2 text-[10px] font-bold text-white placeholder:text-slate-700 outline-none focus:border-sky-500/50 transition-all"
             />
           </div>

           <div className="grid grid-cols-2 gap-2 max-h-[90px] overflow-y-auto no-scrollbar pr-1 mb-6">
              {filteredStyles.map((s) => (
                <button
                  key={s}
                  onClick={() => handleChange('style', s)}
                  className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 text-center leading-tight ${
                    settings.style === s
                      ? 'bg-white/10 border-white text-white'
                      : 'bg-slate-900/40 border-slate-800/50 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
           </div>

           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Output Format</label>
           <div className="flex gap-2">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleChange('format', fmt)}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                    settings.format === fmt
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-900/40 border-slate-800/50 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {fmt}
                </button>
              ))}
           </div>
        </div>

        {/* Reference Image Section */}
        <div className="lg:col-span-3 pt-8 border-t border-white/5 space-y-4">
          <div className="flex justify-between items-end">
            <label className="block text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Style Reference</label>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-40 md:h-48 bg-slate-950/80 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${
              settings.referenceImage ? 'border-sky-500/50' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {settings.referenceImage ? (
              <>
                <img src={settings.referenceImage} className="w-full h-full object-contain p-4" alt="Reference" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Button size="sm" variant="danger" className="rounded-xl px-6" onClick={clearReference}>Clear Asset</Button>
                </div>
              </>
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.1em] mb-1">Upload Reference Image</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-tight">(Optional)</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} hidden onChange={handleReferenceUpload} accept="image/*" />
          </div>
        </div>

        {/* Negative Prompt */}
        <div className="lg:col-span-3 pt-8 border-t border-white/5 space-y-4">
          <div className="flex justify-between items-end">
            <label className="block text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Filtering (Negative Prompt)</label>
          </div>
          <textarea
            value={settings.negativePrompt || ''}
            onChange={(e) => handleChange('negativePrompt', e.target.value)}
            placeholder="blurry, distorted, low quality, watermark, signature, text, extra limbs..."
            className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-3xl p-6 text-white text-sm min-h-[100px] transition-all focus:border-red-500/50 resize-none font-medium placeholder:text-slate-800 shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
