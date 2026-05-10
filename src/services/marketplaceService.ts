// ==========================================
// Phase 5: Monetization & Marketplace Services
// ==========================================
import { isDemoMode } from '@/lib/supabase';
import type { Profile } from '@/types';
import { mockProfiles } from './mockData';

// ==========================================
// Types
// ==========================================
export interface LocalGuide {
  id: string;
  user_id: string;
  profile: Profile;
  destinations: string[];
  languages: string[];
  specialties: string[];
  experience_years: number;
  rating: number;
  reviews_count: number;
  hourly_rate: number;
  daily_rate: number;
  currency: string;
  bio: string;
  verified: boolean;
  response_time: string;
  availability: 'available' | 'busy' | 'unavailable';
  photos: string[];
  featured_review?: {
    text: string;
    author: string;
    rating: number;
  };
}

export interface GuideBooking {
  id: string;
  guide_id: string;
  user_id: string;
  date: string;
  duration_hours: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meeting_point?: string;
  notes?: string;
  created_at: string;
}

export interface TravelInsurance {
  id: string;
  provider: string;
  provider_logo: string;
  plan_name: string;
  plan_type: 'basic' | 'standard' | 'premium' | 'comprehensive';
  coverage: {
    medical: number;
    trip_cancellation: number;
    baggage_loss: number;
    flight_delay: number;
    emergency_evacuation: number;
  };
  features: string[];
  exclusions: string[];
  price_per_day: number;
  min_days: number;
  max_days: number;
  rating: number;
  reviews_count: number;
  recommended?: boolean;
}

export interface PartnerDeal {
  id: string;
  partner_name: string;
  partner_logo: string;
  category: 'accommodation' | 'transport' | 'activity' | 'food' | 'shopping' | 'experience';
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percent: number;
  valid_until: string;
  destinations: string[];
  code?: string;
  terms: string[];
  image_url: string;
  featured: boolean;
  bookings_count: number;
}

export interface TravelPackage {
  id: string;
  title: string;
  destination: string;
  duration_days: number;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary_summary: string[];
  price_per_person: number;
  original_price: number;
  group_size: { min: number; max: number };
  difficulty: 'easy' | 'moderate' | 'challenging';
  rating: number;
  reviews_count: number;
  images: string[];
  departure_dates: string[];
  category: string;
  featured: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  booking_type: 'guide' | 'insurance' | 'package' | 'deal';
  item_id: string;
  item_name: string;
  date: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
}

