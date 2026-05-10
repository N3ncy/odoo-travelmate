import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock, ChevronRight, Globe, Shield, Plane, Copy, Share2, Twitter, MessageCircle, BookCopy } from 'lucide-react';
import { format } from 'date-fns';
import { tripService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Trip } from '@/types';
import toast from 'react-hot-toast';

export function TripSharePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copying, setCopying] = useState(false);

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
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading shared trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-500 mb-6">This shared link may have expired or the trip doesn't exist.</p>
          <Link to="/landing" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
            Explore Traveloop
          </Link>
        </div>
      </div>
    );
  }

  const durationDays = trip.start_date && trip.end_date
    ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Traveloop</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
            <Globe className="w-3 h-3" /> Public View
          </span>
          <Link
            to="/login"
            className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-lg transition-colors"
          >
            Join Free
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Trip Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8">
            <h1 className="text-2xl font-bold text-white mb-2">{trip.title}</h1>
            <div className="flex items-center gap-2 text-emerald-100">
              <MapPin className="w-4 h-4" />
              <span>{trip.destination}</span>
            </div>
          </div>
          <div className="px-6 py-5 grid grid-cols-3 gap-4">
            {trip.start_date && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Departure</p>
                <p className="font-semibold text-gray-800 text-sm">{format(new Date(trip.start_date), 'dd MMM yyyy')}</p>
              </div>
            )}
            {durationDays && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Duration</p>
                <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />{durationDays} days
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-1">Group Size</p>
              <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-400" />{trip.current_participants}/{trip.max_participants}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3">About This Trip</h2>
            <p className="text-gray-600 leading-relaxed">{trip.description}</p>
          </div>
        )}

        {/* Travel Style */}
        {trip.travel_style?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3">Travel Style</h2>
            <div className="flex flex-wrap gap-2">
              {trip.travel_style.map(style => (
                <span key={style} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium capitalize">
                  {style.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {trip.itinerary && trip.itinerary.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" /> Itinerary
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {trip.itinerary.map((day) => (
                <div key={day.day} className="px-6 py-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-700">{day.day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{day.title}</p>
                    {day.description && <p className="text-sm text-gray-500 mt-0.5">{day.description}</p>}
                    {day.locations && day.locations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {day.locations.map(loc => (
                          <span key={loc} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />{loc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sharing Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            Share This Trip
          </h2>

          {/* Copy Trip Button */}
          <button
            onClick={async () => {
              if (!isAuthenticated) {
                navigate('/login');
                return;
              }
              if (!trip) return;
              setCopying(true);
              try {
                await tripService.createTrip({
                  ...trip,
                  id: undefined as any,
                  title: `Copy of ${trip.title}`,
                  status: 'open',
                  created_at: undefined as any,
                  updated_at: undefined as any,
                });
                toast.success('Trip copied to your trips!');
              } catch {
                toast.error('Failed to copy trip');
              } finally {
                setCopying(false);
              }
            }}
            disabled={copying}
            className="w-full flex items-center gap-3 px-5 py-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium hover:bg-emerald-100 transition-colors mb-4 disabled:opacity-50"
          >
            <BookCopy className="w-5 h-5" />
            {copying ? 'Copying...' : 'Copy Trip to My Trips'}
          </button>

          {/* Social Sharing Row */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied! 🔗');
              }}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Copy className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-xs font-medium text-gray-700">Copy Link</span>
            </button>

            <a
              href={`https://wa.me/?text=Check out my trip: ${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=Check out my trip plan on Traveloop!&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">Twitter / X</span>
            </a>
          </div>
        </div>

        {/* Budget Preview */}
        {(trip.budget_min || trip.budget_max) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-2">Budget Range</h2>
            <p className="text-2xl font-bold text-emerald-600">
              {trip.budget_currency} {trip.budget_min?.toLocaleString()} – {trip.budget_max?.toLocaleString()}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white text-center">
          <Shield className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold mb-2">Join This Trip on Traveloop</h3>
          <p className="text-emerald-100 text-sm mb-5">Verified travellers. Safe co-travel. Real adventures.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              Request to Join <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/landing"
              className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
