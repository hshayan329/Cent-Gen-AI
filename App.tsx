
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlanType, UserCredits } from './types';
import { CREDIT_LIMITS, MOCKUP_LIMITS } from './constants';
import { SingleGenerator } from './components/SingleGenerator';
import { SceneGenerator } from './components/SceneGenerator';
import { Pricing } from './components/Pricing';
import { Chatbot } from './components/Chatbot';
import { BackgroundChanger } from './components/BackgroundChanger';
import { BackgroundRemover } from './components/BackgroundRemover';
import { ThumbnailCreator } from './components/ThumbnailCreator';
import { AuthModal } from './components/AuthModal';
import { EbookLab } from './components/EbookLab';
import { MockupGenerator } from './components/MockupGenerator';
import { ChatWidget } from './components/ChatWidget';
import { ContactPage } from './components/ContactPage';
import { ProfilePage } from './components/ProfilePage';
import { LandingPage } from './components/LandingPage';
import { LiveAssistant } from './components/LiveAssistant';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Button } from './components/ui/Button';
import { supabase, isSupabaseConnected } from './lib/supabase';

const App: React.FC = () => {
  // Always start at landing page
  const [activeTab, setActiveTab] = useState<'landing' | 'single' | 'scene' | 'pricing' | 'assistant' | 'live' | 'bgchange' | 'ebook' | 'mockup' | 'bgremove' | 'thumbnail' | 'contact' | 'profile' | 'privacy'>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialMsg, setChatInitialMsg] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [credits, setCredits] = useState<UserCredits>(() => {
    const saved = localStorage.getItem('centgen_user_credits');
    if (saved) return JSON.parse(saved);
    return {
      plan: PlanType.FREE,
      remaining: CREDIT_LIMITS[PlanType.FREE],
      total: CREDIT_LIMITS[PlanType.FREE],
      mockupsRemaining: MOCKUP_LIMITS[PlanType.FREE],
      mockupsTotal: MOCKUP_LIMITS[PlanType.FREE],
      referralCode: 'CENT-GIFT',
      referralsCount: 0
    };
  });

  useEffect(() => {
    localStorage.setItem('centgen_user_credits', JSON.stringify(credits));
  }, [credits]);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConnected()) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setCredits({
          plan: data.plan as PlanType,
          remaining: data.credits,
          total: CREDIT_LIMITS[data.plan as PlanType] || 70,
          mockupsRemaining: data.mockup_credits,
          mockupsTotal: MOCKUP_LIMITS[data.plan as PlanType] || 20,
          referralCode: 'CENT-GIFT',
          referralsCount: 0
        });
      }
    } catch (e) {
      // Fail silently
    }
  }, []);

  useEffect(() => {
    const restrictedTabs = ['single', 'scene', 'bgremove', 'bgchange', 'mockup', 'assistant', 'live', 'ebook', 'thumbnail', 'profile'];

    if (!isSupabaseConnected()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        resetCredits();
        if (restrictedTabs.includes(activeTabRef.current)) {
          setActiveTab('landing');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const resetCredits = () => {
    setCredits({
      plan: PlanType.FREE,
      remaining: CREDIT_LIMITS[PlanType.FREE],
      total: CREDIT_LIMITS[PlanType.FREE],
      mockupsRemaining: MOCKUP_LIMITS[PlanType.FREE],
      mockupsTotal: MOCKUP_LIMITS[PlanType.FREE],
      referralCode: 'CENT-GIFT',
      referralsCount: 0
    });
  };

  const handleLogout = async () => {
    if (isSupabaseConnected()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setActiveTab('landing');
    setIsAccountOpen(false);
  };

  const handleDeductCredit = (amount: number = 1): boolean => {
    if (credits.remaining >= amount) {
      const newRemaining = credits.remaining - amount;
      setCredits(prev => ({ ...prev, remaining: newRemaining }));
      
      if (user && isSupabaseConnected()) {
        supabase
          .from('profiles')
          .update({ credits: newRemaining })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) console.error("Credit sync error", error);
          });
      }
      return true;
    }
    return false;
  };

  const handleUpgradeRequest = (plan: PlanType) => {
    setChatInitialMsg(`I would like to upgrade my plan to ${plan}. Please send me the payment link.`);
    setIsChatOpen(true);
  };

  const getTabs = () => {
    const isFree = credits.plan === PlanType.FREE;
    const baseTabs = [
      {id: 'single', label: 'Visualizer'},
      {id: 'scene', label: 'Storyboard'},
      {id: 'bgremove', label: 'BG Remover'},
      {id: 'bgchange', label: 'Neural-BG'},
      {id: 'mockup', label: 'Mockups'},
    ];
    if (!isFree) {
      baseTabs.splice(2, 0, {id: 'ebook', label: 'Ebook Lab'});
      baseTabs.splice(3, 0, {id: 'thumbnail', label: 'Thumbnails'});
    }
    baseTabs.push({id: 'live', label: 'Neural Live'});
    if (credits.plan !== PlanType.PRO) baseTabs.push({id: 'assistant', label: 'Assistant'});
    baseTabs.push({id: 'pricing', label: 'Plans'});
    return baseTabs;
  };

  const renderContent = () => {
    if (activeTab === 'privacy') return <PrivacyPolicy onBack={() => setActiveTab(user ? 'single' : 'landing')} />;
    if (activeTab === 'contact') return <ContactPage />;
    if (activeTab === 'pricing') return <Pricing currentPlan={credits.plan} onUpgrade={handleUpgradeRequest} isLoggedIn={!!user} onOpenAuth={() => setIsAuthOpen(true)} onOpenChat={handleUpgradeRequest} />;

    if (activeTab === 'landing' && !user) {
      return (
        <LandingPage 
          onStart={() => setIsAuthOpen(true)} 
          onHelp={() => setActiveTab('contact')} 
          onPricing={() => setActiveTab('pricing')}
          onPrivacy={() => setActiveTab('privacy')}
        />
      );
    }

    // Strictly enforce auth for app features
    const needsAuth = ['single', 'scene', 'bgremove', 'bgchange', 'mockup', 'assistant', 'live', 'ebook', 'thumbnail', 'profile'].includes(activeTab);
    
    if (needsAuth && !user) {
      return (
        <div className="max-w-4xl mx-auto py-24 px-4 text-center">
          <div className="glass p-16 rounded-[64px] border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
             <div className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto mb-8 shadow-2xl animate-bounce-slow">C</div>
             <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter gradient-text">Access Restricted</h2>
             <p className="text-xl text-slate-300 mb-10 font-semibold max-w-lg mx-auto leading-relaxed">
               Authentication required. Please sign up or login to access Cent Gen's suite of creative neural models.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setIsAuthOpen(true)} size="lg" className="rounded-2xl px-12 py-5 text-xl font-black uppercase tracking-widest shadow-blue-500/20">Sign Up</Button>
                <Button variant="outline" onClick={() => setIsAuthOpen(true)} size="lg" className="rounded-2xl px-12 py-5 text-xl font-black uppercase tracking-widest">Login</Button>
             </div>
          </div>
        </div>
      );
    }

    switch(activeTab) {
      case 'landing': return <LandingPage onStart={() => user ? setActiveTab('single') : setIsAuthOpen(true)} onHelp={() => setActiveTab('contact')} onPricing={() => setActiveTab('pricing')} onPrivacy={() => setActiveTab('privacy')} />;
      case 'single': return <SingleGenerator credits={credits} onDeduct={() => Promise.resolve(handleDeductCredit(1))} />;
      case 'scene': return <SceneGenerator credits={credits} onDeduct={() => Promise.resolve(handleDeductCredit(1))} />;
      case 'ebook': return <EbookLab plan={credits.plan} credits={credits} onDeduct={() => Promise.resolve(handleDeductCredit(1))} />;
      case 'thumbnail': return <ThumbnailCreator credits={credits} onDeduct={(amt) => Promise.resolve(handleDeductCredit(amt))} />;
      case 'bgremove': return <BackgroundRemover credits={credits} onDeduct={() => Promise.resolve(handleDeductCredit(1))} />;
      case 'bgchange': return <BackgroundChanger plan={credits.plan} onDeduct={() => Promise.resolve(handleDeductCredit(1))} />;
      case 'mockup': return <MockupGenerator credits={credits} onDeduct={() => Promise.resolve(handleDeductCredit(1))} />;
      case 'assistant': return <Chatbot plan={credits.plan} onDeduct={() => Promise.resolve(handleDeductCredit(1))} onHelpClick={() => setActiveTab('contact')} />;
      case 'live': return <LiveAssistant plan={credits.plan} />;
      case 'profile': return user ? <ProfilePage user={user} credits={credits} onLogout={handleLogout} onUpgrade={() => setActiveTab('pricing')} /> : null;
      default: return null;
    }
  };

  const AccountDropdown = () => (
    <div className="absolute right-0 mt-3 w-56 glass rounded-[24px] p-5 shadow-2xl border-white/10 z-[101] animate-in slide-in-from-top-2 duration-200">
      <button onClick={() => { setActiveTab('profile'); setIsAccountOpen(false); }} className="w-full text-left text-white font-black uppercase text-[10px] mb-4 hover:text-blue-400 flex items-center gap-3">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        User Profile
      </button>
      <button onClick={handleLogout} className="w-full text-left text-red-500 font-black uppercase text-[10px] hover:text-red-400 flex items-center gap-3">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        Logout Agent
      </button>
    </div>
  );

  const UserStatusTrigger = () => (
    user ? (
      <div className="relative">
        <button onClick={() => setIsAccountOpen(!isAccountOpen)} className="flex items-center gap-2 md:gap-3 bg-slate-900/80 hover:bg-slate-800 px-3 md:px-5 py-1.5 md:py-2.5 rounded-2xl border border-white/10 transition-all">
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full gradient-bg flex items-center justify-center text-[10px] text-white font-black shadow-inner">{user.email[0].toUpperCase()}</div>
          <div className="flex flex-col items-start">
            <span className="text-[8px] md:text-[10px] font-black text-white uppercase leading-none">{credits.remaining} Credits</span>
            <span className="text-[7px] md:text-[8px] font-black text-blue-500 uppercase tracking-tighter leading-none mt-0.5 md:mt-1">{credits.plan}</span>
          </div>
        </button>
        {isAccountOpen && <AccountDropdown />}
      </div>
    ) : (
      <Button size="sm" className="rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs px-4 md:px-6" onClick={() => setIsAuthOpen(true)}>
        Authenticate
      </Button>
    )
  );

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.5)]"></div>
        <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Syncing Neural Core...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-[#020617] text-white overflow-x-hidden">
      <header className={`sticky top-0 z-[100] px-4 md:px-6 py-4 transition-all ${activeTab === 'landing' ? 'bg-transparent' : 'glass border-b border-white/5'}`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('landing')}>
              <div className="w-8 h-8 md:w-10 md:h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg group-hover:scale-110 transition-transform">C</div>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter gradient-text uppercase">CENT GEN</h1>
            </div>
            <div className="lg:hidden">
              <UserStatusTrigger />
            </div>
          </div>

          <nav className="flex bg-slate-900/50 p-1 rounded-2xl overflow-x-auto w-full lg:max-w-4xl no-scrollbar border border-white/5 backdrop-blur-md">
            <div className="flex gap-1 min-w-max p-1">
              <button
                onClick={() => setActiveTab('landing')}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'landing' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                Home
              </button>
              {getTabs().map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
             <UserStatusTrigger />
          </div>
        </div>
      </header>

      <main className={`container mx-auto relative z-10 ${activeTab === 'landing' ? '' : 'px-4 mt-8'}`}>
        {renderContent()}
      </main>

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      <ChatWidget isOpen={isChatOpen} setIsOpen={setIsChatOpen} initialMessage={chatInitialMsg} />
    </div>
  );
};

export default App;