// ==========================================
// Mock Data
// ==========================================
const mockGuides: LocalGuide[] = [
  {
    id: 'guide-1',
    user_id: '2',
    profile: mockProfiles[1],
    destinations: ['Manali', 'Kasol', 'Spiti Valley'],
    languages: ['English', 'Hindi', 'Punjabi'],
    specialties: ['Trekking', 'Photography', 'Cultural Tours'],
    experience_years: 8,
    rating: 4.9,
    reviews_count: 234,
    hourly_rate: 500,
    daily_rate: 3000,
    currency: 'INR',
    bio: 'Born and raised in the Himalayas. I\'ve been guiding travelers for 8 years, specializing in off-beat treks and cultural experiences. Let me show you the real mountains!',
    verified: true,
    response_time: 'Usually responds within 1 hour',
    availability: 'available',
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    ],
    featured_review: {
      text: 'Amazing guide! Ravi took us to places we never would have found on our own. Highly recommend!',
      author: 'Sarah M.',
      rating: 5,
    },
  },
  {
    id: 'guide-2',
    user_id: '3',
    profile: mockProfiles[2],
    destinations: ['Goa', 'Mumbai', 'Pune'],
    languages: ['English', 'Hindi', 'Marathi', 'Konkani'],
    specialties: ['Beach Tours', 'Nightlife', 'Food Tours', 'History'],
    experience_years: 5,
    rating: 4.7,
    reviews_count: 156,
    hourly_rate: 400,
    daily_rate: 2500,
    currency: 'INR',
    bio: 'Goa local with deep knowledge of both tourist spots and hidden gems. From Portuguese heritage to secret beaches, I\'ll make your trip unforgettable!',
    verified: true,
    response_time: 'Usually responds within 2 hours',
    availability: 'available',
    photos: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
    ],
    featured_review: {
      text: 'Priya showed us the best local food spots and hidden beaches. Best decision of our trip!',
      author: 'Mike T.',
      rating: 5,
    },
  },
  {
    id: 'guide-3',
    user_id: '4',
    profile: mockProfiles[3],
    destinations: ['Rishikesh', 'Haridwar', 'Varanasi'],
    languages: ['English', 'Hindi', 'Sanskrit'],
    specialties: ['Spiritual Tours', 'Yoga', 'Meditation', 'Temple Visits'],
    experience_years: 12,
    rating: 4.8,
    reviews_count: 312,
    hourly_rate: 600,
    daily_rate: 4000,
    currency: 'INR',
    bio: 'Yoga instructor and spiritual guide. I help travelers find inner peace through authentic ashram experiences, meditation sessions, and temple tours.',
    verified: true,
    response_time: 'Usually responds within 3 hours',
    availability: 'busy',
    photos: [
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
    ],
    featured_review: {
      text: 'Transformative experience! Ananya helped me understand the spiritual side of India.',
      author: 'Emma L.',
      rating: 5,
    },
  },
  {
    id: 'guide-4',
    user_id: '5',
    profile: mockProfiles[4],
    destinations: ['Kerala', 'Munnar', 'Alleppey', 'Kochi'],
    languages: ['English', 'Hindi', 'Malayalam'],
    specialties: ['Backwaters', 'Wildlife', 'Ayurveda', 'Tea Plantations'],
    experience_years: 6,
    rating: 4.6,
    reviews_count: 189,
    hourly_rate: 450,
    daily_rate: 2800,
    currency: 'INR',
    bio: 'Kerala native passionate about eco-tourism. I\'ll take you through serene backwaters, misty tea gardens, and introduce you to authentic Ayurvedic traditions.',
    verified: true,
    response_time: 'Usually responds within 1 hour',
    availability: 'available',
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
  },
];

const mockInsurance: TravelInsurance[] = [
  {
    id: 'ins-1',
    provider: 'ICICI Lombard',
    provider_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/ICICI_Lombard_logo.svg/200px-ICICI_Lombard_logo.svg.png',
    plan_name: 'Travel Secure Basic',
    plan_type: 'basic',
    coverage: {
      medical: 500000,
      trip_cancellation: 50000,
      baggage_loss: 25000,
      flight_delay: 5000,
      emergency_evacuation: 200000,
    },
    features: [
      '24/7 emergency assistance',
      'Cashless hospitalization',
      'Coverage for adventure sports (basic)',
      'COVID-19 coverage included',
    ],
    exclusions: ['Pre-existing conditions', 'Extreme sports', 'War zones'],
    price_per_day: 49,
    min_days: 1,
    max_days: 30,
    rating: 4.2,
    reviews_count: 1245,
  },
  {
    id: 'ins-2',
    provider: 'HDFC ERGO',
    provider_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/HDFC_ERGO_Logo.svg/200px-HDFC_ERGO_Logo.svg.png',
    plan_name: 'Travel Plus',
    plan_type: 'standard',
    coverage: {
      medical: 1000000,
      trip_cancellation: 100000,
      baggage_loss: 50000,
      flight_delay: 10000,
      emergency_evacuation: 500000,
    },
    features: [
      '24/7 emergency assistance',
      'Cashless hospitalization worldwide',
      'Adventure sports covered',
      'Trip interruption coverage',
      'Personal liability cover',
      'COVID-19 coverage included',
    ],
    exclusions: ['Pre-existing conditions', 'Professional sports'],
    price_per_day: 99,
    min_days: 1,
    max_days: 60,
    rating: 4.5,
    reviews_count: 2341,
    recommended: true,
  },
  {
    id: 'ins-3',
    provider: 'Bajaj Allianz',
    provider_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Bajaj_Allianz_logo.svg/200px-Bajaj_Allianz_logo.svg.png',
    plan_name: 'Travel Elite Premium',
    plan_type: 'premium',
    coverage: {
      medical: 2500000,
      trip_cancellation: 200000,
      baggage_loss: 100000,
      flight_delay: 25000,
      emergency_evacuation: 1000000,
    },
    features: [
      '24/7 premium concierge service',
      'Cashless hospitalization worldwide',
      'All adventure sports covered',
      'Trip interruption & curtailment',
      'Personal liability Rs 50 Lakh',
      'Hijack distress allowance',
      'Home burglary cover during travel',
      'COVID-19 comprehensive coverage',
    ],
    exclusions: ['War zones', 'Intentional self-injury'],
    price_per_day: 199,
    min_days: 1,
    max_days: 180,
    rating: 4.7,
    reviews_count: 876,
  },
];

