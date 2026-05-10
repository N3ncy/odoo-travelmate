import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, IndianRupee, AlertTriangle, TrendingUp, PieChartIcon, BarChart2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { tripService } from '@/services/api';
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
  { day: 'Day 6', planned: 5000, actual: 4800 },
  { day: 'Day 7', planned: 3500, actual: 3500 },
];

export function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) fetchTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrip(tripId!);
      setTrip(data);
    } catch {
      toast.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = MOCK_EXPENSES.reduce((s, e) => s + e.budget, 0);
  const totalSpent = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const overBudget = totalSpent > totalBudget;
  const overBudgetCategories = MOCK_EXPENSES.filter(e => e.amount > e.budget);

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
        <div>
          <h1 className="font-bold text-gray-900">Trip Budget</h1>
          <p className="text-sm text-gray-500">{trip?.destination || 'Loading...'}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

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

        {/* Chart Toggle */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Expense Breakdown</h2>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setChartType('pie')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'pie' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <PieChartIcon className="w-4 h-4" /> Pie
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'bar' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart2 className="w-4 h-4" /> Bar
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            {chartType === 'pie' ? (
              <PieChart>
                <Pie data={MOCK_EXPENSES} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
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
      </div>
    </div>
  );
}
