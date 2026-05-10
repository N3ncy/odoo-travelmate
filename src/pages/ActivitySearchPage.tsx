import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  MapPin,
  Clock,
  Plus,
  X,
  ChevronLeft,
  SlidersHorizontal,
  Zap,
  Utensils,
  Eye,
  Leaf,
  Mountain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tripService } from '@/services/api';
import { useAuthStore } from '@/store';
import type { Trip } from '@/types';

// ─── Mock Activity Data ───────────────────────────────────────────────────────

type ActivityType = 'Sightseeing' | 'Adventure' | 'Food' | 'Cultural' | 'Wellness';

interface Activity {
  id: string;
  name: string;
  destination: string;
  type: ActivityType;
  duration: string;
  cost: number;
  rating: number;
  image: string;
  description: string;
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    name: 'Taj Mahal Visit',
    destination: 'Agra',
    type: 'Sightseeing',
    duration: '3 hrs',
    cost: 800,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
    description: 'Visit one of the Seven Wonders of the World at sunrise for the best experience.',
  },
  {
    id: 'a2',
    name: 'Bungee Jumping',
    destination: 'Rishikesh',
    type: 'Adventure',
    duration: '2 hrs',
    cost: 3500,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
    description: "India's highest bungee jump at 83 meters — not for the faint-hearted!",
  },
  {
    id: 'a3',
    name: 'Street Food Walk',
    destination: 'Delhi',
    type: 'Food',
    duration: '2 hrs',
    cost: 600,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
    description: 'Explore the famous Chandni Chowk and taste iconic Delhi street food.',
  },
  {
    id: 'a4',
    name: 'Kathakali Show',
    destination: 'Kerala',
    type: 'Cultural',
    duration: '2 hrs',
    cost: 400,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1570799442741-b8bf8f30b51a?w=600',
    description: 'Witness the traditional Kathakali dance-drama performance with stunning makeup.',
  },
  {
    id: 'a5',
    name: 'Scuba Diving',
    destination: 'Andamans',
    type: 'Adventure',
    duration: '4 hrs',
    cost: 4500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=600',
    description: 'Explore vibrant coral reefs and marine life in crystal-clear Andaman waters.',
  },
  {
    id: 'a6',
    name: 'Cooking Class',
    destination: 'Jaipur',
    type: 'Food',
    duration: '3 hrs',
    cost: 1200,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=600',
    description: 'Learn to cook authentic Rajasthani dishes with a local chef in a haveli.',
  },
  {
    id: 'a7',
    name: 'Yoga Retreat',
    destination: 'Rishikesh',
    type: 'Wellness',
    duration: '2 hrs',
    cost: 800,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
    description: 'Morning yoga session on the banks of the Ganges with a certified instructor.',
  },
  {
    id: 'a8',
    name: 'Camel Safari',
    destination: 'Jaisalmer',
    type: 'Adventure',
    duration: '3 hrs',
    cost: 1500,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1604430456622-f77d5261e40a?w=600',
    description: 'Ride camels through the golden Sam Sand Dunes at sunset.',
  },
  {
    id: 'a9',
    name: 'Backwater Cruise',
    destination: 'Kerala',
    type: 'Sightseeing',
    duration: '4 hrs',
    cost: 2000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600',
    description: 'Cruise through serene backwaters on a traditional Kerala houseboat.',
  },
  {
    id: 'a10',
    name: 'Tea Plantation Tour',
    destination: 'Darjeeling',
    type: 'Cultural',
    duration: '3 hrs',
    cost: 900,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1504474298956-ea15f7b7cba3?w=600',
    description: 'Walk through lush tea gardens and learn about the tea-making process.',
  },
  {
    id: 'a11',
    name: 'Paragliding',
    destination: 'Manali',
    type: 'Adventure',
    duration: '1 hr',
    cost: 2500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1531722569936-825d4ebd8c2e?w=600',
    description: 'Soar above the Himalayan valleys with a certified paragliding instructor.',
  },
  {
    id: 'a12',
    name: 'Meditation Session',
    destination: 'Varanasi',
    type: 'Wellness',
    duration: '2 hrs',
    cost: 300,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600',
    description: 'Join a guided meditation session on the sacred ghats of Varanasi.',
  },
];