const mockDeals: PartnerDeal[] = [
  {
    id: 'deal-1',
    partner_name: 'Zostel',
    partner_logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100',
    category: 'accommodation',
    title: '30% Off on All Zostel Properties',
    description: 'Exclusive Traveloop discount on dorm beds and private rooms across 60+ Zostel locations in India.',
    original_price: 799,
    discounted_price: 559,
    discount_percent: 30,
    valid_until: '2025-03-31',
    destinations: ['Pan India'],
    code: 'Traveloop30',
    terms: ['Valid on bookings of 2+ nights', 'Cannot be combined with other offers', 'Subject to availability'],
    image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
    featured: true,
    bookings_count: 1234,
  },
  {
    id: 'deal-2',
    partner_name: 'RedBus',
    partner_logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100',
    category: 'transport',
    title: 'Flat Rs 200 Off on Bus Tickets',
    description: 'Save on your bus journeys with exclusive RedBus discount for Traveloop users.',
    original_price: 1000,
    discounted_price: 800,
    discount_percent: 20,
    valid_until: '2025-02-28',
    destinations: ['Pan India'],
    code: 'TMBUS200',
    terms: ['Minimum booking Rs 500', 'Valid once per user', 'Not valid on already discounted tickets'],
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
    featured: false,
    bookings_count: 567,
  },
  {
    id: 'deal-3',
    partner_name: 'Thrillophilia',
    partner_logo: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=100',
    category: 'activity',
    title: '25% Off Adventure Activities',
    description: 'Paragliding, bungee jumping, rafting & more - get 25% off on all adventure bookings.',
    original_price: 3500,
    discounted_price: 2625,
    discount_percent: 25,
    valid_until: '2025-04-30',
    destinations: ['Rishikesh', 'Manali', 'Goa', 'Ladakh'],
    code: 'TMADVENTURE25',
    terms: ['Advance booking required', 'Subject to weather conditions', 'Valid on select activities'],
    image_url: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=600',
    featured: true,
    bookings_count: 892,
  },
  {
    id: 'deal-4',
    partner_name: 'EatSure',
    partner_logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100',
    category: 'food',
    title: '40% Off First 3 Orders',
    description: 'Explore local food while traveling with huge discounts on your first orders.',
    original_price: 500,
    discounted_price: 300,
    discount_percent: 40,
    valid_until: '2025-01-31',
    destinations: ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad'],
    code: 'TMFOOD40',
    terms: ['New users only', 'Max discount Rs 200 per order', 'Valid on orders above Rs 199'],
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    featured: false,
    bookings_count: 2341,
  },
  {
    id: 'deal-5',
    partner_name: 'Camp Jeeo',
    partner_logo: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=100',
    category: 'experience',
    title: 'Camping + Bonfire Package at Rs 999',
    description: 'Riverside camping experience with bonfire, music, and meals included.',
    original_price: 1999,
    discounted_price: 999,
    discount_percent: 50,
    valid_until: '2025-02-15',
    destinations: ['Rishikesh', 'Kasol', 'Bir'],
    code: 'TMCAMP50',
    terms: ['Weekend bookings only', 'Minimum 2 persons', 'Includes dinner & breakfast'],
    image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
    featured: true,
    bookings_count: 456,
  },
];

