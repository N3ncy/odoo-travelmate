import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  MoreVertical,
  MapPin,
  Eye,
  UserPlus,
  Check,
} from 'lucide-react';
import { vlogService, followService } from '@/services/api';
import type { TravelVlog, VlogComment } from '@/types';
import toast from 'react-hot-toast';

export function VlogsPage() {
  const { vlogId } = useParams<{ vlogId: string }>();
  const navigate = useNavigate();
  const [vlogs, setVlogs] = useState<TravelVlog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<VlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadVlogs();
  }, []);

  useEffect(() => {
    if (vlogId && vlogs.length > 0) {
      const index = vlogs.findIndex(v => v.id === vlogId);
      if (index >= 0) {
        setCurrentIndex(index);
      }
    }
  }, [vlogId, vlogs]);

  useEffect(() => {
    // Pause all videos except current
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (vlogs[currentIndex]?.id === id) {
        if (isPlaying) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Track view
    const currentVlog = vlogs[currentIndex];
    if (currentVlog) {
      vlogService.incrementViews(currentVlog.id);
    }
  }, [currentIndex, isPlaying, vlogs]);

  const loadVlogs = async () => {
    try {
      setLoading(true);
      const vlogList = await vlogService.getVlogs();
      setVlogs(vlogList);
    } catch (error) {
      console.error('Failed to load vlogs:', error);
      toast.error('Failed to load vlogs');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (vlogId: string) => {
    try {
      const vlogComments = await vlogService.getVlogComments(vlogId);
      setComments(vlogComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (direction === 'down' && currentIndex < vlogs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    setIsPlaying(true);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 50) {
      if (e.deltaY > 0) {
        handleScroll('down');
      } else {
        handleScroll('up');
      }
    }
  };

  const handleTouchStart = useRef({ y: 0 });
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = handleTouchStart.current.y - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleScroll('down');
      } else {
        handleScroll('up');
      }
    }
  };

  const handleLike = async () => {
    const currentVlog = vlogs[currentIndex];
    if (!currentVlog) return;

    try {
      await vlogService.likeVlog(currentVlog.id);
      setVlogs(prev => prev.map((v, i) =>
        i === currentIndex ? { ...v, likes_count: v.likes_count + 1 } : v
      ));
      toast.success('Liked!');
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleFollow = async () => {
    const currentVlog = vlogs[currentIndex];
    if (!currentVlog?.author) return;

    try {
      if (isFollowing) {
        await followService.unfollow(currentVlog.author.user_id);
        setIsFollowing(false);
        toast.success('Unfollowed');
      } else {
        await followService.follow(currentVlog.author.user_id);
        setIsFollowing(true);
        toast.success('Following!');
      }
    } catch (error) {
      console.error('Follow failed:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    const currentVlog = vlogs[currentIndex];
    if (!currentVlog) return;

    try {
      const comment = await vlogService.addVlogComment(currentVlog.id, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setVlogs(prev => prev.map((v, i) =>
        i === currentIndex ? { ...v, comments_count: v.comments_count + 1 } : v
      ));
      toast.success('Comment added!');
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  const openComments = () => {
    const currentVlog = vlogs[currentIndex];
    if (currentVlog) {
      loadComments(currentVlog.id);
      setShowComments(true);
      setIsPlaying(false);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const currentVlog = vlogs[currentIndex];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (vlogs.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
        <Play className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">No vlogs available</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-white/20 rounded-full"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={(e) => { handleTouchStart.current.y = e.touches[0].clientY; }}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-30 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Vlog Container */}
      <div className="relative w-full h-full">
        {vlogs.map((vlog, index) => (
          <div
            key={vlog.id}
            className={`absolute inset-0 transition-transform duration-300 ${
              index === currentIndex ? 'translate-y-0' :
              index < currentIndex ? '-translate-y-full' : 'translate-y-full'
            }`}
          >
            {/* Video */}
            <video
              ref={(el) => { if (el) videoRefs.current[vlog.id] = el; }}
              src={vlog.video_url}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
              onClick={() => setIsPlaying(!isPlaying)}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

            {/* Play/Pause Indicator */}
            {!isPlaying && index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Video Info */}
            {index === currentIndex && (
              <div className="absolute bottom-20 left-4 right-20 z-20">
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={vlog.author?.avatar_url || `https://ui-avatars.com/api/?name=${vlog.author?.full_name}`}
                    alt={vlog.author?.full_name}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{vlog.author?.full_name}</p>
                    <p className="text-white/70 text-sm">@{vlog.author?.full_name?.toLowerCase().replace(' ', '_')}</p>
                  </div>
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      isFollowing
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4" /> Following
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserPlus className="w-4 h-4" /> Follow
                      </span>
                    )}
                  </button>
                </div>

                {/* Title & Description */}
                <h3 className="text-white font-bold text-lg mb-1">{vlog.title}</h3>
                {vlog.description && (
                  <p className="text-white/80 text-sm line-clamp-2">{vlog.description}</p>
                )}

                {/* Location */}
                {vlog.location_tag && (
                  <div className="flex items-center gap-1 mt-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4" />
                    {vlog.location_tag.name}
                  </div>
                )}

                {/* Hashtags */}
                {vlog.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vlog.hashtags.map(tag => (
                      <span key={tag} className="text-white/80 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-6">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{formatCount(currentVlog?.likes_count || 0)}</span>
        </button>

        {/* Comments */}
        <button
          onClick={openComments}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{formatCount(currentVlog?.comments_count || 0)}</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center">
          <div className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{formatCount(currentVlog?.shares_count || 0)}</span>
        </button>

        {/* Bookmark */}
        <button className="flex flex-col items-center">
          <div className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Mute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {currentIndex > 0 && (
          <button
            onClick={() => handleScroll('up')}
            className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
          >
            <ChevronUp className="w-5 h-5 text-white" />
          </button>
        )}
        {currentIndex < vlogs.length - 1 && (
          <button
            onClick={() => handleScroll('down')}
            className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* View Counter */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full">
        <Eye className="w-4 h-4 text-white" />
        <span className="text-white text-sm">{formatCount(currentVlog?.views_count || 0)}</span>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="absolute inset-0 z-40 flex items-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowComments(false);
              setIsPlaying(true);
            }}
          />
          <div className="relative w-full max-h-[70vh] bg-white rounded-t-3xl overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">{comments.length} Comments</h3>
              <button
                onClick={() => {
                  setShowComments(false);
                  setIsPlaying(true);
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comments List */}
            <div className="overflow-y-auto max-h-[calc(70vh-140px)] p-4 space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.full_name}`}
                    alt={comment.author?.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{comment.author?.full_name}</p>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                      <button className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {comment.likes_count}
                      </button>
                      <button>Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VlogsPage;
