import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  User,
  Heart,
  Compass,
  Globe,
  CheckCircle
} from 'lucide-react';
import type { TravelStyle } from '@/types';

const TRAVEL_STYLES: { value: TravelStyle; label: string; icon: string }[] = [
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'relaxation', label: 'Relaxation', icon: '🏖️' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️' },
  { value: 'budget', label: 'Budget', icon: '💰' },
  { value: 'luxury', label: 'Luxury', icon: '✨' },
  { value: 'backpacking', label: 'Backpacking', icon: '🎒' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'food_explorer', label: 'Food Explorer', icon: '🍜' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'solo', label: 'Solo Travel', icon: '🚶' },
];

const INTERESTS = [
  'Hiking', 'Photography', 'Food Tours', 'Museums', 'Beaches',
  'Mountains', 'Temples', 'Nightlife', 'Shopping', 'Yoga',
  'Scuba Diving', 'Camping', 'Road Trips', 'Wildlife', 'History',
  'Art', 'Music', 'Local Cuisine', 'Trekking', 'Meditation'
];

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali',
  'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi',
  'French', 'German', 'Spanish', 'Japanese', 'Mandarin'
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [location, setLocation] = useState('');

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleTravelStyle = (style: TravelStyle) => {
    if (travelStyles.includes(style)) {
      setTravelStyles(travelStyles.filter(s => s !== style));
    } else if (travelStyles.length < 5) {
      setTravelStyles([...travelStyles, style]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else if (interests.length < 10) {
      setInterests([...interests, interest]);
    }
  };

  const toggleLanguage = (language: string) => {
    if (languages.includes(language)) {
      if (languages.length > 1) {
        setLanguages(languages.filter(l => l !== language));
      }
    } else if (languages.length < 5) {
      setLanguages([...languages, language]);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      await updateProfile({
        full_name: fullName,
        gender,
        date_of_birth: dateOfBirth,
        bio,
        travel_style: travelStyles,
        interests,
        languages,
        location,
        onboarding_complete: true,
      });

      navigate('/kyc');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return fullName.length >= 2 && gender && dateOfBirth;
      case 2:
        return travelStyles.length >= 1;
      case 3:
        return interests.length >= 3;
      case 4:
        return languages.length >= 1;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Traveloop</span>
          </div>
          <div className="text-sm text-gray-400">
            Step {step} of {totalSteps}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
                <p className="text-gray-400">This helps us find the best travel matches for you</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setGender(option.value as typeof gender)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          gender === option.value
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">You must be 18+ to use Traveloop</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio (Optional)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 200))}
                    placeholder="Tell others about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{bio.length}/200</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Travel Styles */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">How do you like to travel?</h2>
                <p className="text-gray-400">Select up to 5 travel styles</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TRAVEL_STYLES.map(style => (
                  <button
                    key={style.value}
                    onClick={() => toggleTravelStyle(style.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      travelStyles.includes(style.value)
                        ? 'bg-emerald-500/20 border-emerald-500'
                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{style.icon}</span>
                    <span className={`font-medium ${
                      travelStyles.includes(style.value) ? 'text-emerald-400' : 'text-gray-300'
                    }`}>
                      {style.label}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-400">
                Selected: {travelStyles.length}/5
              </p>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">What are your interests?</h2>
                <p className="text-gray-400">Select at least 3 interests (max 10)</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      interests.includes(interest)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-400">
                Selected: {interests.length}/10
              </p>
            </div>
          )}

          {/* Step 4: Languages & Location */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Almost there!</h2>
                <p className="text-gray-400">Languages and location help with matching</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Languages you speak</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(language => (
                    <button
                      key={language}
                      onClick={() => toggleLanguage(language)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        languages.includes(language)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your City (Optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Mumbai, India"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-medium">Profile Complete!</p>
                    <p className="text-gray-400 text-sm">
                      Next, we'll verify your identity for safety. This is required to match with others.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                step === 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading || !isStepValid()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Continue to KYC'}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
