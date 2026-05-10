import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, IndianRupee, AlertTriangle, TrendingUp,
  PieChartIcon, BarChart2, Sparkles, Loader2, RefreshCw,
  Lightbulb, CheckCircle2, Users
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { tripService } from '@/services/api';
import { generateAIBudget, type AIBudgetPlan } from '@/services/aiService';
import toast from 'react-hot-toast';
import type { Trip } from '@/types';

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const MOCK_EXPENSES = [
  { category: 'Accommodation', amount: 12000, budget: 15000 },
  { category: 'Transport', amount: 8500, budget: 8000 },
  { category: 'Food', amount: 4200, budget: 5000 },
  { category: 'Activities', amount: 6800, budget: 6000 },
  { category: 'Shopping', amount: 2100, budget: 3000 },
  { category: 'Miscellaneous', amount: 1500, budget: 2000 },
];

const MOCK_DAILY = [
  { day: 'Day 1', planned: 3500, actual: 3200 },
  { day: 'Day 2', planned: 4000, actual: 5100 },
  { day: 'Day 3', planned: 3000, actual: 2800 },
  { day: 'Day 4', planned: 4500, actual: 4700 },
  { day: 'Day 5', planned: 3200, actual: 3000 },
];

export function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [loading, setLoading] = useState(true);

  // AI Budget state
  const [aiBudget, setAiBudget] = useState<AIBudgetPlan | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeView, setActiveView] = useState<'actual' | 'ai'>('actual');
  const [groupSize, setGroupSize] = useState(1);
  const [travelStyle, setTravelStyle] = useState<'budget' | 'mid-range' | 'luxury'>('mid-range');
  const [duration, setDuration] = useState(5);

  useEffect(() => {
    if (tripId) fetchTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrip(tripId!);
      setTrip(data);
      // Auto-detect duration from trip
      if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diff > 0) setDuration(diff);
      }
    } catch {
      toast.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIBudget = async () => {
    if (!trip?.destination) {
      toast.error('Trip destination not set');
      return;
    }
    setAiLoading(true);
    setAiBudget(null);
    try {
      const budget = await generateAIBudget(trip.destination, duration, groupSize, travelStyle);
      setAiBudget(budget);
      setActiveView('ai');
      toast.success('AI budget plan ready!');
    } catch (e) {
      console.error(e);
      toast.error('AI budget failed. Check your API key in .env file.');
    } finally {
      setAiLoading(false);
    }
  };

  const totalBudget = MOCK_EXPENSES.reduce((s, e) => s + e.budget, 0);
  const totalSpent = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const overBudget = totalSpent > totalBudget;
  const overBudgetCategories = MOCK_EXPENSES.filter(e => e.amount > e.budget);

  // Convert AI budget to chart-friendly data
  const aiChartData = aiBudget?.categories.map(c => ({
    category: c.category.replace('Activities & Entry Fees', 'Activities'),
    amount: c.estimated,
    budget: c.estimated,
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900">Trip Budget</h1>
          <p className="text-sm text-gray-500">{trip?.destination || 'Loading...'}</p>
        </div>
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveView('actual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'actual' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
            }`}
          >
            Actual
          </button>
          <button
            onClick={() => setActiveView('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              activeView === 'ai' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
            }`}
          >
            <Sparkles className="w-3 h-3" /> AI Plan
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ─── AI Budget Planner ─── */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h2 className="font-bold text-lg">AI Budget Planner</h2>
          </div>
          <p className="text-emerald-100 text-sm mb-4">
            Get a detailed INR budget breakdown for {trip?.destination || 'your destination'} powered by Claude AI
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Duration */}
            <div>
              <p className="text-xs text-emerald-200 mb-1">Days</p>
              <input
                type="number"
                min={1} max={30}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
            {/* Group Size */}
            <div>
              <p className="text-xs text-emerald-200 mb-1">People</p>
              <input
                type="number"
                min={1} max={20}
                value={groupSize}
                onChange={e => setGroupSize(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
            {/* Style */}
            <div>
              <p className="text-xs text-emerald-200 mb-1">Style</p>
              <select
                value={travelStyle}
                onChange={e => setTravelStyle(e.target.value as typeof travelStyle)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <option value="budget" className="text-gray-900">💰 Budget</option>
                <option value="mid-range" className="text-gray-900">✨ Mid</option>
                <option value="luxury" className="text-gray-900">👑 Luxury</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateAIBudget}
            disabled={aiLoading}
            className="w-full py-3 bg-white text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {aiLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating AI Budget...</>
              : <><Sparkles className="w-4 h-4" /> Generate AI Budget Plan</>
            }
          </button>
        </div>

        {/* ─── AI Budget Results ─── */}
        {aiBudget && activeView === 'ai' && (
          <>
            {/* Total Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 col-span-2">
                <p className="text-xs text-gray-500 mb-1">AI Estimated Total</p>
                <p className="text-xl font-bold text-emerald-600">
                  {aiBudget.totalMin.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} –{' '}
                  {aiBudget.totalMax.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  ~₹{aiBudget.perDayAvg.toLocaleString()} per day · {aiBudget.travelStyle} style
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Group</p>
                <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                  <Users className="w-5 h-5 text-gray-400" /> {groupSize}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{duration} days</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">AI Cost Breakdown</h2>
              </div>

              {/* Pie Chart */}
              <div className="px-4 py-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={aiChartData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={90}
                      label={({ category, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {aiChartData.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Estimated']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="divide-y divide-gray-50">
                {aiBudget.categories.map((cat, i) => (
                  <div key={cat.category} className="px-6 py-4">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        <span className="font-medium text-gray-800 text-sm">{cat.emoji} {cat.category}</span>
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">₹{cat.estimated.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-5 mb-1">{cat.breakdown}</p>
                    <div className="ml-5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <p className="text-xs text-emerald-600">{cat.savingTip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" /> AI Money Tips
              </h3>
              <ul className="space-y-2">
                {aiBudget.moneyTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => { setAiBudget(null); setActiveView('actual'); handleGenerateAIBudget(); }}
              className="w-full py-2.5 border border-emerald-300 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate Budget
            </button>
          </>
        )}

        {/* ─── Actual Expense Tracker ─── */}
        {activeView === 'actual' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total Budget</p>
                <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />{totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Spent</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${overBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                  <IndianRupee className="w-4 h-4" />{totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Remaining</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${totalBudget - totalSpent < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  <IndianRupee className="w-4 h-4" />{Math.abs(totalBudget - totalSpent).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Over-budget Alerts */}
            {overBudgetCategories.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Over Budget Alert</h3>
                </div>
                <div className="space-y-2">
                  {overBudgetCategories.map(cat => (
                    <div key={cat.category} className="flex justify-between items-center">
                      <span className="text-sm text-red-700">{cat.category}</span>
                      <span className="text-sm font-semibold text-red-800">
                        +₹{(cat.amount - cat.budget).toLocaleString()} over
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900">Expense Breakdown</h2>
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setChartType('pie')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      chartType === 'pie' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
                    }`}
                  >
                    <PieChartIcon className="w-4 h-4" /> Pie
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      chartType === 'bar' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" /> Bar
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie data={MOCK_EXPENSES} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {MOCK_EXPENSES.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Spent']} />
                  </PieChart>
                ) : (
                  <BarChart data={MOCK_EXPENSES} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`]} />
                    <Legend />
                    <Bar dataKey="budget" name="Budget" fill="#d1fae5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="amount" name="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Per-Day Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-gray-900">Per-Day Breakdown</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MOCK_DAILY} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`]} />
                  <Legend />
                  <Bar dataKey="planned" name="Planned" fill="#d1fae5" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">Category Details</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {MOCK_EXPENSES.map((exp, i) => {
                  const pct = Math.min(100, (exp.amount / exp.budget) * 100);
                  const over = exp.amount > exp.budget;
                  return (
                    <div key={exp.category} className="px-6 py-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                          <span className="font-medium text-gray-800 text-sm">{exp.category}</span>
                          {over && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Over</span>}
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold text-sm ${over ? 'text-red-600' : 'text-gray-800'}`}>
                            ₹{exp.amount.toLocaleString()}
                          </span>
                          <span className="text-gray-400 text-xs"> / ₹{exp.budget.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${over ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
