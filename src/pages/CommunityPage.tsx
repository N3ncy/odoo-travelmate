import { useState, useEffect } from 'react';
import {
  Users, MessageCircle, ThumbsUp,
  Send, Plus, Search, TrendingUp, Clock,
  Globe, Mountain, Utensils, Camera, Compass
} from 'lucide-react';
import { communityService, CommunityPost } from '@/services/groupService';
import { CommunityBoard } from '@/types';
import { useAuthStore } from '@/store';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  women: <Users className="w-5 h-5" />,
  budget: <Compass className="w-5 h-5" />,
  adventure: <Mountain className="w-5 h-5" />,
  food: <Utensils className="w-5 h-5" />,
  photography: <Camera className="w-5 h-5" />,
  general: <Globe className="w-5 h-5" />,
};

export function CommunityPage() {
  const { profile } = useAuthStore();
  const [boards, setBoards] = useState<CommunityBoard[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedBoard]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [boardsData, postsData] = await Promise.all([
        communityService.getBoards(),
        communityService.getPosts(),
      ]);
      setBoards(boardsData);
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to fetch community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsData = await communityService.getPosts(selectedBoard || undefined);
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const tags = newPost.tags.split(',').map(t => t.trim()).filter(Boolean);
      await communityService.createPost({
        board_id: selectedBoard || 'general',
        user_id: profile?.id || 'demo-user',
        title: newPost.title,
        content: newPost.content,
        post_type: 'discussion',
        tags,
      });
      setNewPost({ title: '', content: '', tags: '' });
      setShowNewPost(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await communityService.upvotePost(postId);
      setLikedPosts(prev => new Set(prev).add(postId));
      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, upvotes: p.upvotes + 1 }
          : p
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const trendingTags = ['solo-travel', 'budget-tips', 'safety', 'hostels', 'photography', 'adventure'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Community</h1>
                <p className="text-violet-100">Connect with fellow travelers</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Post</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-300" />
            <input
              type="text"
              placeholder="Search discussions, tips, questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Boards */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Discussion Boards</h3>

              <button
                onClick={() => setSelectedBoard(null)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mb-2 ${
                  !selectedBoard ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">All Discussions</span>
              </button>

              <div className="space-y-1">
                {boards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => setSelectedBoard(board.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedBoard === board.id
                        ? 'bg-violet-50 text-violet-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {CATEGORY_ICONS[board.category] || <MessageCircle className="w-5 h-5" />}
                      <span className="font-medium">{board.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{board.members_count}</span>
                  </button>
                ))}
              </div>

              {/* Trending Tags */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  Trending Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-violet-100 hover:text-violet-700 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Posts */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.full_name || 'User')}&background=8b5cf6&color=fff`}
                      alt={post.author?.full_name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{post.author?.full_name || 'Anonymous'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-violet-50 text-violet-700 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        likedPosts.has(post.id)
                          ? 'bg-violet-100 text-violet-700'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{post.upvotes}</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{post.comments_count}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No discussions yet</h3>
                <p className="text-gray-500 mb-4">
                  Be the first to start a conversation!
                </p>
                <button
                  onClick={() => setShowNewPost(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Post</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, tips, or questions..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="solo-travel, tips, safety"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewPost(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
