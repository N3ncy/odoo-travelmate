import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Heart, Send, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { storyService } from '@/services/api';
import type { TravelStory, StoryRing } from '@/types';
import toast from 'react-hot-toast';

export function StoriesPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(true);
  const [storyRings, setStoryRings] = useState<StoryRing[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [stories, setStories] = useState<TravelStory[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    loadStoryRings();
  }, []);

  useEffect(() => {
    if (userId && storyRings.length > 0) {
      const userIndex = storyRings.findIndex(r => r.user_id === userId);
      if (userIndex >= 0) {
        setCurrentUserIndex(userIndex);
        loadUserStories(userId);
      }
    }
  }, [userId, storyRings]);

  const loadStoryRings = async () => {
    try {
      const rings = await storyService.getStoryRings();
      setStoryRings(rings);

      if (rings.length > 0 && !userId) {
        const firstUserId = rings[0].user_id;
        loadUserStories(firstUserId);
      }
    } catch (error) {
      console.error('Failed to load story rings:', error);
    }
  };

  const loadUserStories = async (uid: string) => {
    try {
      setLoading(true);
      const userStories = await storyService.getUserStories(uid);
      setStories(userStories);
      setCurrentStoryIndex(0);
      setProgress(0);
      startProgress();
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const startProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      if (isPaused) return;

      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;

      if (newProgress >= 100) {
        goToNextStory();
      } else {
        setProgress(newProgress);
      }
    }, 50);
  }, [isPaused]);

  useEffect(() => {
    if (!loading && stories.length > 0) {
      startProgress();
      // Mark story as viewed
      const currentStory = stories[currentStoryIndex];
      if (currentStory) {
        storyService.viewStory(currentStory.id);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, loading, stories]);

  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Go to next user's stories
      goToNextUser();
    }
  };

  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Go to previous user's stories
      goToPrevUser();
    }
  };

  const goToNextUser = () => {
    if (currentUserIndex < storyRings.length - 1) {
      const nextUser = storyRings[currentUserIndex + 1];
      setCurrentUserIndex(prev => prev + 1);
      loadUserStories(nextUser.user_id);
    } else {
      // End of all stories
      navigate(-1);
    }
  };

  const goToPrevUser = () => {
    if (currentUserIndex > 0) {
      const prevUser = storyRings[currentUserIndex - 1];
      setCurrentUserIndex(prev => prev - 1);
      loadUserStories(prevUser.user_id);
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      goToPrevStory();
    } else if (x > width * 0.7) {
      goToNextStory();
    } else {
      setIsPaused(prev => !prev);
    }
  };

  const handleReaction = async (emoji: string) => {
    const currentStory = stories[currentStoryIndex];
    if (!currentStory) return;

    try {
      await storyService.reactToStory(currentStory.id, emoji);
      toast.success('Reaction sent!');
      setShowReactions(false);
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    toast.success('Reply sent!');
    setReplyText('');
    setIsPaused(false);
  };

  const currentStory = stories[currentStoryIndex];
  const currentUser = storyRings[currentUserIndex]?.profile;

  if (loading || !currentStory) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Story Container */}
      <div className="relative w-full h-full max-w-lg mx-auto">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentStoryIndex ? '100%' :
                         index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${currentUser?.full_name}`}
              alt={currentUser?.full_name}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-white font-semibold text-sm">{currentUser?.full_name}</p>
              <p className="text-white/70 text-xs">
                {new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="text-white"
            >
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
            {currentStory.media_type === 'video' && (
              <button
                onClick={() => setIsMuted(prev => !prev)}
                className="text-white"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          onClick={handleTap}
        >
          {currentStory.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              playsInline
              loop
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-32 left-4 right-4 z-20">
            <p className="text-white text-center text-lg font-medium drop-shadow-lg">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Hashtags */}
        {currentStory.hashtags.length > 0 && (
          <div className="absolute bottom-24 left-4 right-4 z-20 flex justify-center gap-2 flex-wrap">
            {currentStory.hashtags.map(tag => (
              <span key={tag} className="text-white/80 text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {currentUserIndex > 0 && (
          <button
            onClick={goToPrevUser}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {currentUserIndex < storyRings.length - 1 && (
          <button
            onClick={goToNextUser}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Reactions */}
        {showReactions && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-white/20 backdrop-blur-lg rounded-full px-4 py-2 flex gap-3">
            {['❤️', '🔥', '😍', '😮', '😂', '👏'].map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value);
              setIsPaused(true);
            }}
            onBlur={() => !replyText && setIsPaused(false)}
            placeholder="Send a message..."
            className="flex-1 bg-white/20 backdrop-blur text-white placeholder-white/70 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
          >
            <Heart className="w-5 h-5 text-white" />
          </button>
          {replyText && (
            <button
              onClick={handleReply}
              className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* View Count */}
        <div className="absolute bottom-4 left-4 z-10 opacity-0">
          <p className="text-white/70 text-xs">
            {currentStory.views_count} views
          </p>
        </div>
      </div>
    </div>
  );
}

export default StoriesPage;
