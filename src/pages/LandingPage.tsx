import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, Users, MapPin, MessageCircle, Camera, Compass,
  Star, ChevronRight, Play, Globe, Building2, Check, ArrowRight,
  Menu, X, Sparkles, Zap, Heart
} from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'AI-Powered Itinerary Builder',
    description: 'Generate complete day-by-day itineraries for any Indian destination. Activities, budget breakdowns, and local tips — instant.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: MapPin,
    title: 'Multi-City Trip Planning',
    description: 'Create rich itineraries with multiple stops, travel dates, and collaborative planning for your group.',
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    icon: MessageCircle,
    title: 'Real-Time Collaboration',
    description: 'Chat with co-travelers, share notes, and coordinate plans — all in one place without messy WhatsApp threads.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Camera,
    title: 'Trip Stories & Vlogs',
    description: 'Share photos, stories and travel vlogs to inspire millions of travelers across India.',
    gradient: 'from-emerald-400 to-teal-600'
  },
  {
    icon: Compass,
    title: 'Smart Budget Tracker',
    description: 'Estimate costs, split expenses, and track your travel budget with visual breakdowns and alerts.',
    gradient: 'from-teal-400 to-emerald-600'
  },
  {
    icon: Building2,
    title: 'City & Activity Discovery',
    description: 'Explore 50+ Indian cities and 200+ curated activities — from Ladakh treks to Goa beaches.',
    gradient: 'from-cyan-400 to-teal-600'
  }
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Solo Traveler · Mumbai',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    text: 'Traveloop completely changed how I plan my trips. I built my entire Ladakh itinerary in under 10 minutes — with costs, activities, and everything!',
    rating: 5
  },
  {
    name: 'Rahul Verma',
    role: 'Adventure Seeker · Delhi',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    text: 'The group trip planning is incredible. No more endless coordination — everyone can see the plan, add notes, and track the budget.',
    rating: 5
  },
  {
    name: 'Ananya Patel',
    role: 'Backpacker · Bangalore',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    text: 'Found amazing co-travelers through Traveloop for my Rajasthan road trip. The verification system gives me peace of mind as a solo female traveler.',
    rating: 5
  }
];

const STATS = [
  { value: '50K+', label: 'Indian Travelers', icon: Users },
  { value: '28+', label: 'States Covered', icon: Globe },
  { value: '12K+', label: 'Trips Planned', icon: MapPin },
  { value: '4.9', label: 'App Rating', icon: Star }
];

