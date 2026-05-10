// ==========================================
// Phase 4: Travel Utilities Services
// ==========================================
import { isDemoMode } from '@/lib/supabase';

// ==========================================
// AI Recommendation Types
// ==========================================
export interface AIRecommendation {
  id: string;
  type: 'destination' | 'activity' | 'food' | 'accommodation' | 'safety_tip' | 'hidden_gem';
  title: string;
  description: string;
  image_url?: string;
  destination: string;
  rating?: number;
  price_level?: 1 | 2 | 3 | 4;
  tags: string[];
  ai_reason: string;
  match_score: number; // 0-100
}

export interface TravelItinerarySuggestion {
  id: string;
  destination: string;
  duration_days: number;
  travel_style: string;
  budget_level: 'budget' | 'mid-range' | 'luxury';
  days: ItinerarySuggestionDay[];
  estimated_cost: {
    min: number;
    max: number;
    currency: string;
  };
  best_time_to_visit: string;
  ai_insights: string[];
}

export interface ItinerarySuggestionDay {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    duration: string;
    cost_estimate?: number;
    tips?: string;
  }[];
}

export interface WeatherForecast {
  destination: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind_speed: number;
    icon: string;
  };
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
  }[];
  travel_advisory: string;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  last_updated: string;
}

export interface PackingItem {
  id: string;
  category: string;
  item: string;
  essential: boolean;
  quantity: number;
  packed: boolean;
}

export interface PackingList {
  id: string;
  trip_id?: string;
  destination: string;
  duration_days: number;
  travel_type: string;
  weather: string;
  items: PackingItem[];
  created_at: string;
}

export interface LocalPhrase {
  english: string;
  local: string;
  pronunciation: string;
  category: 'greeting' | 'emergency' | 'food' | 'transport' | 'shopping' | 'general';
}

export interface EmergencyContact {
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  tourist_helpline?: string;
  embassy?: string;
}

// ==========================================
// Mock Data
// ==========================================
const mockRecommendations: AIRecommendation[] = [
  {
    id: 'rec-1',
    type: 'destination',
    title: 'Spiti Valley',
    description: 'A cold desert mountain valley in the Himalayas. Perfect for adventure seekers who love remote, untouched landscapes.',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
    destination: 'Himachal Pradesh',
    rating: 4.9,
    price_level: 2,
    tags: ['adventure', 'mountains', 'photography', 'offbeat'],
    ai_reason: 'Based on your love for trekking and mountain destinations, Spiti Valley offers challenging terrain and stunning monasteries.',
    match_score: 95,
  },
  {
    id: 'rec-2',
    type: 'hidden_gem',
    title: 'Mawlynnong Village',
    description: 'Known as Asia\'s cleanest village, this gem in Meghalaya offers living root bridges and stunning natural beauty.',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    destination: 'Meghalaya',
    rating: 4.7,
    price_level: 2,
    tags: ['nature', 'culture', 'offbeat', 'eco-tourism'],
    ai_reason: 'You mentioned interest in sustainable travel. This eco-friendly destination aligns with your values.',
    match_score: 88,
  },
  {
    id: 'rec-3',
    type: 'activity',
    title: 'Bungee Jumping at Rishikesh',
    description: 'India\'s highest bungee jump at 83 meters. An adrenaline-pumping experience with stunning valley views.',
    image_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600',
    destination: 'Rishikesh, Uttarakhand',
    rating: 4.8,
    price_level: 3,
    tags: ['adventure', 'thrill', 'bucket-list'],
    ai_reason: 'Your profile shows you love adventure activities. This is a must-try experience!',
    match_score: 92,
  },
  {
    id: 'rec-4',
    type: 'food',
    title: 'Street Food Tour in Old Delhi',
    description: 'Experience the legendary Chandni Chowk street food - from paranthas to jalebis, this is a foodie\'s paradise.',
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
    destination: 'Delhi',
    rating: 4.6,
    price_level: 1,
    tags: ['food', 'culture', 'budget', 'experience'],
    ai_reason: 'You marked food experiences as a priority. Delhi\'s street food is legendary!',
    match_score: 85,
  },
  {
    id: 'rec-5',
    type: 'accommodation',
    title: 'Treehouse Stay in Wayanad',
    description: 'Unique treehouse accommodations surrounded by lush forests and wildlife in Kerala\'s Wayanad district.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    destination: 'Wayanad, Kerala',
    rating: 4.5,
    price_level: 3,
    tags: ['unique-stay', 'nature', 'wildlife', 'romantic'],
    ai_reason: 'Your preference for unique accommodations makes this treehouse experience perfect for you.',
    match_score: 90,
  },
  {
    id: 'rec-6',
    type: 'safety_tip',
    title: 'Solo Travel Safety in Rajasthan',
    description: 'Essential safety tips for solo travelers exploring the desert state - from trusted transport to safe stays.',
    image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600',
    destination: 'Rajasthan',
    tags: ['safety', 'solo-travel', 'tips'],
    ai_reason: 'As a solo traveler, these curated safety tips will help you explore Rajasthan confidently.',
    match_score: 82,
  },
];