const ACTIVITY_TYPES: ('All' | ActivityType)[] = ['All', 'Sightseeing', 'Adventure', 'Food', 'Cultural', 'Wellness'];
const COST_RANGES = ['All', 'Under ₹500', '₹500–₹2000', '₹2000+'];
const DURATIONS = ['All', '1–2 hrs', '3–4 hrs', '4+ hrs'];

const TYPE_STYLES: Record<ActivityType, { bg: string; text: string; icon: React.ReactNode }> = {
  Sightseeing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Eye className="w-3 h-3" /> },
  Adventure: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <Mountain className="w-3 h-3" /> },
  Food: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Utensils className="w-3 h-3" /> },
  Cultural: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Leaf className="w-3 h-3" /> },
  Wellness: { bg: 'bg-green-100', text: 'text-green-700', icon: <Zap className="w-3 h-3" /> },
};

function matchesCostRange(cost: number, range: string): boolean {
  if (range === 'All') return true;
  if (range === 'Under ₹500') return cost < 500;
  if (range === '₹500–₹2000') return cost >= 500 && cost <= 2000;
  if (range === '₹2000+') return cost > 2000;
  return true;
}

function matchesDuration(duration: string, filter: string): boolean {
  if (filter === 'All') return true;
  const hrs = parseInt(duration);
  if (filter === '1–2 hrs') return hrs <= 2;
  if (filter === '3–4 hrs') return hrs >= 3 && hrs <= 4;
  if (filter === '4+ hrs') return hrs > 4;
  return true;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivitySearchPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCost, setSelectedCost] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Add to Trip modal
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDay, setSelectedDay] = useState('Day 1');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [addingToTrip, setAddingToTrip] = useState(false);

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

  const filteredActivities = MOCK_ACTIVITIES.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || a.type === selectedType;
    const matchesCost = matchesCostRange(a.cost, selectedCost);
    const matchesDur = matchesDuration(a.duration, selectedDuration);
    return matchesSearch && matchesType && matchesCost && matchesDur;
  });

  const handleAddToTrip = async (trip: Trip) => {
    if (!selectedActivity) return;
    setAddingToTrip(true);
    try {
      await tripService.updateTrip(trip.id, {
        description: `${trip.description || ''}\n🎯 ${selectedDay}: ${selectedActivity.name} (${selectedActivity.destination}) — ₹${selectedActivity.cost}`,
      });
      toast.success(`${selectedActivity.name} added to "${trip.title}" — ${selectedDay}!`);
      setSelectedActivity(null);
    } catch {
      toast.error('Failed to add activity to trip');
    } finally {
      setAddingToTrip(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Activity Marketplace</h1>
              <p className="text-purple-100 text-sm">Curated experiences across India</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities or destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white text-gray-900 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-400"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
                showFilters ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Type Badges */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-white text-purple-700'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <p className="text-xs text-purple-200 mb-2 font-medium">Cost Range</p>
                <div className="flex flex-wrap gap-2">
                  {COST_RANGES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCost(c)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCost === c
                          ? 'bg-white text-purple-700'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-purple-200 mb-2 font-medium">Duration</p>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDuration(d)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedDuration === d
                          ? 'bg-white text-purple-700'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">
          {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'} found
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map((activity) => {
            const style = TYPE_STYLES[activity.type];
            return (
              <div
                key={activity.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                    {style.icon} {activity.type}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-sm leading-tight">{activity.name}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activity.destination}</span>
                  </div>

                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{activity.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3.5 h-3.5" /> {activity.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-gray-800">{activity.rating}</span>
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">₹{activity.cost.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => setSelectedActivity(activity)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Trip
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-16">
            <Zap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No activities found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Add Activity to Trip</h2>
                <p className="text-gray-500 text-sm">{selectedActivity.name}</p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Day Selector */}
            <div className="px-5 py-4 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Which day?</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Trip List */}
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
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-violet-50 rounded-xl transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{trip.title}</p>
                      <p className="text-sm text-gray-500 truncate">{trip.destination}</p>
                    </div>
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
