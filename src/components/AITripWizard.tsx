import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MapPin, Calendar, Users, Wallet, Compass, Train, Home, Utensils, Zap, Shield, ChevronRight, Loader2 } from 'lucide-react';
import { generateTripPlan, generateAIPackingList, type AITripPlan, type PackingCategory } from '@/services/aiService';
import toast from 'react-hot-toast';

// ─── Questions ─────────────────────────────────────────────────────────────
const QUESTIONS = [
  { id: 'destination', icon: MapPin,   label: 'Where do you want to travel?',     placeholder: 'e.g. Goa, Ladakh, Bali, Europe...', type: 'text' },
  { id: 'days',        icon: Calendar, label: 'How many days?',                    placeholder: 'e.g. 5', type: 'number' },
  { id: 'group',       icon: Users,    label: 'Who are you traveling with?',       type: 'chips', options: ['Solo 🧳','Couple 💑','Friends 👯','Family 👨‍👩‍👧','Office Group 💼'] },
  { id: 'budget',      icon: Wallet,   label: 'What is your total budget?',        type: 'chips', options: ['Budget 💰','Mid-Range 🏷️','Luxury ✨','I\'ll specify ₹'] },
  { id: 'tripType',    icon: Compass,  label: 'What type of trip?',                type: 'chips', options: ['Adventure 🏔️','Relaxation 🌴','Cultural 🏛️','Party 🎉','Nature 🌿','Spiritual 🕌','Food 🍜','Backpacking 🎒'] },
  { id: 'transport',   icon: Train,    label: 'Preferred transport?',              type: 'chips', options: ['Flight ✈️','Train 🚂','Road Trip 🚗','Flexible 🔄'] },
  { id: 'stay',        icon: Home,     label: 'Preferred stay type?',              type: 'chips', options: ['Hostel 🛏️','Hotel 🏨','Resort 🏖️','Airbnb 🏡','Luxury Stay 👑'] },
  { id: 'food',        icon: Utensils, label: 'Food preference?',                  type: 'chips', options: ['Veg 🥗','Non-Veg 🍗','Vegan 🌱','Local Explorer 🍲'] },
  { id: 'activities',  icon: Zap,      label: 'Activity preferences?',             type: 'multichips', options: ['Trekking 🥾','Nightlife 🌃','Scuba 🤿','Camping ⛺','Cafes ☕','Shopping 🛍️','Photography 📸','Hidden Gems 💎'] },
  { id: 'special',     icon: Shield,   label: 'Any special requirements?',         type: 'multichips', options: ['Kid Friendly 👶','Pet Friendly 🐾','Female Safe 👩','Wheelchair ♿','None ✅'] },
];

const AI_GREETING = "Hey! I'm your AI Travel Concierge 🌏 I'll help you plan the perfect trip. Let me ask you a few quick questions...";

interface Props { onClose: () => void; }