const mockPackages: TravelPackage[] = [
  {
    id: 'pkg-1',
    title: 'Spiti Valley Explorer',
    destination: 'Spiti Valley, Himachal Pradesh',
    duration_days: 8,
    description: 'Journey through the mystical Spiti Valley - ancient monasteries, high-altitude villages, and stunning Himalayan landscapes.',
    highlights: [
      'Visit Key Monastery & Tabo Monastery',
      'Explore Chandratal Lake',
      'Stay in traditional homestays',
      'Cross Kunzum Pass (4,590m)',
      'Visit world\'s highest post office at Hikkim',
    ],
    inclusions: [
      'Accommodation (7 nights)',
      'All meals',
      'Transport in tempo traveler',
      'Experienced guide',
      'Inner line permits',
      'First aid kit',
    ],
    exclusions: [
      'Travel to Manali',
      'Personal expenses',
      'Travel insurance',
      'Tips for guide',
    ],
    itinerary_summary: [
      'Day 1: Arrive Manali, acclimatization',
      'Day 2: Manali to Kaza via Kunzum Pass',
      'Day 3: Key Monastery & Kibber village',
      'Day 4: Hikkim, Komic & Langza villages',
      'Day 5: Tabo & Dhankar Monastery',
      'Day 6: Pin Valley excursion',
      'Day 7: Chandratal Lake camping',
      'Day 8: Return to Manali',
    ],
    price_per_person: 24999,
    original_price: 32999,
    group_size: { min: 4, max: 12 },
    difficulty: 'moderate',
    rating: 4.8,
    reviews_count: 156,
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    ],
    departure_dates: ['2025-05-15', '2025-06-01', '2025-06-15', '2025-07-01'],
    category: 'Adventure',
    featured: true,
  },
  {
    id: 'pkg-2',
    title: 'Kerala Backwaters & Beaches',
    destination: 'Kerala',
    duration_days: 6,
    description: 'Experience God\'s Own Country - serene backwaters, pristine beaches, lush tea gardens, and authentic Ayurvedic treatments.',
    highlights: [
      'Houseboat stay in Alleppey',
      'Tea plantation visit in Munnar',
      'Ayurvedic spa experience',
      'Kathakali dance performance',
      'Fort Kochi heritage walk',
    ],
    inclusions: [
      'Accommodation (5 nights including 1 night houseboat)',
      'Breakfast & dinner',
      'AC transport',
      'Sightseeing as per itinerary',
      'One Ayurvedic massage',
    ],
    exclusions: [
      'Flights/trains',
      'Lunch',
      'Personal expenses',
      'Camera fees at monuments',
    ],
    itinerary_summary: [
      'Day 1: Arrive Kochi, Fort Kochi exploration',
      'Day 2: Kochi to Munnar, tea gardens',
      'Day 3: Munnar sightseeing',
      'Day 4: Munnar to Alleppey houseboat',
      'Day 5: Alleppey to Kovalam beach',
      'Day 6: Kovalam, departure',
    ],
    price_per_person: 18999,
    original_price: 24999,
    group_size: { min: 2, max: 8 },
    difficulty: 'easy',
    rating: 4.6,
    reviews_count: 234,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    ],
    departure_dates: ['2025-01-10', '2025-01-25', '2025-02-14', '2025-03-01'],
    category: 'Leisure',
    featured: true,
  },
  {
    id: 'pkg-3',
    title: 'Rajasthan Royal Heritage',
    destination: 'Rajasthan',
    duration_days: 7,
    description: 'Explore the majestic forts, colorful bazaars, and royal heritage of Rajasthan - the Land of Kings.',
    highlights: [
      'Sunrise at Jaisalmer Fort',
      'Desert camping with cultural program',
      'Udaipur lake palace views',
      'Pushkar Brahma temple visit',
      'Traditional Rajasthani thali experience',
    ],
    inclusions: [
      'Accommodation (6 nights)',
      'Breakfast',
      'AC transport',
      'Desert safari with camping',
      'English-speaking guide',
    ],
    exclusions: [
      'Flights',
      'Lunch & dinner (except desert camp)',
      'Monument entry fees',
      'Personal expenses',
    ],
    itinerary_summary: [
      'Day 1: Arrive Jaipur, city tour',
      'Day 2: Jaipur - Amber Fort, Hawa Mahal',
      'Day 3: Jaipur to Jodhpur',
      'Day 4: Jodhpur to Jaisalmer',
      'Day 5: Jaisalmer fort, desert safari & camping',
      'Day 6: Jaisalmer to Udaipur',
      'Day 7: Udaipur sightseeing, departure',
    ],
    price_per_person: 21999,
    original_price: 28999,
    group_size: { min: 2, max: 15 },
    difficulty: 'easy',
    rating: 4.5,
    reviews_count: 312,
    images: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600',
    ],
    departure_dates: ['2025-02-01', '2025-02-15', '2025-03-01', '2025-10-15'],
    category: 'Heritage',
    featured: false,
  },
];

