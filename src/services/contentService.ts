// ==========================================
// Phase 3: Content Platform Services
// ==========================================
import { supabase, isDemoMode } from '@/lib/supabase';
import type { Profile } from '@/types';
import { mockProfiles, demoUserProfile } from './mockData';

// ==========================================
// Content Types
// ==========================================
export interface Story {
  id: string;
  user_id: string;
  author?: Profile;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  location?: string;
  views: number;
  created_at: string;
  expires_at: string;
  is_viewed?: boolean;
}

export interface StoryGroup {
  user_id: string;
  author: Profile;
  stories: Story[];
  has_unviewed: boolean;
  latest_at: string;
}

export interface Vlog {
  id: string;
  user_id: string;
  author?: Profile;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url?: string;
  destination: string;
  duration?: number; // seconds
  views: number;
  likes: number;
  comments_count: number;
  tags: string[];
  trip_id?: string;
  created_at: string;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface TravelPost {
  id: string;
  user_id: string;
  author?: Profile;
  content: string;
  media: PostMedia[];
  location?: string;
  destination?: string;
  trip_id?: string;
  likes: number;
  comments_count: number;
  shares: number;
  tags: string[];
  post_type: 'text' | 'photo' | 'album' | 'vlog' | 'itinerary' | 'tip';
  created_at: string;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  order: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author?: Profile;
  content: string;
  likes: number;
  replies_count: number;
  created_at: string;
  parent_id?: string;
  is_liked?: boolean;
}

export interface SavedContent {
  id: string;
  user_id: string;
  content_type: 'post' | 'vlog' | 'story';
  content_id: string;
  saved_at: string;
}

// ==========================================
// Mock Data for Phase 3
// ==========================================
const mockStories: Story[] = [
  {
    id: 'story-1',
    user_id: '2',
    author: mockProfiles[1],
    media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    media_type: 'image',
    caption: 'Sunrise at Triund! The view is unreal',
    location: 'Triund, Himachal Pradesh',
    views: 234,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    is_viewed: false,
  },
  {
    id: 'story-2',
    user_id: '2',
    author: mockProfiles[1],
    media_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    media_type: 'image',
    caption: 'The trek was worth every step',
    location: 'Triund Peak',
    views: 189,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    is_viewed: false,
  },
  {
    id: 'story-3',
    user_id: '3',
    author: mockProfiles[2],
    media_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
    media_type: 'image',
    caption: 'Beach vibes in Goa',
    location: 'Palolem Beach, Goa',
    views: 456,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    is_viewed: true,
  },
  {
    id: 'story-4',
    user_id: '4',
    author: mockProfiles[3],
    media_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600',
    media_type: 'image',
    caption: 'Morning yoga session at the ashram',
    location: 'Rishikesh, Uttarakhand',
    views: 312,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    is_viewed: false,
  },
  {
    id: 'story-5',
    user_id: '5',
    author: mockProfiles[4],
    media_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    media_type: 'image',
    caption: 'Houseboat life in Kerala',
    location: 'Alleppey Backwaters',
    views: 567,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
    is_viewed: false,
  },
];

const mockVlogs: Vlog[] = [
  {
    id: 'vlog-1',
    user_id: '2',
    author: mockProfiles[1],
    title: '48 Hours in Manali - Complete Travel Guide',
    description: 'Everything you need to know about visiting Manali in winter. From the best cafes to hidden trails, this guide covers it all!',
    thumbnail_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
    destination: 'Manali, Himachal Pradesh',
    duration: 720,
    views: 12500,
    likes: 834,
    comments_count: 156,
    tags: ['manali', 'himachal', 'winter-travel', 'solo-travel', 'mountains'],
    created_at: '2024-12-01T10:00:00Z',
    is_liked: false,
    is_saved: true,
  },
  {
    id: 'vlog-2',
    user_id: '3',
    author: mockProfiles[2],
    title: 'Goa on a Budget - Under 5000/day',
    description: 'Yes, you can do Goa without breaking the bank! Hostels, beach shacks, local food - here is how I did it.',
    thumbnail_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
    destination: 'Goa',
    duration: 540,
    views: 8900,
    likes: 612,
    comments_count: 89,
    tags: ['goa', 'budget-travel', 'beaches', 'backpacking'],
    created_at: '2024-11-28T14:00:00Z',
    is_liked: true,
    is_saved: false,
  },
  {
    id: 'vlog-3',
    user_id: '4',
    author: mockProfiles[3],
    title: 'Solo Female Travel in Rishikesh - Safety Tips',
    description: 'My honest experience traveling solo as a woman in Rishikesh. Safety tips, best areas to stay, and what to avoid.',
    thumbnail_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600',
    destination: 'Rishikesh, Uttarakhand',
    duration: 480,
    views: 23400,
    likes: 2100,
    comments_count: 342,
    tags: ['rishikesh', 'solo-female-travel', 'safety', 'yoga', 'spiritual'],
    created_at: '2024-11-25T09:00:00Z',
    is_liked: false,
    is_saved: false,
  },
  {
    id: 'vlog-4',
    user_id: '5',
    author: mockProfiles[4],
    title: 'Kerala Backwaters - A Photographic Journey',
    description: 'Join me on a houseboat journey through the serene backwaters of Kerala. Tips on getting the best photography shots!',
    thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    destination: 'Alleppey, Kerala',
    duration: 600,
    views: 15600,
    likes: 1234,
    comments_count: 198,
    tags: ['kerala', 'backwaters', 'photography', 'houseboat', 'nature'],
    created_at: '2024-11-20T11:00:00Z',
    is_liked: true,
    is_saved: true,
  },
];

const mockTravelPosts: TravelPost[] = [
  {
    id: 'post-1',
    user_id: '2',
    author: mockProfiles[1],
    content: 'Just completed the Hampta Pass trek! 5 days of pure adventure. The crossover from Kullu to Spiti valley is something else. If you are planning this trek, go in September - perfect weather!',
    media: [
      { id: 'm1', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', type: 'image', order: 1 },
      { id: 'm2', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', type: 'image', order: 2 },
    ],
    location: 'Hampta Pass, Himachal',
    destination: 'Spiti Valley',
    likes: 456,
    comments_count: 34,
    shares: 12,
    tags: ['trekking', 'hampta-pass', 'adventure'],
    post_type: 'album',
    created_at: '2024-12-05T10:00:00Z',
    is_liked: true,
  },
  {
    id: 'post-2',
    user_id: '3',
    author: mockProfiles[2],
    content: 'Pro tip for Goa travelers: Skip the touristy North beaches and head to South Goa. Palolem and Agonda are SO much better. Less crowded, cleaner beaches, and better food. You are welcome!',
    media: [
      { id: 'm3', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600', type: 'image', order: 1 },
    ],
    location: 'Palolem Beach',
    destination: 'South Goa',
    likes: 289,
    comments_count: 45,
    shares: 23,
    tags: ['goa', 'travel-tip', 'beaches'],
    post_type: 'tip',
    created_at: '2024-12-04T15:00:00Z',
    is_liked: false,
  },
  {
    id: 'post-3',
    user_id: '4',
    author: mockProfiles[3],
    content: 'Day 1 of my Varanasi solo trip. The ghats at sunrise are magical. Attended the Ganga Aarti yesterday - an experience I will never forget. This city has a different energy.',
    media: [
      { id: 'm4', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600', type: 'image', order: 1 },
      { id: 'm5', url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600', type: 'image', order: 2 },
      { id: 'm6', url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?w=600', type: 'image', order: 3 },
    ],
    location: 'Dashashwamedh Ghat',
    destination: 'Varanasi',
    likes: 567,
    comments_count: 78,
    shares: 34,
    tags: ['varanasi', 'solo-travel', 'spiritual', 'photography'],
    post_type: 'album',
    created_at: '2024-12-03T06:00:00Z',
    is_liked: true,
  },
  {
    id: 'post-4',
    user_id: '5',
    author: mockProfiles[4],
    content: 'Found this hidden waterfall near Munnar. No tourists, just us and nature. Sometimes the best spots are the ones not on Google Maps. Ask the locals!',
    media: [
      { id: 'm7', url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600', type: 'image', order: 1 },
    ],
    location: 'Near Munnar',
    destination: 'Kerala',
    likes: 892,
    comments_count: 56,
    shares: 45,
    tags: ['kerala', 'waterfall', 'hidden-gem', 'nature'],
    post_type: 'photo',
    created_at: '2024-12-02T12:00:00Z',
    is_liked: false,
  },
  {
    id: 'post-5',
    user_id: 'demo-user',
    author: demoUserProfile,
    content: 'Planning my next adventure to Ladakh! Looking for travel buddies for a 10-day bike trip in June. Anyone interested? We will cover Leh, Nubra Valley, Pangong, and Khardung La!',
    media: [],
    destination: 'Ladakh',
    likes: 123,
    comments_count: 45,
    shares: 8,
    tags: ['ladakh', 'bike-trip', 'looking-for-buddies', 'adventure'],
    post_type: 'text',
    created_at: '2024-12-06T09:00:00Z',
    is_liked: false,
  },
];

const mockComments: Comment[] = [
  {
    id: 'comment-1',
    post_id: 'post-1',
    user_id: '3',
    author: mockProfiles[2],
    content: 'This looks amazing! How difficult was the trek? I am a beginner.',
    likes: 12,
    replies_count: 2,
    created_at: '2024-12-05T11:00:00Z',
  },
  {
    id: 'comment-2',
    post_id: 'post-1',
    user_id: '4',
    author: mockProfiles[3],
    content: 'I did this trek last year! Best experience ever. Pro tip: carry enough warm clothes, it gets really cold at night.',
    likes: 24,
    replies_count: 1,
    created_at: '2024-12-05T12:30:00Z',
  },
  {
    id: 'comment-3',
    post_id: 'post-2',
    user_id: '5',
    author: mockProfiles[4],
    content: 'Totally agree! Agonda is my favorite beach in all of India.',
    likes: 8,
    replies_count: 0,
    created_at: '2024-12-04T16:00:00Z',
  },
];

// ==========================================
// Story Service
// ==========================================
export const storyService = {
  async getStories(): Promise<StoryGroup[]> {
    if (isDemoMode) {
      // Group stories by user
      const grouped = mockStories.reduce((acc, story) => {
        if (!acc[story.user_id]) {
          acc[story.user_id] = [];
        }
        acc[story.user_id].push(story);
        return acc;
      }, {} as Record<string, Story[]>);

      return Object.entries(grouped).map(([userId, stories]) => ({
        user_id: userId,
        author: stories[0].author!,
        stories: stories.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        has_unviewed: stories.some(s => !s.is_viewed),
        latest_at: stories[stories.length - 1].created_at,
      })).sort((a, b) => {
        // Unviewed first, then by latest
        if (a.has_unviewed !== b.has_unviewed) return a.has_unviewed ? -1 : 1;
        return new Date(b.latest_at).getTime() - new Date(a.latest_at).getTime();
      });
    }
    const { data, error } = await supabase
      .from('stories')
      .select('*, author:profiles(*)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Group by user
    return [];
  },

  async getUserStories(userId: string): Promise<Story[]> {
    if (isDemoMode) {
      return mockStories.filter(s => s.user_id === userId);
    }
    const { data, error } = await supabase
      .from('stories')
      .select('*, author:profiles(*)')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createStory(story: Omit<Story, 'id' | 'views' | 'created_at' | 'expires_at'>): Promise<Story> {
    const newStory: Story = {
      ...story,
      id: `story-${Date.now()}`,
      views: 0,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    if (isDemoMode) {
      mockStories.unshift(newStory);
      return newStory;
    }
    const { data, error } = await supabase
      .from('stories')
      .insert(newStory)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async viewStory(storyId: string): Promise<void> {
    if (isDemoMode) {
      const story = mockStories.find(s => s.id === storyId);
      if (story) {
        story.views++;
        story.is_viewed = true;
      }
      return;
    }
    await supabase.rpc('increment_story_views', { story_id: storyId });
  },

  async deleteStory(storyId: string): Promise<void> {
    if (isDemoMode) {
      const idx = mockStories.findIndex(s => s.id === storyId);
      if (idx >= 0) mockStories.splice(idx, 1);
      return;
    }
    await supabase.from('stories').delete().eq('id', storyId);
  },
};

// ==========================================
// Vlog Service
// ==========================================
export const vlogService = {
  async getVlogs(options?: { limit?: number; offset?: number; tag?: string }): Promise<Vlog[]> {
    if (isDemoMode) {
      let vlogs = [...mockVlogs];
      if (options?.tag) {
        vlogs = vlogs.filter(v => v.tags.includes(options.tag!));
      }
      return vlogs.slice(options?.offset || 0, (options?.offset || 0) + (options?.limit || 20));
    }
    let query = supabase
      .from('vlogs')
      .select('*, author:profiles(*)')
      .order('created_at', { ascending: false });

    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20));

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getVlog(vlogId: string): Promise<Vlog | null> {
    if (isDemoMode) {
      return mockVlogs.find(v => v.id === vlogId) || null;
    }
    const { data, error } = await supabase
      .from('vlogs')
      .select('*, author:profiles(*)')
      .eq('id', vlogId)
      .single();
    if (error) return null;
    return data;
  },

  async getTrendingVlogs(limit: number = 10): Promise<Vlog[]> {
    if (isDemoMode) {
      return [...mockVlogs].sort((a, b) => b.views - a.views).slice(0, limit);
    }
    const { data, error } = await supabase
      .from('vlogs')
      .select('*, author:profiles(*)')
      .order('views', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async likeVlog(vlogId: string): Promise<void> {
    if (isDemoMode) {
      const vlog = mockVlogs.find(v => v.id === vlogId);
      if (vlog) {
        vlog.likes++;
        vlog.is_liked = true;
      }
      return;
    }
    await supabase.rpc('like_vlog', { vlog_id: vlogId });
  },

  async saveVlog(vlogId: string): Promise<void> {
    if (isDemoMode) {
      const vlog = mockVlogs.find(v => v.id === vlogId);
      if (vlog) vlog.is_saved = true;
      return;
    }
    await supabase.from('saved_content').insert({
      content_type: 'vlog',
      content_id: vlogId,
    });
  },

  async createVlog(vlog: Omit<Vlog, 'id' | 'views' | 'likes' | 'comments_count' | 'created_at'>): Promise<Vlog> {
    const newVlog: Vlog = {
      ...vlog,
      id: `vlog-${Date.now()}`,
      views: 0,
      likes: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      mockVlogs.unshift(newVlog);
      return newVlog;
    }
    const { data, error } = await supabase
      .from('vlogs')
      .insert(newVlog)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ==========================================
// Post Service
// ==========================================
export const postService = {
  async getFeed(options?: { limit?: number; offset?: number }): Promise<TravelPost[]> {
    if (isDemoMode) {
      return mockTravelPosts.slice(options?.offset || 0, (options?.offset || 0) + (options?.limit || 20));
    }
    const { data, error } = await supabase
      .from('travel_posts')
      .select('*, author:profiles(*), media:post_media(*)')
      .order('created_at', { ascending: false })
      .limit(options?.limit || 20);
    if (error) throw error;
    return data || [];
  },

  async getPost(postId: string): Promise<TravelPost | null> {
    if (isDemoMode) {
      return mockTravelPosts.find(p => p.id === postId) || null;
    }
    const { data, error } = await supabase
      .from('travel_posts')
      .select('*, author:profiles(*), media:post_media(*)')
      .eq('id', postId)
      .single();
    if (error) return null;
    return data;
  },

  async getUserPosts(userId: string): Promise<TravelPost[]> {
    if (isDemoMode) {
      return mockTravelPosts.filter(p => p.user_id === userId);
    }
    const { data, error } = await supabase
      .from('travel_posts')
      .select('*, author:profiles(*), media:post_media(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createPost(post: Omit<TravelPost, 'id' | 'likes' | 'comments_count' | 'shares' | 'created_at'>): Promise<TravelPost> {
    const newPost: TravelPost = {
      ...post,
      id: `post-${Date.now()}`,
      likes: 0,
      comments_count: 0,
      shares: 0,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      mockTravelPosts.unshift(newPost);
      return newPost;
    }
    const { data, error } = await supabase
      .from('travel_posts')
      .insert(newPost)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async likePost(postId: string): Promise<void> {
    if (isDemoMode) {
      const post = mockTravelPosts.find(p => p.id === postId);
      if (post) {
        post.likes++;
        post.is_liked = true;
      }
      return;
    }
    await supabase.rpc('like_post', { post_id: postId });
  },

  async savePost(postId: string): Promise<void> {
    if (isDemoMode) {
      const post = mockTravelPosts.find(p => p.id === postId);
      if (post) post.is_saved = true;
      return;
    }
    await supabase.from('saved_content').insert({
      content_type: 'post',
      content_id: postId,
    });
  },

  async getComments(postId: string): Promise<Comment[]> {
    if (isDemoMode) {
      return mockComments.filter(c => c.post_id === postId);
    }
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles(*)')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      post_id: postId,
      user_id: 'demo-user',
      author: demoUserProfile,
      content,
      likes: 0,
      replies_count: 0,
      created_at: new Date().toISOString(),
      parent_id: parentId,
    };

    if (isDemoMode) {
      mockComments.push(newComment);
      const post = mockTravelPosts.find(p => p.id === postId);
      if (post) post.comments_count++;
      return newComment;
    }
    const { data, error } = await supabase
      .from('comments')
      .insert(newComment)
      .select('*, author:profiles(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async deletePost(postId: string): Promise<void> {
    if (isDemoMode) {
      const idx = mockTravelPosts.findIndex(p => p.id === postId);
      if (idx >= 0) mockTravelPosts.splice(idx, 1);
      return;
    }
    await supabase.from('travel_posts').delete().eq('id', postId);
  },
};

// ==========================================
// Trending Service
// ==========================================
export const trendingService = {
  async getTrendingTags(): Promise<{ tag: string; count: number }[]> {
    if (isDemoMode) {
      const tagCounts: Record<string, number> = {};
      [...mockTravelPosts, ...mockVlogs].forEach(item => {
        item.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
    const { data, error } = await supabase.rpc('get_trending_tags');
    if (error) throw error;
    return data || [];
  },

  async getTrendingDestinations(): Promise<{ destination: string; posts_count: number }[]> {
    if (isDemoMode) {
      const destCounts: Record<string, number> = {};
      mockTravelPosts.forEach(post => {
        if (post.destination) {
          destCounts[post.destination] = (destCounts[post.destination] || 0) + 1;
        }
      });
      return Object.entries(destCounts)
        .map(([destination, posts_count]) => ({ destination, posts_count }))
        .sort((a, b) => b.posts_count - a.posts_count)
        .slice(0, 5);
    }
    const { data, error } = await supabase.rpc('get_trending_destinations');
    if (error) throw error;
    return data || [];
  },

  async searchContent(query: string): Promise<{ posts: TravelPost[]; vlogs: Vlog[] }> {
    if (isDemoMode) {
      const lowerQuery = query.toLowerCase();
      return {
        posts: mockTravelPosts.filter(p =>
          p.content.toLowerCase().includes(lowerQuery) ||
          p.destination?.toLowerCase().includes(lowerQuery) ||
          p.tags.some(t => t.includes(lowerQuery))
        ),
        vlogs: mockVlogs.filter(v =>
          v.title.toLowerCase().includes(lowerQuery) ||
          v.destination.toLowerCase().includes(lowerQuery) ||
          v.tags.some(t => t.includes(lowerQuery))
        ),
      };
    }
    // In production, use full-text search
    return { posts: [], vlogs: [] };
  },
};
