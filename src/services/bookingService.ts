// Phase 6: SuperApp Booking Service
import { Profile } from '@/types';

export interface Flight {
  id: string;
  airline: string;
  airline_logo: string;
  flight_number: string;
  departure_city: string;
  departure_airport: string;
  departure_code: string;
  departure_time: string;
  arrival_city: string;
  arrival_airport: string;
  arrival_code: string;
  arrival_time: string;
  duration: string;
  stops: number;
  stop_cities?: string[];
  price: number;
  currency: string;
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first';
  seats_available: number;
  amenities: string[];
  baggage: {
    carry_on: string;
    checked: string;
  };
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  images: string[];
  address: string;
  city: string;
  country: string;
  rating: number;
  reviews_count: number;
  stars: number;
  price_per_night: number;
  currency: string;
  amenities: string[];
  room_types: RoomType[];
  check_in_time: string;
  check_out_time: string;
  cancellation_policy: string;
  distance_from_center: string;
  coordinates: { lat: number; lng: number };
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  max_guests: number;
  bed_type: string;
  size_sqm: number;
  price_per_night: number;
  amenities: string[];
  images: string[];
  available: boolean;
}

export interface LocalService {
  id: string;
  category: 'restaurant' | 'activity' | 'transport' | 'shopping' | 'wellness' | 'nightlife';
  name: string;
  image: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  reviews_count: number;
  price_range: '$' | '$$' | '$$$' | '$$$$';
  opening_hours: string;
  phone?: string;
  website?: string;
  tags: string[];
  distance?: string;
  coordinates: { lat: number; lng: number };
}

export interface Booking {
  id: string;
  user_id: string;
  type: 'flight' | 'hotel' | 'service';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  item_id: string;
  item_details: Flight | Hotel | LocalService;
  booking_date: string;
  travel_date: string;
  return_date?: string;
  guests: number;
  total_price: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  confirmation_code: string;
  notes?: string;
  created_at: string;
}

