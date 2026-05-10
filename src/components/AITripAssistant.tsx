import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, Sparkles, Minimize2,
  Bot, User, Loader2, RotateCcw
} from 'lucide-react';
import { chatWithTraveloopAI, type Message } from '@/services/aiService';
import { useLocation } from 'react-router-dom';

const QUICK_PROMPTS = [
  '🏔️ Best hill stations in India under ₹10k?',
  '🌊 Goa trip plan for 3 days?',
  '🎒 Budget tips for Rajasthan?',
  '🍜 Must-try street food in India?',
  '🚂 Train travel tips for India?',
  '📱 Apps every India traveler needs?',
];

const WELCOME_MESSAGE: Message & { isWelcome?: boolean } = {
  role: 'assistant',
  content: `Namaste! 🙏 I'm **Traveloop AI**, your personal India travel guide!

I can help you with:
- 🗺️ Day-wise trip itineraries
- 💰 Budget planning in INR
- 🏨 Where to stay & eat
- 🎯 Hidden gems & local tips
- 🌤️ Best time to visit

What would you like to explore?`,
  isWelcome: true,
};

export function AITripAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<(Message & { isWelcome?: boolean })[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !loading) {
      inputRef.current?.focus();
    }
  }, [isOpen, loading]);

  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('/trips/') && path.includes('/itinerary')) return 'Itinerary Builder';
    if (path.includes('/trips/') && path.includes('/budget')) return 'Budget Tracker';
    if (path.includes('/city-search')) return 'City Explorer';
    if (path.includes('/activities')) return 'Activity Finder';
    if (path.includes('/ai-planner')) return 'AI Trip Planner';
    return 'Traveloop Dashboard';
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput('');
    setShowQuickPrompts(false);
    setLoading(true);

    const userMsg: Message = { role: 'user', content };
    const updatedMessages = [...messages.filter(m => !m.isWelcome), userMsg];
    setMessages(prev => [...prev, userMsg]);

    try {
      const apiMessages: Message[] = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await chatWithTraveloopAI(apiMessages, undefined, getPageContext());
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ AI temporarily unavailable. Please check your API key in the .env file.\n\nAdd `VITE_OPENROUTER_API_KEY` or `VITE_GEMINI_API_KEY` to enable AI features.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([WELCOME_MESSAGE]);
    setShowQuickPrompts(true);
    setInput('');
  };

  const renderMessage = (content: string) => {
    // Simple markdown: bold, line breaks
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed right-4 z-50 transition-all duration-300 ${
          isMinimized
            ? 'bottom-4 w-72'
            : 'bottom-4 w-full max-w-sm sm:max-w-md'
        }`}>
          <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[560px]'
          }`}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Traveloop AI</p>
                  <p className="text-emerald-100 text-xs">
                    {loading ? 'Thinking...' : '● Online · Claude + Gemini'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="New conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(v => !v)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-emerald-600'
                          : 'bg-gradient-to-br from-teal-500 to-emerald-600'
                      }`}>
                        {msg.role === 'user'
                          ? <User className="w-4 h-4 text-white" />
                          : <Bot className="w-4 h-4 text-white" />
                        }
                      </div>
                      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-md'
                          : 'bg-white border border-gray-100 text-gray-700 rounded-tl-md shadow-sm'
                      }`}>
                        <span
                          dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                        />
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Prompts */}
                  {showQuickPrompts && messages.length === 1 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs text-gray-400 text-center">Quick questions:</p>
                      {QUICK_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(prompt)}
                          className="w-full text-left px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Ask about any Indian destination..."
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white hover:shadow-md disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Powered by Claude (OpenRouter) • Gemini fallback
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