const DESTINATIONS = [
  { name: 'Manali', country: 'Himachal Pradesh', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=400&fit=crop', travelers: 3241 },
  { name: 'Goa', country: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=400&fit=crop', travelers: 5876 },
  { name: 'Kerala', country: 'Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=400&fit=crop', travelers: 2156 },
  { name: 'Leh-Ladakh', country: 'Jammu & Kashmir', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&h=400&fit=crop', travelers: 1934 }
];

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '1s', transform: `translateY(${-scrollY * 0.05}px)` }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px]"
          style={{ transform: `translate(-50%, -50%) rotate(${scrollY * 0.1}deg)` }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-gray-950/80 backdrop-blur-xl border-b border-white/10' : ''
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl blur-sm opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Plane className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Traveloop
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Destinations', 'Reviews', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-400 hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                  Get Started
                </div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10 py-6">
            <div className="container mx-auto px-4 space-y-4">
              {['Features', 'Destinations', 'Reviews', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="block text-gray-300 py-2 hover:text-white">
                  {item}
                </a>
              ))}
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium mt-4"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-gray-300">India's #1 Travel Planning Platform</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Main Heading with 3D effect */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              <span className="block text-white drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                Personalized Travel
              </span>
              <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.5)]"
                style={{
                  textShadow: '0 0 80px rgba(16,185,129,0.5)',
                }}
              >
                Planning Made Easy
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Dream, design and organize trips across India with ease. Multi-city itineraries, smart budgeting, and activity discovery —
              <span className="text-white"> all in one place.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => navigate('/login')}
                className="group relative w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300">
                    Start Planning Your Trip
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
              </button>
              <button className="group flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Hero Visual - 3D Card Stack */}
            <div className="relative max-w-4xl mx-auto" style={{ perspective: '1000px' }}>
              {/* Back card */}
              <div
                className="absolute inset-x-8 top-8 h-full bg-gradient-to-br from-teal-600/20 to-cyan-600/20 rounded-3xl border border-white/10 backdrop-blur-sm"
                style={{ transform: 'rotateX(5deg) translateZ(-40px)' }}
              />
              {/* Middle card */}
              <div
                className="absolute inset-x-4 top-4 h-full bg-gradient-to-br from-emerald-600/30 to-teal-600/30 rounded-3xl border border-white/10 backdrop-blur-sm"
                style={{ transform: 'rotateX(3deg) translateZ(-20px)' }}
              />
              {/* Main card */}
              <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-emerald-500/10"
                style={{ transform: 'rotateX(2deg)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=900&fit=crop"
                  alt="Travel Adventure"
                  className="w-full aspect-[16/9] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />

                {/* Floating notification cards */}
                <div className="absolute -left-4 md:left-8 top-1/4 bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-emerald-500/50">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">New Trip Match!</p>
                      <p className="text-sm text-emerald-400">Priya wants to explore Manali 🏔️</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 md:right-8 bottom-1/4 bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Trip Confirmed!</p>
                      <p className="text-sm text-gray-400">Ladakh · June 12–20</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform border border-emerald-500/20">
                  <stat.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Travel Smarter
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From finding travel partners to booking your entire trip, we've built the ultimate travel companion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity`} />

                <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">Plan your India trip in 3 simple steps</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-cyan-500/50" />

              {[
                { step: 1, title: 'Create Your Trip', desc: 'Set dates, destinations, and trip style across multiple Indian cities', icon: Users },
                { step: 2, title: 'Build Itinerary', desc: 'Add activities, estimate budgets and create a day-wise plan', icon: Heart },
                { step: 3, title: 'Share & Explore', desc: 'Share your plan, find co-travelers and enjoy the journey', icon: Plane }
              ].map((item, idx) => (
                <div key={idx} className="text-center relative group">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Popular Indian Destinations</h2>
              <p className="text-gray-400 text-lg">Trending spots our community loves</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium group">
              View All
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESTINATIONS.map((dest, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                  <p className="text-gray-400 mb-3">{dest.country}</p>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{dest.travelers.toLocaleString()} travelers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
              <Heart className="w-4 h-4" />
              Loved by Travelers
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Our Community Says
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div
                key={idx}
                className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-emerald-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-sm opacity-50" />
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="relative w-14 h-14 rounded-full object-cover ring-2 ring-white/20"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">Start free, upgrade when you need more</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                desc: 'Perfect for getting started',
                features: ['5 matches per month', 'Basic chat', 'Join group trips', 'Community access'],
                cta: 'Get Started',
                featured: false
              },
              {
                name: 'Pro',
                price: '$9.99',
                desc: 'For active travelers',
                features: ['Unlimited matches', 'Priority support', 'Create group trips', 'AI recommendations', 'No ads', 'Verified badge'],
                cta: 'Start Free Trial',
                featured: true
              },
              {
                name: 'Team',
                price: '$29.99',
                desc: 'For travel groups',
                features: ['Everything in Pro', 'Up to 10 members', 'Shared itineraries', 'Expense splitting', 'Dedicated support'],
                cta: 'Contact Sales',
                featured: false
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-8 rounded-3xl transition-all duration-300 ${
                  plan.featured
                    ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50 scale-105'
                    : 'bg-white/[0.02] border border-white/10 hover:border-white/20'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-gray-500">/month</span>}
                </div>
                <p className="text-gray-400 mb-8">{plan.desc}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.featured ? 'bg-emerald-500' : 'bg-white/10'
                      }`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto text-center p-12 rounded-[40px] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Plan Your Perfect Indian Trip?
              </h2>
              <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                Join thousands of Indian travelers who plan smarter with Traveloop.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-600 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-1 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Traveloop</span>
              </div>
              <p className="text-gray-500 text-sm">India's personalized travel planning platform — dream, design, and explore.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Mobile App', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Safety', 'Terms', 'Privacy'] }
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">&copy; 2025 Traveloop. Made with ❤️ in India.</p>
            <div className="flex items-center gap-4 text-gray-500">
              <Globe className="w-5 h-5" />
              <span className="text-sm">English (US)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}