const mockBookings: Booking[] = [];

// ==========================================
// Guide Service
// ==========================================
export const guideService = {
  async getGuides(filters?: {
    destination?: string;
    specialty?: string;
    minRating?: number;
  }): Promise<LocalGuide[]> {
    if (isDemoMode) {
      let guides = [...mockGuides];
      if (filters?.destination) {
        guides = guides.filter(g =>
          g.destinations.some(d => d.toLowerCase().includes(filters.destination!.toLowerCase()))
        );
      }
      if (filters?.specialty) {
        guides = guides.filter(g =>
          g.specialties.some(s => s.toLowerCase().includes(filters.specialty!.toLowerCase()))
        );
      }
      if (filters?.minRating) {
        guides = guides.filter(g => g.rating >= filters.minRating!);
      }
      return guides;
    }
    return [];
  },

  async getGuide(guideId: string): Promise<LocalGuide | null> {
    if (isDemoMode) {
      return mockGuides.find(g => g.id === guideId) || null;
    }
    return null;
  },

  async bookGuide(booking: Omit<GuideBooking, 'id' | 'status' | 'created_at'>): Promise<GuideBooking> {
    const newBooking: GuideBooking = {
      ...booking,
      id: `booking-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      return newBooking;
    }
    return newBooking;
  },

  async getMyBookings(userId: string): Promise<GuideBooking[]> {
    return [];
  },
};

// ==========================================
// Insurance Service
// ==========================================
export const insuranceService = {
  async getPlans(filters?: {
    planType?: string;
    maxPrice?: number;
  }): Promise<TravelInsurance[]> {
    if (isDemoMode) {
      let plans = [...mockInsurance];
      if (filters?.planType) {
        plans = plans.filter(p => p.plan_type === filters.planType);
      }
      if (filters?.maxPrice) {
        plans = plans.filter(p => p.price_per_day <= filters.maxPrice!);
      }
      return plans;
    }
    return [];
  },

  async getPlan(planId: string): Promise<TravelInsurance | null> {
    if (isDemoMode) {
      return mockInsurance.find(p => p.id === planId) || null;
    }
    return null;
  },

  async calculatePremium(planId: string, days: number, travelers: number): Promise<{
    base: number;
    tax: number;
    total: number;
  }> {
    const plan = mockInsurance.find(p => p.id === planId);
    if (!plan) return { base: 0, tax: 0, total: 0 };

    const base = plan.price_per_day * days * travelers;
    const tax = base * 0.18; // 18% GST
    return { base, tax, total: base + tax };
  },

  async purchaseInsurance(params: {
    planId: string;
    days: number;
    travelers: number;
    startDate: string;
    travelerDetails: any[];
  }): Promise<Booking> {
    const newBooking: Booking = {
      id: `ins-booking-${Date.now()}`,
      user_id: 'demo-user',
      booking_type: 'insurance',
      item_id: params.planId,
      item_name: mockInsurance.find(p => p.id === params.planId)?.plan_name || '',
      date: params.startDate,
      amount: 0,
      status: 'confirmed',
      payment_status: 'paid',
      created_at: new Date().toISOString(),
    };
    mockBookings.push(newBooking);
    return newBooking;
  },
};

// ==========================================
// Deals Service
// ==========================================
export const dealsService = {
  async getDeals(filters?: {
    category?: string;
    destination?: string;
    featured?: boolean;
  }): Promise<PartnerDeal[]> {
    if (isDemoMode) {
      let deals = [...mockDeals];
      if (filters?.category) {
        deals = deals.filter(d => d.category === filters.category);
      }
      if (filters?.destination) {
        deals = deals.filter(d =>
          d.destinations.some(dest => dest.toLowerCase().includes(filters.destination!.toLowerCase()))
        );
      }
      if (filters?.featured) {
        deals = deals.filter(d => d.featured);
      }
      return deals;
    }
    return [];
  },

  async getDeal(dealId: string): Promise<PartnerDeal | null> {
    if (isDemoMode) {
      return mockDeals.find(d => d.id === dealId) || null;
    }
    return null;
  },

  async redeemDeal(dealId: string): Promise<{ code: string; success: boolean }> {
    const deal = mockDeals.find(d => d.id === dealId);
    if (deal?.code) {
      return { code: deal.code, success: true };
    }
    return { code: '', success: false };
  },
};

// ==========================================
// Packages Service
// ==========================================
export const packagesService = {
  async getPackages(filters?: {
    category?: string;
    destination?: string;
    maxPrice?: number;
    difficulty?: string;
  }): Promise<TravelPackage[]> {
    if (isDemoMode) {
      let packages = [...mockPackages];
      if (filters?.category) {
        packages = packages.filter(p => p.category.toLowerCase() === filters.category?.toLowerCase());
      }
      if (filters?.destination) {
        packages = packages.filter(p =>
          p.destination.toLowerCase().includes(filters.destination!.toLowerCase())
        );
      }
      if (filters?.maxPrice) {
        packages = packages.filter(p => p.price_per_person <= filters.maxPrice!);
      }
      if (filters?.difficulty) {
        packages = packages.filter(p => p.difficulty === filters.difficulty);
      }
      return packages;
    }
    return [];
  },

  async getPackage(packageId: string): Promise<TravelPackage | null> {
    if (isDemoMode) {
      return mockPackages.find(p => p.id === packageId) || null;
    }
    return null;
  },

  async bookPackage(params: {
    packageId: string;
    departureDate: string;
    travelers: number;
  }): Promise<Booking> {
    const pkg = mockPackages.find(p => p.id === params.packageId);
    const newBooking: Booking = {
      id: `pkg-booking-${Date.now()}`,
      user_id: 'demo-user',
      booking_type: 'package',
      item_id: params.packageId,
      item_name: pkg?.title || '',
      date: params.departureDate,
      amount: (pkg?.price_per_person || 0) * params.travelers,
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
    };
    mockBookings.push(newBooking);
    return newBooking;
  },

  async getFeaturedPackages(): Promise<TravelPackage[]> {
    return mockPackages.filter(p => p.featured);
  },
};

// ==========================================
// Bookings Service
// ==========================================
export const bookingsService = {
  async getMyBookings(userId: string): Promise<Booking[]> {
    if (isDemoMode) {
      return mockBookings.filter(b => b.user_id === userId);
    }
    return [];
  },

  async cancelBooking(bookingId: string): Promise<boolean> {
    const idx = mockBookings.findIndex(b => b.id === bookingId);
    if (idx >= 0) {
      mockBookings[idx].status = 'cancelled';
      return true;
    }
    return false;
  },
};
