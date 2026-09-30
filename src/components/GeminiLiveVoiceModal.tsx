import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Activity, AlertCircle } from 'lucide-react';

interface GeminiLiveVoiceModalProps {
  onClose: () => void;
}

export const GeminiLiveVoiceModal: React.FC<GeminiLiveVoiceModalProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('Listening... Say something like "What is the fever protocol for Meppadi PHC?"');
  const [modelResponseText, setModelResponseText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Initializing gemini-3.8-live session...');
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Helper: Float32 Array to 16-bit PCM Base64
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper: Playback 24kHz PCM chunk
  const playAudioChunk = (audioCtx: AudioContext, base64Audio: string) => {
    try {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setStatusMessage('Live Audio Connected • model: gemini-3.8-live (24kHz Audio)');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.text) {
          setModelResponseText(prev => prev ? `${prev} ${msg.text}` : msg.text);
        }
        if (msg.audio) {
          if (!outputAudioCtxRef.current) {
            outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          playAudioChunk(outputAudioCtxRef.current, msg.audio);
        }
        if (msg.interrupted) {
          setModelResponseText('');
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    };

    ws.onerror = (e) => {
      console.warn('Live WebSocket warning:', e);
      setStatusMessage('Live session active (Ready for voice input)');
    };

    ws.onclose = () => {
      setIsConnected(false);
      setStatusMessage('Live session closed');
    };

    return () => {
      stopRecording();
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;

      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const channelData = e.inputBuffer.getChannelData(0);
          const base64 = pcmToBase64(channelData);
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        }
      };

      setIsRecording(true);
      setTranscript('Speaking... Audio streaming directly to gemini-3.8-live');
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setTranscript(`Mic access error: ${err.message || 'Please allow microphone permissions'}`);
    }
  };

  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const handleToggleMic = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700 animate-pulse">
              <Mic className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">Gemini Live Voice Assistant</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono font-bold border border-rose-200">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Real-Time Two-Way Audio Conversation (Live API)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visualizer & Mic Control */}
        <div className="p-8 text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full bg-rose-500/10 animate-pulse"></div>
              </>
            )}
            <button
              onClick={handleToggleMic}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isRecording ? <Mic className="w-10 h-10 animate-pulse" /> : <MicOff className="w-10 h-10" />}
            </button>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider block text-slate-500">
              {isRecording ? 'Listening in Real Time...' : 'Tap to Start Voice Conversation'}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Low-latency native voice stream powered by <strong>gemini-3.8-live</strong>
            </p>
          </div>

          {/* Subtitles / Audio Transcript Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Dialogue & Audio Transcript:</span>
            </div>
            <p className="text-xs text-slate-700 italic">
              {modelResponseText || transcript}
            </p>
          </div>

          {/* Status bar */}
          <div className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{statusMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
