import { useState } from 'react';
import {
  X, MapPin, Star, Utensils, Activity, Bed, Calendar,
  IndianRupee, Clock, AlertTriangle, Lightbulb, Train,
  Sparkles, ChevronDown, ChevronUp, Loader2, Globe
} from 'lucide-react';
import { getCityGuide, type CityGuide } from '@/services/aiService';
import toast from 'react-hot-toast';

interface Props {
  cityName: string;
  stateName: string;
  coverImage: string;
  onClose: () => void;
}

type Tab = 'places' | 'food' | 'activities' | 'stay' | 'plan' | 'budget';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'plan', label: 'Day Plan', emoji: '📅' },
  { id: 'places', label: 'Places', emoji: '🏛️' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'activities', label: 'Activities', emoji: '🎯' },
  { id: 'stay', label: 'Where to Stay', emoji: '🏨' },
  { id: 'budget', label: 'Budget', emoji: '💰' },
];

const DURATION_OPTIONS = [2, 3, 5, 7];
const STYLE_OPTIONS = ['budget', 'mid-range', 'luxury'];

export function AICityExplorer({ cityName, stateName, coverImage, onClose }: Props) {
  const [guide, setGuide] = useState<CityGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState('mid-range');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const fetchGuide = async () => {
    setLoading(true);
    setGuide(null);
    try {
      const data = await getCityGuide(cityName, stateName, days, style);
      setGuide(data);
      setActiveTab('plan');
    } catch (e) {
      console.error(e);
      toast.error('AI guide failed. Check your API key in .env file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Cover Image Header */}
        <div className="relative h-48 flex-shrink-0">
          <img src={coverImage} alt={cityName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-medium">AI-Powered Guide</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{cityName}</h2>
            <p className="text-white/80 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {stateName}, India
            </p>
          </div>
        </div>

        {/* Config & Generate */}
        {!guide && !loading && (
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              🤖 Generate Your Personalized Guide
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Claude AI will create a complete travel guide with real places, prices, and day-wise plans.
            </p>

            {/* Duration */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Trip Duration</label>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                      days === d
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Travel Style</label>
              <div className="flex gap-2">
                {STYLE_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all border-2 ${
                      style === s
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    {s === 'budget' ? '💰' : s === 'mid-range' ? '✨' : '👑'} {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={fetchGuide}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold text-base hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate AI Guide for {cityName}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Powered by Claude (OpenRouter) • Gemini fallback
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 rounded-full" />
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
              <Sparkles className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 mb-1">AI is researching {cityName}...</p>
              <p className="text-sm text-gray-500">Finding best places, prices & creating your {days}-day plan</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {['Discovering top attractions...', 'Finding local food gems...', 'Building day-wise plan...', 'Calculating budget estimates...'].map((msg, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guide Content */}
        {guide && !loading && (
          <>
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50 flex-shrink-0 scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">

              {/* Overview strip */}
              <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                <p className="text-xs text-emerald-700 leading-relaxed">{guide.overview}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-emerald-600">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{guide.bestTimeToVisit.split('.')[0]}</span>
                  <span className="flex items-center gap-1"><Train className="w-3 h-3" />{guide.howToReach.split('.')[0]}</span>
                </div>
              </div>

              {/* DAY PLAN */}
              {activeTab === 'plan' && (
                <div className="p-4 space-y-4">
                  {guide.dayWisePlan.map((day, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        className="w-full flex items-center justify-between p-4"
                        onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            D{day.day}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 text-sm">{day.theme}</p>
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" />{day.estimatedCost}
                            </p>
                          </div>
                        </div>
                        {expandedItem === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      {expandedItem === i && (
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                          {[
                            { time: '🌅 Morning', content: day.morning },
                            { time: '☀️ Afternoon', content: day.afternoon },
                            { time: '🌙 Evening', content: day.evening },
                          ].map(slot => (
                            <div key={slot.time}>
                              <p className="text-xs font-semibold text-gray-500 mb-1">{slot.time}</p>
                              <p className="text-sm text-gray-700">{slot.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* PLACES */}
              {activeTab === 'places' && (
                <div className="p-4 space-y-3">
                  {guide.places.map((place, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{place.name}</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                          {place.entryFee}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{place.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{place.timings}</span>
                      </div>
                      <div className="mt-2 flex items-start gap-1.5">
                        <Lightbulb className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700">{place.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FOOD */}
              {activeTab === 'food' && (
                <div className="p-4 space-y-3">
                  {guide.food.map((f, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{f.dish}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {f.where}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 flex-shrink-0 ml-2">{f.price}</span>
                      </div>
                      <p className="text-sm text-gray-600">{f.mustTry}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ACTIVITIES */}
              {activeTab === 'activities' && (
                <div className="p-4 space-y-3">
                  {guide.activities.map((act, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{act.name}</h3>
                        <span className="text-sm font-bold text-emerald-600 flex-shrink-0 ml-2">{act.cost}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{act.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" /> {act.duration}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          act.difficulty === 'Hard' ? 'bg-red-100 text-red-600' :
                          act.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {act.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STAY */}
              {activeTab === 'stay' && (
                <div className="p-4 space-y-3">
                  {guide.stays.map((stay, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            stay.type === 'Budget' ? 'bg-green-100 text-green-700' :
                            stay.type === 'Luxury' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{stay.type}</span>
                          <h3 className="font-semibold text-gray-900 mt-1">{stay.name}</h3>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm font-bold text-emerald-600">{stay.pricePerNight}</p>
                          <p className="text-xs text-gray-400">/night</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{stay.pros}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* BUDGET */}
              {activeTab === 'budget' && (
                <div className="p-4 space-y-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                    <p className="text-sm text-emerald-600 font-medium mb-1">Total Estimate ({guide.totalBudgetEstimate.days} days)</p>
                    <p className="text-2xl font-bold text-emerald-700">{guide.totalBudgetEstimate.budget}</p>
                    <p className="text-xs text-emerald-600 mt-1">{guide.totalBudgetEstimate.breakdown}</p>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" /> Local Tips
                    </h3>
                    <ul className="space-y-2">
                      {guide.localTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Emergency Numbers
                    </h3>
                    <div className="space-y-1">
                      {guide.emergencyNumbers.map((e, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-red-700">{e.name}</span>
                          <span className="font-bold text-red-800">{e.number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Regenerate */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => { setGuide(null); }}
                className="w-full py-2.5 border-2 border-emerald-600 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" /> Change Duration or Style
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
