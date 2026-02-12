
import React, { useState } from 'react';
import { PlanType } from '../types';
import { CREDIT_LIMITS, MOCKUP_LIMITS } from '../constants';
import { Button } from './ui/Button';

interface PricingProps {
  currentPlan: PlanType;
  onUpgrade: (plan: PlanType) => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  onOpenChat: (plan: PlanType) => void;
}

export const Pricing: React.FC<PricingProps> = ({ currentPlan, onUpgrade, isLoggedIn, onOpenAuth, onOpenChat }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const BASE_PRICES = {
    [PlanType.FREE]: 0,
    [PlanType.PRO]: 19,
    [PlanType.ULTIMATE]: 49,
  };

  const calculateDisplayPrice = (planName: PlanType) => {
    const base = BASE_PRICES[planName];
    if (planName === PlanType.FREE) return "0";
    
    if (billingCycle === 'yearly') {
      return (base * 0.4).toFixed(2);
    }
    return (base * 0.6).toFixed(2);
  };

  const plans = [
    {
      name: PlanType.FREE,
      credits: CREDIT_LIMITS[PlanType.FREE],
      mockups: MOCKUP_LIMITS[PlanType.FREE],
      price: '0',
      description: 'Full model access for basic creative testing.',
      features: [
        `${CREDIT_LIMITS[PlanType.FREE]} Vision Credits`,
        `${MOCKUP_LIMITS[PlanType.FREE]} Monthly Mockups`,
        'All Neural Qualities (Draft-High)',
        'Full Resolution Support',
        'Storyboard & Visualizer',
        'Neural BG Changer',
        'PNG, JPG & SVG Exports'
      ],
      cta: 'Sign Up Free'
    },
    {
      name: PlanType.PRO,
      credits: CREDIT_LIMITS[PlanType.PRO],
      mockups: MOCKUP_LIMITS[PlanType.PRO],
      price: calculateDisplayPrice(PlanType.PRO),
      originalPrice: BASE_PRICES[PlanType.PRO],
      description: 'Built for active creators and freelancers.',
      features: [
        `${CREDIT_LIMITS[PlanType.PRO]} Vision Credits`,
        `${MOCKUP_LIMITS[PlanType.PRO]} Monthly Mockups`,
        'Ebook Production Lab',
        'Viral Thumbnail Hub',
        'Always Watermark-Free',
        'Neural BG Changer & Remover',
        'Priority Rendering Pipeline'
      ],
      popular: true,
      cta: 'Contact for Payment Link'
    },
    {
      name: PlanType.ULTIMATE,
      credits: CREDIT_LIMITS[PlanType.ULTIMATE],
      mockups: MOCKUP_LIMITS[PlanType.ULTIMATE],
      price: calculateDisplayPrice(PlanType.ULTIMATE),
      originalPrice: BASE_PRICES[PlanType.ULTIMATE],
      description: 'The complete enterprise visual suite.',
      features: [
        `${CREDIT_LIMITS[PlanType.ULTIMATE]} Vision Credits`,
        `${MOCKUP_LIMITS[PlanType.ULTIMATE]} Monthly Mockups`,
        'Advanced Ebook Lab',
        'Cent Gen Assistant',
        'Search Grounding',
        'Gemini 3 Pro Max Access',
        'Enterprise Logic Controls'
      ],
      cta: 'Talk to Enterprise'
    }
  ];

  const handleAction = (plan: PlanType) => {
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }
    
    if (plan === currentPlan) return;

    if (plan !== PlanType.FREE) {
      onOpenChat(plan);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase">Scale Your Vision</h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium mb-10">Limited Time Offer: Neural Nodes at Massive Discounts.</p>
        
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[8px] font-black border border-white/5">40% OFF</span>
            </div>
            
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-16 h-8 bg-slate-800 rounded-full p-1 relative transition-colors hover:bg-slate-700 shadow-inner"
            >
              <div className={`w-6 h-6 bg-blue-500 rounded-full transition-transform duration-300 shadow-lg ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`}></div>
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-blue-400' : 'text-slate-500'}`}>Yearly</span>
              <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full text-[8px] font-black border border-blue-500/20 shadow-blue-500/10">60% OFF</span>
            </div>
          </div>
        </div>

        {billingCycle === 'yearly' && (
          <div className="inline-flex items-center gap-2 bg-green-500/5 border border-green-500/20 px-6 py-2.5 rounded-full mb-4 shadow-sm animate-in zoom-in duration-300">
             <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
             <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">7-Day Risk-Free Moneyback Guarantee</span>
          </div>
        )}

        <div className="mt-6 bg-slate-900/50 border border-slate-800 p-4 rounded-3xl max-w-xl mx-auto mb-12">
          <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Upgrade Protocol</p>
          <p className="text-xs text-slate-400 mt-2">To ensure secure transactions, payments are processed via manually dispatched links. Choose a plan and our agents will send your unique link within minutes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = isLoggedIn && plan.name === currentPlan;
          const showSignUp = !isLoggedIn && plan.name === PlanType.FREE;
          
          return (
            <div 
              key={plan.name} 
              className={`relative glass p-8 rounded-[48px] border-2 transition-all hover:scale-[1.02] flex flex-col ${
                plan.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/10' : 'border-white/5'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-blue-500/30">
                  Most Popular
                </span>
              )}
              
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{plan.name}</h3>
              <p className="text-slate-500 text-[10px] mb-6 font-bold uppercase tracking-widest leading-relaxed">{plan.description}</p>
              
              <div className="flex flex-col mb-6">
                {plan.originalPrice && plan.originalPrice > 0 && (
                  <span className="text-slate-500 text-sm line-through font-bold decoration-red-500/50 decoration-2">
                    €{plan.originalPrice}
                  </span>
                )}
                <div className="flex items-baseline">
                  <span className="text-5xl font-black tracking-tighter">€{plan.price}</span>
                  <span className="text-slate-500 text-xs ml-2 font-bold uppercase tracking-widest">/mo</span>
                </div>
              </div>
              
              <div className={`rounded-3xl p-5 mb-8 ${plan.name === PlanType.ULTIMATE ? 'bg-purple-500/10' : 'bg-blue-500/10'}`}>
                <div className="flex flex-col gap-1">
                  <span className={`${plan.name === PlanType.ULTIMATE ? 'text-purple-400' : 'text-blue-400'} font-black text-xl block leading-none`}>{plan.credits} Vision Credits</span>
                  <span className={`${plan.name === PlanType.ULTIMATE ? 'text-purple-500/70' : 'text-blue-500/70'} font-black text-xs block leading-none`}>{plan.mockups} Mockups</span>
                </div>
                <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-none mt-2 block">Monthly Capacity</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start text-xs text-slate-300">
                    <div className="mt-0.5 mr-3">
                      <svg className={`w-3.5 h-3.5 ${plan.name === PlanType.FREE ? 'text-slate-600' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="font-bold uppercase tracking-tight leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full py-5 text-[10px] font-black uppercase tracking-widest rounded-[20px]"
                variant={isCurrentPlan ? 'outline' : 'primary'}
                disabled={isCurrentPlan}
                onClick={() => handleAction(plan.name as PlanType)}
              >
                {isCurrentPlan ? 'Current Access Tier' : (showSignUp ? 'Sign Up Free' : plan.cta)}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
