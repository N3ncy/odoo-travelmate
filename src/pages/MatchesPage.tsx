import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Filter, RefreshCw } from 'lucide-react';
import { matchService } from '@/services/api';
import { useMatchStore, useAuthStore } from '@/store';
import { MatchCard } from '@/components/cards/MatchCard';
import type { Match } from '@/types';

export function MatchesPage() {
  const { profile } = useAuthStore();
  const { matches, setMatches } = useMatchStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await matchService.getMatches(profile?.id || 'demo-user');
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const pendingCount = matches.filter((m) => m.status === 'pending').length;
  const acceptedCount = matches.filter((m) => m.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Matches</h1>
              <p className="text-emerald-100">Travelers compatible with your trips</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{matches.length}</p>
              <p className="text-sm text-emerald-100">Total Matches</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-emerald-100">Pending</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{acceptedCount}</p>
              <p className="text-sm text-emerald-100">Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Connected' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === option.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchMatches}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-24 bg-gray-200 rounded-xl mb-4" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onAccept={fetchMatches}
                onReject={fetchMatches}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No matches yet' : `No ${filter} matches`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all'
                ? 'Create or join trips to find compatible travel partners'
                : 'Check other tabs for more matches'}
            </p>
            <Link
              to="/trips"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Browse Trips
            </Link>
          </div>
        )}
      </div>

      {/* How Matching Works */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">How Our Matching Works</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold text-emerald-700">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Destination Match</h4>
              <p className="text-sm text-gray-600">
                We find travelers going to the same destinations on similar dates
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold text-blue-700">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Compatibility Score</h4>
              <p className="text-sm text-gray-600">
                Travel style, interests, and preferences are analyzed for best matches
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold text-purple-700">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Safety Verified</h4>
              <p className="text-sm text-gray-600">
                All matches are between KYC-verified users with good ratings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
