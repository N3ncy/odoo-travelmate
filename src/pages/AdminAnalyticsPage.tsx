import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, MapPin, TrendingUp, Activity, ArrowUp, Shield, Star } from 'lucide-react';
import { mockProfiles, mockTrips } from '@/services/mockData';

const USER_GROWTH = [
  { month: 'Oct', users: 820 },
  { month: 'Nov', users: 1050 },
  { month: 'Dec', users: 1320 },
  { month: 'Jan', users: 1680 },
  { month: 'Feb', users: 2100 },
  { month: 'Mar', users: 2750 },
  { month: 'Apr', users: 3400 },
  { month: 'May', users: 4120 },
];

const TRIP_CREATION = [
  { month: 'Oct', trips: 92 },
  { month: 'Nov', trips: 124 },
  { month: 'Dec', trips: 156 },
  { month: 'Jan', trips: 203 },
  { month: 'Feb', trips: 275 },
  { month: 'Mar', trips: 348 },
  { month: 'Apr', trips: 421 },
  { month: 'May', trips: 510 },
];

const TOP_DESTINATIONS = [
  { name: 'Ladakh', trips: 148 },
  { name: 'Goa', trips: 132 },
  { name: 'Manali', trips: 119 },
  { name: 'Rajasthan', trips: 97 },
  { name: 'Kerala', trips: 88 },
  { name: 'Coorg', trips: 72 },
];

const TRAVEL_STYLES = [
  { name: 'Adventure', value: 34 },
  { name: 'Cultural', value: 22 },
  { name: 'Budget', value: 18 },
  { name: 'Luxury', value: 12 },
  { name: 'Nature', value: 14 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

const STATS = [
  { label: 'Total Users', value: '4,120', change: '+21%', icon: Users, color: 'emerald' },
  { label: 'Active Trips', value: '510', change: '+21%', icon: MapPin, color: 'blue' },
  { label: 'Matches Made', value: '1,892', change: '+18%', icon: TrendingUp, color: 'violet' },
  { label: 'Avg Trust Score', value: '86.4', change: '+3.2', icon: Shield, color: 'amber' },
];

export function AdminAnalyticsPage() {
  const [timeRange] = useState('7m');

  // Compute live stats from mock data
  const verifiedUsers = mockProfiles.filter(p => p.is_verified).length;
  const totalTrips = mockTrips.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Analytics</h1>
            <p className="text-sm text-gray-500">Platform health & growth overview</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">{stat.change} this month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <Activity className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{verifiedUsers}/{mockProfiles.length}</p>
            <p className="text-xs text-gray-500">Verified Users (demo)</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <MapPin className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{totalTrips}</p>
            <p className="text-xs text-gray-500">Sample Trips (demo)</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">4.8</p>
            <p className="text-xs text-gray-500">Avg Trip Rating</p>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">User Growth</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Last 8 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={USER_GROWTH} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2.5} fill="url(#userGrad)" dot={{ r: 4, fill: '#10b981' }} name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trips Created Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Trips Created</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TRIP_CREATION} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Trips" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row: Top Destinations + Travel Styles */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Destinations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-5">Top Destinations</h2>
            <div className="space-y-3">
              {TOP_DESTINATIONS.map((dest, i) => {
                const pct = Math.round((dest.trips / TOP_DESTINATIONS[0].trips) * 100);
                return (
                  <div key={dest.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{i + 1}. {dest.name}</span>
                      <span className="text-gray-500">{dest.trips} trips</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Travel Styles Pie */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-5">Travel Style Distribution</h2>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={TRAVEL_STYLES} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={80}>
                    {TRAVEL_STYLES.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {TRAVEL_STYLES.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-gray-600">{s.name}</span>
                    <span className="text-xs font-medium text-gray-800 ml-auto">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
