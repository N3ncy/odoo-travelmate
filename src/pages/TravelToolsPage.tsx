import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, MapPin, Cloud, DollarSign, Package, Languages,
  Phone, Calculator, ChevronRight, Star, TrendingUp, Lightbulb,
  Sun, CloudRain, Snowflake, Wind, Thermometer, Check, Plus, X,
  AlertTriangle, Hospital, Shield, RefreshCw, Search
} from 'lucide-react';
import {
  aiRecommendationService, weatherService, currencyService,
  packingService, languageService, emergencyInfoService, budgetService,
  AIRecommendation, WeatherForecast, PackingItem, LocalPhrase, EmergencyContact
} from '@/services/travelUtilsService';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

type ActiveTool = 'recommendations' | 'weather' | 'currency' | 'packing' | 'phrases' | 'emergency' | 'budget' | null;

const WEATHER_ICONS: Record<string, React.ReactNode> = {
  'sunny': <Sun className="w-8 h-8 text-yellow-500" />,
  'cloudy': <Cloud className="w-8 h-8 text-gray-500" />,
  'partly-cloudy': <Cloud className="w-8 h-8 text-blue-400" />,
  'rain': <CloudRain className="w-8 h-8 text-blue-600" />,
  'snow': <Snowflake className="w-8 h-8 text-blue-300" />,
};

