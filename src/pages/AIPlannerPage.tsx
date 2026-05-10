import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, MapPin, Calendar, IndianRupee, Users,
  Loader2, ChevronDown, ChevronUp, Send, Package, AlertCircle
} from 'lucide-react';
import { aiTripPlannerService, type TripPlanInput, type AITripPlan } from '@/services/aiService';
import toast from 'react-hot-toast';

const TRAVEL_STYLES = ['adventure', 'cultural', 'budget', 'luxury', 'nature', 'backpacking', 'relaxation', 'food_explorer'];
const INTERESTS = ['hiking', 'photography', 'history', 'food', 'beaches', 'mountains', 'temples', 'wildlife', 'nightlife', 'shopping'];

export function AIPlannerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AITripPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [form, setForm] = useState<TripPlanInput>({
    destination: '',
    duration: 5,
    budget: 30000,
    travelStyle: ['adventure'],
    interests: ['hiking', 'photography'],
    groupSize: 2,
  });

  const toggleStyle = (s: string) => {
    setForm(f => ({
      ...f,
      travelStyle: f.travelStyle.includes(s) ? f.travelStyle.filter(x => x !== s) : [...f.travelStyle, s],
    }));
  };

  const toggleInterest = (i: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i],
    }));
  };

  const generatePlan = async () => {
    if (!form.destination.trim()) { toast.error('Enter a destination'); return; }
    setLoading(true);
    setApiKeyMissing(false);
    try {
      const result = await aiTripPlannerService.generateTripPlan(form);
      setPlan(result);
      setStep('result');
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('API key')) {
        setApiKeyMissing(true);
      } else {
        toast.error('AI planning failed. Check your API key.');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const tripCtx = plan ? `Trip to ${form.destination} for ${form.duration} days, budget ₹${form.budget}` : undefined;
      const reply = await aiTripPlannerService.chatWithAI(newMessages, tripCtx);
      setChatMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      toast.error('Chat failed');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => step === 'result' ? setStep('form') : navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h1 className="font-bold text-gray-900">AI Trip Planner</h1>
        </div>
        <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Powered by Claude</span>
      </div>

      {/* API Key Warning */}
      {apiKeyMissing && (
        <div className="mx-4 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">OpenRouter API Key Missing</p>
            <p className="text-xs text-amber-700 mt-1">Add <code className="bg-amber-100 px-1 rounded">VITE_OPENROUTER_API_KEY=your_key</code> to your <code className="bg-amber-100 px-1 rounded">.env</code> file and restart the dev server.</p>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-xs text-amber-800 underline mt-1 inline-block">Get your key at openrouter.ai →</a>
          </div>
        </div>
      )}

      {step === 'form' ? (
        <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
          {/* Destination */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> Destination
            </label>
            <input
              type="text"
              placeholder="e.g. Ladakh, Goa, Rajasthan..."
              value={form.destination}
              onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          {/* Duration + Group Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> Days
              </label>
              <input
                type="number" min={1} max={30}
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" /> People
              </label>
              <input
                type="number" min={1} max={20}
                value={form.groupSize}
                onChange={e => setForm(f => ({ ...f, groupSize: +e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-500" /> Total Budget (₹)
            </label>
            <input
              type="number" min={1000} step={1000}
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: +e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <p className="text-xs text-gray-400 mt-1">Per person: ₹{Math.round(form.budget / form.groupSize).toLocaleString()}</p>
          </div>

          {/* Travel Style */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Travel Style (select multiple)</label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleStyle(s)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                    form.travelStyle.includes(s)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                    form.interests.includes(i)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePlan}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating your plan...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate AI Plan</>
            )}
          </button>
        </div>
      ) : (
        <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
          {plan && (
            <>
              {/* Overview */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="font-bold">{form.destination} — {form.duration} Days</h2>
                </div>
                <p className="text-emerald-100 text-sm leading-relaxed">{plan.overview}</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-emerald-200">Budget</p>
                    <p className="font-bold text-sm">₹{form.budget.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-emerald-200">People</p>
                    <p className="font-bold text-sm">{form.groupSize}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-emerald-200">Best Time</p>
                    <p className="font-bold text-xs leading-tight">{plan.bestTimeToVisit?.split(' ').slice(0, 3).join(' ')}</p>
                  </div>
                </div>
              </div>

              {/* Day-by-Day */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900">Day-by-Day Itinerary</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {plan.days.map(day => (
                    <div key={day.day}>
                      <button
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-700">{day.day}</span>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-800 text-sm">{day.title}</p>
                            <p className="text-xs text-gray-400">~₹{day.estimatedCost?.toLocaleString()}</p>
                          </div>
                        </div>
                        {expandedDay === day.day ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      {expandedDay === day.day && (
                        <div className="px-5 pb-4 space-y-3">
                          {[['🌅 Morning', day.morning], ['☀️ Afternoon', day.afternoon], ['🌙 Evening', day.evening]].map(([label, text]) => (
                            <div key={label as string}>
                              <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                              <p className="text-sm text-gray-700">{text}</p>
                            </div>
                          ))}
                          {day.tips && (
                            <div className="bg-amber-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-amber-700 mb-1">💡 Insider Tip</p>
                              <p className="text-xs text-amber-800">{day.tips}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Breakdown */}
              {plan.budgetBreakdown && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-500" /> Budget Breakdown
                  </h2>
                  <div className="space-y-3">
                    {plan.budgetBreakdown.map(b => {
                      const pct = Math.round((b.amount / plan.budgetBreakdown.reduce((s, x) => s + x.amount, 0)) * 100);
                      return (
                        <div key={b.category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{b.category}</span>
                            <span className="font-semibold">₹{b.amount.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Packing Tips */}
              {plan.packingTips && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" /> Packing Tips
                  </h2>
                  <ul className="space-y-2">
                    {plan.packingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Chat */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h2 className="font-bold text-gray-900">Ask AI about your trip</h2>
                </div>
                <div className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Ask anything about {form.destination}...</p>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-gray-50 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about local food, transport, weather..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  <button
                    onClick={sendChat}
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Plan Again */}
              <button
                onClick={() => { setStep('form'); setPlan(null); setChatMessages([]); }}
                className="w-full py-3 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-2xl hover:bg-emerald-50 transition-colors"
              >
                Plan Another Trip
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