const mockItinerary: TravelItinerarySuggestion = {
  id: 'itin-1',
  destination: 'Manali & Kasol',
  duration_days: 5,
  travel_style: 'Backpacking',
  budget_level: 'budget',
  days: [
    {
      day: 1,
      title: 'Arrival & Old Manali Exploration',
      activities: [
        { time: '10:00 AM', activity: 'Arrive at Manali Bus Stand', location: 'Manali', duration: '30 min', tips: 'Book Volvo from Delhi for comfortable overnight journey' },
        { time: '11:00 AM', activity: 'Check into hostel', location: 'Old Manali', duration: '1 hr', cost_estimate: 500 },
        { time: '1:00 PM', activity: 'Lunch at Lazy Dog Lounge', location: 'Old Manali', duration: '1.5 hrs', cost_estimate: 300 },
        { time: '3:00 PM', activity: 'Explore Old Manali & Manu Temple', location: 'Old Manali', duration: '3 hrs' },
        { time: '7:00 PM', activity: 'Dinner & bonfire at hostel', location: 'Old Manali', duration: '2 hrs', cost_estimate: 250 },
      ],
    },
    {
      day: 2,
      title: 'Solang Valley Adventure',
      activities: [
        { time: '8:00 AM', activity: 'Breakfast at hostel', location: 'Old Manali', duration: '1 hr' },
        { time: '9:30 AM', activity: 'Travel to Solang Valley', location: 'Solang Valley', duration: '45 min', cost_estimate: 200 },
        { time: '10:30 AM', activity: 'Paragliding/Skiing (seasonal)', location: 'Solang Valley', duration: '2 hrs', cost_estimate: 1500 },
        { time: '1:00 PM', activity: 'Lunch at local dhaba', location: 'Solang', duration: '1 hr', cost_estimate: 200 },
        { time: '3:00 PM', activity: 'Atal Tunnel & Sissu visit', location: 'Lahaul', duration: '3 hrs', cost_estimate: 500 },
        { time: '7:00 PM', activity: 'Return & dinner', location: 'Old Manali', duration: '2 hrs', cost_estimate: 300 },
      ],
    },
    {
      day: 3,
      title: 'Manali to Kasol',
      activities: [
        { time: '9:00 AM', activity: 'Check out & travel to Kasol', location: 'Kasol', duration: '3 hrs', cost_estimate: 300 },
        { time: '12:30 PM', activity: 'Check into riverside camp', location: 'Kasol', duration: '1 hr', cost_estimate: 800 },
        { time: '2:00 PM', activity: 'Lunch at Evergreen Cafe', location: 'Kasol', duration: '1.5 hrs', cost_estimate: 350 },
        { time: '4:00 PM', activity: 'Walk along Parvati River', location: 'Kasol', duration: '2 hrs' },
        { time: '7:00 PM', activity: 'Explore Kasol market & dinner', location: 'Kasol', duration: '3 hrs', cost_estimate: 400 },
      ],
    },
    {
      day: 4,
      title: 'Kheerganga Trek',
      activities: [
        { time: '6:00 AM', activity: 'Early breakfast', location: 'Kasol', duration: '45 min' },
        { time: '7:00 AM', activity: 'Start Kheerganga trek', location: 'Barshaini', duration: '5 hrs', tips: 'Carry water, snacks, and rain gear' },
        { time: '12:00 PM', activity: 'Reach Kheerganga & lunch', location: 'Kheerganga', duration: '2 hrs', cost_estimate: 300 },
        { time: '2:00 PM', activity: 'Hot springs & rest', location: 'Kheerganga', duration: '3 hrs' },
        { time: '5:00 PM', activity: 'Sunset views & camping setup', location: 'Kheerganga', duration: '2 hrs', cost_estimate: 600 },
        { time: '8:00 PM', activity: 'Dinner & stargazing', location: 'Kheerganga', duration: '2 hrs' },
      ],
    },
    {
      day: 5,
      title: 'Return & Departure',
      activities: [
        { time: '6:00 AM', activity: 'Sunrise & breakfast', location: 'Kheerganga', duration: '1.5 hrs' },
        { time: '8:00 AM', activity: 'Trek down to Barshaini', location: 'Barshaini', duration: '3.5 hrs' },
        { time: '12:00 PM', activity: 'Lunch at Kasol', location: 'Kasol', duration: '1.5 hrs', cost_estimate: 300 },
        { time: '2:00 PM', activity: 'Depart for Bhuntar/Delhi', location: 'Bhuntar', duration: 'varies', cost_estimate: 300 },
      ],
    },
  ],
  estimated_cost: { min: 8000, max: 12000, currency: 'INR' },
  best_time_to_visit: 'March to June, September to November',
  ai_insights: [
    'Book hostels in advance during peak season (May-June)',
    'Carry cash as ATMs are unreliable in Kasol',
    'Kheerganga trek is moderate - good fitness required',
    'Try the Israeli food - Kasol is famous for it!',
    'Respect local customs and avoid loud music in villages',
  ],
};

