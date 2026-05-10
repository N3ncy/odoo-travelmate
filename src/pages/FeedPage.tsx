import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  MapPin, Play, X, ChevronLeft, ChevronRight, Plus,
  TrendingUp, Compass, Image as ImageIcon, Video, Send
} from 'lucide-react';
import {
  storyService, postService, vlogService, trendingService,
  StoryGroup, Story, TravelPost, Vlog
} from '@/services/contentService';
import { useAuthStore } from '@/store';

// Story Viewer Modal
function StoryViewer({
  storyGroups,
  initialGroupIndex,
  onClose,
}: {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentGroup = storyGroups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  useEffect(() => {
    if (!currentStory) return;

    storyService.viewStory(currentStory.id);

    const duration = 5000; // 5 seconds per story
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (storyIndex < currentGroup.stories.length - 1) {
            setStoryIndex(storyIndex + 1);
            return 0;
          } else if (groupIndex < storyGroups.length - 1) {
            setGroupIndex(groupIndex + 1);
            setStoryIndex(0);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStory?.id, storyIndex, groupIndex]);

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setStoryIndex(storyGroups[groupIndex - 1].stories.length - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
      setProgress(0);
    } else if (groupIndex < storyGroups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md h-full max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
          {currentGroup.stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-50"
                style={{
                  width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentGroup.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentGroup.author.full_name)}&background=8b5cf6&color=fff`}
              alt={currentGroup.author.full_name}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-white font-medium text-sm">{currentGroup.author.full_name}</p>
              <p className="text-white/60 text-xs">
                {new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Story content */}
        <img
          src={currentStory.media_url}
          alt=""
          className="w-full h-full object-cover"
        />

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <p className="text-white text-sm bg-black/40 px-3 py-2 rounded-lg">
              {currentStory.caption}
            </p>
            {currentStory.location && (
              <div className="flex items-center gap-1 text-white/80 text-xs mt-2">
                <MapPin className="w-3 h-3" />
                {currentStory.location}
              </div>
            )}
          </div>
        )}

        {/* Navigation areas */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-5"
        />
        <button
          onClick={handleNext}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-5"
        />

        {/* Arrow indicators */}
        {(groupIndex > 0 || storyIndex > 0) && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {(groupIndex < storyGroups.length - 1 || storyIndex < currentGroup.stories.length - 1) && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Views count */}
        <div className="absolute bottom-4 left-4 text-white/60 text-sm">
          {currentStory.views} views
        </div>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post, onLike }: { post: TravelPost; onLike: (id: string) => void }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    const comment = await postService.addComment(post.id, newComment);
    setComments([...comments, comment]);
    setNewComment('');
  };

  const loadComments = async () => {
    const data = await postService.getComments(post.id);
    setComments(data);
    setShowComments(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3">
          <img
            src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.full_name || 'User')}&background=8b5cf6&color=fff`}
            alt={post.author?.full_name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">{post.author?.full_name}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {post.location && (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>{post.location}</span>
                </>
              )}
            </div>
          </div>
        </Link>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <div className="relative">
          {post.media.length === 1 ? (
            <img
              src={post.media[0].url}
              alt=""
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory">
              {post.media.map((m, idx) => (
                <img
                  key={m.id}
                  src={m.url}
                  alt=""
                  className="w-full aspect-square object-cover flex-shrink-0 snap-center"
                />
              ))}
            </div>
          )}
          {post.media.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              1/{post.media.length}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 ${post.is_liked ? 'text-red-500' : 'text-gray-700'}`}
            >
              <Heart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={loadComments} className="text-gray-700">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="text-gray-700">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          <button className={`${post.is_saved ? 'text-emerald-600' : 'text-gray-700'}`}>
            <Bookmark className={`w-6 h-6 ${post.is_saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className="font-semibold text-sm text-gray-900 mb-1">{post.likes} likes</p>

        {/* Content */}
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{post.author?.full_name}</span>{' '}
          {post.content}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-sm text-emerald-600">#{tag}</span>
            ))}
          </div>
        )}

        {/* Comments preview */}
        {post.comments_count > 0 && !showComments && (
          <button
            onClick={loadComments}
            className="text-sm text-gray-500 mt-2"
          >
            View all {post.comments_count} comments
          </button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <img
                    src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.full_name || 'U')}&size=32`}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{comment.author?.full_name}</span>{' '}
                      {comment.content}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm border-none outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                className="text-emerald-600 font-semibold text-sm disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">
          {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

// Vlog Card Component
function VlogCard({ vlog, onLike }: { vlog: Vlog; onLike: (id: string) => void }) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative">
        <img
          src={vlog.thumbnail_url}
          alt={vlog.title}
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-900 ml-1" />
          </div>
        </div>
        {vlog.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(vlog.duration)}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          <Link to={`/profile/${vlog.user_id}`}>
            <img
              src={vlog.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(vlog.author?.full_name || 'User')}&background=8b5cf6&color=fff`}
              alt={vlog.author?.full_name}
              className="w-10 h-10 rounded-full"
            />
          </Link>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{vlog.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {vlog.author?.full_name} • {formatViews(vlog.views)} views
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              {vlog.destination}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onLike(vlog.id)}
            className={`flex items-center gap-1 text-sm ${vlog.is_liked ? 'text-red-500' : 'text-gray-600'}`}
          >
            <Heart className={`w-5 h-5 ${vlog.is_liked ? 'fill-current' : ''}`} />
            {vlog.likes}
          </button>
          <button className="flex items-center gap-1 text-sm text-gray-600">
            <MessageCircle className="w-5 h-5" />
            {vlog.comments_count}
          </button>
          <button className={`ml-auto ${vlog.is_saved ? 'text-emerald-600' : 'text-gray-600'}`}>
            <Bookmark className={`w-5 h-5 ${vlog.is_saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function FeedPage() {
  const { profile } = useAuthStore();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [vlogs, setVlogs] = useState<Vlog[]>([]);
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'vlogs'>('feed');
  const [viewingStories, setViewingStories] = useState<number | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [storiesData, postsData, vlogsData, tagsData] = await Promise.all([
        storyService.getStories(),
        postService.getFeed(),
        vlogService.getTrendingVlogs(),
        trendingService.getTrendingTags(),
      ]);
      setStoryGroups(storiesData);
      setPosts(postsData);
      setVlogs(vlogsData);
      setTrendingTags(tagsData);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    await postService.likePost(postId);
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, likes: p.likes + 1, is_liked: true } : p
    ));
  };

  const handleLikeVlog = async (vlogId: string) => {
    await vlogService.likeVlog(vlogId);
    setVlogs(vlogs.map(v =>
      v.id === vlogId ? { ...v, likes: v.likes + 1, is_liked: true } : v
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Story Viewer */}
      {viewingStories !== null && (
        <StoryViewer
          storyGroups={storyGroups}
          initialGroupIndex={viewingStories}
          onClose={() => setViewingStories(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          {/* Stories */}
          <div className="py-4 overflow-x-auto">
            <div className="flex gap-4">
              {/* Add Story */}
              <Link
                to="/create/story"
                className="flex-shrink-0 flex flex-col items-center gap-1"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Plus className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <span className="text-xs text-gray-600">Your Story</span>
              </Link>

              {/* Story Groups */}
              {storyGroups.map((group, idx) => (
                <button
                  key={group.user_id}
                  onClick={() => setViewingStories(idx)}
                  className="flex-shrink-0 flex flex-col items-center gap-1"
                >
                  <div className={`w-16 h-16 rounded-full p-0.5 ${
                    group.has_unviewed
                      ? 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500'
                      : 'bg-gray-300'
                  }`}>
                    <img
                      src={group.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.author.full_name)}&background=8b5cf6&color=fff`}
                      alt={group.author.full_name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <span className="text-xs text-gray-600 max-w-16 truncate">
                    {group.author.full_name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-100">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'feed'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Feed
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vlogs')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'vlogs'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Video className="w-4 h-4" />
                Vlogs
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="aspect-square bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : activeTab === 'feed' ? (
              posts.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLikePost} />
              ))
            ) : (
              <div className="grid gap-6">
                {vlogs.map(vlog => (
                  <VlogCard key={vlog.id} vlog={vlog} onLike={handleLikeVlog} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Tags */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(({ tag, count }) => (
                  <Link
                    key={tag}
                    to={`/explore?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                  >
                    #{tag}
                    <span className="ml-1 text-gray-400">{count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Suggested Creators */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Suggested Creators</h3>
              <div className="space-y-3">
                {storyGroups.slice(0, 4).map(group => (
                  <Link
                    key={group.user_id}
                    to={`/profile/${group.user_id}`}
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg -mx-2"
                  >
                    <img
                      src={group.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.author.full_name)}&background=8b5cf6&color=fff`}
                      alt={group.author.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{group.author.full_name}</p>
                      <p className="text-xs text-gray-500">{group.stories.length} stories</p>
                    </div>
                    <button className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      Follow
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Create Content CTA */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Share Your Journey</h3>
              <p className="text-emerald-100 text-sm mb-4">
                Create posts, stories, and vlogs to inspire fellow travelers.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
