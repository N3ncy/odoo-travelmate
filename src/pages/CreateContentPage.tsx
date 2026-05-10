import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon, Video, FileText, MapPin, Tag,
  X, Plus, Upload, Camera, ArrowLeft, Send, Sparkles
} from 'lucide-react';
import { postService, storyService, vlogService, PostMedia } from '@/services/contentService';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

type ContentType = 'post' | 'story' | 'vlog';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
  'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
];

export function CreateContentPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [step, setStep] = useState(1);

  // Post state
  const [postContent, setPostContent] = useState('');
  const [postMedia, setPostMedia] = useState<PostMedia[]>([]);
  const [postLocation, setPostLocation] = useState('');
  const [postDestination, setPostDestination] = useState('');
  const [postTags, setPostTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Story state
  const [storyImage, setStoryImage] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyLocation, setStoryLocation] = useState('');

  // Vlog state
  const [vlogTitle, setVlogTitle] = useState('');
  const [vlogDescription, setVlogDescription] = useState('');
  const [vlogThumbnail, setVlogThumbnail] = useState('');
  const [vlogDestination, setVlogDestination] = useState('');
  const [vlogTags, setVlogTags] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const addTag = (tag: string) => {
    const cleanTag = tag.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanTag && !postTags.includes(cleanTag)) {
      if (contentType === 'vlog') {
        setVlogTags([...vlogTags, cleanTag]);
      } else {
        setPostTags([...postTags, cleanTag]);
      }
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (contentType === 'vlog') {
      setVlogTags(vlogTags.filter(t => t !== tag));
    } else {
      setPostTags(postTags.filter(t => t !== tag));
    }
  };

  const addSampleImage = (url: string) => {
    if (contentType === 'story') {
      setStoryImage(url);
    } else if (contentType === 'vlog') {
      setVlogThumbnail(url);
    } else {
      setPostMedia([...postMedia, {
        id: `media-${Date.now()}`,
        url,
        type: 'image',
        order: postMedia.length + 1,
      }]);
    }
  };

  const removeMedia = (id: string) => {
    setPostMedia(postMedia.filter(m => m.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (contentType === 'post') {
        await postService.createPost({
          user_id: profile?.id || 'demo-user',
          content: postContent,
          media: postMedia,
          location: postLocation || undefined,
          destination: postDestination || undefined,
          tags: postTags,
          post_type: postMedia.length > 1 ? 'album' : postMedia.length === 1 ? 'photo' : 'text',
        });
        toast.success('Post created successfully!');
      } else if (contentType === 'story') {
        await storyService.createStory({
          user_id: profile?.id || 'demo-user',
          media_url: storyImage,
          media_type: 'image',
          caption: storyCaption || undefined,
          location: storyLocation || undefined,
        });
        toast.success('Story created successfully!');
      } else if (contentType === 'vlog') {
        await vlogService.createVlog({
          user_id: profile?.id || 'demo-user',
          title: vlogTitle,
          description: vlogDescription,
          thumbnail_url: vlogThumbnail,
          destination: vlogDestination,
          tags: vlogTags,
        });
        toast.success('Vlog created successfully!');
      }

      navigate('/feed');
    } catch (error) {
      console.error('Failed to create content:', error);
      toast.error('Failed to create content');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (contentType === 'post') {
      return postContent.trim().length > 0 || postMedia.length > 0;
    } else if (contentType === 'story') {
      return storyImage.length > 0;
    } else if (contentType === 'vlog') {
      return vlogTitle.trim().length > 0 && vlogThumbnail.length > 0 && vlogDestination.trim().length > 0;
    }
    return false;
  };

  // Content type selection
  if (!contentType) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Create Content</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What would you like to create?</h2>
            <p className="text-gray-500 mb-8">Share your travel experiences with the community</p>

            <div className="space-y-4">
              <button
                onClick={() => setContentType('post')}
                className="w-full flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Create Post</h3>
                  <p className="text-sm text-gray-500">Share photos, tips, and travel updates</p>
                </div>
              </button>

              <button
                onClick={() => setContentType('story')}
                className="w-full flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-pink-500 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Add Story</h3>
                  <p className="text-sm text-gray-500">Share moments that disappear in 24 hours</p>
                </div>
              </button>

              <button
                onClick={() => setContentType('vlog')}
                className="w-full flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-violet-500 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Video className="w-7 h-7 text-violet-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Create Vlog</h3>
                  <p className="text-sm text-gray-500">Share detailed travel guides and experiences</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Post creation
  if (contentType === 'post') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setContentType(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Create Post</h1>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Post'}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=8b5cf6&color=fff`}
                alt={profile?.full_name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{profile?.full_name || 'Demo User'}</p>
                <p className="text-sm text-gray-500">Posting publicly</p>
              </div>
            </div>

            {/* Content */}
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind? Share your travel experience..."
              className="w-full h-40 p-4 bg-white border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />

            {/* Media */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Add Photos</h3>
              {postMedia.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {postMedia.map(media => (
                    <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={media.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeMedia(media.id)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mb-2">Select from sample images (demo):</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SAMPLE_IMAGES.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => addSampleImage(url)}
                    className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-emerald-500"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="Where are you?"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  value={postDestination}
                  onChange={(e) => setPostDestination(e.target.value)}
                  placeholder="e.g., Manali, Goa"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {postTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag(tagInput)}
                  placeholder="Add tags (press Enter)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Story creation
  if (contentType === 'story') {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-white mb-6">
            <button onClick={() => setContentType(null)} className="p-2 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Add Story</h1>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || submitting}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? 'Sharing...' : 'Share'}
            </button>
          </div>

          <div className="max-w-md mx-auto">
            {/* Preview */}
            <div className="aspect-[9/16] bg-gray-800 rounded-2xl overflow-hidden mb-6 relative">
              {storyImage ? (
                <>
                  <img src={storyImage} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setStoryImage('')}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {/* Caption overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <input
                      type="text"
                      value={storyCaption}
                      onChange={(e) => setStoryCaption(e.target.value)}
                      placeholder="Add a caption..."
                      className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none text-lg"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-white/60" />
                      <input
                        type="text"
                        value={storyLocation}
                        onChange={(e) => setStoryLocation(e.target.value)}
                        placeholder="Add location"
                        className="bg-transparent text-white/80 placeholder-white/40 border-none outline-none text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
                  <Camera className="w-16 h-16 mb-4" />
                  <p>Select an image for your story</p>
                </div>
              )}
            </div>

            {/* Image selection */}
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-white/60 text-sm mb-3">Select from sample images (demo):</p>
              <div className="grid grid-cols-5 gap-2">
                {SAMPLE_IMAGES.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => addSampleImage(url)}
                    className={`aspect-square rounded-lg overflow-hidden ${
                      storyImage === url ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vlog creation
  if (contentType === 'vlog') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setContentType(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Create Vlog</h1>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Publishing...' : 'Publish'}
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Thumbnail */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Thumbnail</h3>
              {vlogThumbnail ? (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <img src={vlogThumbnail} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setVlogThumbnail('')}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-gray-400">
                    <Video className="w-12 h-12 mx-auto mb-2" />
                    <p>Select a thumbnail</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 mb-2">Select from sample images (demo):</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SAMPLE_IMAGES.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setVlogThumbnail(url)}
                    className={`w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 ${
                      vlogThumbnail === url ? 'ring-2 ring-violet-500' : ''
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={vlogTitle}
                onChange={(e) => setVlogTitle(e.target.value)}
                placeholder="Give your vlog an engaging title..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 text-lg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={vlogDescription}
                onChange={(e) => setVlogDescription(e.target.value)}
                placeholder="Describe your travel experience, tips, and highlights..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={vlogDestination}
                  onChange={(e) => setVlogDestination(e.target.value)}
                  placeholder="e.g., Manali, Himachal Pradesh"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {vlogTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag(tagInput)}
                  placeholder="Add tags (press Enter)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