const mockWeather: WeatherForecast = {
  destination: 'Manali',
  current: {
    temp: 12,
    condition: 'Partly Cloudy',
    humidity: 65,
    wind_speed: 8,
    icon: 'partly-cloudy',
  },
  forecast: [
    { date: '2024-12-11', high: 14, low: 4, condition: 'Sunny', icon: 'sunny', precipitation: 0 },
    { date: '2024-12-12', high: 12, low: 2, condition: 'Cloudy', icon: 'cloudy', precipitation: 20 },
    { date: '2024-12-13', high: 10, low: 0, condition: 'Snow', icon: 'snow', precipitation: 80 },
    { date: '2024-12-14', high: 8, low: -2, condition: 'Snow', icon: 'snow', precipitation: 60 },
    { date: '2024-12-15', high: 11, low: 1, condition: 'Partly Cloudy', icon: 'partly-cloudy', precipitation: 10 },
  ],
  travel_advisory: 'Snowfall expected mid-week. Carry warm layers and check road conditions before traveling to Rohtang.',
};

const mockPackingList: PackingItem[] = [
  // Clothing
  { id: 'p1', category: 'Clothing', item: 'Thermal innerwear', essential: true, quantity: 2, packed: false },
  { id: 'p2', category: 'Clothing', item: 'Fleece jacket', essential: true, quantity: 1, packed: false },
  { id: 'p3', category: 'Clothing', item: 'Waterproof jacket', essential: true, quantity: 1, packed: false },
  { id: 'p4', category: 'Clothing', item: 'Trekking pants', essential: true, quantity: 2, packed: false },
  { id: 'p5', category: 'Clothing', item: 'Warm socks', essential: true, quantity: 4, packed: false },
  { id: 'p6', category: 'Clothing', item: 'Beanie/Warm cap', essential: true, quantity: 1, packed: false },
  { id: 'p7', category: 'Clothing', item: 'Gloves', essential: true, quantity: 1, packed: false },

  // Footwear
  { id: 'p8', category: 'Footwear', item: 'Trekking shoes', essential: true, quantity: 1, packed: false },
  { id: 'p9', category: 'Footwear', item: 'Flip flops', essential: false, quantity: 1, packed: false },

  // Gear
  { id: 'p10', category: 'Gear', item: 'Backpack (40-50L)', essential: true, quantity: 1, packed: false },
  { id: 'p11', category: 'Gear', item: 'Day pack', essential: true, quantity: 1, packed: false },
  { id: 'p12', category: 'Gear', item: 'Sleeping bag (if trekking)', essential: false, quantity: 1, packed: false },
  { id: 'p13', category: 'Gear', item: 'Trekking poles', essential: false, quantity: 1, packed: false },
  { id: 'p14', category: 'Gear', item: 'Headlamp/Torch', essential: true, quantity: 1, packed: false },

  // Electronics
  { id: 'p15', category: 'Electronics', item: 'Power bank (20000mAh)', essential: true, quantity: 1, packed: false },
  { id: 'p16', category: 'Electronics', item: 'Camera', essential: false, quantity: 1, packed: false },
  { id: 'p17', category: 'Electronics', item: 'Universal adapter', essential: false, quantity: 1, packed: false },

  // Essentials
  { id: 'p18', category: 'Essentials', item: 'ID proof (Aadhar/Passport)', essential: true, quantity: 1, packed: false },
  { id: 'p19', category: 'Essentials', item: 'Cash (ATMs unreliable)', essential: true, quantity: 1, packed: false },
  { id: 'p20', category: 'Essentials', item: 'First aid kit', essential: true, quantity: 1, packed: false },
  { id: 'p21', category: 'Essentials', item: 'Sunscreen SPF 50+', essential: true, quantity: 1, packed: false },
  { id: 'p22', category: 'Essentials', item: 'Lip balm with SPF', essential: true, quantity: 1, packed: false },
  { id: 'p23', category: 'Essentials', item: 'Sunglasses', essential: true, quantity: 1, packed: false },
  { id: 'p24', category: 'Essentials', item: 'Water bottle', essential: true, quantity: 1, packed: false },
  { id: 'p25', category: 'Essentials', item: 'Snacks/Energy bars', essential: false, quantity: 5, packed: false },
];

