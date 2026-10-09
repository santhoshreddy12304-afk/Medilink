import React, { useEffect, useRef, useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  PhoneCall, 
  User, 
  RefreshCw, 
  BookOpen
} from 'lucide-react';
import { assistantService } from '../../services/assistantService';
import type { ChatMessage } from '../../types';

export const AssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => assistantService.getInitialState());
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemoResponse: false
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const response = await assistantService.sendMessage(query, messages);
      setMessages((prev) => [...prev, response]);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages(assistantService.getInitialState());
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* 1. ASSISTANT HEADER & DEMO ENGINE BADGE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Health Assistant</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                Stage 1 Demo Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Preliminary educational guidance • Rule-based demonstration response system
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={resetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Reset Chat Session"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Chat</span>
          </button>
        </div>
      </div>

      {/* 2. EMERGENCY & MEDICAL DISCLAIMER BANNER */}
      <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-900">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Medical Emergency Notice:</span> Severe chest pain, acute shortness of breath, sudden numbness, or loss of consciousness require urgent local emergency care. Do not wait for AI responses.
          </div>
        </div>
        <a
          href="tel:112"
          className="shrink-0 flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Dial 112 (India)</span>
        </a>
      </div>

      {/* 3. MAIN CHAT WINDOW */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
        
        {/* Messages Scroll Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isEmergency = msg.isEmergencyWarning;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                    isUser
                      ? 'bg-slate-900 shadow-xs'
                      : isEmergency
                      ? 'bg-rose-600 shadow-md animate-pulse'
                      : 'bg-teal-600 shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble Content */}
                <div className={`space-y-2 max-w-[88%] sm:max-w-[80%]`}>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed space-y-3 ${
                      isUser
                        ? 'bg-slate-900 text-slate-100 rounded-tr-none'
                        : isEmergency
                        ? 'bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-tl-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {/* Demo Tag for Assistant */}
                    {!isUser && (
                      <div className="flex items-center justify-between text-[10px] pb-2 border-b border-slate-100 text-slate-400">
                        <span className="font-semibold text-teal-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-teal-500" />
                          MediLink AI Assistant (Demo Response Engine)
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}

                    {/* Formatted Markdown text lines */}
                    <div className="whitespace-pre-wrap font-sans text-sm space-y-2">
                      {msg.text}
                    </div>

                    {/* Sources Citation if present */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-teal-600" /> Reference Guidelines:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-slate-500 pl-1 space-y-0.5">
                          {msg.sources.map((src, i) => (
                            <li key={i}>{src}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Suggestions Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-2">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(suggestion)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Emergency Direct Call Button inside Emergency Message */}
                  {isEmergency && (
                    <div className="pt-2">
                      <a
                        href="tel:112"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Call Emergency 112 Immediately</span>
                      </a>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs flex items-center gap-2 rounded-tl-none">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                <span>Generating rule-based demo response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. CHAT INPUT & PROMPT SUGGESTIONS FOOTER */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          
          {/* Preset Prompts Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-400 text-[11px] shrink-0">Suggested:</span>
            <button
              onClick={() => handleSend("How can I maintain a healthy lifestyle?")}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              "Healthy Lifestyle"
            </button>
            <button
              onClick={() => handleSend("What should I know about common cold symptoms?")}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              "Common Cold Symptoms"
            </button>
            <button
              onClick={() => handleSend("How can I prepare for a doctor visit?")}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              "Doctor Visit Prep"
            </button>
          </div>

          {/* Text Input Field */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a wellness question or describe symptoms..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputPrompt.trim() || loading}
              className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white font-bold transition-all shadow-sm flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-400">
            MediLink AI Stage 1 Demo • Local Rule Engine • Educational Use Only • Emergency Dial 112
          </p>

        </div>

      </div>

    </div>
  );
};
