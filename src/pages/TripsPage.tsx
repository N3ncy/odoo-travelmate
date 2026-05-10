import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Plus,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { tripService } from '@/services/api';
import { useTripStore } from '@/store';
import { TripCard, TripCardSkeleton } from '@/components/cards/TripCard';
import type { Trip, TravelStyle, TripFilters } from '@/types';

const TRAVEL_STYLES: TravelStyle[] = [
  'adventure',
  'relaxation',
  'cultural',
  'budget',
  'luxury',
  'backpacking',
  'photography',
  'food_explorer',
  'nature',
  'solo',
];

const POPULAR_DESTINATIONS = [
  'Leh-Ladakh',
  'Goa',
  'Rishikesh',
  'Kerala',
  'Andaman',
  'Rajasthan',
  'Himachal',
  'Sikkim',
];

export function TripsPage() {
  const { trips, setTrips } = useTripStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TripFilters>({});
  const [selectedStyles, setSelectedStyles] = useState<TravelStyle[]>([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async (filterParams?: TripFilters) => {
    try {
      setLoading(true);
      const data = await tripService.getTrips(filterParams);
      setTrips(data);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrips({ ...filters, destination: searchQuery });
  };

  const handleStyleToggle = (style: TravelStyle) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const applyFilters = () => {
    const newFilters: TripFilters = {
      ...filters,
      destination: searchQuery,
      travelStyle: selectedStyles.length > 0 ? selectedStyles : undefined,
    };
    setFilters(newFilters);
    fetchTrips(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedStyles([]);
    setSearchQuery('');
    fetchTrips();
    setShowFilters(false);
  };

  const filteredTrips = trips.filter((trip) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        trip.destination.toLowerCase().includes(query) ||
        trip.title.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors ${
                showFilters || Object.keys(filters).length > 0
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <Link
              to="/trips/create"
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Trip</span>
            </Link>
          </form>

          {/* Quick Destination Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                onClick={() => {
                  setSearchQuery(dest);
                  fetchTrips({ destination: dest });
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchQuery === dest
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-gray-50">
            <div className="container mx-auto px-4 py-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Budget (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.budgetMin || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        budgetMin: parseInt(e.target.value) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={filters.budgetMax || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        budgetMax: parseInt(e.target.value) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Travel Styles */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => handleStyleToggle(style)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedStyles.includes(style)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {style.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? (
              'Searching trips...'
            ) : (
              <>
                <span className="font-semibold text-gray-900">{filteredTrips.length}</span>{' '}
                trips found
                {searchQuery && (
                  <>
                    {' '}for "{searchQuery}"
                  </>
                )}
              </>
            )}
          </p>
          {(searchQuery || selectedStyles.length > 0) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Trip Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </>
          ) : filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or create your own trip
              </p>
              <Link
                to="/trips/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create a Trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
