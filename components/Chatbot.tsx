
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, PlanType, ChatSession, AssistantSettings } from '../types';
import { chatWithAI } from '../services/geminiService';
import { Button } from './ui/Button';

const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  persona: 'General',
  tone: 'Professional',
  creativity: 0.7,
  detailLevel: 'Standard',
  focus: 'General'
};

export const Chatbot: React.FC<{ 
  plan: PlanType, 
  // Updated onDeduct to return Promise<boolean> to match App.tsx implementation
  onDeduct: () => Promise<boolean>,
  onHelpClick: () => void 
}> = ({ plan, onDeduct, onHelpClick }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('centgen_chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [globalSettings, setGlobalSettings] = useState<AssistantSettings>(() => {
    const saved = localStorage.getItem('centgen_global_settings');
    return saved ? JSON.parse(saved) : DEFAULT_ASSISTANT_SETTINGS;
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ type: 'image' | 'file', url: string, name: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const currentSettings = activeSession?.settings || globalSettings;

  useEffect(() => {
    localStorage.setItem('centgen_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('centgen_global_settings', JSON.stringify(globalSettings));
  }, [globalSettings]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeSession?.messages, isLoading]);

  const updateSettings = (newSettings: Partial<AssistantSettings>) => {
    const updated = { ...globalSettings, ...newSettings };
    setGlobalSettings(updated);
    
    // Also update active session if it exists
    if (activeSessionId) {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        settings: { ...(s.settings || updated), ...newSettings }
      } : s));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingAttachment({ type, url: reader.result as string, name: file.name });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      lastModified: Date.now(),
      settings: { ...globalSettings }
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  const handleSend = async (customText?: string) => {
    const sanitized = (customText || input).trim();
    if (!sanitized && !pendingAttachment) return;
    if (isLoading) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: sanitized ? sanitized.slice(0, 30) : 'File Transfer',
        messages: [],
        lastModified: Date.now(),
        settings: { ...globalSettings }
      };
      setSessions([newSession, ...sessions]);
      currentSessionId = newSession.id;
      setActiveSessionId(newSession.id);
    }

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: sanitized, 
      timestamp: Date.now(), 
      read: true,
      attachment: pendingAttachment ? { ...pendingAttachment } : undefined
    };

    setSessions(prev => prev.map(s => s.id === currentSessionId ? {
      ...s,
      messages: [...s.messages, userMsg],
      lastModified: Date.now(),
      title: s.messages.length === 0 ? (sanitized.slice(0, 30) || 'Attachment') : s.title
    } : s));

    setInput('');
    const attachmentToSend = pendingAttachment;
    setPendingAttachment(null);
    setIsLoading(true);

    try {
      // Awaiting onDeduct because handleDeductCredit is asynchronous
      await onDeduct();
      const session = sessions.find(s => s.id === currentSessionId);
      const sessionSettings = session?.settings || globalSettings;
      const currentHistory = session?.messages || [];
      const history = currentHistory.map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithAI(sanitized, history, sessionSettings, attachmentToSend || undefined);
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: response, 
        timestamp: Date.now(), 
        read: true 
      };

      setSessions(prev => prev.map(s => s.id === currentSessionId ? {
        ...s,
        messages: [...s.messages, aiMsg],
        lastModified: Date.now()
      } : s));
    } catch (err: any) {
      const errMsg: ChatMessage = { id: 'err', sender: 'ai', text: `System Alert: ${err.message}`, timestamp: Date.now(), read: true };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? {
        ...s,
        messages: [...s.messages, errMsg]
      } : s));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { title: "Analyze this image concept", icon: "🎨" },
    { title: "Explain the file content", icon: "📑" },
    { title: "Rewrite in a professional tone", icon: "👔" }
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#212121] rounded-[32px] overflow-hidden shadow-2xl border border-white/5 font-sans relative">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass w-full max-w-lg p-10 rounded-[48px] border-white/10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Assistant Nodes</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Persona</label>
                  <select 
                    value={currentSettings.persona}
                    onChange={e => updateSettings({ persona: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                  >
                    <option value="General">General Utility</option>
                    <option value="Artist">Creative Artist</option>
                    <option value="Developer">Logic Developer</option>
                    <option value="Writer">Ebook Writer</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Tone</label>
                  <select 
                    value={currentSettings.tone}
                    onChange={e => updateSettings({ tone: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Concise">Concise</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>3. Creativity Spark</span>
                  <span className="text-sky-400">{(currentSettings.creativity * 100).toFixed(0)}%</span>
                </label>
                <input 
                  type="range" min="0" max="1" step="0.1"
                  value={currentSettings.creativity}
                  onChange={e => updateSettings({ creativity: parseFloat(e.target.value) })}
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4. Detail Level</label>
                  <select 
                    value={currentSettings.detailLevel}
                    onChange={e => updateSettings({ detailLevel: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                  >
                    <option value="Brief">Brief</option>
                    <option value="Standard">Standard</option>
                    <option value="Detailed">Comprehensive</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">5. Expertise Focus</label>
                  <select 
                    value={currentSettings.focus}
                    onChange={e => updateSettings({ focus: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                  >
                    <option value="General">General</option>
                    <option value="Design">Visual Design</option>
                    <option value="Logic">Coding/Logic</option>
                  </select>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowSettings(false)} className="w-full mt-12 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest">Synchronize Neural Nodes</Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="hidden lg:flex w-[260px] bg-[#171717] flex-col border-r border-white/5">
        <div className="p-3.5">
          <button 
            onClick={startNewChat}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[#2c2c2c] transition-colors text-white text-sm font-medium group"
          >
            <div className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center group-hover:bg-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
          {sessions.length > 0 && (
            <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Previous Sessions</div>
          )}
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 group ${
                activeSessionId === s.id ? 'bg-[#2c2c2c]' : 'hover:bg-[#2c2c2c]/50'
              }`}
            >
              <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              <span className={`text-xs truncate ${activeSessionId === s.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {s.title}
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/5 space-y-1">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#2c2c2c] text-slate-300 text-xs font-medium">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             Settings
          </button>
          <button onClick={onHelpClick} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#2c2c2c] text-slate-300 text-xs font-medium">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             Help
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3 lg:hidden">
             <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center font-black text-[10px] text-white">CG</div>
          </div>
          <div className="flex items-center gap-2 px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentSettings.persona} Mode</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Share option removed as requested */}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 lg:px-0 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            {(!activeSession || activeSession.messages.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center mt-20">
                <div className="w-16 h-16 gradient-bg rounded-3xl flex items-center justify-center text-white text-2xl font-black mb-6 shadow-2xl">C</div>
                <h1 className="text-3xl font-black text-white mb-2">Neural Workspace Active</h1>
                <p className="text-slate-400 text-sm mb-12 uppercase tracking-widest font-bold">Initiate session with text or multimodal payload.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(s.title)}
                      className="p-4 bg-[#2f2f2f] hover:bg-[#383838] border border-white/5 rounded-2xl text-left transition-colors flex items-center gap-4 group"
                    >
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-slate-200 text-xs font-semibold group-hover:text-white">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {activeSession.messages.map((m) => (
                  <div key={m.id} className={`flex w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-4 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {m.sender === 'ai' && (
                        <div className="w-8 h-8 rounded-full gradient-bg flex-shrink-0 flex items-center justify-center font-black text-[10px] text-white shadow-lg">
                          CG
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl ${
                        m.sender === 'user' 
                          ? 'bg-[#10a37f] text-white shadow-lg rounded-tr-none' 
                          : 'bg-[#2f2f2f] text-slate-100 rounded-tl-none border border-white/5'
                      }`}>
                        {m.attachment && (
                          <div className="mb-3 rounded-xl overflow-hidden bg-black/20 p-2 border border-white/5">
                            {m.attachment.type === 'image' ? (
                              <img src={m.attachment.url} className="w-full max-h-60 object-contain rounded-lg" alt="Attached" />
                            ) : (
                              <div className="flex items-center gap-3 p-2">
                                <div className="p-2 bg-white/10 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg></div>
                                <span className="text-[10px] font-black uppercase tracking-widest truncate">{m.attachment.name}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="bg-[#2f2f2f] p-4 rounded-2xl rounded-tl-none border border-white/5">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto relative">
            
            {/* Pending Attachment Preview */}
            {pendingAttachment && (
              <div className="absolute bottom-full left-0 mb-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="glass p-3 rounded-[24px] border-sky-500/30 flex items-center gap-4 bg-[#2f2f2f] shadow-2xl">
                  {pendingAttachment.type === 'image' ? (
                    <img src={pendingAttachment.url} className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center"><svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg></div>
                  )}
                  <div className="pr-4">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest max-w-[120px] truncate">{pendingAttachment.name}</p>
                    <button onClick={() => setPendingAttachment(null)} className="text-[9px] text-red-500 font-black uppercase mt-1">Remove</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#2f2f2f] border border-white/10 rounded-[28px] focus-within:border-white/20 transition-all p-2 flex items-end gap-2 shadow-2xl relative">
              <div className="relative">
                <button 
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-3 text-slate-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
                {showAttachMenu && (
                  <div className="absolute bottom-full left-0 mb-2 glass bg-[#1e1e1e] rounded-2xl border border-white/10 shadow-2xl p-2 w-48 overflow-hidden z-[60]">
                    <button 
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full text-left p-3 hover:bg-white/5 rounded-xl flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Neural Image</span>
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left p-3 hover:bg-white/5 rounded-xl flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Document File</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Hidden Inputs */}
              <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'image')} />
              <input type="file" ref={fileInputRef} hidden accept=".pdf,.txt,.doc,.docx" onChange={e => handleFileUpload(e, 'file')} />

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Send a message or attach a file..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white py-3 px-2 text-sm max-h-[200px] resize-none overflow-y-auto no-scrollbar placeholder:text-slate-500 font-medium"
                rows={1}
                style={{ height: 'auto' }}
              />
              <div className="flex items-center gap-1.5 px-1 pb-1">
                <button 
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !pendingAttachment) || isLoading}
                  className={`p-2 rounded-xl transition-all ${
                    (input.trim() || pendingAttachment) && !isLoading ? 'bg-white text-black hover:opacity-90' : 'bg-[#1e1e1e] text-[#676767] cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                </button>
              </div>
            </div>
            <p className="text-center text-[9px] text-slate-600 mt-3 font-bold uppercase tracking-widest">
              Neural Assistant is in {currentSettings.persona} mode. Logic thresholds apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
