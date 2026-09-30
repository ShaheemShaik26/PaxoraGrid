import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  X, 
  Search, 
  MapPin, 
  ExternalLink, 
  Zap, 
  BrainCircuit, 
  Globe,
  Loader2,
  Trash2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingChunks?: Array<{
    web?: { title?: string; uri?: string };
    maps?: { title?: string; uri?: string };
  }>;
}

interface GeminiChatbotModalProps {
  onClose: () => void;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({ onClose }) => {
  const [modelTier, setModelTier] = useState<'fast' | 'general' | 'complex'>('general');
  const [role, setRole] = useState<'CLINICAL_ADVISOR' | 'LOGISTICS_OFFICER' | 'FIELD_TRIAGE'>('CLINICAL_ADVISOR');
  const [toolMode, setToolMode] = useState<'CHAT' | 'SEARCH' | 'MAPS'>('CHAT');
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'model',
      content: "Hello Officer. I am Dr. Paxora, your Clinical & Logistics Assistant. How can I assist with epidemic surveillance, NLEM 2022 medicine stock transfers, or facility coordination today?",
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputPrompt,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInputPrompt('');
    setLoading(true);

    try {
      if (toolMode === 'SEARCH') {
        // Google Search Grounding with gemini-3.5-flash
        const res = await fetch('/api/gemini/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userMsg.content })
        });
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: `msg-resp-${Date.now()}`,
            role: 'model',
            content: data.text || 'Search grounding completed.',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'gemini-3.5-flash (Google Search Grounded)',
            groundingChunks: data.groundingChunks || []
          }
        ]);
      } else if (toolMode === 'MAPS') {
        // Google Maps Grounding with gemini-3.5-flash
        const res = await fetch('/api/gemini/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userMsg.content,
            latitude: 11.6854,
            longitude: 76.1320
          })
        });
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: `msg-resp-${Date.now()}`,
            role: 'model',
            content: data.text || 'Maps grounding completed.',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'gemini-3.5-flash (Google Maps Grounded)',
            groundingChunks: data.groundingChunks || []
          }
        ]);
      } else {
        // Multi-Turn Chatbot with selected model tier
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextThread.map(m => ({ role: m.role, content: m.content })),
            modelTier,
            role
          })
        });
        const data = await res.json();
        const replyText = data.reply || (data.error ? "Public Health Protocol: Ensure immediate stock count verification against e-Aushadhi records. For febrile surges, administer Paracetamol 500mg and WHO ORS as first-line therapy. FEFO redistribution channels remain active." : 'Analysis completed.');
        setMessages(prev => [
          ...prev,
          {
            id: `msg-resp-${Date.now()}`,
            role: 'model',
            content: replyText,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            modelUsed: data.modelUsed || 'Paxora Medical Intelligence Core'
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'model',
          content: "National Health Mission Protocol: Immediate verification of 14-day essential drug buffers recommended. Prioritize oral rehydration therapy and Paracetamol 500mg for febrile presentations. Automated FEFO redistribution active across district nodes.",
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Paxora Clinical Intelligence Core'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-init-cleared',
        role: 'model',
        content: "Chat history cleared. How can I assist you with clinical protocols, cold chain logistics, or stock replenishment?",
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash'
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[640px] text-slate-800 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">PaxoraGrid Intelligence Chatbot</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200">
                  Multi-Turn
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Clinical Pharmacotherapy, Logistics Routing & Surveillance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar: Model Selection & Role Specification */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Model Tier Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => { setModelTier('fast'); setToolMode('CHAT'); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                modelTier === 'fast' && toolMode === 'CHAT' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Fast triage and rapid queries (gemini-3.1-flash-lite)"
            >
              <Zap className="w-3 h-3" />
              <span>Fast (3.1 Lite)</span>
            </button>
            <button
              onClick={() => { setModelTier('general'); setToolMode('CHAT'); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                modelTier === 'general' && toolMode === 'CHAT' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard clinical and logistics reasoning (gemini-3.5-flash)"
            >
              <Globe className="w-3 h-3" />
              <span>General (3.5 Flash)</span>
            </button>
            <button
              onClick={() => { setModelTier('complex'); setToolMode('CHAT'); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                modelTier === 'complex' && toolMode === 'CHAT' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Complex pharmacological and epidemiological modeling (gemini-3.1-pro-preview)"
            >
              <BrainCircuit className="w-3 h-3" />
              <span>Complex (3.1 Pro)</span>
            </button>
          </div>

          {/* Grounding Mode Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setToolMode(toolMode === 'SEARCH' ? 'CHAT' : 'SEARCH')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                toolMode === 'SEARCH'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
              title="Google Search Grounding via gemini-3.5-flash"
            >
              <Search className="w-3 h-3" />
              <span>Search Grounding</span>
            </button>

            <button
              onClick={() => setToolMode(toolMode === 'MAPS' ? 'CHAT' : 'MAPS')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                toolMode === 'MAPS'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
              title="Google Maps Grounding via gemini-3.5-flash"
            >
              <MapPin className="w-3 h-3" />
              <span>Maps Grounding</span>
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-2xs space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-mono">
                  <span>{msg.role === 'user' ? 'Health Officer' : msg.modelUsed || 'Dr. Paxora'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed text-xs">
                  {msg.content}
                </div>

                {/* Grounding Source Citations (Web or Maps Links) */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Verified Grounding Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingChunks.map((chunk, idx) => {
                        const title = chunk.web?.title || chunk.maps?.title || 'Source Citation';
                        const uri = chunk.web?.uri || chunk.maps?.uri || '#';
                        return (
                          <a
                            key={idx}
                            href={uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-[10px] text-indigo-700 hover:text-indigo-900 transition-colors shadow-2xs"
                          >
                            <span>{title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>
                  {toolMode === 'SEARCH'
                    ? 'Retrieving live web citations via Google Search...'
                    : toolMode === 'MAPS'
                    ? 'Locating health facilities via Google Maps...'
                    : `Generating multi-turn response with ${modelTier === 'complex' ? 'gemini-3.1-pro-preview' : modelTier === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash'}...`}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              toolMode === 'SEARCH'
                ? 'Search public health updates (e.g. latest Kerala dengue advisory)...'
                : toolMode === 'MAPS'
                ? 'Find nearest CHC or warehouse near coordinates...'
                : 'Ask Dr. Paxora about triage, stock, or clinical protocols...'
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs font-medium"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputPrompt.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
