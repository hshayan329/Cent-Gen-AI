
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Button } from './ui/Button';
import { PlanType } from '../types';

// Manual Base64 implementation as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveAssistant: React.FC<{ plan: PlanType }> = ({ plan }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{role: string, text: string}[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (sourcesRef.current) {
      sourcesRef.current.forEach(source => source.stop());
      sourcesRef.current.clear();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
  };

  const startSession = async () => {
    setIsConnecting(true);
    setTranscriptions([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userText = currentInputTranscription.current;
              const aiText = currentOutputTranscription.current;
              if (userText) setTranscriptions(prev => [...prev, { role: 'user', text: userText }]);
              if (aiText) setTranscriptions(prev => [...prev, { role: 'ai', text: aiText }]);
              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(ctx.destination);
              
              sourceNode.addEventListener('ended', () => {
                sourcesRef.current.delete(sourceNode);
              });

              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live session error:', e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are the Cent Gen Neural Live Assistant. You are friendly, creative, and professional. Help the user brainstorm image prompts, storyboard ideas, or just chat. Keep responses human-like and concise.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to initialize live session:', err);
      stopSession();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter gradient-text">Neural Live</h2>
        <p className="text-xl text-slate-300 font-semibold max-w-2xl mx-auto leading-relaxed">
          Real-time bidirectional voice interaction with the Cent Gen core.
        </p>
      </div>

      <div className="glass p-12 rounded-[64px] border-white/10 shadow-2xl flex flex-col items-center gap-12 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className={`absolute inset-0 bg-blue-500/5 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Neural Core Orb */}
        <div className="relative z-10">
          <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000 ${
            isActive ? 'scale-110 shadow-[0_0_80px_rgba(56,189,248,0.4)]' : 'scale-100 shadow-xl'
          }`}>
            <div className={`absolute inset-0 rounded-full border-4 border-white/5 ${isActive ? 'animate-ping' : ''}`}></div>
            <div className={`w-full h-full rounded-full gradient-bg flex items-center justify-center relative overflow-hidden ${isActive ? 'animate-pulse' : ''}`}>
               <div className="w-20 h-20 bg-white/20 blur-xl rounded-full animate-bounce-slow"></div>
               <span className="text-white text-5xl font-black drop-shadow-lg relative z-20">C</span>
            </div>
          </div>
        </div>

        <div className="text-center relative z-10">
           {isActive ? (
             <div className="space-y-2">
                <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-sm animate-pulse">Neural Link Established</p>
                <p className="text-slate-500 text-[10px] font-black uppercase">Speak naturally to the core</p>
             </div>
           ) : isConnecting ? (
             <p className="text-amber-400 font-black uppercase tracking-[0.4em] text-sm animate-pulse">Establishing Handshake...</p>
           ) : (
             <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm">Node Standby</p>
           )}
        </div>

        <div className="flex gap-6 relative z-10 w-full max-w-md">
           {!isActive ? (
             <Button 
               onClick={startSession} 
               isLoading={isConnecting}
               className="w-full py-6 rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl"
             >
               Initialize Live
             </Button>
           ) : (
             <Button 
               onClick={stopSession} 
               variant="danger"
               className="w-full py-6 rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl"
             >
               Terminate Link
             </Button>
           )}
        </div>

        {/* Live Transcription Registry */}
        <div className="w-full h-64 bg-slate-950/50 rounded-[40px] border border-white/5 p-8 overflow-y-auto no-scrollbar relative z-10">
           <div className="space-y-6">
              {transcriptions.length === 0 && (
                <div className="h-full flex items-center justify-center opacity-10">
                   <p className="text-xs font-black uppercase tracking-[0.3em]">Live Logs Awaiting Signal...</p>
                </div>
              )}
              {transcriptions.map((t, i) => (
                <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">{t.role === 'user' ? 'Local Identity' : 'Neural Core'}</span>
                   <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm font-medium ${
                     t.role === 'user' ? 'bg-blue-600/10 text-blue-100 rounded-tr-none border border-blue-500/20' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                   }`}>
                      {t.text}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
      
      <p className="mt-8 text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">
         Encrypted Real-time PCM Synthesis Protocol v2.5.5
      </p>
    </div>
  );
};
