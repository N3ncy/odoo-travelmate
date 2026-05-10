import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  MapPin,
  Plus,
  X,
  ChevronLeft,
  Filter,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tripService } from '@/services/api';
import { useAuthStore } from '@/store';
import type { Trip } from '@/types';
import { AICityExplorer } from '@/components/AICityExplorer';

// ─── Types ───────────────────────────────────────────────────────────────────

type Region = 'North' | 'South' | 'East' | 'West' | 'Islands';

interface City {
  id: string;
  name: string;
  state: string;
  costIndex: '₹' | '₹₹' | '₹₹₹';
  rating: number;
  region: Region;
  image: string;
  highlights: string[];
}

// ─── 18 India-Only Cities ─────────────────────────────────────────────────────

const MOCK_CITIES: City[] = [
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    costIndex: '₹₹',
    rating: 4.9,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
    highlights: ['Snow Peaks', 'Rohtang Pass', 'Solang Valley'],
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    costIndex: '₹₹',
    rating: 4.8,
    region: 'West',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
    highlights: ['Beaches', 'Nightlife', 'Seafood'],
  },
  {
    id: 'ladakh',
    name: 'Leh-Ladakh',
    state: 'Jammu & Kashmir',
    costIndex: '₹₹₹',
    rating: 4.9,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600',
    highlights: ['Pangong Lake', 'Monasteries', 'Mountain Passes'],
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    costIndex: '₹',
    rating: 4.7,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=600',
    highlights: ['River Rafting', 'Yoga', 'Bungee Jumping'],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    costIndex: '₹₹',
    rating: 4.7,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600',
    highlights: ['Amber Fort', 'Hawa Mahal', 'Heritage Hotels'],
  },
  {
    id: 'kerala',
    name: 'Kerala Backwaters',
    state: 'Kerala',
    costIndex: '₹₹',
    rating: 4.8,
    region: 'South',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600',
    highlights: ['Backwaters', 'Houseboats', 'Ayurveda'],
  },
  {
    id: 'andamans',
    name: 'Andaman Islands',
    state: 'A&N Islands',
    costIndex: '₹₹₹',
    rating: 4.9,
    region: 'Islands',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
    highlights: ['Scuba Diving', 'Radhanagar Beach', 'Coral Reefs'],
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    costIndex: '₹',
    rating: 4.6,
    region: 'East',
    image: 'https://images.unsplash.com/photo-1504474298956-ea15f7b7cba3?w=600',
    highlights: ['Tea Gardens', 'Tiger Hill', 'Toy Train'],
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    costIndex: '₹₹',
    rating: 4.7,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?w=600',
    highlights: ['Lake Palace', 'City Palace', 'Lake Pichola'],
  },
  {
    id: 'coorg',
    name: 'Coorg',
    state: 'Karnataka',
    costIndex: '₹₹',
    rating: 4.6,
    region: 'South',
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600',
    highlights: ['Coffee Estates', 'Abbey Falls', "Raja's Seat"],
  },
  {
    id: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    costIndex: '₹₹',
    rating: 4.5,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1501901609772-df0848060b33?w=600',
    highlights: ['Mall Road', 'Kufri', 'Snow Views'],
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    costIndex: '₹',
    rating: 4.5,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1561361058-c24e02d33483?w=600',
    highlights: ['Ganga Ghats', 'Ganga Aarti', 'Ancient Temples'],
  },
  {
    id: 'hampi',
    name: 'Hampi',
    state: 'Karnataka',
    costIndex: '₹',
    rating: 4.6,
    region: 'South',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600',
    highlights: ['Virupaksha Temple', 'Boulder Ruins', 'Vijayanagara'],
  },
  {
    id: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    costIndex: '₹₹',
    rating: 4.7,
    region: 'South',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600',
    highlights: ['Tea Plantations', 'Misty Hills', 'Eravikulam'],
  },
  {
    id: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    costIndex: '₹₹',
    rating: 4.8,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
    highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri'],
  },
  {
    id: 'ooty',
    name: 'Ooty',
    state: 'Tamil Nadu',
    costIndex: '₹',
    rating: 4.4,
    region: 'South',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    highlights: ['Nilgiri Hills', 'Botanical Garden', 'Toy Train'],
  },
  {
    id: 'spiti',
    name: 'Spiti Valley',
    state: 'Himachal Pradesh',
    costIndex: '₹₹',
    rating: 4.8,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1505832018823-50331d70d237?w=600',
    highlights: ['Key Monastery', 'Chandratal Lake', 'Stargazing'],
  },
  {
    id: 'mcleodganj',
    name: 'McLeod Ganj',
    state: 'Himachal Pradesh',
    costIndex: '₹',
    rating: 4.5,
    region: 'North',
    image: 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=600',
    highlights: ['Tibetan Culture', 'Triund Trek', 'Namgyal Monastery'],
  },
];

