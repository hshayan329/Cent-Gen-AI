
import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<'stats' | 'chats' | 'contacts' | 'users'>('stats');
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeView]);

  const fetchData = async () => {
    setLoading(true);
    if (activeView === 'chats') {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setMessages(data);
    } else if (activeView === 'contacts') {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setContacts(data);
    }
    setLoading(false);
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedSessionId) return;
    
    const { error } = await supabase
      .from('messages')
      .insert([{
        sender: 'admin',
        text: replyText,
        session_id: selectedSessionId
      }]);

    if (!error) {
      setReplyText('');
      fetchData();
    }
  };

  const getSessions = () => {
    const sessions: Record<string, any> = {};
    messages.forEach(m => {
      if (!sessions[m.session_id]) {
        sessions[m.session_id] = {
          id: m.session_id,
          lastMsg: m.text,
          time: m.created_at
        };
      }
    });
    return Object.values(sessions);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      <div className="bg-slate-900 border-b border-red-500/20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
            Admin Root Console
          </div>
          <nav className="flex gap-4 ml-8">
            <button onClick={() => setActiveView('stats')} className={`text-xs font-bold uppercase tracking-widest ${activeView === 'stats' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>System Stats</button>
            <button onClick={() => setActiveView('chats')} className={`text-xs font-bold uppercase tracking-widest ${activeView === 'chats' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>Transmissions</button>
            <button onClick={() => setActiveView('contacts')} className={`text-xs font-bold uppercase tracking-widest ${activeView === 'contacts' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>Form Fills</button>
            <button onClick={() => setActiveView('users')} className={`text-xs font-bold uppercase tracking-widest ${activeView === 'users' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>User Base</button>
          </nav>
        </div>
        <Button variant="danger" size="sm" onClick={onClose}>Exit Secure Mode</Button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {activeView === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-left duration-500">
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Total System Latency</p>
                <p className="text-3xl font-black text-green-500">18ms</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Pending Inquiries</p>
                <p className="text-3xl font-black text-blue-500">{contacts.length}</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Live Chat Sessions</p>
                <p className="text-3xl font-black text-purple-500">{getSessions().length}</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Neural Success Rate</p>
                <p className="text-3xl font-black text-white">99.8%</p>
             </div>
          </div>
        )}

        {activeView === 'chats' && (
          <div className="max-w-6xl mx-auto glass rounded-3xl h-[650px] flex overflow-hidden border-red-500/10">
            <div className="w-1/3 border-r border-white/5 bg-black/20 p-4 overflow-y-auto">
               <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-4">Support Hub</h4>
               <div className="space-y-2">
                  {getSessions().map(session => (
                    <div 
                      key={session.id} 
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSessionId === session.id ? 'bg-red-500/20 border-red-500/40' : 'bg-slate-900/50 border-white/5 hover:border-white/10'}`}
                    >
                      <p className="text-[10px] font-black text-white mb-1 uppercase tracking-tighter">Session: {session.id}</p>
                      <p className="text-[10px] text-slate-400 truncate font-medium">{session.lastMsg}</p>
                      <p className="text-[8px] text-slate-600 mt-2">{new Date(session.time).toLocaleString()}</p>
                    </div>
                  ))}
               </div>
            </div>
            <div className="flex-1 flex flex-col bg-slate-900/30">
               {selectedSessionId ? (
                 <>
                   <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                      {messages.filter(m => m.session_id === selectedSessionId).reverse().map((m) => (
                        <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`p-4 rounded-2xl text-sm max-w-[75%] ${m.sender === 'admin' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 border border-white/5'}`}>
                              <p className="text-[8px] font-black mb-1 opacity-50 uppercase tracking-[0.2em]">{m.sender}</p>
                              <p className="font-medium">{m.text}</p>
                              <p className="text-[7px] mt-2 opacity-30">{new Date(m.created_at).toLocaleTimeString()}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="p-4 bg-black/40 border-t border-white/5 flex gap-4">
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                        placeholder="Enter response dispatch..."
                        className="flex-1 bg-slate-950 border border-red-900/30 rounded-xl px-4 text-sm text-red-400 font-mono focus:border-red-500 outline-none"
                      />
                      <Button variant="danger" size="sm" onClick={handleReply} className="px-6 font-black uppercase text-[10px]">Dispatch</Button>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex items-center justify-center text-slate-700 font-black uppercase tracking-[0.4em] text-xs">Select Session to Engage</div>
               )}
            </div>
          </div>
        )}

        {activeView === 'contacts' && (
           <div className="max-w-6xl mx-auto space-y-4">
              <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tighter">Transmission Registry (Form Fills)</h3>
              <div className="grid grid-cols-1 gap-4">
                 {contacts.map(contact => (
                    <div key={contact.id} className="glass p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between gap-6 hover:border-sky-500/20 transition-all">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="text-xs font-black text-white uppercase">{contact.name}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{contact.email}</span>
                          </div>
                          <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-3">Subject: {contact.subject}</p>
                          <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                             <p className="text-sm text-slate-300 leading-relaxed font-medium">"{contact.message}"</p>
                          </div>
                       </div>
                       <div className="flex flex-col justify-between items-end min-w-[150px]">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${contact.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                             {contact.status}
                          </span>
                          <p className="text-[10px] text-slate-600 font-bold mt-4">{new Date(contact.created_at).toLocaleString()}</p>
                          <Button variant="outline" size="sm" className="mt-4 w-full text-[10px]">Mark Resolved</Button>
                       </div>
                    </div>
                 ))}
                 {contacts.length === 0 && <p className="text-center text-slate-600 py-20 font-black uppercase tracking-widest">No transmissions found in registry.</p>}
              </div>
           </div>
        )}

        {activeView === 'users' && (
           <div className="max-w-5xl mx-auto glass rounded-[40px] overflow-hidden border-white/5">
              <table className="w-full text-left text-sm text-slate-400 border-collapse">
                 <thead className="bg-slate-900/80">
                    <tr>
                       <th className="p-6 border-b border-white/5 font-black uppercase tracking-widest text-[10px]">Identity</th>
                       <th className="p-6 border-b border-white/5 font-black uppercase tracking-widest text-[10px]">Plan Tier</th>
                       <th className="p-6 border-b border-white/5 font-black uppercase tracking-widest text-[10px]">Neural Balance</th>
                       <th className="p-6 border-b border-white/5 font-black uppercase tracking-widest text-[10px]">Status</th>
                       <th className="p-6 border-b border-white/5 font-black uppercase tracking-widest text-[10px]">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
                       <td className="p-6 font-mono text-xs text-white">U-9201-AX</td>
                       <td className="p-6"><span className="text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-black">ULTIMATE</span></td>
                       <td className="p-6 font-black text-white">4000 / 4000</td>
                       <td className="p-6"><span className="text-green-500 flex items-center gap-2 font-black text-[10px] uppercase"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active</span></td>
                       <td className="p-6"><button className="text-red-500 hover:text-red-400 font-black uppercase text-[10px] tracking-widest">Ban ID</button></td>
                    </tr>
                 </tbody>
              </table>
           </div>
        )}
      </div>
    </div>
  );
};