// Mock data
const mockFlights: Flight[] = [
  {
    id: 'fl-1',
    airline: 'Emirates',
    airline_logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop',
    flight_number: 'EK 203',
    departure_city: 'New York',
    departure_airport: 'John F. Kennedy International',
    departure_code: 'JFK',
    departure_time: '2024-03-15T22:30:00',
    arrival_city: 'Dubai',
    arrival_airport: 'Dubai International',
    arrival_code: 'DXB',
    arrival_time: '2024-03-16T19:45:00',
    duration: '12h 15m',
    stops: 0,
    price: 850,
    currency: 'USD',
    cabin_class: 'economy',
    seats_available: 45,
    amenities: ['In-flight Entertainment', 'WiFi', 'USB Power', 'Meals Included'],
    baggage: { carry_on: '7kg', checked: '30kg' }
  },
  {
    id: 'fl-2',
    airline: 'Singapore Airlines',
    airline_logo: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=100&h=100&fit=crop',
    flight_number: 'SQ 25',
    departure_city: 'New York',
    departure_airport: 'John F. Kennedy International',
    departure_code: 'JFK',
    departure_time: '2024-03-15T00:05:00',
    arrival_city: 'Singapore',
    arrival_airport: 'Changi Airport',
    arrival_code: 'SIN',
    arrival_time: '2024-03-16T06:30:00',
    duration: '18h 25m',
    stops: 0,
    price: 1250,
    currency: 'USD',
    cabin_class: 'economy',
    seats_available: 28,
    amenities: ['In-flight Entertainment', 'WiFi', 'Power Outlets', 'Premium Meals', 'Amenity Kit'],
    baggage: { carry_on: '7kg', checked: '30kg' }
  },
  {
    id: 'fl-3',
    airline: 'British Airways',
    airline_logo: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=100&h=100&fit=crop',
    flight_number: 'BA 178',
    departure_city: 'New York',
    departure_airport: 'John F. Kennedy International',
    departure_code: 'JFK',
    departure_time: '2024-03-15T19:00:00',
    arrival_city: 'London',
    arrival_airport: 'Heathrow Airport',
    arrival_code: 'LHR',
    arrival_time: '2024-03-16T07:05:00',
    duration: '7h 05m',
    stops: 0,
    price: 580,
    currency: 'USD',
    cabin_class: 'economy',
    seats_available: 62,
    amenities: ['In-flight Entertainment', 'Meals', 'Beverages'],
    baggage: { carry_on: '6kg', checked: '23kg' }
  },
  {
    id: 'fl-4',
    airline: 'Qatar Airways',
    airline_logo: 'https://images.unsplash.com/photo-1540339832862-474599807836?w=100&h=100&fit=crop',
    flight_number: 'QR 702',
    departure_city: 'New York',
    departure_airport: 'John F. Kennedy International',
    departure_code: 'JFK',
    departure_time: '2024-03-15T21:55:00',
    arrival_city: 'Tokyo',
    arrival_airport: 'Narita International',
    arrival_code: 'NRT',
    arrival_time: '2024-03-17T06:20:00',
    duration: '18h 25m',
    stops: 1,
    stop_cities: ['Doha'],
    price: 1100,
    currency: 'USD',
    cabin_class: 'economy',
    seats_available: 35,
    amenities: ['In-flight Entertainment', 'WiFi', 'USB Power', 'Gourmet Meals', 'Amenity Kit'],
    baggage: { carry_on: '7kg', checked: '30kg' }
  },
  {
    id: 'fl-5',
    airline: 'Lufthansa',
    airline_logo: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=100&h=100&fit=crop',
    flight_number: 'LH 405',
    departure_city: 'New York',
    departure_airport: 'John F. Kennedy International',
    departure_code: 'JFK',
    departure_time: '2024-03-15T17:35:00',
    arrival_city: 'Frankfurt',
    arrival_airport: 'Frankfurt Airport',
    arrival_code: 'FRA',
    arrival_time: '2024-03-16T07:10:00',
    duration: '7h 35m',
    stops: 0,
    price: 620,
    currency: 'USD',
    cabin_class: 'economy',
    seats_available: 48,
    amenities: ['In-flight Entertainment', 'Meals', 'Beverages', 'USB Power'],
    baggage: { carry_on: '8kg', checked: '23kg' }
  }
];

