import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService, matchService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Trip, TravelStyle } from '@/types';
import {
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Filter,
  X,
  Star,
  Shield,
  Sparkles,
  ChevronRight,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

const TRAVEL_STYLES: { value: TravelStyle; label: string }[] = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'budget', label: 'Budget' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'backpacking', label: 'Backpacking' },
  { value: 'photography', label: 'Photography' },
  { value: 'food_explorer', label: 'Food Explorer' },
  { value: 'nature', label: 'Nature' },
];

export function SearchTripsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<TravelStyle[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [budgetRange, setBudgetRange] = useState({ min: 0, max: 100000 });
  const [genderPreference, setGenderPreference] = useState<string>('any');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getTrips({
        destination: searchQuery || undefined,
        travelStyle: selectedStyles.length > 0 ? selectedStyles : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        budgetMin: budgetRange.min || undefined,
        budgetMax: budgetRange.max || undefined,
        gender: genderPreference !== 'any' ? genderPreference : undefined,
      });
      setTrips(data.filter(t => t.status === 'open'));
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTrips();
  };

  const toggleStyle = (style: TravelStyle) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const calculateCompatibility = (trip: Trip): number => {
    if (!profile) return 50;

    let score = 50;

    // Travel style match
    const styleMatch = trip.travel_style.filter(s =>
      profile.travel_style?.includes(s)
    ).length;
    score += styleMatch * 10;

    // Interest match
    const interestMatch = trip.interests.filter(i =>
      profile.interests?.includes(i)
    ).length;
    score += interestMatch * 5;

    // Safety badge bonus
    if (trip.creator?.safety_badge === 'platinum') score += 10;
    else if (trip.creator?.safety_badge === 'gold') score += 7;
    else if (trip.creator?.safety_badge === 'silver') score += 4;

    return Math.min(score, 100);
  };

  const handleRequestMatch = async (tripId: string) => {
    try {
      await matchService.calculateMatch(tripId, profile?.user_id || 'demo-user');
      toast.success('Match request sent!');
    } catch (error) {
      toast.error('Failed to send match request');
    }
  };

  const clearFilters = () => {
    setSelectedStyles([]);
    setDateRange({ start: '', end: '' });
    setBudgetRange({ min: 0, max: 100000 });
    setGenderPreference('any');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Find Travel Buddies</h1>
          <p className="text-gray-400">Discover trips that match your travel style</p>

          {/* Search Bar */}
          <div className="mt-6 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                showFilters || selectedStyles.length > 0
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {selectedStyles.length > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedStyles.length}
                </span>
              )}
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Clear all
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Travel Styles */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Travel Style</label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map(style => (
                    <button
                      key={style.value}
                      onClick={() => toggleStyle(style.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedStyles.includes(style.value)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Traveler Gender</label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                >
                  <option value="any">Any</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                  <option value="same_gender">Same Gender</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{trips.length} trips found</p>

            {trips.map(trip => {
              const compatibility = calculateCompatibility(trip);

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Creator Avatar */}
                      <img
                        src={trip.creator?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.creator_id}`}
                        alt={trip.creator?.full_name}
                        className="w-14 h-14 rounded-full border-2 border-gray-100"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{trip.title}</h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                              <MapPin className="w-4 h-4" />
                              {trip.destination}
                            </div>
                          </div>

                          {/* Compatibility Score */}
                          <div className="flex flex-col items-end">
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              compatibility >= 80
                                ? 'bg-emerald-100 text-emerald-700'
                                : compatibility >= 60
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}>
                              <Sparkles className="w-4 h-4" />
                              {compatibility}% Match
                            </div>
                          </div>
                        </div>

                        {/* Trip Info */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(trip.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(trip.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {trip.budget_min?.toLocaleString()} - {trip.budget_max?.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {trip.current_participants}/{trip.max_participants} travelers
                          </div>
                        </div>

                        {/* Travel Styles */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {trip.travel_style.slice(0, 3).map(style => (
                            <span
                              key={style}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize"
                            >
                              {style.replace('_', ' ')}
                            </span>
                          ))}
                        </div>

                        {/* Creator Info */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">By {trip.creator?.full_name}</span>
                            {trip.creator?.is_verified && (
                              <Shield className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {trip.creator?.rating_avg?.toFixed(1)}
                          </div>
                          <span className="text-sm text-gray-400">
                            {trip.creator?.total_trips} trips
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleRequestMatch(trip.id)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Heart className="w-5 h-5" />
                        Request to Join
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