const mockPhrases: Record<string, LocalPhrase[]> = {
  hindi: [
    { english: 'Hello', local: 'Namaste', pronunciation: 'nuh-muh-stay', category: 'greeting' },
    { english: 'Thank you', local: 'Dhanyavaad', pronunciation: 'dhun-yuh-vaad', category: 'greeting' },
    { english: 'How much?', local: 'Kitna?', pronunciation: 'kit-naa', category: 'shopping' },
    { english: 'Water', local: 'Paani', pronunciation: 'paa-nee', category: 'food' },
    { english: 'Help!', local: 'Madad!', pronunciation: 'muh-dud', category: 'emergency' },
    { english: 'Where is...?', local: 'Kahan hai...?', pronunciation: 'kuh-haan hai', category: 'general' },
    { english: 'I need a doctor', local: 'Mujhe doctor chahiye', pronunciation: 'muj-hey doctor chaa-hi-yey', category: 'emergency' },
    { english: 'Too expensive', local: 'Bahut mehenga', pronunciation: 'buh-hut meh-hen-gaa', category: 'shopping' },
    { english: 'Delicious', local: 'Swadisht', pronunciation: 'swaa-disht', category: 'food' },
    { english: 'Train station', local: 'Railway station', pronunciation: 'rail-way station', category: 'transport' },
  ],
};

const mockEmergencyContacts: Record<string, EmergencyContact> = {
  india: {
    country: 'India',
    police: '100',
    ambulance: '102',
    fire: '101',
    tourist_helpline: '1363',
    embassy: 'Varies by country',
  },
};

const currencyRates: Record<string, number> = {
  'USD_INR': 83.12,
  'EUR_INR': 90.45,
  'GBP_INR': 105.23,
  'AUD_INR': 54.67,
  'CAD_INR': 61.23,
  'SGD_INR': 62.15,
  'AED_INR': 22.63,
  'THB_INR': 2.35,
};

// ==========================================
// AI Recommendation Service
// ==========================================
export const aiRecommendationService = {
  async getPersonalizedRecommendations(userId: string, preferences?: {
    travelStyle?: string[];
    interests?: string[];
    budget?: string;
  }): Promise<AIRecommendation[]> {
    if (isDemoMode) {
      // Simulate personalization by adjusting match scores
      return mockRecommendations.map(rec => ({
        ...rec,
        match_score: Math.floor(Math.random() * 15) + 80, // 80-95
      })).sort((a, b) => b.match_score - a.match_score);
    }
    // In production, call AI service
    return [];
  },

  async getDestinationRecommendations(params: {
    month?: string;
    budget?: string;
    travelStyle?: string;
    duration?: number;
  }): Promise<AIRecommendation[]> {
    if (isDemoMode) {
      return mockRecommendations.filter(r => r.type === 'destination');
    }
    return [];
  },

  async generateItinerary(params: {
    destination: string;
    duration: number;
    budget: string;
    interests: string[];
  }): Promise<TravelItinerarySuggestion> {
    if (isDemoMode) {
      return {
        ...mockItinerary,
        destination: params.destination,
        duration_days: params.duration,
        budget_level: params.budget as any,
      };
    }
    return mockItinerary;
  },

  async getSimilarDestinations(destination: string): Promise<AIRecommendation[]> {
    if (isDemoMode) {
      return mockRecommendations.slice(0, 3);
    }
    return [];
  },
};

// ==========================================
// Weather Service
// ==========================================
export const weatherService = {
  async getWeather(destination: string): Promise<WeatherForecast> {
    if (isDemoMode) {
      return { ...mockWeather, destination };
    }
    // In production, call weather API
    return mockWeather;
  },

  async getTravelAdvisory(destination: string): Promise<string> {
    if (isDemoMode) {
      return mockWeather.travel_advisory;
    }
    return '';
  },
};