export function AITripWizard({ onClose }: Props) {
  const [step, setStep] = useState(-1); // -1 = greeting
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textVal, setTextVal] = useState('');
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [phase, setPhase] = useState<'questions' | 'generating' | 'result'>('questions');
  const [plan, setPlan] = useState<AITripPlan | null>(null);
  const [packing, setPacking] = useState<PackingCategory[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing animation for greeting
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (step === -1) {
      let i = 0;
      const iv = setInterval(() => {
        setDisplayed(AI_GREETING.slice(0, ++i));
        if (i >= AI_GREETING.length) { clearInterval(iv); setTimeout(() => setStep(0), 600); }
      }, 18);
      return () => clearInterval(iv);
    }
  }, []);

  const q = step >= 0 ? QUESTIONS[step] : null;

  const advance = (val: string) => {
    const newAnswers = { ...answers, [QUESTIONS[step].id]: val };
    setAnswers(newAnswers);
    setTextVal('');
    setMultiSel([]);
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      generate(newAnswers);
    }
  };

  const generate = async (ans: Record<string, string>) => {
    setPhase('generating');
    try {
      const days = parseInt(ans.days) || 5;
      const budgetMap: Record<string, number> = { 'Budget 💰': 15000, 'Mid-Range 🏷️': 40000, 'Luxury ✨': 100000 };
      const budget = budgetMap[ans.budget] || 30000;
      const groupMap: Record<string, number> = { 'Solo 🧳': 1, 'Couple 💑': 2, 'Friends 👯': 4, 'Family 👨‍👩‍👧': 4, 'Office Group 💼': 10 };
      const groupSize = groupMap[ans.group] || 2;

      const [tripPlan, packingList] = await Promise.all([
        generateTripPlan({
          destination: ans.destination,
          duration: days,
          budget,
          travelStyle: [ans.tripType?.replace(/\s\S+$/, '').toLowerCase() || 'adventure'],
          interests: (ans.activities || '').split(',').map(a => a.replace(/\s\S+$/, '').toLowerCase()),
          groupSize,
        }),
        generateAIPackingList(ans.destination, days, 'current season',
          (ans.activities || '').split(',').map(a => a.replace(/\s\S+$/, '').toLowerCase())).catch(() => [])
      ]);
      setPlan(tripPlan);
      setPacking(packingList);
      setPhase('result');
    } catch {
      toast.error('AI planning failed. Please check your API key in .env');
      setPhase('questions');
      setStep(QUESTIONS.length - 1);
    }
  };

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl flex flex-col"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0d2118 100%)', border: '1px solid rgba(52,211,153,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">TravelMate AI Concierge</p>
              <p className="text-[11px] text-emerald-400/70">Powered by Claude + Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* GREETING */}
          {step === -1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white/5 rounded-2xl p-5 border border-white/10"
            >
              <p className="text-white text-lg leading-relaxed font-medium">{displayed}<span className="animate-pulse">|</span></p>
            </motion.div>
          )}

          {/* QUESTIONS */}
          {phase === 'questions' && step >= 0 && q && (
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Progress */}
                <div className="flex gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-emerald-500' : 'bg-white/10'}`} />
                  ))}
                </div>

                {/* Question bubble */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                    <q.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm px-5 py-4 border border-white/10">
                    <p className="text-white font-semibold text-base">{q.label}</p>
                    <p className="text-xs text-gray-400 mt-1">Step {step + 1} of {QUESTIONS.length}</p>
                  </div>
                </div>

                {/* Text input */}
                {q.type === 'text' && (
                  <div className="flex gap-3 ml-11">
                    <input
                      ref={inputRef} autoFocus
                      value={textVal} onChange={e => setTextVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && textVal.trim() && advance(textVal.trim())}
                      placeholder={q.placeholder}
                      className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                    <button
                      onClick={() => textVal.trim() && advance(textVal.trim())}
                      disabled={!textVal.trim()}
                      className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Number input */}
                {q.type === 'number' && (
                  <div className="flex gap-3 ml-11">
                    <input
                      ref={inputRef} autoFocus type="number" min={1} max={30}
                      value={textVal} onChange={e => setTextVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && textVal.trim() && advance(textVal.trim())}
                      placeholder="e.g. 5"
                      className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                    <button
                      onClick={() => textVal.trim() && advance(textVal.trim())}
                      disabled={!textVal.trim()}
                      className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Single-select chips */}
                {q.type === 'chips' && (
                  <div className="ml-11 flex flex-wrap gap-2">
                    {q.options!.map(opt => (
                      <button key={opt} onClick={() => advance(opt)}
                        className="px-4 py-2.5 rounded-full bg-white/5 border border-white/15 text-white text-sm hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Multi-select chips */}
                {q.type === 'multichips' && (
                  <div className="ml-11 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {q.options!.map(opt => (
                        <button key={opt}
                          onClick={() => setMultiSel(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])}
                          className={`px-4 py-2.5 rounded-full border text-sm transition-all ${multiSel.includes(opt) ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-white/15 text-white hover:border-emerald-500'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => advance(multiSel.length ? multiSel.join(', ') : 'None')}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors"
                    >
                      {step + 1 < QUESTIONS.length ? 'Next' : 'Generate My Trip ✨'} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* GENERATING */}
          {phase === 'generating' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl mb-2">Building your perfect trip...</p>
                <p className="text-gray-400 text-sm">AI is crafting a personalized itinerary for {answers.destination} ✨</p>
              </div>
              <div className="flex flex-col gap-2 w-64">
                {['Analyzing your preferences...', 'Optimizing routes & budget...', 'Creating day-by-day plan...', 'Generating packing list...'].map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }}
                    className="flex items-center gap-2 text-xs text-gray-400"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                    {t}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === 'result' && plan && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Overview Card */}
              <div className="rounded-2xl p-5 border border-emerald-500/30" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(20,184,166,0.10))' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-bold text-white text-lg">{answers.destination} — {answers.days} Days</h2>
                </div>
                <p className="text-emerald-100/80 text-sm leading-relaxed">{plan.overview}</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Group', val: answers.group?.split(' ')[0] },
                    { label: 'Style', val: answers.tripType?.split(' ')[0] },
                    { label: 'Best Time', val: plan.bestTimeToVisit?.split(' ').slice(0,3).join(' ') },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-emerald-300/70 uppercase tracking-wider">{label}</p>
                      <p className="font-bold text-white text-xs mt-1 truncate">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-by-Day */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/3">
                <div className="px-5 py-4 border-b border-white/5">
                  <h3 className="font-bold text-white">📅 Day-by-Day Itinerary</h3>
                </div>
                {plan.days.map(day => (
                  <div key={day.day} className="border-b border-white/5 last:border-0">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-400">{day.day}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{day.title}</p>
                          <p className="text-xs text-gray-500">~₹{day.estimatedCost?.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">{expandedDay === day.day ? '▲' : '▼'}</span>
                    </button>
                    {expandedDay === day.day && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="px-5 pb-4 space-y-3"
                      >
                        {[['🌅 Morning', day.morning], ['☀️ Afternoon', day.afternoon], ['🌙 Evening', day.evening]].map(([label, text]) => (
                          <div key={label as string} className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
                            <p className="text-sm text-gray-200">{text}</p>
                          </div>
                        ))}
                        {day.tips && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                            <p className="text-xs font-bold text-amber-400 mb-1">💡 Insider Tip</p>
                            <p className="text-xs text-amber-200">{day.tips}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Budget Breakdown */}
              {plan.budgetBreakdown?.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-3">
                  <h3 className="font-bold text-white">💰 Budget Breakdown</h3>
                  {plan.budgetBreakdown.map(b => {
                    const total = plan.budgetBreakdown.reduce((s, x) => s + x.amount, 0);
                    const pct = Math.round((b.amount / total) * 100);
                    return (
                      <div key={b.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{b.category}</span>
                          <span className="text-white font-semibold">₹{b.amount.toLocaleString()} <span className="text-gray-500 text-xs">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full">
                          <motion.div className="h-1.5 bg-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Packing Checklist */}
              {packing.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-4">
                  <h3 className="font-bold text-white">🎒 Smart Packing List</h3>
                  {packing.map(cat => (
                    <div key={cat.category}>
                      <p className="text-sm font-semibold text-gray-300 mb-2">{cat.emoji} {cat.category}</p>
                      <div className="space-y-1.5">
                        {cat.items.map((item, i) => {
                          const key = `${cat.category}-${i}`;
                          return (
                            <button key={key} onClick={() => toggleCheck(key)}
                              className="w-full flex items-center gap-3 text-left group"
                            >
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checkedItems.has(key) ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-emerald-500'}`}>
                                {checkedItems.has(key) && <span className="text-white text-xs">✓</span>}
                              </div>
                              <span className={`text-sm transition-all ${checkedItems.has(key) ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                {item.item}
                                {item.essential && <span className="ml-2 text-[10px] text-amber-400 font-bold">MUST</span>}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Plan Again */}
              <button
                onClick={() => { setPhase('questions'); setStep(0); setPlan(null); setPacking([]); setAnswers({}); }}
                className="w-full py-3 rounded-xl border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/10 transition-colors"
              >
                ↺ Plan Another Trip
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
