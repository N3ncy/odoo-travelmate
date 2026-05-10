import { Link } from 'react-router-dom';
import {
  Star,
  Shield,
  MapPin,
  MessageSquare,
  UserPlus,
  Flag,
  Ban,
} from 'lucide-react';
import type { Profile } from '@/types';

interface ProfileCardProps {
  profile: Profile;
  showActions?: boolean;
  onMessage?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
}

export function ProfileCard({
  profile,
  showActions = false,
  onMessage,
  onReport,
  onBlock,
}: ProfileCardProps) {
  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case 'platinum':
        return { color: 'from-purple-500 to-pink-500', label: 'Platinum Traveler' };
      case 'gold':
        return { color: 'from-yellow-400 to-orange-500', label: 'Gold Traveler' };
      case 'silver':
        return { color: 'from-gray-300 to-gray-500', label: 'Silver Traveler' };
      case 'bronze':
        return { color: 'from-orange-300 to-orange-600', label: 'Bronze Traveler' };
      default:
        return { color: 'bg-gray-200', label: 'New Traveler' };
    }
  };

  const badgeInfo = getBadgeInfo(profile.safety_badge);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
        {profile.is_premium && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
            PREMIUM
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="relative px-4 -mt-10">
        <div className="relative inline-block">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`}
            alt={profile.full_name}
            className="w-20 h-20 rounded-full border-4 border-white shadow-sm"
          />
          {profile.is_verified && (
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4 pt-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-gray-900">{profile.full_name}</h3>
          {profile.safety_badge !== 'none' && (
            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${badgeInfo.color} flex items-center justify-center`} title={badgeInfo.label}>
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {profile.location && (
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* Rating and Stats */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-900">{profile.rating_avg}</span>
          </div>
          <div className="text-gray-500 text-sm">
            <span className="font-semibold text-gray-900">{profile.total_trips}</span> trips
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-600 text-sm mt-3 line-clamp-2">{profile.bio}</p>
        )}

        {/* Interests */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.interests.slice(0, 4).map((interest) => (
            <span
              key={interest}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
            >
              {interest}
            </span>
          ))}
          {profile.interests.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{profile.interests.length - 4}
            </span>
          )}
        </div>

        {/* Travel Styles */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {profile.travel_style.slice(0, 3).map((style) => (
            <span
              key={style}
              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
            >
              {style.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={onMessage}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Message</span>
            </button>
            <button
              onClick={onReport}
              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              title="Report"
            >
              <Flag className="w-5 h-5" />
            </button>
            <button
              onClick={onBlock}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Block"
            >
              <Ban className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* View Profile Link */}
        {!showActions && (
          <Link
            to={`/profile/${profile.id}`}
            className="block text-center py-2 mt-4 text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors"
          >
            View Profile
          </Link>
        )}
      </div>
    </div>
  );
}
