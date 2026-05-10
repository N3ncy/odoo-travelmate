import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  X,
} from 'lucide-react';
import { tripService } from '@/services/api';
import { useAuthStore } from '@/store';
import type { Trip, TravelStyle } from '@/types';
import toast from 'react-hot-toast';

const TRAVEL_STYLES: { value: TravelStyle; label: string; emoji: string }[] = [
  { value: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { value: 'relaxation', label: 'Relaxation', emoji: '🏖️' },
  { value: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { value: 'budget', label: 'Budget', emoji: '💰' },
  { value: 'luxury', label: 'Luxury', emoji: '✨' },
  { value: 'backpacking', label: 'Backpacking', emoji: '🎒' },
  { value: 'photography', label: 'Photography', emoji: '📷' },
  { value: 'food_explorer', label: 'Food Explorer', emoji: '🍜' },
  { value: 'nature', label: 'Nature', emoji: '🌿' },
  { value: 'solo', label: 'Solo Friendly', emoji: '🚶' },
];

const COMMON_INTERESTS = [
  'hiking', 'photography', 'food tours', 'nightlife', 'museums',
  'temples', 'beaches', 'mountains', 'shopping', 'yoga',
  'adventure sports', 'wildlife', 'history', 'art', 'music',
  'camping', 'trekking', 'scuba diving', 'surfing', 'cycling',
];

const POPULAR_DESTINATIONS = [
  'Leh-Ladakh, India',
  'Goa, India',
  'Rishikesh, Uttarakhand',
  'Kerala Backwaters',
  'Andaman Islands',
  'Jaipur, Rajasthan',
  'Manali, Himachal',
  'Darjeeling, West Bengal',
];

export function CreateTripPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Trip>>({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget_min: undefined,
    budget_max: undefined,
    budget_currency: 'INR',
    travel_style: [],
    gender_preference: 'any',
    age_range_min: 18,
    age_range_max: 60,
    max_participants: 2,
    interests: [],
    description: '',
    is_group_trip: false,
  });

  const [customInterest, setCustomInterest] = useState('');

  const updateField = <K extends keyof Trip>(field: K, value: Trip[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleStyle = (style: TravelStyle) => {
    const current = formData.travel_style || [];
    if (current.includes(style)) {
      updateField('travel_style', current.filter((s) => s !== style));
    } else {
      updateField('travel_style', [...current, style]);
    }
  };

  const toggleInterest = (interest: string) => {
    const current = formData.interests || [];
    if (current.includes(interest)) {
      updateField('interests', current.filter((i) => i !== interest));
    } else {
      updateField('interests', [...current, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests?.includes(customInterest.trim())) {
      updateField('interests', [...(formData.interests || []), customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.title?.trim()) {
          toast.error('Please enter a trip title');
          return false;
        }
        if (!formData.destination?.trim()) {
          toast.error('Please enter a destination');
          return false;
        }
        return true;
      case 2:
        if (!formData.start_date) {
          toast.error('Please select start date');
          return false;
        }
        if (!formData.end_date) {
          toast.error('Please select end date');
          return false;
        }
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
          toast.error('End date must be after start date');
          return false;
        }
        return true;
      case 3:
        if (!formData.travel_style?.length) {
          toast.error('Please select at least one travel style');
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const trip = await tripService.createTrip({
        ...formData,
        creator_id: profile?.id || 'demo-user',
        status: 'open',
      });
      toast.success('Trip created successfully!');
      navigate(`/trips/${trip.id}`);
    } catch (error) {
      toast.error('Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basics' },
    { number: 2, title: 'Dates & Budget' },
    { number: 3, title: 'Style' },
    { number: 4, title: 'Preferences' },
    { number: 5, title: 'Review' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Create Trip</h1>
            <div className="w-16" />
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step > s.number
                        ? 'bg-emerald-600 text-white'
                        : step === s.number
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 hidden sm:block">{s.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-16 mx-2 ${
                      step > s.number ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Where are you going?</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Adventure in Ladakh"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => updateField('destination', e.target.value)}
                    placeholder="Enter destination"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Popular destinations</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => updateField('destination', dest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.destination === dest
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dest.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell potential travel partners about your trip..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Dates & Budget */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">When & Budget</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => updateField('start_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => updateField('end_date', e.target.value)}
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Budget (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget_min || ''}
                      onChange={(e) => updateField('budget_min', parseInt(e.target.value) || undefined)}
                      placeholder="10000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Budget (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget_max || ''}
                      onChange={(e) => updateField('budget_max', parseInt(e.target.value) || undefined)}
                      placeholder="50000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Travelers
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('max_participants', Math.max(2, (formData.max_participants || 2) - 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-xl font-semibold text-gray-900 w-8 text-center">
                      {formData.max_participants || 2}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('max_participants', Math.min(10, (formData.max_participants || 2) + 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_group_trip}
                    onChange={(e) => updateField('is_group_trip', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">This is a group trip (3+ travelers)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Travel Style */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Travel Style</h2>
            <p className="text-gray-500 mb-6">Select styles that match your trip (choose multiple)</p>

            <div className="grid grid-cols-2 gap-3">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => toggleStyle(style.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.travel_style?.includes(style.value)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{style.emoji}</span>
                  <span className={`font-medium ${
                    formData.travel_style?.includes(style.value)
                      ? 'text-emerald-700'
                      : 'text-gray-700'
                  }`}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.interests?.includes(interest)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Add custom interest..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                />
                <button
                  type="button"
                  onClick={addCustomInterest}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Travel Partner Preferences</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gender Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'any', label: 'Open to All' },
                    { value: 'male', label: 'Male Only' },
                    { value: 'female', label: 'Female Only' },
                    { value: 'same_gender', label: 'Same Gender' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('gender_preference', option.value as any)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.gender_preference === option.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Range: {formData.age_range_min} - {formData.age_range_max} years
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
                    <input
                      type="range"
                      min="18"
                      max="60"
                      value={formData.age_range_min}
                      onChange={(e) => updateField('age_range_min', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
                    <input
                      type="range"
                      min="18"
                      max="60"
                      value={formData.age_range_max}
                      onChange={(e) => updateField('age_range_max', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Trip</h2>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 text-lg">{formData.title}</h3>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {formData.destination}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Dates</p>
                  <p className="font-medium text-gray-900">
                    {formData.start_date} to {formData.end_date}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium text-gray-900">
                    ₹{formData.budget_min?.toLocaleString()} - ₹{formData.budget_max?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Travel Style</p>
                <div className="flex flex-wrap gap-2">
                  {formData.travel_style?.map((style) => (
                    <span key={style} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                      {style.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {formData.interests?.map((interest) => (
                    <span key={interest} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Gender Preference</p>
                  <p className="font-medium text-gray-900 capitalize">{formData.gender_preference?.replace('_', ' ')}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Max Travelers</p>
                  <p className="font-medium text-gray-900">{formData.max_participants}</p>
                </div>
              </div>

              {formData.description && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{formData.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              step === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create Trip
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
