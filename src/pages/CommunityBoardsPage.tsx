import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { communityService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { CommunityBoard, CommunityPost, CommunityReply } from '@/types';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Search,
  Plus,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Pin,
  Flag,
  Share2,
  CheckCircle,
  Clock,
  Tag,
  Filter,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  ThumbsUp,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  question: HelpCircle,
  tip: Lightbulb,
  discussion: MessageSquare,
  recommendation: ThumbsUp,
  warning: AlertTriangle,
};

const CATEGORY_COLORS = {
  question: 'bg-blue-500/20 text-blue-400',
  tip: 'bg-yellow-500/20 text-yellow-400',
  discussion: 'bg-purple-500/20 text-purple-400',
  recommendation: 'bg-green-500/20 text-green-400',
  warning: 'bg-red-500/20 text-red-400',
};

export function CommunityBoardsPage() {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const { profile } = useAuth();

  const [boards, setBoards] = useState<CommunityBoard[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'discussion' as const, tags: '' });
  const [newReply, setNewReply] = useState('');
  const [filter, setFilter] = useState<'all' | 'question' | 'tip' | 'discussion'>('all');

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (boardId) {
      loadPosts(boardId);
    }
  }, [boardId]);

  const loadBoards = async () => {
    try {
      const data = await communityService.getBoards();
      setBoards(data);
    } catch (error) {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (id: string) => {
    setLoading(true);
    try {
      const data = await communityService.getBoardPosts(id);
      setPosts(data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (postId: string) => {
    try {
      const data = await communityService.getPostReplies(postId);
      setReplies(data);
    } catch (error) {
      toast.error('Failed to load replies');
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const post = await communityService.createPost({
        board_id: boardId,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setPosts([post, ...posts]);
      setShowCreatePost(false);
      setNewPost({ title: '', content: '', category: 'discussion', tags: '' });
      toast.success('Post created!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      await communityService.vote(postId, 'post', voteType);
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            upvotes: voteType === 'up' ? p.upvotes + 1 : p.upvotes,
            downvotes: voteType === 'down' ? p.downvotes + 1 : p.downvotes,
          };
        }
        return p;
      }));
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleReply = async () => {
    if (!newReply.trim() || !selectedPost) return;

    try {
      const reply = await communityService.createReply({
        post_id: selectedPost.id,
        content: newReply,
      });
      setReplies([...replies, reply]);
      setNewReply('');
      toast.success('Reply posted!');
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handleSelectPost = async (post: CommunityPost) => {
    setSelectedPost(post);
    await loadReplies(post.id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredPosts = posts.filter(p => {
    if (filter !== 'all' && p.category !== filter) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Board list view
  if (!boardId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Community Boards</h1>
            <p className="text-gray-400">Connect with fellow travelers, share tips, and ask questions</p>

            {/* Search */}
            <div className="mt-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Boards Grid */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {boards.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase())).map((board) => (
                <button
                  key={board.id}
                  onClick={() => navigate(`/community/${board.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{board.members_count.toLocaleString()}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{board.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{board.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">
                      {board.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Post detail view
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setSelectedPost(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-semibold text-gray-900">Post Details</h2>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Post */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              {/* Vote */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleVote(selectedPost.id, 'up')}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-emerald-600"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <span className="font-semibold text-gray-900">
                  {selectedPost.upvotes - selectedPost.downvotes}
                </span>
                <button
                  onClick={() => handleVote(selectedPost.id, 'down')}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const CategoryIcon = CATEGORY_ICONS[selectedPost.category];
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${CATEGORY_COLORS[selectedPost.category]}`}>
                        <CategoryIcon className="w-3 h-3" />
                        {selectedPost.category}
                      </span>
                    );
                  })()}
                  {selectedPost.is_pinned && (
                    <Pin className="w-4 h-4 text-yellow-500" />
                  )}
                </div>

                <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedPost.title}</h1>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedPost.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPost.author_id}`}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{selectedPost.author?.full_name || 'Anonymous'}</span>
                  </div>
                  <span>{formatDate(selectedPost.created_at)}</span>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap mb-4">{selectedPost.content}</p>

                {selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPost.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-red-500">
                    <Flag className="w-4 h-4" />
                    <span className="text-sm">Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </h3>

            {/* Reply input */}
            <div className="mb-6">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-emerald-500 outline-none resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleReply}
                  disabled={!newReply.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Post Reply
                </button>
              </div>
            </div>

            {/* Reply list */}
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={reply.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author_id}`}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{reply.author?.full_name || 'Anonymous'}</span>
                      {reply.is_accepted && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Accepted
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{reply.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button className="flex items-center gap-1 text-gray-400 hover:text-emerald-600 text-xs">
                        <ArrowUp className="w-4 h-4" />
                        {reply.upvotes}
                      </button>
                      <button className="flex items-center gap-1 text-gray-400 hover:text-red-600 text-xs">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Posts list view
  const currentBoard = boards.find(b => b.id === boardId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/community')}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{currentBoard?.name || 'Community Board'}</h1>
              <p className="text-gray-400 text-sm">{currentBoard?.members_count.toLocaleString()} members</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Post
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {(['all', 'question', 'tip', 'discussion'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {f === 'all' ? 'All Posts' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const CategoryIcon = CATEGORY_ICONS[post.category];

              return (
                <button
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className="w-full bg-white rounded-2xl border border-gray-200 p-4 text-left hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Vote count */}
                    <div className="flex flex-col items-center min-w-[40px]">
                      <ArrowUp className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{post.upvotes - post.downvotes}</span>
                      <ArrowDown className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${CATEGORY_COLORS[post.category]}`}>
                          <CategoryIcon className="w-3 h-3" />
                          {post.category}
                        </span>
                        {post.is_pinned && (
                          <Pin className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{post.content}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <img
                            src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`}
                            alt=""
                            className="w-4 h-4 rounded-full"
                          />
                          <span>{post.author?.full_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.replies_count} replies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:border-emerald-500 outline-none"
                  >
                    <option value="question">Question</option>
                    <option value="tip">Tip</option>
                    <option value="discussion">Discussion</option>
                    <option value="recommendation">Recommendation</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter a descriptive title..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your thoughts, questions, or tips..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    placeholder="e.g., ladakh, trekking, budget"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
