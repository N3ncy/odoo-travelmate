import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Star,
  Shield,
  MapPin,
  Calendar,
  Check,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Match } from '@/types';
import { matchService } from '@/services/api';
import toast from 'react-hot-toast';

interface MatchCardProps {
  match: Match;
  onAccept?: () => void;
  onReject?: () => void;
}

export function MatchCard({ match, onAccept, onReject }: MatchCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const profile = match.matched_user;
  const trip = match.trip;

  const handleAccept = async () => {
    try {
      setLoading(true);
      await matchService.acceptMatch(match.id);
      toast.success('Match accepted! You can now chat.');
      onAccept?.();
    } catch (err) {
      toast.error('Failed to accept match');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await matchService.rejectMatch(match.id);
      toast.success('Match rejected');
      onReject?.();
    } catch (err) {
      toast.error('Failed to reject match');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'platinum':
        return 'from-purple-500 to-pink-500';
      case 'gold':
        return 'from-yellow-400 to-orange-500';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      case 'bronze':
        return 'from-orange-300 to-orange-600';
      default:
        return 'bg-gray-200';
    }
  };

  const scoreLabels: Record<string, string> = {
    destination: 'Destination',
    date_overlap: 'Date Match',
    interests: 'Interests',
    travel_style: 'Travel Style',
    safety_preference: 'Safety',
    rating: 'Rating',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Compatibility Score Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Compatibility Score</p>
            <p className="text-3xl font-bold">{match.compatibility_score}%</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Profile Section */}
      {profile && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`}
              alt={profile.full_name}
              className="w-14 h-14 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900">{profile.full_name}</h3>
                {profile.safety_badge !== 'none' && (
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getBadgeColor(profile.safety_badge)} flex items-center justify-center`}>
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
                {profile.is_verified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{profile.rating_avg}</span>
                </div>
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="text-gray-600 text-sm mt-3 line-clamp-2">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.travel_style.slice(0, 4).map((style) => (
              <span
                key={style}
                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
              >
                {style.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trip Section */}
      {trip && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 uppercase font-medium mb-2">For Trip</p>
          <Link to={`/trips/${trip.id}`} className="group">
            <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {trip.title}
            </h4>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d')}</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="p-4">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center justify-between w-full text-gray-600 hover:text-gray-900"
        >
          <span className="text-sm font-medium">Score Breakdown</span>
          {showBreakdown ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showBreakdown && (
          <div className="mt-3 space-y-2">
            {Object.entries(match.score_breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{scoreLabels[key]}</span>
                    <span className="font-medium text-gray-900">{value}/20</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {match.status === 'pending' && (
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Pass</span>
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">Connect</span>
          </button>
        </div>
      )}

      {match.status === 'accepted' && (
        <div className="p-4 border-t border-gray-100">
          <Link
            to={`/chat`}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors w-full"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Start Chatting</span>
          </Link>
        </div>
      )}
    </div>
  );
}
