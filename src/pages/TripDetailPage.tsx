import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PackingChecklist } from '@/components/PackingChecklist';
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Star,
  Shield,
  MessageSquare,
  Share2,
  Heart,
  ChevronLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Phone,
} from 'lucide-react';
import { tripService, matchService, chatService, otpService, locationService } from '@/services/api';
import { useAuthStore, useTripStore, useLocationStore } from '@/store';
import { useLocation } from '@/hooks/useLocation';
import { ProfileCard } from '@/components/cards/ProfileCard';
import type { Trip, TripParticipant } from '@/types';
import toast from 'react-hot-toast';

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { currentTrip, setCurrentTrip, participants, setParticipants } = useTripStore();
  const { startSharing, stopSharing, isSharing, triggerPanic, currentLocation } = useLocation();

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [myOTP, setMyOTP] = useState('');
  const [tripStarted, setTripStarted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const trip = await tripService.getTrip(id!);
      setCurrentTrip(trip);
      // Mock participants
      if (trip?.creator) {
        setParticipants([
          {
            id: 'p1',
            trip_id: trip.id,
            user_id: trip.creator_id,
            role: 'creator',
            status: 'accepted',
            otp_verified: false,
            end_otp_verified: false,
            profile: trip.creator,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch trip:', error);
      toast.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    try {
      setJoining(true);
      // Calculate match and create invite
      const match = await matchService.calculateMatch(id!, profile?.id || 'demo-user');
      toast.success(`Match score: ${match.compatibility_score}%! Request sent.`);
    } catch (error) {
      toast.error('Failed to send join request');
    } finally {
      setJoining(false);
    }
  };

  const handleStartTrip = async () => {
    try {
      // Generate OTP for this user
      const otp = await otpService.generateStartOTP(id!, 'demo-user');
      setMyOTP(otp);
      setShowOTPModal(true);
      toast.success('OTP generated! Share with your travel partner.');
    } catch (error) {
      toast.error('Failed to generate OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const verified = await otpService.verifyStartOTP(id!, 'demo-user', otpValue);
      if (verified) {
        setShowOTPModal(false);
        setTripStarted(true);
        // Start location sharing
        await startSharing(id!, 'demo-user');
        toast.success('Trip started! Location sharing is now active.');
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    }
  };

  const handleEndTrip = async () => {
    try {
      const otp = await otpService.generateEndOTP(id!, 'demo-user');
      // In a real app, show end OTP modal
      toast.success('Trip ending... Please rate your experience.');
      stopSharing();
      setTripStarted(false);
      navigate(`/trips/${id}/rate`);
    } catch (error) {
      toast.error('Failed to end trip');
    }
  };

  const handlePanic = async () => {
    if (!currentLocation) {
      toast.error('Unable to get your location');
      return;
    }
    try {
      await triggerPanic(id!, 'demo-user');
    } catch (error) {
      toast.error('Failed to send emergency alert');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Trip not found</h2>
          <Link to="/trips" className="text-emerald-600 hover:underline">
            Browse all trips
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = currentTrip.creator_id === profile?.id || currentTrip.creator_id === 'demo-user';
  const destinationImage = 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1200';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={destinationImage}
          alt={currentTrip.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <Heart className="w-6 h-6" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Trip Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
            currentTrip.status === 'open' ? 'bg-emerald-500 text-white' :
            currentTrip.status === 'active' ? 'bg-orange-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {currentTrip.status.charAt(0).toUpperCase() + currentTrip.status.slice(1)}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{currentTrip.title}</h1>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-5 h-5" />
            <span>{currentTrip.destination}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dates</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(currentTrip.start_date), 'MMM d')} - {format(new Date(currentTrip.end_date), 'MMM d')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Travelers</p>
                    <p className="font-medium text-gray-900">
                      {currentTrip.current_participants}/{currentTrip.max_participants}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-medium text-gray-900">
                      ₹{currentTrip.budget_min?.toLocaleString()} - ₹{currentTrip.budget_max?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">
                      {Math.ceil((new Date(currentTrip.end_date).getTime() - new Date(currentTrip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentTrip.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Trip</h2>
                <p className="text-gray-600 leading-relaxed">{currentTrip.description}</p>
              </div>
            )}

            {/* Travel Styles & Interests */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Travel Style & Interests</h2>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Travel Style</p>
                <div className="flex flex-wrap gap-2">
                  {currentTrip.travel_style.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                    >
                      {style.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {currentTrip.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Itinerary */}
            {currentTrip.itinerary && currentTrip.itinerary.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Itinerary</h2>
                <div className="space-y-4">
                  {currentTrip.itinerary.map((day, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-700 font-bold text-sm">{day.day}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{day.title}</h3>
                        {day.description && (
                          <p className="text-sm text-gray-500 mt-1">{day.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Trip Dashboard */}
            {tripStarted && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Trip Dashboard</h2>
                  <span className="flex items-center gap-2 text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <Navigation className="w-5 h-5" />
                      <span className="font-medium">Location Sharing</span>
                    </div>
                    <p className="text-sm text-emerald-600">
                      {isSharing ? 'Active - Your location is being shared' : 'Inactive'}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Group Status</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      {participants.length} travelers connected
                    </p>
                  </div>
                </div>

                {/* Panic Button */}
                <button
                  onClick={handlePanic}
                  className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-6 h-6" />
                  Emergency Alert (SOS)
                </button>

                <button
                  onClick={handleEndTrip}
                  className="w-full py-3 mt-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  End Trip
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Card */}
            {currentTrip.creator && (
              <ProfileCard profile={currentTrip.creator} />
            )}

            {/* Action Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {currentTrip.status === 'open' && !isCreator && (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Interested in this trip? Send a join request and start chatting!
                  </p>
                  <button
                    onClick={handleJoinRequest}
                    disabled={joining}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {joining ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        Request to Join
                      </>
                    )}
                  </button>
                </>
              )}

              {(currentTrip.status === 'matched' || currentTrip.status === 'confirmed') && (
                <>
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Trip Confirmed!</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Both travelers have confirmed. Meet at the designated location and verify OTPs to start.
                  </p>
                  <button
                    onClick={handleStartTrip}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    Start Trip
                  </button>
                  <Link
                    to="/chat"
                    className="w-full py-3 mt-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Open Chat
                  </Link>
                </>
              )}

              {isCreator && currentTrip.status === 'open' && (
                <div className="text-center space-y-3">
                  <p className="text-gray-500 text-sm">
                    You created this trip. Wait for travelers to send join requests.
                  </p>
                  <Link
                    to={`/trips/${id}/edit`}
                    className="w-full py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition-colors inline-block"
                  >
                    Edit Trip
                  </Link>
                  <Link
                    to={`/trips/${id}/notes`}
                    className="w-full py-3 border-2 border-amber-400 text-amber-600 rounded-xl font-medium hover:bg-amber-50 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    📝 Trip Notes
                  </Link>
                </div>
              )}
            </div>

            {/* Participants */}
            {participants.length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Travelers ({participants.length})</h3>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    participant.profile && (
                      <div key={participant.id} className="flex items-center gap-3">
                        <img
                          src={participant.profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.profile.full_name}`}
                          alt={participant.profile.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{participant.profile.full_name}</p>
                          <p className="text-xs text-gray-500">{participant.role}</p>
                        </div>
                        {participant.otp_verified && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Safety Info */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700 mb-3">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Safety Tips</span>
              </div>
              <ul className="text-sm text-amber-800 space-y-2">
                <li>• Always verify OTPs before starting the trip</li>
                <li>• Keep location sharing active</li>
                <li>• Share trip details with family</li>
                <li>• Use the panic button if needed</li>
              </ul>
            </div>

            {/* Packing Checklist */}
            {currentTrip?.id && <PackingChecklist tripId={currentTrip.id} />}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Trip Verification</h3>

            <div className="bg-emerald-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-emerald-700 mb-2">Your OTP (Share with partner)</p>
              <p className="text-3xl font-bold text-emerald-600 tracking-widest">{myOTP}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Partner's OTP
              </label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:ring-2 focus:ring-emerald-500"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowOTPModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
              >
                Verify & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
