import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  TrendingUp,
  MapPin,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Play,
  Users,
  Compass,
  Filter,
  Grid,
  List,
  X,
  ChevronRight,
  Eye,
  Clock,
  Star,
  Plus,
} from 'lucide-react';
import {
  exploreService,
  hashtagService,
  experiencePostService,
  vlogService,
  storyService,
  followService,
  locationTagService,
} from '@/services/api';
import { useAuthStore } from '@/store';
import type {
  ExploreFeedItem,
  ExperiencePost,
  TravelVlog,
  Hashtag,
  LocationTag,
  Profile,
  ExploreFilters,
  StoryRing,
  TrendingSection,
} from '@/types';
import toast from 'react-hot-toast';

export function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useAuthStore();

  // State
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'vlogs' | 'posts'>('for_you');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Data states
  const [feedItems, setFeedItems] = useState<ExploreFeedItem[]>([]);
  const [storyRings, setStoryRings] = useState<StoryRing[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [trendingSections, setTrendingSections] = useState<TrendingSection[]>([]);
  const [popularLocations, setPopularLocations] = useState<LocationTag[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filters
  const [filters, setFilters] = useState<ExploreFilters>({
    content_types: ['post', 'vlog'],
    sort_by: 'trending',
  });

  // Search results
  const [searchResults, setSearchResults] = useState<{
    posts: ExperiencePost[];
    vlogs: TravelVlog[];
    users: Profile[];
    locations: LocationTag[];
  } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query !== searchQuery) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [feed, stories, hashtags, sections, locations] = await Promise.all([
        exploreService.getFeed(filters),
        storyService.getStoryRings(),
        hashtagService.getTrending(),
        exploreService.getTrendingSections(),
        locationTagService.getPopularLocations(),
      ]);

      setFeedItems(feed);
      setStoryRings(stories);
      setTrendingHashtags(hashtags);
      setTrendingSections(sections);
      setPopularLocations(locations.map(l => l.location_tag));
      setHasMore(feed.length >= 20);
    } catch (error) {
      console.error('Failed to load explore data:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    try {
      const nextPage = page + 1;
      const moreFeed = await exploreService.getFeed(filters, nextPage);
      if (moreFeed.length === 0) {
        setHasMore(false);
      } else {
        setFeedItems(prev => [...prev, ...moreFeed]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more:', error);
    }
  }, [loading, hasMore, page, filters]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, loading]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await exploreService.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      performSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchParams({});
  };

  const handleLike = async (postId: string, type: 'post' | 'vlog') => {
    try {
      if (type === 'post') {
        await experiencePostService.likePost(postId);
      } else {
        await vlogService.likeVlog(postId);
      }
      setFeedItems(prev => prev.map(item => {
        if (item.type === type) {
          const content = item.content as ExperiencePost | TravelVlog;
          if (content.id === postId) {
            return {
              ...item,
              content: { ...content, likes_count: content.likes_count + 1 }
            };
          }
        }
        return item;
      }));
      toast.success('Liked!');
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await experiencePostService.bookmarkPost(postId);
      toast.success('Saved!');
    } catch (error) {
      console.error('Bookmark failed:', error);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Render story rings
  const renderStoryRings = () => (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4">
      {/* Add Story Button */}
      <button
        onClick={() => navigate('/create/story')}
        className="flex-shrink-0 flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
          <Plus className="w-6 h-6 text-gray-400" />
        </div>
        <span className="text-xs text-gray-600 mt-1">Add Story</span>
      </button>

      {storyRings.map(ring => (
        <button
          key={ring.user_id}
          onClick={() => navigate(`/stories/${ring.user_id}`)}
          className="flex-shrink-0 flex flex-col items-center"
        >
          <div className={`w-16 h-16 rounded-full p-0.5 ${
            ring.has_unseen
              ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
              : 'bg-gray-300'
          }`}>
            <img
              src={ring.profile?.avatar_url || `https://ui-avatars.com/api/?name=${ring.profile?.full_name}`}
              alt={ring.profile?.full_name}
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
          </div>
          <span className="text-xs text-gray-600 mt-1 truncate w-16 text-center">
            {ring.profile?.full_name?.split(' ')[0]}
          </span>
        </button>
      ))}
    </div>
  );

  // Render post card
  const renderPostCard = (item: ExploreFeedItem) => {
    const post = item.content as ExperiencePost;

    if (viewMode === 'list') {
      return (
        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex">
            {post.media_urls.length > 0 && (
              <div className="w-32 h-32 flex-shrink-0">
                <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name}`}
                  alt={post.author?.full_name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium text-sm">{post.author?.full_name}</span>
                <span className="text-xs text-gray-400">{formatTimeAgo(post.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" /> {formatCount(post.likes_count)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> {formatCount(post.comments_count)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Author */}
        <div className="p-4 flex items-center gap-3">
          <img
            src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name}`}
            alt={post.author?.full_name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{post.author?.full_name}</p>
            {post.location_tag && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {post.location_tag.name}
              </p>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            post.post_type === 'experience' ? 'bg-emerald-100 text-emerald-700' :
            post.post_type === 'tip' ? 'bg-yellow-100 text-yellow-700' :
            post.post_type === 'review' ? 'bg-blue-100 text-blue-700' :
            post.post_type === 'recommendation' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {post.post_type}
          </span>
        </div>

        {/* Media */}
        {post.media_urls.length > 0 && (
          <div className="relative">
            <img
              src={post.media_urls[0]}
              alt=""
              className="w-full aspect-square object-cover"
            />
            {post.media_urls.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                +{post.media_urls.length - 1}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-800 text-sm line-clamp-3">{post.content}</p>

          {/* Rating for reviews */}
          {post.post_type === 'review' && post.rating && (
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < post.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              {post.price_range && (
                <span className="ml-2 text-sm text-gray-500">{post.price_range}</span>
              )}
            </div>
          )}

          {/* Tags */}
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.slice(0, 4).map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(`#${tag}`);
                    performSearch(`#${tag}`);
                  }}
                  className="text-emerald-600 text-xs hover:text-emerald-700"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(post.id, 'post')}
                className={`flex items-center gap-1 transition-colors ${
                  post.is_liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                <span className="text-sm">{formatCount(post.likes_count)}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{formatCount(post.comments_count)}</span>
              </button>
              <button className="text-gray-600 hover:text-emerald-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => handleBookmark(post.id)}
              className={`transition-colors ${
                post.is_bookmarked ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${post.is_bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render vlog card
  const renderVlogCard = (item: ExploreFeedItem) => {
    const vlog = item.content as TravelVlog;

    return (
      <div
        key={item.id}
        onClick={() => navigate(`/vlogs/${vlog.id}`)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group"
      >
        <div className="relative aspect-video">
          <img
            src={vlog.thumbnail_url}
            alt={vlog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-7 h-7 text-gray-900 ml-1" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            0:{vlog.duration_seconds.toString().padStart(2, '0')}
          </div>
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            VLOG
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2">{vlog.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <img
              src={vlog.author?.avatar_url || `https://ui-avatars.com/api/?name=${vlog.author?.full_name}`}
              alt={vlog.author?.full_name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-gray-600">{vlog.author?.full_name}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {formatCount(vlog.views_count)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {formatCount(vlog.likes_count)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTimeAgo(vlog.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render feed item
  const renderFeedItem = (item: ExploreFeedItem) => {
    if (item.type === 'post') return renderPostCard(item);
    if (item.type === 'vlog') return renderVlogCard(item);
    return null;
  };

  // Render search results
  const renderSearchResults = () => {
    if (!searchResults) return null;

    const hasResults =
      searchResults.posts.length > 0 ||
      searchResults.vlogs.length > 0 ||
      searchResults.users.length > 0 ||
      searchResults.locations.length > 0;

    if (!hasResults) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No results found for "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Users */}
        {searchResults.users.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> People
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {searchResults.users.map(user => (
                <div
                  key={user.user_id}
                  onClick={() => navigate(`/profile/${user.user_id}`)}
                  className="flex-shrink-0 bg-white rounded-xl p-4 shadow-sm border border-gray-100 w-36 text-center cursor-pointer hover:shadow-md transition-shadow"
                >
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}`}
                    alt={user.full_name}
                    className="w-14 h-14 rounded-full mx-auto mb-2"
                  />
                  <p className="font-medium text-sm truncate">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.total_trips} trips</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {searchResults.locations.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Places
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {searchResults.locations.map(loc => (
                <div
                  key={loc.id}
                  className="flex-shrink-0 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{loc.name}</p>
                    <p className="text-xs text-gray-500">{formatCount(loc.posts_count)} posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts & Vlogs */}
        {(searchResults.posts.length > 0 || searchResults.vlogs.length > 0) && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Content</h3>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
              {searchResults.posts.map(post => renderPostCard({
                id: post.id,
                type: 'post',
                content: post,
                relevance_score: 0,
                created_at: post.created_at
              }))}
              {searchResults.vlogs.map(vlog => renderVlogCard({
                id: vlog.id,
                type: 'vlog',
                content: vlog,
                relevance_score: 0,
                created_at: vlog.created_at
              }))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { key: 'for_you', label: 'For You', icon: Compass },
    { key: 'following', label: 'Following', icon: Users },
    { key: 'vlogs', label: 'Vlogs', icon: Play },
    { key: 'posts', label: 'Posts', icon: Grid },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 md:top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, places, travelers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Tabs */}
          {!searchResults && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {searchResults ? (
          renderSearchResults()
        ) : (
          <>
            {/* Stories */}
            {storyRings.length > 0 && activeTab === 'for_you' && (
              <div className="mb-6">
                {renderStoryRings()}
              </div>
            )}

            {/* Trending Hashtags */}
            {activeTab === 'for_you' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Trending</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {trendingHashtags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSearchQuery(`#${tag.tag}`);
                        performSearch(`#${tag.tag}`);
                      }}
                      className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-medium hover:shadow-md transition-shadow"
                    >
                      #{tag.tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Locations */}
            {activeTab === 'for_you' && popularLocations.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Popular Destinations
                  </h3>
                  <button className="text-sm text-emerald-600 flex items-center gap-1">
                    See all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {popularLocations.slice(0, 6).map(loc => (
                    <div
                      key={loc.id}
                      className="flex-shrink-0 w-28 cursor-pointer"
                      onClick={() => {
                        setSearchQuery(loc.name);
                        performSearch(loc.name);
                      }}
                    >
                      <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-2">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <p className="font-medium text-sm text-center truncate">{loc.name}</p>
                      <p className="text-xs text-gray-500 text-center">{formatCount(loc.posts_count)} posts</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter & View Toggle */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showFilters ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Content Type</h4>
                <div className="flex gap-2 flex-wrap mb-4">
                  {(['post', 'vlog'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          content_types: prev.content_types?.includes(type)
                            ? prev.content_types.filter(t => t !== type)
                            : [...(prev.content_types || []), type]
                        }));
                      }}
                      className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${
                        filters.content_types?.includes(type)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}s
                    </button>
                  ))}
                </div>
                <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                <div className="flex gap-2 flex-wrap">
                  {(['trending', 'recent', 'popular'] as const).map(sort => (
                    <button
                      key={sort}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, sort_by: sort }));
                        loadInitialData();
                      }}
                      className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${
                        filters.sort_by === sort
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feed */}
            {loading && feedItems.length === 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                {feedItems
                  .filter(item => {
                    if (activeTab === 'vlogs') return item.type === 'vlog';
                    if (activeTab === 'posts') return item.type === 'post';
                    return true;
                  })
                  .map(item => renderFeedItem(item))}
              </div>
            )}

            {/* Load More */}
            <div ref={loadMoreRef} className="py-8 text-center">
              {loading && feedItems.length > 0 && (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
              )}
              {!hasMore && feedItems.length > 0 && (
                <p className="text-gray-500 text-sm">You've seen it all!</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Content FAB */}
      <Link
        to="/create"
        className="fixed bottom-24 md:bottom-8 right-4 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors z-50"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