const REGIONS = ['All', 'North', 'South', 'East', 'West', 'Islands'];
const COST_LEVELS = ['All', '₹', '₹₹', '₹₹₹'];

const COST_COLORS: Record<string, string> = {
  '₹': 'bg-green-100 text-green-700',
  '₹₹': 'bg-yellow-100 text-yellow-700',
  '₹₹₹': 'bg-orange-100 text-orange-700',
};

const REGION_COLORS: Record<string, string> = {
  North: 'bg-blue-100 text-blue-700',
  South: 'bg-purple-100 text-purple-700',
  East: 'bg-yellow-100 text-yellow-700',
  West: 'bg-orange-100 text-orange-700',
  Islands: 'bg-cyan-100 text-cyan-700',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CitySearchPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCost, setSelectedCost] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Add to Trip modal
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [addingToTrip, setAddingToTrip] = useState(false);

  // AI Explorer modal
  const [explorerCity, setExplorerCity] = useState<City | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await tripService.getUserTrips(profile?.id || 'demo-user');
      setTrips(data);
    } catch {
      setTrips([]);
    }
  };

  const filteredCities = MOCK_CITIES.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
    const matchesCost = selectedCost === 'All' || city.costIndex === selectedCost;
    return matchesSearch && matchesRegion && matchesCost;
  });

  const handleAddToTrip = async (trip: Trip) => {
    if (!selectedCity) return;
    setAddingToTrip(true);
    try {
      await tripService.updateTrip(trip.id, {
        description: `${trip.description || ''}\n📍 Stop: ${selectedCity.name}, ${selectedCity.state}`,
      });
      toast.success(`${selectedCity.name} added to "${trip.title}"!`);
      setSelectedCity(null);
    } catch {
      toast.error('Failed to add city to trip');
    } finally {
      setAddingToTrip(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* AI City Explorer Modal */}
      {explorerCity && (
        <AICityExplorer
          cityName={explorerCity.name}
          stateName={explorerCity.state}
          coverImage={explorerCity.image}
          onClose={() => setExplorerCity(null)}
        />
      )}
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Explore India</h1>
              <p className="text-emerald-100 text-sm">18 handpicked destinations across the country</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities or states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white text-gray-900 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder-gray-400"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
                showFilters ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Row */}
          {showFilters && (
            <div className="mt-4 flex flex-col gap-3">
              {/* Region Filter */}
              <div>
                <p className="text-xs text-emerald-200 mb-2 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Region
                </p>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedRegion === r
                          ? 'bg-white text-emerald-700'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Filter */}
              <div>
                <p className="text-xs text-emerald-200 mb-2 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Budget Level
                </p>
                <div className="flex flex-wrap gap-2">
                  {COST_LEVELS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCost(c)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCost === c
                          ? 'bg-white text-emerald-700'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">
          {filteredCities.length} destination{filteredCities.length !== 1 ? 's' : ''} found
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white font-bold text-lg leading-tight">{city.name}</h3>
                  <p className="text-white/80 text-sm">{city.state}</p>
                </div>
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${REGION_COLORS[city.region]}`}>
                  {city.region} India
                </span>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-800 text-sm">{city.rating}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${COST_COLORS[city.costIndex]}`}>
                    {city.costIndex} Budget
                  </span>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {city.highlights.map((h) => (
                    <span key={h} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {h}
                    </span>
                  ))}
                </div>

              {/* Add to Trip Button + AI Explore */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setExplorerCity(city)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Explore with AI
                  </button>
                  <button
                    onClick={() => setSelectedCity(city)}
                    className="w-11 flex items-center justify-center bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-700 rounded-xl transition-colors"
                    title="Add to Trip"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No destinations found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Add {selectedCity.name} to Trip</h2>
                <p className="text-gray-500 text-sm">Select which trip to add this stop</p>
              </div>
              <button onClick={() => setSelectedCity(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {trips.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No trips yet. Create a trip first!</p>
                </div>
              ) : (
                trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => handleAddToTrip(trip)}
                    disabled={addingToTrip}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{trip.title}</p>
                      <p className="text-sm text-gray-500 truncate">{trip.destination}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      trip.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {trip.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
