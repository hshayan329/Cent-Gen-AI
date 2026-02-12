
import React from 'react';
import { UserCredits, PlanType } from '../types';
import { Button } from './ui/Button';

interface ProfilePageProps {
  user: { email: string };
  credits: UserCredits;
  onLogout: () => void;
  onUpgrade: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, credits, onLogout, onUpgrade }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="glass p-10 md:p-16 rounded-[64px] border-white/5 relative overflow-hidden shadow-2xl">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] -ml-32 -mb-32 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
            <div className="w-32 h-32 gradient-bg rounded-[40px] flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-blue-500/20">
              {user.email[0].toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{user.email.split('@')[0]}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2 justify-center md:justify-start">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Account Authenticated & Secure
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-slate-950/50 p-8 rounded-[40px] border border-white/5 shadow-inner">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Tier Status</p>
              <div className="flex items-center gap-4">
                <span className={`text-3xl font-black uppercase tracking-tighter ${
                  credits.plan === PlanType.ULTIMATE ? 'text-purple-400' : 
                  credits.plan === PlanType.PRO ? 'text-blue-400' : 'text-slate-300'
                }`}>
                  {credits.plan}
                </span>
                <span className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-400 border border-white/5">Active</span>
              </div>
              <p className="mt-4 text-[11px] text-slate-500 font-medium leading-relaxed">
                Your current plan grants you access to prioritized neural nodes and advanced synthesis modules.
              </p>
            </div>

            <div className="bg-slate-950/50 p-8 rounded-[40px] border border-white/5 shadow-inner">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Credit Reserves</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">{credits.remaining}</span>
                <span className="text-slate-500 font-bold text-lg">/ {credits.total}</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full mt-6 overflow-hidden">
                <div 
                  className="h-full gradient-bg transition-all duration-1000" 
                  style={{ width: `${(credits.remaining / credits.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-white/5">
            <Button onClick={onUpgrade} className="flex-1 py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em]">Upgrade Neural Tier</Button>
            <Button onClick={onLogout} variant="danger" className="flex-1 py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em]">Terminate Session</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
