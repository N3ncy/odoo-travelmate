import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  Shield,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Map,
  MessageSquare,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { useAuthStore, useTripStore, useMatchStore } from '@/store';
import { tripService, matchService } from '@/services/api';
import { TripCard, TripCardSkeleton } from '@/components/cards/TripCard';
import { MatchCard } from '@/components/cards/MatchCard';
import type { Trip, Match } from '@/types';

export function HomePage() {
  const { profile } = useAuthStore();
  const { trips, setTrips } = useTripStore();
  const { matches, setMatches } = useMatchStore();
  const [loading, setLoading] = useState(true);
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripsData, matchesData] = await Promise.all([
          tripService.getTrips(),
          matchService.getMatches('demo-user'),
        ]);
        setTrips(tripsData);
        setFeaturedTrips(tripsData.slice(0, 3));
        setMatches(matchesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [setTrips, setMatches]);

  const stats = [
    { icon: Users, label: 'Indian Travelers', value: '50K+' },
    { icon: Map, label: 'Trips Planned', value: '12K+' },
    { icon: Star, label: 'Avg Rating', value: '4.9' },
    { icon: Shield, label: 'Verified Users', value: '95%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Plan Your Perfect
              <span className="block text-yellow-300">Indian Journey 🇮🇳</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl">
              Create multi-city itineraries, track your budget, discover activities, and share your travel plan — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/trips"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
              >
                <Search className="w-5 h-5" />
                Find Trips
              </Link>
              <Link
                to="/trips/create"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-400 transition-colors border-2 border-emerald-400"
              >
                <MapPin className="w-5 h-5" />
                Create a Trip
              </Link>
              <Link
                to="/city-search"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border-2 border-white/30"
              >
                <Globe className="w-5 h-5" />
                Explore Cities
              </Link>
              <Link
                to="/activities"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400/20 text-yellow-200 rounded-xl font-semibold hover:bg-yellow-400/30 transition-colors border-2 border-yellow-300/30"
              >
                <Sparkles className="w-5 h-5" />
                Find Activities
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="container mx-auto px-4 pb-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-emerald-200" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-emerald-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Welcome Back Section */}
      {profile && (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`}
                alt={profile.full_name}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  Welcome back, {profile.full_name?.split(' ')[0]}!
                </h2>
                <p className="text-gray-500">Ready for your next adventure?</p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/matches"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">{matches.length} Matches</span>
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Messages</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Your Matches */}
      {matches.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Top Matches</h2>
              <p className="text-gray-500">Travelers who match your preferences</p>
            </div>
            <Link
              to="/matches"
              className="flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.slice(0, 3).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Trips */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trending Trips</h2>
            <p className="text-gray-500">Popular destinations this season</p>
          </div>
          <Link
            to="/trips"
            className="flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700"
          >
            Explore All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </>
          ) : (
            featuredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Traveloop Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Find your perfect travel partner in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Complete KYC verification and set your travel preferences, interests, and safety requirements.',
                icon: Shield,
                color: 'emerald',
              },
              {
                step: '02',
                title: 'Find or Create Trips',
                description: 'Browse trips by other travelers or create your own. Our AI finds compatible travel partners.',
                icon: Search,
                color: 'blue',
              },
              {
                step: '03',
                title: 'Travel Safely Together',
                description: 'Use OTP verification, live location sharing, and emergency features for a safe journey.',
                icon: MapPin,
                color: 'purple',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-${item.color}-100 flex items-center justify-center`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                </div>
                <div className="text-sm text-emerald-600 font-bold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Your Safety is Our Priority</h2>
              <p className="text-emerald-100 mb-6">
                Traveloop includes comprehensive safety features to ensure you have a secure travel experience.
              </p>
              <ul className="space-y-3">
                {[
                  'Mandatory KYC verification for all users',
                  'OTP verification before trip starts',
                  'Real-time location sharing with group',
                  'Panic button with emergency contacts',
                  'Distance alerts if separated from group',
                  'Post-trip rating and review system',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600"
                alt="Safe travel"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Travel Partner?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of verified travelers and start your next adventure today.
          </p>
          <Link
            to="/trips/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-500 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            Create Your First Trip
          </Link>
        </div>
      </section>
    </div>
  );
}