const mockHotels: Hotel[] = [
  {
    id: 'htl-1',
    name: 'The Ritz-Carlton Tokyo',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop'
    ],
    address: '9-7-1 Akasaka, Minato-ku',
    city: 'Tokyo',
    country: 'Japan',
    rating: 4.9,
    reviews_count: 2847,
    stars: 5,
    price_per_night: 650,
    currency: 'USD',
    amenities: ['Spa', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'WiFi', 'Concierge', 'Valet Parking'],
    room_types: [
      { id: 'rm-1', name: 'Deluxe Room', description: 'City view room with modern amenities', max_guests: 2, bed_type: 'King', size_sqm: 52, price_per_night: 650, amenities: ['City View', 'Mini Bar', 'Rain Shower'], images: [], available: true },
      { id: 'rm-2', name: 'Club Suite', description: 'Luxurious suite with club lounge access', max_guests: 3, bed_type: 'King', size_sqm: 80, price_per_night: 1200, amenities: ['Club Lounge', 'Butler Service', 'Separate Living'], images: [], available: true }
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    cancellation_policy: 'Free cancellation up to 48 hours before check-in',
    distance_from_center: '2.5 km',
    coordinates: { lat: 35.6762, lng: 139.7673 }
  },
  {
    id: 'htl-2',
    name: 'Marina Bay Sands',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop'
    ],
    address: '10 Bayfront Avenue',
    city: 'Singapore',
    country: 'Singapore',
    rating: 4.7,
    reviews_count: 15234,
    stars: 5,
    price_per_night: 450,
    currency: 'USD',
    amenities: ['Infinity Pool', 'Casino', 'Spa', 'Multiple Restaurants', 'Shopping Mall', 'SkyPark', 'Gym'],
    room_types: [
      { id: 'rm-3', name: 'Deluxe Room', description: 'Stunning city or garden view', max_guests: 2, bed_type: 'King or Twin', size_sqm: 39, price_per_night: 450, amenities: ['City View', 'Rain Shower', 'Mini Bar'], images: [], available: true },
      { id: 'rm-4', name: 'Premier Room', description: 'Higher floor with panoramic views', max_guests: 2, bed_type: 'King', size_sqm: 39, price_per_night: 550, amenities: ['Marina View', 'Premium Amenities'], images: [], available: true }
    ],
    check_in_time: '15:00',
    check_out_time: '11:00',
    cancellation_policy: 'Free cancellation up to 24 hours before check-in',
    distance_from_center: '0 km (City Center)',
    coordinates: { lat: 1.2834, lng: 103.8607 }
  },
  {
    id: 'htl-3',
    name: 'Burj Al Arab Jumeirah',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop'
    ],
    address: 'Jumeirah Beach Road',
    city: 'Dubai',
    country: 'UAE',
    rating: 4.9,
    reviews_count: 8456,
    stars: 5,
    price_per_night: 1500,
    currency: 'USD',
    amenities: ['Private Beach', 'Helicopter Transfer', 'Butler Service', '9 Restaurants', 'Spa', 'Pool', 'Chauffeur'],
    room_types: [
      { id: 'rm-5', name: 'Deluxe Suite', description: 'Duplex suite with Arabian Gulf views', max_guests: 2, bed_type: 'King', size_sqm: 170, price_per_night: 1500, amenities: ['Ocean View', 'Butler', 'Jacuzzi'], images: [], available: true }
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    cancellation_policy: 'Free cancellation up to 72 hours before check-in',
    distance_from_center: '15 km',
    coordinates: { lat: 25.1412, lng: 55.1853 }
  },
  {
    id: 'htl-4',
    name: 'Aman Tokyo',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop'
    ],
    address: 'The Otemachi Tower, 1-5-6 Otemachi',
    city: 'Tokyo',
    country: 'Japan',
    rating: 4.8,
    reviews_count: 1234,
    stars: 5,
    price_per_night: 950,
    currency: 'USD',
    amenities: ['Spa', 'Pool', 'Restaurant', 'Bar', 'Fitness Center', 'Garden', 'Library'],
    room_types: [
      { id: 'rm-6', name: 'Deluxe Room', description: 'Minimalist luxury with city views', max_guests: 2, bed_type: 'King', size_sqm: 71, price_per_night: 950, amenities: ['Furo Bath', 'City View', 'Living Area'], images: [], available: true }
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    cancellation_policy: 'Free cancellation up to 48 hours before check-in',
    distance_from_center: '1 km',
    coordinates: { lat: 35.6867, lng: 139.7639 }
  },
  {
    id: 'htl-5',
    name: 'Four Seasons Bali',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop'
    ],
    address: 'Jimbaran Bay',
    city: 'Bali',
    country: 'Indonesia',
    rating: 4.8,
    reviews_count: 3567,
    stars: 5,
    price_per_night: 580,
    currency: 'USD',
    amenities: ['Private Beach', 'Infinity Pool', 'Spa', 'Multiple Restaurants', 'Water Sports', 'Yoga Classes'],
    room_types: [
      { id: 'rm-7', name: 'Premier Villa', description: 'Private villa with plunge pool', max_guests: 2, bed_type: 'King', size_sqm: 139, price_per_night: 580, amenities: ['Private Pool', 'Garden', 'Ocean View'], images: [], available: true }
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    cancellation_policy: 'Free cancellation up to 48 hours before check-in',
    distance_from_center: '12 km',
    coordinates: { lat: -8.7915, lng: 115.1621 }
  }
];

