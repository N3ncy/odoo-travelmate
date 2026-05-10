import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ratingService, profileService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Star,
  Shield,
  MessageCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  ThumbsUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const RATING_CRITERIA = [
  { key: 'overall', label: 'Overall Experience', icon: Star, description: 'How was your overall trip experience?' },
  { key: 'safety', label: 'Safety & Trust', icon: Shield, description: 'Did you feel safe throughout the trip?' },
  { key: 'communication', label: 'Communication', icon: MessageCircle, description: 'How well did they communicate?' },
  { key: 'punctuality', label: 'Punctuality', icon: Clock, description: 'Were they on time and reliable?' },
];

export function RatingPage() {
  const { tripId, userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ratings, setRatings] = useState({
    overall: 0,
    safety: 0,
    communication: 0,
    punctuality: 0,
  });
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mock user data
  const ratedUser = {
    full_name: 'Rahul Verma',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    total_trips: 28,
  };

  const handleRatingChange = (key: string, value: number) => {
    setRatings({ ...ratings, [key]: value });
  };

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setLoading(true);
    try {
      await ratingService.submitRating({
        trip_id: tripId,
        rated_user_id: userId,
        rater_id: user?.id,
        overall_rating: ratings.overall,
        safety_rating: ratings.safety || ratings.overall,
        communication_rating: ratings.communication || ratings.overall,
        punctuality_rating: ratings.punctuality || ratings.overall,
        review_text: review || undefined,
      });

      setSubmitted(true);
      toast.success('Rating submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-400 mb-6">
            Your rating helps build a trusted travel community.
          </p>

          <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300">
              {ratedUser.full_name}'s trust score has been updated based on your feedback.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
          >
            Continue to Home
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={ratedUser.avatar_url}
              alt={ratedUser.full_name}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-700"
            />
            <h2 className="text-xl font-bold text-white mb-1">Rate Your Trip</h2>
            <p className="text-gray-400">
              How was your experience with {ratedUser.full_name}?
            </p>
          </div>

          {/* Rating Criteria */}
          <div className="space-y-6 mb-8">
            {RATING_CRITERIA.map((criteria) => {
              const Icon = criteria.icon;
              const currentRating = ratings[criteria.key as keyof typeof ratings];

              return (
                <div key={criteria.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-white">{criteria.label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{criteria.description}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(criteria.key, star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= currentRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Write a Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, 500))}
              placeholder="Share your experience with other travelers..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{review.length}/500</p>
          </div>

          {/* Quick Tags */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-300 mb-2">Quick Tags</p>
            <div className="flex flex-wrap gap-2">
              {['Great company', 'Very helpful', 'Fun to travel with', 'Reliable', 'Good planner', 'Respectful'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setReview(review ? `${review} ${tag}.` : `${tag}.`)}
                  className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
                >
                  <ThumbsUp className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || ratings.overall === 0}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Skip Option */}
          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 py-2 text-gray-400 hover:text-white text-sm"
          >
            Skip for now
          </button>
        </div>

        {/* Trust Score Info */}
        <div className="mt-6 bg-gray-800/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-300 font-medium">Building Trust</p>
              <p className="text-gray-500 mt-1">
                Your honest rating helps other travelers make safe decisions.
                All ratings are anonymous and contribute to the community trust score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
