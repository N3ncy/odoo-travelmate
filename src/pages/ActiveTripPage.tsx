import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService, otpService, locationService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useLocationStore } from '@/store';
import type { Trip, TripParticipant, LocationUpdate } from '@/types';
import {
  MapPin,
  Phone,
  MessageCircle,
  AlertTriangle,
  Shield,
  Users,
  Clock,
  CheckCircle,
  Navigation,
  Battery,
  Signal,
  X,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ActiveTripPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { currentLocation, setCurrentLocation, groupLocations, setGroupLocations, isSharing, setIsSharing } = useLocationStore();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpType, setOtpType] = useState<'start' | 'end'>('start');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  useEffect(() => {
    if (isSharing && tripId) {
      const interval = setInterval(updateLocation, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isSharing, tripId]);

  const loadTrip = async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const data = await tripService.getTrip(tripId);
      setTrip(data);
      // Load mock participants
      setParticipants([
        {
          id: '1',
          trip_id: tripId,
          user_id: user?.id || 'demo-user',
          role: 'creator',
          status: 'accepted',
          otp_verified: true,
          end_otp_verified: false,
          profile: profile || undefined,
        },
        {
          id: '2',
          trip_id: tripId,
          user_id: 'user-2',
          role: 'participant',
          status: 'accepted',
          otp_verified: true,
          end_otp_verified: false,
          profile: data?.creator,
        },
      ]);
    } catch (error) {
      toast.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = useCallback(async () => {
    if (!tripId || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        try {
          await locationService.updateLocation(tripId, user?.id || 'demo-user', latitude, longitude);
          const locations = await locationService.getGroupLocations(tripId);
          setGroupLocations(locations);
        } catch (error) {
          console.error('Failed to update location');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true }
    );
  }, [tripId, user?.id, setCurrentLocation, setGroupLocations]);

  const handleStartLocationSharing = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    setIsSharing(true);
    await updateLocation();
    toast.success('Location sharing started');
  };

  const handleStopLocationSharing = () => {
    setIsSharing(false);
    toast.success('Location sharing stopped');
  };

  const handleGenerateOTP = async (type: 'start' | 'end') => {
    if (!tripId || !user?.id) return;

    try {
      const code = type === 'start'
        ? await otpService.generateStartOTP(tripId, user.id)
        : await otpService.generateEndOTP(tripId, user.id);
      setGeneratedOTP(code);
      setOtpType(type);
      setShowOTPModal(true);
    } catch (error) {
      toast.error('Failed to generate OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (!tripId || !user?.id) return;

    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setVerifying(true);
    try {
      const verified = otpType === 'start'
        ? await otpService.verifyStartOTP(tripId, user.id, otpCode)
        : await otpService.verifyEndOTP(tripId, user.id, otpCode);

      if (verified) {
        toast.success(`${otpType === 'start' ? 'Trip started' : 'Trip ended'} successfully!`);
        setShowOTPModal(false);
        setOtp(['', '', '', '', '', '']);

        if (otpType === 'end') {
          navigate(`/rate/${tripId}/${participants[1]?.user_id}`);
        }
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handlePanicButton = async () => {
    if (!tripId || !user?.id || !currentLocation) {
      toast.error('Location required for panic alert');
      return;
    }

    try {
      await locationService.triggerPanicAlert(
        tripId,
        user.id,
        currentLocation.lat,
        currentLocation.lng
      );
      toast.success('Emergency alert sent to all contacts!');
      setShowPanicConfirm(false);
    } catch (error) {
      toast.error('Failed to send alert');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`verify-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Trip not found</h2>
          <button onClick={() => navigate('/')} className="text-emerald-400">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">{trip.title}</h1>
              <p className="text-sm text-gray-400">{trip.destination}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Location Status */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              Location Sharing
            </h3>
            <div className={`flex items-center gap-2 text-sm ${isSharing ? 'text-emerald-400' : 'text-gray-400'}`}>
              <Signal className="w-4 h-4" />
              {isSharing ? 'Active' : 'Inactive'}
            </div>
          </div>

          {currentLocation && (
            <p className="text-sm text-gray-400 mb-4">
              Last update: {new Date().toLocaleTimeString()}
            </p>
          )}

          <button
            onClick={isSharing ? handleStopLocationSharing : handleStartLocationSharing}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              isSharing
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            {isSharing ? 'Stop Sharing' : 'Start Sharing Location'}
          </button>
        </div>

        {/* Trip Participants */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-emerald-400" />
            Trip Members ({participants.length})
          </h3>

          <div className="space-y-3">
            {participants.map(participant => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl"
              >
                <img
                  src={participant.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.user_id}`}
                  alt={participant.profile?.full_name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium">{participant.profile?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">
                    {participant.otp_verified ? 'Verified' : 'Pending verification'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-gray-600 rounded-lg hover:bg-gray-500">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/chat')}
                    className="p-2 bg-gray-600 rounded-lg hover:bg-gray-500"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OTP Verification */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-400" />
            Trip Verification
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGenerateOTP('start')}
              className="py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Start Trip OTP
            </button>
            <button
              onClick={() => handleGenerateOTP('end')}
              className="py-3 bg-blue-500/20 text-blue-400 rounded-xl font-medium hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              End Trip OTP
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Both travelers must verify OTP when meeting in person
          </p>
        </div>

        {/* Panic Button */}
        <button
          onClick={() => setShowPanicConfirm(true)}
          className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-3"
        >
          <AlertTriangle className="w-6 h-6" />
          EMERGENCY SOS
        </button>

        <p className="text-xs text-gray-500 text-center">
          Sends your location to emergency contacts and Traveloop support
        </p>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {otpType === 'start' ? 'Start Trip' : 'End Trip'} Verification
              </h3>
              {generatedOTP && (
                <div className="bg-gray-700 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Your OTP Code:</p>
                  <p className="text-3xl font-bold text-emerald-400 tracking-widest">
                    {generatedOTP}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Share this with your travel buddy
                  </p>
                </div>
              )}
              <p className="text-gray-400 text-sm">
                Enter the OTP shared by your travel buddy
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`verify-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-10 h-12 text-center text-xl font-bold bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-emerald-500 outline-none"
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp(['', '', '', '', '', '']);
                }}
                className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={verifying || otp.join('').length !== 6}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panic Confirm Modal */}
      {showPanicConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Emergency SOS</h3>
              <p className="text-gray-400">
                This will send your current location to all emergency contacts and Traveloop support.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPanicConfirm(false)}
                className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePanicButton}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
              >
                Send SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