const mockLocalServices: LocalService[] = [
  {
    id: 'svc-1',
    category: 'restaurant',
    name: 'Sukiyabashi Jiro',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop',
    description: 'World-famous 3-Michelin star sushi restaurant run by Jiro Ono',
    address: 'Tsukamoto Sogyo Building, 4-2-15 Ginza',
    city: 'Tokyo',
    rating: 4.9,
    reviews_count: 1547,
    price_range: '$$$$',
    opening_hours: '11:30-14:00, 17:30-20:30',
    phone: '+81-3-3535-3600',
    tags: ['Sushi', 'Fine Dining', 'Omakase', 'Michelin Star'],
    distance: '2.3 km',
    coordinates: { lat: 35.6721, lng: 139.7636 }
  },
  {
    id: 'svc-2',
    category: 'activity',
    name: 'Mount Fuji Day Trip',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop',
    description: 'Full-day guided tour to Mount Fuji with stunning views and cultural experiences',
    address: 'Pickup from major Tokyo hotels',
    city: 'Tokyo',
    rating: 4.7,
    reviews_count: 3245,
    price_range: '$$',
    opening_hours: '07:00-19:00',
    website: 'https://example.com',
    tags: ['Day Trip', 'Nature', 'Photography', 'Cultural'],
    distance: '100 km',
    coordinates: { lat: 35.3606, lng: 138.7274 }
  },
  {
    id: 'svc-3',
    category: 'wellness',
    name: 'Sensoji Temple Meditation',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
    description: 'Traditional Zen meditation session at Tokyo\'s oldest temple',
    address: '2-3-1 Asakusa, Taito City',
    city: 'Tokyo',
    rating: 4.8,
    reviews_count: 892,
    price_range: '$',
    opening_hours: '06:00-17:00',
    tags: ['Meditation', 'Temple', 'Spiritual', 'Cultural'],
    distance: '5.1 km',
    coordinates: { lat: 35.7148, lng: 139.7967 }
  },
  {
    id: 'svc-4',
    category: 'transport',
    name: 'Private Airport Transfer',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop',
    description: 'Luxury private car service from Narita/Haneda airports to any Tokyo destination',
    address: 'All airports covered',
    city: 'Tokyo',
    rating: 4.9,
    reviews_count: 2156,
    price_range: '$$$',
    opening_hours: '24/7',
    phone: '+81-3-1234-5678',
    tags: ['Airport', 'Private Car', 'Luxury', 'Transfer'],
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  {
    id: 'svc-5',
    category: 'shopping',
    name: 'Tsukiji Outer Market',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    description: 'Famous fish market with fresh seafood, street food, and cooking supplies',
    address: '4-16-2 Tsukiji, Chuo City',
    city: 'Tokyo',
    rating: 4.6,
    reviews_count: 8934,
    price_range: '$$',
    opening_hours: '05:00-14:00',
    tags: ['Market', 'Seafood', 'Street Food', 'Shopping'],
    distance: '3.2 km',
    coordinates: { lat: 35.6654, lng: 139.7707 }
  },
  {
    id: 'svc-6',
    category: 'nightlife',
    name: 'Robot Restaurant',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
    description: 'Unique entertainment experience with robots, dancers, and neon lights',
    address: 'Shinjuku Robot Building, 1-7-1 Kabukicho',
    city: 'Tokyo',
    rating: 4.4,
    reviews_count: 5672,
    price_range: '$$$',
    opening_hours: '16:00-23:00',
    phone: '+81-3-3200-5500',
    tags: ['Entertainment', 'Show', 'Unique', 'Nightlife'],
    distance: '4.8 km',
    coordinates: { lat: 35.6938, lng: 139.7034 }
  },
  {
    id: 'svc-7',
    category: 'restaurant',
    name: 'Gordon Ramsay Bar & Grill',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    description: 'Celebrity chef restaurant offering British cuisine with a modern twist',
    address: 'Marina Bay Sands, Tower 2',
    city: 'Singapore',
    rating: 4.5,
    reviews_count: 2341,
    price_range: '$$$$',
    opening_hours: '12:00-14:30, 18:00-22:30',
    tags: ['British', 'Fine Dining', 'Celebrity Chef', 'Steak'],
    distance: '0.5 km',
    coordinates: { lat: 1.2834, lng: 103.8607 }
  },
  {
    id: 'svc-8',
    category: 'activity',
    name: 'Gardens by the Bay',
    image: 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=800&h=600&fit=crop',
    description: 'Futuristic nature park featuring Supertrees, conservatories, and light shows',
    address: '18 Marina Gardens Drive',
    city: 'Singapore',
    rating: 4.8,
    reviews_count: 45678,
    price_range: '$$',
    opening_hours: '05:00-02:00',
    website: 'https://gardensbythebay.com.sg',
    tags: ['Nature', 'Gardens', 'Light Show', 'Photography'],
    distance: '1.2 km',
    coordinates: { lat: 1.2816, lng: 103.8636 }
  }
];

// Service functions
export const flightService = {
  async search(params: {
    from: string;
    to: string;
    date: string;
    passengers: number;
    cabin_class?: string;
  }): Promise<Flight[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Filter mock flights based on search (simplified)
    return mockFlights.filter(f =>
      f.departure_city.toLowerCase().includes(params.from.toLowerCase()) ||
      f.departure_code.toLowerCase() === params.from.toLowerCase()
    );
  },

  async getById(id: string): Promise<Flight | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFlights.find(f => f.id === id) || null;
  },

  async getPopular(): Promise<Flight[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFlights.slice(0, 4);
  }
};