export function TravelToolsPage() {
  const { profile } = useAuthStore();
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [phrases, setPhrases] = useState<LocalPhrase[]>([]);
  const [emergency, setEmergency] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [weatherCity, setWeatherCity] = useState('Manali');
  const [currencyAmount, setCurrencyAmount] = useState(100);
  const [currencyFrom, setCurrencyFrom] = useState('USD');
  const [currencyTo, setCurrencyTo] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [packingDestination, setPackingDestination] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [budgetDays, setBudgetDays] = useState(5);
  const [budgetTravelers, setBudgetTravelers] = useState(1);
  const [budgetStyle, setBudgetStyle] = useState<'budget' | 'mid-range' | 'luxury'>('mid-range');
  const [budgetResult, setBudgetResult] = useState<any>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const recs = await aiRecommendationService.getPersonalizedRecommendations(profile?.id || 'demo');
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadWeather = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getWeather(weatherCity);
      setWeather(data);
    } catch (error) {
      toast.error('Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = async () => {
    try {
      const result = await currencyService.convert(currencyAmount, currencyFrom, currencyTo);
      setConvertedAmount(result.result);
    } catch (error) {
      toast.error('Conversion failed');
    }
  };

  const generatePackingList = async () => {
    try {
      setLoading(true);
      const list = await packingService.generatePackingList({
        destination: packingDestination || 'Mountain Trip',
        duration: 5,
        activities: ['trekking', 'sightseeing'],
        weather: 'cold',
      });
      setPackingItems(list.items);
    } catch (error) {
      toast.error('Failed to generate packing list');
    } finally {
      setLoading(false);
    }
  };

  const togglePacked = (itemId: string) => {
    setPackingItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const loadPhrases = async () => {
    try {
      setLoading(true);
      const data = await languageService.getPhrases(selectedLanguage);
      setPhrases(data);
    } catch (error) {
      toast.error('Failed to load phrases');
    } finally {
      setLoading(false);
    }
  };

  const loadEmergency = async () => {
    try {
      setLoading(true);
      const data = await emergencyInfoService.getEmergencyContacts('india');
      setEmergency(data);
    } catch (error) {
      toast.error('Failed to load emergency info');
    } finally {
      setLoading(false);
    }
  };

  const calculateBudget = async () => {
    try {
      setLoading(true);
      const result = await budgetService.estimateTripCost({
        destination: 'India',
        duration: budgetDays,
        travelers: budgetTravelers,
        accommodation: budgetStyle,
        activities: ['sightseeing'],
      });
      setBudgetResult(result);
    } catch (error) {
      toast.error('Failed to calculate budget');
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { id: 'recommendations', icon: Sparkles, label: 'AI Recommendations', color: 'from-violet-500 to-purple-600', description: 'Personalized travel suggestions' },
    { id: 'weather', icon: Cloud, label: 'Weather', color: 'from-blue-500 to-cyan-500', description: 'Destination forecasts' },
    { id: 'currency', icon: DollarSign, label: 'Currency', color: 'from-green-500 to-emerald-500', description: 'Exchange rates' },
    { id: 'packing', icon: Package, label: 'Packing List', color: 'from-orange-500 to-amber-500', description: 'Smart packing assistant' },
    { id: 'phrases', icon: Languages, label: 'Local Phrases', color: 'from-pink-500 to-rose-500', description: 'Essential phrases' },
    { id: 'emergency', icon: Phone, label: 'Emergency', color: 'from-red-500 to-rose-600', description: 'Emergency contacts' },
    { id: 'budget', icon: Calculator, label: 'Budget', color: 'from-teal-500 to-green-500', description: 'Trip cost estimator' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Travel Tools</h1>
              <p className="text-indigo-100">AI-powered utilities for your journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tools Grid */}
        {!activeTool && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ActiveTool)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{tool.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                </button>
              ))}
            </div>

            {/* Quick Recommendations */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  For You
                </h2>
                <button
                  onClick={() => setActiveTool('recommendations')}
                  className="text-violet-600 text-sm font-medium flex items-center gap-1"
                >
                  See All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {recommendations.slice(0, 3).map(rec => (
                  <div key={rec.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                    {rec.image_url && (
                      <div className="relative h-32">
                        <img src={rec.image_url} alt={rec.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-violet-600 text-white text-xs rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {rec.match_score}% Match
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <MapPin className="w-3 h-3" />
                        {rec.destination}
                      </div>
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{rec.ai_reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Active Tool Views */}
        {activeTool && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Tools
            </button>

            {/* AI Recommendations */}
            {activeTool === 'recommendations' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-violet-600" />
                  AI Recommendations
                </h2>
                <p className="text-gray-500">Personalized suggestions based on your travel preferences</p>

                <div className="space-y-4 mt-6">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      <div className="flex">
                        {rec.image_url && (
                          <img src={rec.image_url} alt={rec.title} className="w-32 h-32 object-cover" />
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              rec.type === 'destination' ? 'bg-blue-100 text-blue-700' :
                              rec.type === 'hidden_gem' ? 'bg-purple-100 text-purple-700' :
                              rec.type === 'activity' ? 'bg-orange-100 text-orange-700' :
                              rec.type === 'food' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {rec.type.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-violet-600 font-medium">{rec.match_score}% match</span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {rec.destination}
                            {rec.rating && (
                              <>
                                <span className="mx-1">•</span>
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                {rec.rating}
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{rec.ai_reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weather */}
            {activeTool === 'weather' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-blue-500" />
                  Weather Forecast
                </h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={weatherCity}
                    onChange={(e) => setWeatherCity(e.target.value)}
                    placeholder="Enter destination"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={loadWeather}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Search'}
                  </button>
                </div>

                {weather && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{weather.destination}</h3>
                        <p className="text-gray-500">{weather.current.condition}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {WEATHER_ICONS[weather.current.icon] || <Cloud className="w-8 h-8" />}
                        <span className="text-4xl font-bold text-gray-900">{weather.current.temp}°C</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <Thermometer className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Humidity</p>
                        <p className="font-semibold">{weather.current.humidity}%</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <Wind className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Wind</p>
                        <p className="font-semibold">{weather.current.wind_speed} km/h</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <CloudRain className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Rain</p>
                        <p className="font-semibold">{weather.forecast[0]?.precipitation || 0}%</p>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-3">5-Day Forecast</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {weather.forecast.map((day, idx) => (
                        <div key={idx} className="flex-shrink-0 w-20 text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                          {WEATHER_ICONS[day.icon] || <Cloud className="w-6 h-6 mx-auto my-2" />}
                          <p className="text-sm font-semibold">{day.high}°/{day.low}°</p>
                        </div>
                      ))}
                    </div>

                    {weather.travel_advisory && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-xl flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800">{weather.travel_advisory}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Currency */}
            {activeTool === 'currency' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  Currency Converter
                </h2>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <input
                        type="number"
                        value={currencyAmount}
                        onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-2xl font-semibold focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <select
                          value={currencyFrom}
                          onChange={(e) => setCurrencyFrom(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="SGD">SGD - Singapore Dollar</option>
                          <option value="AED">AED - UAE Dirham</option>
                          <option value="THB">THB - Thai Baht</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <select
                          value={currencyTo}
                          onChange={(e) => setCurrencyTo(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                        >
                          <option value="INR">INR - Indian Rupee</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="THB">THB - Thai Baht</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={convertCurrency}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Convert
                    </button>

                    {convertedAmount !== null && (
                      <div className="text-center p-6 bg-green-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">{currencyAmount} {currencyFrom} =</p>
                        <p className="text-4xl font-bold text-green-700">{convertedAmount.toLocaleString()} {currencyTo}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Packing List */}
            {activeTool === 'packing' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-orange-500" />
                  Smart Packing List
                </h2>

                {packingItems.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="text-center mb-6">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Generate a packing list for your trip</p>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={packingDestination}
                        onChange={(e) => setPackingDestination(e.target.value)}
                        placeholder="Where are you going? (e.g., Manali)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={generatePackingList}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50"
                      >
                        {loading ? 'Generating...' : 'Generate Packing List'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Your Packing List</h3>
                        <p className="text-sm text-gray-500">
                          {packingItems.filter(i => i.packed).length}/{packingItems.length} items packed
                        </p>
                      </div>
                      <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{ width: `${(packingItems.filter(i => i.packed).length / packingItems.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {Object.entries(
                      packingItems.reduce((acc, item) => {
                        if (!acc[item.category]) acc[item.category] = [];
                        acc[item.category].push(item);
                        return acc;
                      }, {} as Record<string, PackingItem[]>)
                    ).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {items.map(item => (
                            <button
                              key={item.id}
                              onClick={() => togglePacked(item.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                item.packed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                item.packed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                              }`}>
                                {item.packed && <Check className="w-4 h-4 text-white" />}
                              </div>
                              <span className={item.packed ? 'line-through text-gray-400' : 'text-gray-700'}>
                                {item.item}
                                {item.quantity > 1 && ` (x${item.quantity})`}
                              </span>
                              {item.essential && !item.packed && (
                                <span className="ml-auto text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Essential</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Phrases */}
            {activeTool === 'phrases' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Languages className="w-6 h-6 text-pink-500" />
                  Local Phrases
                </h2>

                <div className="flex gap-2">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Marathi">Marathi</option>
                  </select>
                  <button
                    onClick={loadPhrases}
                    disabled={loading}
                    className="px-6 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 disabled:opacity-50"
                  >
                    Load
                  </button>
                </div>

                {phrases.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="space-y-3">
                      {phrases.map((phrase, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{phrase.english}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              phrase.category === 'emergency' ? 'bg-red-100 text-red-600' :
                              phrase.category === 'greeting' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {phrase.category}
                            </span>
                          </div>
                          <p className="text-lg text-pink-700 font-semibold">{phrase.local}</p>
                          <p className="text-sm text-gray-500 italic">({phrase.pronunciation})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Emergency */}
            {activeTool === 'emergency' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Phone className="w-6 h-6 text-red-500" />
                  Emergency Contacts
                </h2>

                <button
                  onClick={loadEmergency}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load India Emergency Numbers'}
                </button>

                {emergency && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-4">{emergency.country} Emergency Numbers</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <a href={`tel:${emergency.police}`} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                          <Shield className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-500">Police</p>
                            <p className="text-xl font-bold text-blue-700">{emergency.police}</p>
                          </div>
                        </a>
                        <a href={`tel:${emergency.ambulance}`} className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                          <Hospital className="w-8 h-8 text-red-600" />
                          <div>
                            <p className="text-sm text-gray-500">Ambulance</p>
                            <p className="text-xl font-bold text-red-700">{emergency.ambulance}</p>
                          </div>
                        </a>
                        {emergency.tourist_helpline && (
                          <a href={`tel:${emergency.tourist_helpline}`} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl col-span-2">
                            <Phone className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="text-sm text-gray-500">Tourist Helpline</p>
                              <p className="text-xl font-bold text-green-700">{emergency.tourist_helpline}</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Budget Calculator */}
            {activeTool === 'budget' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-teal-500" />
                  Budget Calculator
                </h2>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                        <input
                          type="number"
                          value={budgetDays}
                          onChange={(e) => setBudgetDays(Number(e.target.value))}
                          min={1}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                        <input
                          type="number"
                          value={budgetTravelers}
                          onChange={(e) => setBudgetTravelers(Number(e.target.value))}
                          min={1}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['budget', 'mid-range', 'luxury'] as const).map(style => (
                          <button
                            key={style}
                            onClick={() => setBudgetStyle(style)}
                            className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                              budgetStyle === style
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={calculateBudget}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
                    >
                      {loading ? 'Calculating...' : 'Calculate Budget'}
                    </button>

                    {budgetResult && (
                      <div className="mt-6 p-6 bg-teal-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-4">Estimated Total</h4>
                        <p className="text-3xl font-bold text-teal-700 mb-4">
                          Rs {budgetResult.total.min.toLocaleString()} - Rs {budgetResult.total.max.toLocaleString()}
                        </p>

                        <div className="space-y-2 mb-4">
                          {budgetResult.breakdown.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.category}</span>
                              <span className="font-medium">Rs {item.min.toLocaleString()} - {item.max.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-teal-200">
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Money-Saving Tips
                          </h5>
                          <ul className="space-y-1">
                            {budgetResult.tips.map((tip: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
