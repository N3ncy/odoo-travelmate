import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Users, Shield, Tag, Package, Star, MapPin,
  Clock, Check, ChevronRight, Calendar, Copy, ExternalLink,
  BadgeCheck, Languages, Mountain, Utensils, Camera, Sparkles,
  Heart, Percent, TrendingUp, Filter, Search
} from 'lucide-react';
import {
  guideService, insuranceService, dealsService, packagesService,
  LocalGuide, TravelInsurance, PartnerDeal, TravelPackage
} from '@/services/marketplaceService';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

type Tab = 'guides' | 'packages' | 'insurance' | 'deals';

export function MarketplacePage() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('guides');
  const [loading, setLoading] = useState(true);

  // Data
  const [guides, setGuides] = useState<LocalGuide[]>([]);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [insurance, setInsurance] = useState<TravelInsurance[]>([]);
  const [deals, setDeals] = useState<PartnerDeal[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Modals
  const [selectedGuide, setSelectedGuide] = useState<LocalGuide | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<TravelInsurance | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'guides':
          const guidesData = await guideService.getGuides();
          setGuides(guidesData);
          break;
        case 'packages':
          const pkgData = await packagesService.getPackages();
          setPackages(pkgData);
          break;
        case 'insurance':
          const insData = await insuranceService.getPlans();
          setInsurance(insData);
          break;
        case 'deals':
          const dealsData = await dealsService.getDeals();
          setDeals(dealsData);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyDealCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { id: 'guides', label: 'Local Guides', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { id: 'packages', label: 'Packages', icon: Package, color: 'from-violet-500 to-purple-500' },
    { id: 'insurance', label: 'Insurance', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { id: 'deals', label: 'Deals', icon: Tag, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Marketplace</h1>
              <p className="text-rose-100">Guides, packages, insurance & exclusive deals</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
            <input
              type="text"
              placeholder="Search guides, packages, deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-rose-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Guides Tab */}
            {activeTab === 'guides' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {guides.length} Local Guides Available
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guides.map(guide => (
                    <div
                      key={guide.id}
                      onClick={() => setSelectedGuide(guide)}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={guide.photos[0] || guide.profile.avatar_url}
                          alt={guide.profile.full_name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                          {guide.verified && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            guide.availability === 'available' ? 'bg-green-100 text-green-700' :
                            guide.availability === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {guide.availability === 'available' ? 'Available Now' :
                             guide.availability === 'busy' ? 'Busy' : 'Unavailable'}
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={guide.profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.profile.full_name)}`}
                            alt={guide.profile.full_name}
                            className="w-12 h-12 rounded-full border-2 border-white shadow"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{guide.profile.full_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              {guide.rating} ({guide.reviews_count} reviews)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                          <MapPin className="w-4 h-4" />
                          {guide.destinations.slice(0, 2).join(', ')}
                          {guide.destinations.length > 2 && ` +${guide.destinations.length - 2}`}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {guide.specialties.slice(0, 3).map(spec => (
                            <span key={spec} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {spec}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(guide.daily_rate)}</span>
                            <span className="text-sm text-gray-500">/day</span>
                          </div>
                          <button className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Curated Travel Packages
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {packages.map(pkg => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={pkg.images[0]}
                          alt={pkg.title}
                          className="w-full h-48 object-cover"
                        />
                        {pkg.featured && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-violet-600 text-white text-xs rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-gray-900 text-sm font-medium rounded-full">
                          {pkg.duration_days}D/{pkg.duration_days - 1}N
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white text-sm flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {pkg.destination}
                          </p>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">{pkg.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{pkg.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            {pkg.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {pkg.group_size.min}-{pkg.group_size.max} people
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            pkg.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            pkg.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {pkg.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <span className="text-sm text-gray-400 line-through">{formatCurrency(pkg.original_price)}</span>
                            <span className="text-xl font-bold text-gray-900 ml-2">{formatCurrency(pkg.price_per_person)}</span>
                            <span className="text-sm text-gray-500">/person</span>
                          </div>
                          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance Tab */}
            {activeTab === 'insurance' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6">
                  <h2 className="text-xl font-bold mb-2">Travel with Peace of Mind</h2>
                  <p className="text-green-100">Compare and buy travel insurance from top providers</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {insurance.map(plan => (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all ${
                        plan.recommended ? 'border-green-500' : 'border-gray-100'
                      }`}
                    >
                      {plan.recommended && (
                        <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
                          Recommended
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{plan.provider}</p>
                            <h3 className="font-semibold text-gray-900">{plan.plan_name}</h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            plan.plan_type === 'basic' ? 'bg-gray-100 text-gray-600' :
                            plan.plan_type === 'standard' ? 'bg-blue-100 text-blue-600' :
                            plan.plan_type === 'premium' ? 'bg-purple-100 text-purple-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {plan.plan_type}
                          </span>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Medical Cover</span>
                            <span className="font-medium">{formatCurrency(plan.coverage.medical)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Trip Cancellation</span>
                            <span className="font-medium">{formatCurrency(plan.coverage.trip_cancellation)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Baggage Loss</span>
                            <span className="font-medium">{formatCurrency(plan.coverage.baggage_loss)}</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-6">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-2xl font-bold text-gray-900">{formatCurrency(plan.price_per_day)}</span>
                              <span className="text-sm text-gray-500">/day</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              {plan.rating}
                            </div>
                          </div>
                          <button className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                            Get Quote
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === 'deals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Exclusive Partner Deals
                  </h2>
                </div>

                {/* Featured Deals */}
                <div className="grid md:grid-cols-2 gap-6">
                  {deals.filter(d => d.featured).map(deal => (
                    <div
                      key={deal.id}
                      className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl overflow-hidden text-white"
                    >
                      <div className="flex">
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="w-1/3 object-cover"
                        />
                        <div className="flex-1 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                              {deal.category}
                            </span>
                            <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                              {deal.discount_percent}% OFF
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{deal.title}</h3>
                          <p className="text-white/80 text-sm mb-3 line-clamp-2">{deal.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-white/60 line-through text-sm">{formatCurrency(deal.original_price)}</span>
                              <span className="font-bold text-lg">{formatCurrency(deal.discounted_price)}</span>
                            </div>
                            {deal.code && (
                              <button
                                onClick={(e) => { e.stopPropagation(); copyDealCode(deal.code!); }}
                                className="flex items-center gap-1 px-3 py-1 bg-white text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50"
                              >
                                <Copy className="w-4 h-4" />
                                {deal.code}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* All Deals */}
                <div className="grid md:grid-cols-3 gap-4">
                  {deals.filter(d => !d.featured).map(deal => (
                    <div
                      key={deal.id}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                    >
                      <div className="relative h-32">
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          {deal.discount_percent}% OFF
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">{deal.partner_name}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {deal.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-2">{deal.title}</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-400 line-through text-sm">{formatCurrency(deal.original_price)}</span>
                            <span className="font-bold text-gray-900 ml-1">{formatCurrency(deal.discounted_price)}</span>
                          </div>
                          {deal.code && (
                            <button
                              onClick={() => copyDealCode(deal.code!)}
                              className="text-orange-600 text-sm font-medium"
                            >
                              Copy Code
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedGuide(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img
                src={selectedGuide.photos[0] || selectedGuide.profile.avatar_url}
                alt={selectedGuide.profile.full_name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setSelectedGuide(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={selectedGuide.profile.avatar_url}
                  alt={selectedGuide.profile.full_name}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg -mt-12"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedGuide.profile.full_name}
                    {selectedGuide.verified && <BadgeCheck className="w-5 h-5 text-green-500" />}
                  </h2>
                  <p className="text-gray-500">{selectedGuide.experience_years} years experience</p>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{selectedGuide.bio}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Languages</p>
                  <p className="font-medium">{selectedGuide.languages.join(', ')}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {selectedGuide.rating} ({selectedGuide.reviews_count} reviews)
                  </p>
                </div>
              </div>

              {selectedGuide.featured_review && (
                <div className="p-4 bg-green-50 rounded-xl mb-4">
                  <p className="text-gray-700 italic">"{selectedGuide.featured_review.text}"</p>
                  <p className="text-sm text-gray-500 mt-2">— {selectedGuide.featured_review.author}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Daily Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedGuide.daily_rate)}</p>
                </div>
                <button className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors">
                  Book This Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPackage(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img
                src={selectedPackage.images[0]}
                alt={selectedPackage.title}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setSelectedPackage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedPackage.title}</h2>
              <p className="text-gray-600 mb-4">{selectedPackage.description}</p>

              <h3 className="font-semibold text-gray-900 mb-2">Highlights</h3>
              <ul className="space-y-1 mb-4">
                {selectedPackage.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-gray-900 mb-2">Itinerary</h3>
              <div className="space-y-2 mb-4">
                {selectedPackage.itinerary_summary.map((day, i) => (
                  <p key={i} className="text-sm text-gray-600">{day}</p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-400 line-through">{formatCurrency(selectedPackage.original_price)}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedPackage.price_per_person)}</p>
                  <p className="text-sm text-gray-500">per person</p>
                </div>
                <button className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