export const hotelService = {
  async search(params: {
    city: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }): Promise<Hotel[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockHotels.filter(h =>
      h.city.toLowerCase().includes(params.city.toLowerCase()) ||
      h.country.toLowerCase().includes(params.city.toLowerCase())
    );
  },

  async getById(id: string): Promise<Hotel | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockHotels.find(h => h.id === id) || null;
  },

  async getPopular(): Promise<Hotel[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockHotels.slice(0, 4);
  },

  async getFeatured(): Promise<Hotel[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockHotels;
  }
};

export const localServiceService = {
  async search(params: {
    city: string;
    category?: string;
  }): Promise<LocalService[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    let results = mockLocalServices.filter(s =>
      s.city.toLowerCase().includes(params.city.toLowerCase())
    );
    if (params.category) {
      results = results.filter(s => s.category === params.category);
    }
    return results;
  },

  async getByCity(city: string): Promise<LocalService[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockLocalServices.filter(s =>
      s.city.toLowerCase().includes(city.toLowerCase())
    );
  },

  async getById(id: string): Promise<LocalService | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLocalServices.find(s => s.id === id) || null;
  },

  async getCategories(): Promise<string[]> {
    return ['restaurant', 'activity', 'transport', 'shopping', 'wellness', 'nightlife'];
  }
};

export const bookingService = {
  async createFlightBooking(flight: Flight, passengers: number): Promise<Booking> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      id: `bk-${Date.now()}`,
      user_id: 'current-user',
      type: 'flight',
      status: 'confirmed',
      item_id: flight.id,
      item_details: flight,
      booking_date: new Date().toISOString(),
      travel_date: flight.departure_time,
      guests: passengers,
      total_price: flight.price * passengers,
      currency: flight.currency,
      payment_status: 'paid',
      confirmation_code: `TM${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      created_at: new Date().toISOString()
    };
  },

  async createHotelBooking(hotel: Hotel, room: RoomType, nights: number, guests: number): Promise<Booking> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      id: `bk-${Date.now()}`,
      user_id: 'current-user',
      type: 'hotel',
      status: 'confirmed',
      item_id: hotel.id,
      item_details: hotel,
      booking_date: new Date().toISOString(),
      travel_date: new Date().toISOString(),
      guests: guests,
      total_price: room.price_per_night * nights,
      currency: hotel.currency,
      payment_status: 'paid',
      confirmation_code: `TM${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      created_at: new Date().toISOString()
    };
  },

  async getUserBookings(): Promise<Booking[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  }
};
