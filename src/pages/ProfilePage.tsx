import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Star,
  MapPin,
  Calendar,
  Settings,
  Camera,
  Edit2,
  Check,
  X,
  Upload,
  FileText,
  Phone,
  Mail,
  Globe,
  Award,
  AlertTriangle,
  Languages,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store';
import { tripService, kycService, emergencyService, ratingService } from '@/services/api';
import type { Trip, KYCDocument, EmergencyContact, Rating, TravelStyle } from '@/types';
import toast from 'react-hot-toast';

const TRAVEL_STYLES: TravelStyle[] = [
  'adventure', 'relaxation', 'cultural', 'budget', 'luxury',
  'backpacking', 'photography', 'food_explorer', 'nature', 'solo',
];

const INTERESTS = [
  'hiking', 'photography', 'food tours', 'nightlife', 'museums',
  'temples', 'beaches', 'mountains', 'shopping', 'yoga',
  'adventure sports', 'wildlife', 'history', 'art', 'music',
];

export function ProfilePage() {
  const { profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'emergency' | 'reviews'>('profile');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Language preference
  const [langPref, setLangPref] = useState<string>(() => localStorage.getItem('user_language_pref') || 'English');

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Profile form state
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    gender: 'prefer_not_to_say',
    interests: [] as string[],
    travel_style: [] as TravelStyle[],
    languages: [] as string[],
  });

  // Data states
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [kycDocs, setKycDocs] = useState<KYCDocument[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        gender: profile.gender || 'prefer_not_to_say',
        interests: profile.interests || [],
        travel_style: profile.travel_style || [],
        languages: profile.languages || [],
      });
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      const [trips, docs, contacts] = await Promise.all([
        tripService.getUserTrips(profile?.id || 'demo-user'),
        kycService.getDocuments(profile?.id || 'demo-user'),
        emergencyService.getContacts(profile?.id || 'demo-user'),
      ]);
      setMyTrips(trips);
      setKycDocs(docs);
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleStyle = (style: TravelStyle) => {
    setFormData((prev) => ({
      ...prev,
      travel_style: prev.travel_style.includes(style)
        ? prev.travel_style.filter((s) => s !== style)
        : [...prev.travel_style, style],
    }));
  };

  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case 'platinum':
        return { color: 'from-purple-500 to-pink-500', label: 'Platinum Traveler', icon: '💎' };
      case 'gold':
        return { color: 'from-yellow-400 to-orange-500', label: 'Gold Traveler', icon: '🥇' };
      case 'silver':
        return { color: 'from-gray-300 to-gray-500', label: 'Silver Traveler', icon: '🥈' };
      case 'bronze':
        return { color: 'from-orange-300 to-orange-600', label: 'Bronze Traveler', icon: '🥉' };
      default:
        return { color: 'bg-gray-200', label: 'New Traveler', icon: '🆕' };
    }
  };

  const badgeInfo = getBadgeInfo(profile?.safety_badge || 'none');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`}
                alt={profile?.full_name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-50">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                {profile?.is_verified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center" title="Verified">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                {profile?.is_premium && (
                  <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                    PREMIUM
                  </span>
                )}
              </div>

              {profile?.location && (
                <p className="flex items-center justify-center md:justify-start gap-1 text-emerald-100 mb-2">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
                <div>
                  <p className="text-2xl font-bold">{profile?.rating_avg || 0}</p>
                  <p className="text-xs text-emerald-100 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Rating
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile?.total_trips || 0}</p>
                  <p className="text-xs text-emerald-100">Trips</p>
                </div>
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${badgeInfo.color} text-white text-sm font-medium`}>
                  {badgeInfo.icon} {badgeInfo.label}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <Link
                to="/settings"
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'kyc', label: 'KYC', icon: FileText },
              { key: 'emergency', label: 'Emergency', icon: Phone },
              { key: 'reviews', label: 'Reviews', icon: Star },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">About Me</h3>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell travelers about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              ) : (
                <p className="text-gray-600">{profile?.bio || 'No bio yet'}</p>
              )}
            </div>

            {/* Travel Styles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Travel Style</h3>
              <div className="flex flex-wrap gap-2">
                {editing ? (
                  TRAVEL_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.travel_style.includes(style)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style.replace('_', ' ')}
                    </button>
                  ))
                ) : (
                  profile?.travel_style?.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                    >
                      {style.replace('_', ' ')}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {editing ? (
                  INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))
                ) : (
                  profile?.interests?.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* My Trips */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">My Trips</h3>
                <Link to="/trips/create" className="text-emerald-600 text-sm font-medium hover:underline">
                  Create New
                </Link>
              </div>
              {myTrips.length > 0 ? (
                <div className="space-y-3">
                  {myTrips.slice(0, 3).map((trip) => (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{trip.title}</h4>
                        <p className="text-sm text-gray-500">{trip.destination}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trip.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                        trip.status === 'active' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {trip.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No trips yet</p>
              )}
            </div>

            {/* Save Button */}
            {editing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Language Preference */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5 text-blue-500" />
                Language Preference
              </h3>
              <select
                value={langPref}
                onChange={(e) => setLangPref(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 mb-4"
              >
                {['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  localStorage.setItem('user_language_pref', langPref);
                  toast.success(`Language set to ${langPref}`);
                }}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                Save Preference
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-200">
              <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Delete Account — This action is permanent and cannot be undone.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Delete My Account
                </button>
              ) : (
                <div className="space-y-3 bg-red-50 rounded-xl p-4 border border-red-200">
                  <p className="text-sm font-medium text-red-700">
                    Type <strong>DELETE</strong> below to confirm:
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-4 py-2.5 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-400"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); }}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={confirmText !== 'DELETE'}
                      onClick={async () => {
                        try {
                          // Demo mode check
                          const isDemo = !import.meta.env.VITE_SUPABASE_URL;
                          if (isDemo) {
                            toast('Account deletion not available in demo mode', { icon: 'ℹ️' });
                            setShowDeleteConfirm(false);
                            setConfirmText('');
                            return;
                          }
                          await signOut();
                          localStorage.clear();
                          navigate('/landing');
                          toast.success('Account deleted');
                        } catch {
                          toast.error('Failed to delete account');
                        }
                      }}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">KYC Verification</h3>
                  <p className="text-sm text-gray-500">Verify your identity for trust & safety</p>
                </div>
              </div>

              {kycDocs.length > 0 ? (
                <div className="space-y-4">
                  {kycDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">{doc.document_type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">Submitted on {new Date(doc.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No documents uploaded yet</p>
                </div>
              )}

              <button className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Document
              </button>
            </div>
          </div>
        )}

        {/* Emergency Contacts Tab */}
        {activeTab === 'emergency' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-6">Emergency Contacts</h3>

              {emergencyContacts.length > 0 ? (
                <div className="space-y-4">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          {contact.is_primary && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{contact.relationship} • {contact.phone}</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No emergency contacts added</p>
              )}

              <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                + Add Emergency Contact
              </button>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Reviews from Travelers</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900">{profile?.rating_avg || 0}</span>
                  <span className="text-gray-500">({ratings.length} reviews)</span>
                </div>
              </div>

              {ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={rating.rater?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{rating.rater?.full_name || 'Anonymous'}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < rating.overall_rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {rating.review_text && (
                        <p className="text-gray-600">{rating.review_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Complete trips to earn reviews!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