// ==========================================
// Currency Service
// ==========================================
export const currencyService = {
  async convert(amount: number, from: string, to: string): Promise<{ result: number; rate: number }> {
    const key = `${from}_${to}`;
    const reverseKey = `${to}_${from}`;

    let rate = currencyRates[key];
    if (!rate && currencyRates[reverseKey]) {
      rate = 1 / currencyRates[reverseKey];
    }
    if (!rate) rate = 1;

    return {
      result: Math.round(amount * rate * 100) / 100,
      rate,
    };
  },

  async getRates(base: string = 'INR'): Promise<CurrencyRate[]> {
    return Object.entries(currencyRates).map(([pair, rate]) => {
      const [from, to] = pair.split('_');
      return {
        from,
        to,
        rate,
        last_updated: new Date().toISOString(),
      };
    });
  },
};

// ==========================================
// Packing List Service
// ==========================================
export const packingService = {
  async generatePackingList(params: {
    destination: string;
    duration: number;
    activities: string[];
    weather: string;
  }): Promise<PackingList> {
    if (isDemoMode) {
      return {
        id: `pack-${Date.now()}`,
        destination: params.destination,
        duration_days: params.duration,
        travel_type: params.activities.join(', '),
        weather: params.weather,
        items: mockPackingList,
        created_at: new Date().toISOString(),
      };
    }
    return {
      id: '',
      destination: '',
      duration_days: 0,
      travel_type: '',
      weather: '',
      items: [],
      created_at: '',
    };
  },

  async updatePackedStatus(listId: string, itemId: string, packed: boolean): Promise<void> {
    // Update locally in demo mode
    const item = mockPackingList.find(i => i.id === itemId);
    if (item) item.packed = packed;
  },

  async addCustomItem(listId: string, item: Omit<PackingItem, 'id'>): Promise<PackingItem> {
    const newItem: PackingItem = {
      ...item,
      id: `custom-${Date.now()}`,
    };
    mockPackingList.push(newItem);
    return newItem;
  },
};

// ==========================================
// Language Service
// ==========================================
export const languageService = {
  async getPhrases(language: string): Promise<LocalPhrase[]> {
    return mockPhrases[language.toLowerCase()] || mockPhrases['hindi'];
  },

  async getAvailableLanguages(): Promise<string[]> {
    return ['Hindi', 'Tamil', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam'];
  },
};

// ==========================================
// Emergency Service
// ==========================================
export const emergencyInfoService = {
  async getEmergencyContacts(country: string): Promise<EmergencyContact> {
    return mockEmergencyContacts[country.toLowerCase()] || mockEmergencyContacts['india'];
  },

  async getNearbyHospitals(lat: number, lng: number): Promise<{ name: string; distance: string; phone: string }[]> {
    // Mock data
    return [
      { name: 'Civil Hospital', distance: '2.3 km', phone: '0177-2804251' },
      { name: 'IGMC Hospital', distance: '5.1 km', phone: '0177-2658888' },
      { name: 'Max Hospital', distance: '8.2 km', phone: '0177-2656565' },
    ];
  },

  async getNearbyPoliceStations(lat: number, lng: number): Promise<{ name: string; distance: string; phone: string }[]> {
    return [
      { name: 'Tourist Police Station', distance: '1.5 km', phone: '100' },
      { name: 'Manali Police Station', distance: '2.1 km', phone: '01902-252340' },
    ];
  },
};

// ==========================================
// Budget Calculator Service
// ==========================================
export const budgetService = {
  async estimateTripCost(params: {
    destination: string;
    duration: number;
    travelers: number;
    accommodation: 'budget' | 'mid-range' | 'luxury';
    activities: string[];
  }): Promise<{
    breakdown: { category: string; min: number; max: number }[];
    total: { min: number; max: number };
    tips: string[];
  }> {
    const multiplier = params.accommodation === 'budget' ? 1 : params.accommodation === 'mid-range' ? 2 : 4;
    const base = 2000 * params.duration * params.travelers;

    return {
      breakdown: [
        { category: 'Accommodation', min: base * 0.3 * multiplier, max: base * 0.4 * multiplier },
        { category: 'Food', min: base * 0.2, max: base * 0.3 },
        { category: 'Transport', min: base * 0.15, max: base * 0.25 },
        { category: 'Activities', min: base * 0.1, max: base * 0.2 },
        { category: 'Miscellaneous', min: base * 0.1, max: base * 0.15 },
      ],
      total: { min: base * 0.85 * multiplier, max: base * 1.3 * multiplier },
      tips: [
        'Book accommodation in advance for better rates',
        'Eat at local dhabas to save on food costs',
        'Use public transport or share taxis with other travelers',
        'Carry cash as ATMs may be unavailable in remote areas',
      ],
    };
  },
};
