
import React, { useState } from 'react';
import { PlanType, EbookPage, UserCredits } from '../types';
import { Button } from './ui/Button';
import { generateEbookStructure, generateImage } from '../services/geminiService';
import { DEFAULT_SETTINGS } from '../constants';

export const EbookLab: React.FC<{ 
  plan: PlanType, 
  credits: UserCredits, 
  // Updated onDeduct to return Promise<boolean> to match App.tsx implementation
  onDeduct: () => Promise<boolean> 
}> = ({ plan, credits, onDeduct }) => {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [pageCount, setPageCount] = useState(5);
  const [pages, setPages] = useState<EbookPage[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDraftOutline = async () => {
    if (!title || !theme) return;
    setIsDrafting(true);
    setError(null);
    try {
      const structure = await generateEbookStructure(title, theme, pageCount);
      setPages(structure.map(p => ({ ...p, loading: false })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleGeneratePageImage = async (index: number) => {
    if (credits.remaining <= 0) return;
    setPages(prev => prev.map((p, i) => i === index ? { ...p, loading: true } : p));
    try {
      const { url } = await generateImage(pages[index].imagePrompt, { ...DEFAULT_SETTINGS, style: 'Cinematic' }, plan);
      // Awaiting onDeduct because handleDeductCredit is asynchronous
      await onDeduct();
      setPages(prev => prev.map((p, i) => i === index ? { ...p, loading: false, imageUrl: url } : p));
    } catch (err: any) {
      setPages(prev => prev.map((p, i) => i === index ? { ...p, loading: false } : p));
    }
  };

  const exportAsWord = () => {
    const html = `<html><head><meta charset="utf-8"></head><body><h1>${title}</h1>${pages.map(p => `<div><h2>Page ${p.pageNumber}</h2><p>${p.text}</p><img src="${p.imageUrl}" style="width:100%"></div>`).join('')}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, '_')}.doc`;
    link.click();
  };

  const exportAsPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-10 print:hidden">
        <h2 className="text-4xl font-black uppercase tracking-tighter">Ebook Production</h2>
        <p className="text-slate-400">Draft, Visualize, and Export Narrative Projects</p>
      </div>

      <div className="glass p-8 rounded-[40px] border-white/5 mb-10 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ebook Title" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold" />
          <select value={pageCount} onChange={e => setPageCount(Number(e.target.value))} className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold">
            {[3, 5, 8, 12].map(n => <option key={n} value={n}>{n} Pages</option>)}
          </select>
        </div>
        <textarea value={theme} onChange={e => setTheme(e.target.value)} placeholder="Plot summary / Art style..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white min-h-[120px] mb-6" />
        <div className="flex justify-end">
          <Button onClick={handleDraftOutline} isLoading={isDrafting} className="rounded-2xl font-black uppercase tracking-widest text-xs py-4 px-8">Draft Structural Outline</Button>
        </div>
      </div>

      {pages.length > 0 && (
        <div className="space-y-12">
          {/* Print Metadata */}
          <div className="print-only text-center mb-16">
            <h1 className="text-6xl font-black mb-4">{title}</h1>
            <p className="text-xl uppercase tracking-[0.5em] text-slate-500">Synthesized by Cent Gen AI</p>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-6 rounded-3xl border border-white/5 print:hidden">
             <h3 className="text-xl font-black uppercase">Storyboard View</h3>
             <div className="flex gap-3">
               <Button onClick={exportAsPDF} variant="primary" className="rounded-xl px-6">Export PDF</Button>
               <Button onClick={exportAsWord} variant="outline" className="rounded-xl px-6">Export Word</Button>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {pages.map((page, idx) => (
              <div key={idx} className="ebook-page glass p-8 md:p-12 rounded-[48px] border-white/5 flex flex-col lg:flex-row gap-12 shadow-2xl">
                <div className="lg:w-1/2 flex flex-col justify-center">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black mb-8 shadow-xl print:hidden">P{page.pageNumber}</div>
                  <div className="print-only mb-4 text-xs font-bold text-slate-400">Page {page.pageNumber}</div>
                  <p className="ebook-text text-2xl font-medium leading-relaxed italic text-white/90 print:text-black">
                    "{page.text}"
                  </p>
                  <div className="mt-8 pt-8 border-t border-white/5 print:hidden">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Neural Vision Prompt:</p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{page.imagePrompt}</p>
                  </div>
                </div>
                <div className="lg:w-1/2 aspect-video bg-slate-950 rounded-[40px] overflow-hidden flex items-center justify-center border border-white/5 shadow-inner">
                  {page.imageUrl ? (
                    <img src={page.imageUrl} className="ebook-image w-full h-full object-cover" alt={`Page ${page.pageNumber}`} />
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <Button onClick={() => handleGeneratePageImage(idx)} isLoading={page.loading} variant="primary" className="rounded-xl px-8">Synthesize Visual</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
