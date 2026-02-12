
import React from 'react';
import { Button } from './ui/Button';

interface LandingPageProps {
  onStart: () => void;
  onHelp: () => void;
  onPricing: () => void;
  onPrivacy: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onHelp, onPricing, onPrivacy }) => {
  const features = [
    {
      title: "Visualizer Engine",
      desc: "5 precision resolutions and 5 neural quality levels for elite image synthesis.",
      icon: "🎨",
      color: "from-blue-500 to-sky-400"
    },
    {
      title: "Storyboard Console",
      desc: "Sequence frames into a coherent narrative with unified style logic.",
      icon: "🎞️",
      color: "from-purple-500 to-indigo-400"
    },
    {
      title: "Ebook Production",
      desc: "Draft, visualize, and export full books with automated layout nodes.",
      icon: "📖",
      color: "from-emerald-500 to-teal-400"
    },
    {
      title: "Mockup Lab",
      desc: "Instant professional product visualizations on high-fidelity assets.",
      icon: "👔",
      color: "from-rose-500 to-orange-400"
    },
    {
      title: "Neural-BG Changer",
      desc: "Transform background environments while preserving subject integrity.",
      icon: "🌈",
      color: "from-amber-500 to-orange-400"
    },
    {
      title: "BG Remover Pro",
      desc: "Studio-quality subject isolation with edge-detection neural nodes.",
      icon: "✂️",
      color: "from-cyan-500 to-blue-400"
    },
    {
      title: "Thumbnail Hub",
      desc: "Synthesize high-CTR viral thumbnails optimized for global platforms.",
      icon: "🖼️",
      color: "from-red-500 to-rose-400"
    },
    {
      title: "Neural Assistant",
      desc: "Engage with a multimodal AI assistant for logic and design insights.",
      icon: "🤖",
      color: "from-indigo-500 to-purple-400"
    }
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full animate-bounce-slow"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 text-center z-10">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Neural Protocol v3.0 Active</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700">
          Beyond <span className="gradient-text">Imagination</span> <br/>
          Synthesized.
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-12 px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          The ultimate all-in-one neural workshop for creators, artists, and enterprises. 
          Generate elite visuals with unmatched precision across 8 specialized models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <Button onClick={onStart} size="lg" className="w-full sm:w-auto px-12 py-6 rounded-[28px] text-xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 group">
            Initialize Engine
            <svg className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </Button>
          <Button variant="outline" onClick={onStart} size="lg" className="w-full sm:w-auto px-12 py-6 rounded-[28px] text-xl font-black uppercase tracking-widest border-white/10 hover:bg-white/5">
            View Gallery
          </Button>
        </div>

        {/* Hero Demo Mockup */}
        <div className="mt-24 max-w-6xl mx-auto px-4 relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[64px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
           <div className="relative glass rounded-[56px] border-white/10 overflow-hidden shadow-2xl aspect-[16/9] md:aspect-[21/9]">
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                 <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" alt="Demo Syntheses" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                 <div className="absolute bottom-12 left-12 text-left">
                    <p className="text-white text-3xl font-black uppercase tracking-tighter">Cinematic Quality</p>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Rendered in 4K resolution via Cent Gen Pro</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-4xl font-black text-white mb-2 tracking-tighter">1.2M+</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syntheses Daily</p>
          </div>
          <div>
            <p className="text-4xl font-black text-blue-500 mb-2 tracking-tighter">99.8%</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Accuracy</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white mb-2 tracking-tighter">18ms</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Latency</p>
          </div>
          <div>
            <p className="text-4xl font-black text-purple-500 mb-2 tracking-tighter">24/7</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Uptime</p>
          </div>
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">The Neural Suite</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Everything an artist needs to scale their vision</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="glass p-10 rounded-[48px] border-white/5 hover:border-white/20 transition-all hover:-translate-y-2 group cursor-pointer relative overflow-hidden h-full flex flex-col">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity`}></div>
              <div className="text-4xl mb-6">{f.icon}</div>
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{f.title}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed flex-grow">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-40 px-4 text-center relative">
        <div className="max-w-4xl mx-auto glass p-20 rounded-[80px] border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none"></div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">Ready for <span className="gradient-text">Ignition?</span></h2>
          <p className="text-slate-300 text-lg mb-12 max-w-md mx-auto font-medium">Join 50,000+ creators scaling their visual identity with Cent Gen.</p>
          <Button onClick={onStart} size="lg" className="px-16 py-6 rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl">Create Free Account</Button>
          <p className="mt-12 text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Encrypted Handshake Protocol — ISO/IEC 27001</p>
        </div>
      </section>

      {/* Real Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-black text-xl">C</div>
             <h3 className="text-2xl font-black tracking-tighter gradient-text uppercase">CENT GEN</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <button onClick={onPricing} className="hover:text-white transition-colors uppercase">Pricing Plans</button>
             <button onClick={onHelp} className="hover:text-white transition-colors uppercase">Help & Support</button>
             <button onClick={onPrivacy} className="hover:text-white transition-colors uppercase">Privacy Policy</button>
          </div>
          <p className="text-[10px] font-bold text-slate-600">© 2025 CENT GEN ARTIFICIAL INTELLIGENCE LABS</p>
        </div>
      </footer>
    </div>
  );
};
