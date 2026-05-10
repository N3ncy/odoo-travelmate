import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Star,
  Shield,
  ChevronRight,
} from 'lucide-react';
import type { Trip } from '@/types';

interface TripCardProps {
  trip: Trip;
  showCreator?: boolean;
  compatibilityScore?: number;
}

export function TripCard({ trip, showCreator = true, compatibilityScore }: TripCardProps) {
  const travelStyleColors: Record<string, string> = {
    adventure: 'bg-orange-100 text-orange-700',
    relaxation: 'bg-blue-100 text-blue-700',
    cultural: 'bg-purple-100 text-purple-700',
    budget: 'bg-green-100 text-green-700',
    luxury: 'bg-yellow-100 text-yellow-700',
    backpacking: 'bg-teal-100 text-teal-700',
    photography: 'bg-pink-100 text-pink-700',
    food_explorer: 'bg-red-100 text-red-700',
    nature: 'bg-emerald-100 text-emerald-700',
    solo: 'bg-indigo-100 text-indigo-700',
  };

  const destinationImages: Record<string, string> = {
    'leh-ladakh': 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600',
    'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
    'rishikesh': 'https://images.unsplash.com/photo-1591018653367-0a8a8f8a9c6e?w=600',
    'andaman': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
    'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600',
    'default': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
  };

  const getDestinationImage = (destination: string) => {
    const key = Object.keys(destinationImages).find((k) =>
      destination.toLowerCase().includes(k)
    );
    return destinationImages[key || 'default'];
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'platinum':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'silver':
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 'bronze':
        return 'bg-gradient-to-r from-orange-300 to-orange-600';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getDestinationImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            trip.status === 'open' ? 'bg-emerald-500 text-white' :
            trip.status === 'matched' ? 'bg-blue-500 text-white' :
            trip.status === 'active' ? 'bg-orange-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
        </div>

        {/* Compatibility Score */}
        {compatibilityScore && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-sm text-gray-900">{compatibilityScore}%</span>
          </div>
        )}

        {/* Destination */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg line-clamp-1">{trip.title}</h3>
          <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Creator */}
        {showCreator && trip.creator && (
          <div className="flex items-center gap-3 mb-3">
            <img
              src={trip.creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.creator.full_name}`}
              alt={trip.creator.full_name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{trip.creator.full_name}</p>
                {trip.creator.safety_badge !== 'none' && (
                  <span className={`w-5 h-5 rounded-full ${getBadgeColor(trip.creator.safety_badge)} flex items-center justify-center`}>
                    <Shield className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{trip.creator.rating_avg}</span>
                <span className="text-gray-300">•</span>
                <span>{trip.creator.total_trips} trips</span>
              </div>
            </div>
          </div>
        )}

        {/* Trip Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {trip.current_participants}/{trip.max_participants} travelers
            </span>
          </div>

          {(trip.budget_min || trip.budget_max) && (
            <div className="flex items-center gap-2 text-gray-600">
              <IndianRupee className="w-4 h-4" />
              <span className="text-sm">
                {trip.budget_min?.toLocaleString()} - {trip.budget_max?.toLocaleString()} {trip.budget_currency}
              </span>
            </div>
          )}
        </div>

        {/* Travel Styles */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {trip.travel_style.slice(0, 3).map((style) => (
            <span
              key={style}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${travelStyleColors[style] || 'bg-gray-100 text-gray-700'}`}
            >
              {style.replace('_', ' ')}
            </span>
          ))}
          {trip.travel_style.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              +{trip.travel_style.length - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {trip.gender_preference === 'any' ? 'Open to all' : `${trip.gender_preference} only`}
          </span>
          <span className="flex items-center text-emerald-600 font-medium text-sm group-hover:gap-2 transition-all">
            View Details
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}
