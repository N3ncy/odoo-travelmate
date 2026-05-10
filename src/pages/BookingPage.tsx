import { useState, useEffect } from 'react';
import {
  Plane, Building2, MapPin, Calendar, Users, Search, Star,
  Clock, Wifi, Briefcase, ChevronRight, ArrowRight, Filter,
  Utensils, Compass, Car, ShoppingBag, Sparkles, Music,
  X, Check, CreditCard, Info
} from 'lucide-react';
import {
  flightService, hotelService, localServiceService, bookingService,
  Flight, Hotel, LocalService
} from '@/services/bookingService';
import toast from 'react-hot-toast';

type Tab = 'flights' | 'hotels' | 'services';
type ServiceCategory = 'all' | 'restaurant' | 'activity' | 'transport' | 'shopping' | 'wellness' | 'nightlife';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  restaurant: <Utensils className="w-5 h-5" />,
  activity: <Compass className="w-5 h-5" />,
  transport: <Car className="w-5 h-5" />,
  shopping: <ShoppingBag className="w-5 h-5" />,
  wellness: <Sparkles className="w-5 h-5" />,
  nightlife: <Music className="w-5 h-5" />
};

export function BookingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('flights');
  const [isLoading, setIsLoading] = useState(false);

  // Flight state
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightSearch, setFlightSearch] = useState({
    from: 'New York',
    to: '',
    date: '',
    passengers: 1,
    cabin: 'economy'
  });
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Hotel state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelSearch, setHotelSearch] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Services state
  const [services, setServices] = useState<LocalService[]>([]);
  const [serviceCity, setServiceCity] = useState('Tokyo');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('all');

  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingItem, setBookingItem] = useState<Flight | Hotel | null>(null);
  const [bookingType, setBookingType] = useState<'flight' | 'hotel'>('flight');
  const [isBooking, setIsBooking] = useState(false);

  // Load initial data
  useEffect(() => {
    loadPopularFlights();
    loadFeaturedHotels();
    loadServices('Tokyo');
  }, []);

  const loadPopularFlights = async () => {
    const data = await flightService.getPopular();
    setFlights(data);
  };

  const loadFeaturedHotels = async () => {
    const data = await hotelService.getFeatured();
    setHotels(data);
  };

  const loadServices = async (city: string) => {
    setIsLoading(true);
    const data = await localServiceService.getByCity(city);
    setServices(data);
    setIsLoading(false);
  };

  const searchFlights = async () => {
    if (!flightSearch.to) {
      toast.error('Please enter a destination');
      return;
    }
    setIsLoading(true);
    const results = await flightService.search({
      from: flightSearch.from,
      to: flightSearch.to,
      date: flightSearch.date,
      passengers: flightSearch.passengers
    });
    setFlights(results);
    setIsLoading(false);
  };

  const searchHotels = async () => {
    if (!hotelSearch.city) {
      toast.error('Please enter a city');
      return;
    }
    setIsLoading(true);
    const results = await hotelService.search({
      city: hotelSearch.city,
      checkIn: hotelSearch.checkIn,
      checkOut: hotelSearch.checkOut,
      guests: hotelSearch.guests
    });
    setHotels(results);
    setIsLoading(false);
  };

  const filterServices = () => {
    if (serviceCategory === 'all') return services;
    return services.filter(s => s.category === serviceCategory);
  };

  const handleBookFlight = (flight: Flight) => {
    setBookingItem(flight);
    setBookingType('flight');
    setShowBookingModal(true);
  };

  const handleBookHotel = (hotel: Hotel) => {
    setBookingItem(hotel);
    setBookingType('hotel');
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!bookingItem) return;
    setIsBooking(true);
    try {
      if (bookingType === 'flight') {
        const booking = await bookingService.createFlightBooking(
          bookingItem as Flight,
          flightSearch.passengers
        );
        toast.success(`Flight booked! Confirmation: ${booking.confirmation_code}`);
      } else {
        const hotel = bookingItem as Hotel;
        const booking = await bookingService.createHotelBooking(
          hotel,
          hotel.room_types[0],
          3,
          hotelSearch.guests
        );
        toast.success(`Hotel booked! Confirmation: ${booking.confirmation_code}`);
      }
      setShowBookingModal(false);
    } catch {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Book Your Trip</h1>
          <p className="text-blue-100">Flights, hotels, and local experiences - all in one place</p>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4">
          <div className="flex gap-1 bg-blue-700/30 p-1 rounded-xl w-fit">
            {[
              { id: 'flights' as Tab, label: 'Flights', icon: Plane },
              { id: 'hotels' as Tab, label: 'Hotels', icon: Building2 },
              { id: 'services' as Tab, label: 'Local Services', icon: MapPin }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Flight Search */}
        {activeTab === 'flights' && (
          <div className="space-y-6">
            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={flightSearch.from}
                      onChange={(e) => setFlightSearch({ ...flightSearch, from: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City or airport"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={flightSearch.to}
                      onChange={(e) => setFlightSearch({ ...flightSearch, to: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Where to?"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={flightSearch.date}
                      onChange={(e) => setFlightSearch({ ...flightSearch, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={flightSearch.passengers}
                      onChange={(e) => setFlightSearch({ ...flightSearch, passengers: parseInt(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={searchFlights}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Flight Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {flightSearch.to ? 'Search Results' : 'Popular Flights'}
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : flights.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No flights found. Try different search criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flights.map(flight => (
                    <div
                      key={flight.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Airline & Flight Info */}
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Plane className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{flight.airline}</p>
                            <p className="text-sm text-gray-500">{flight.flight_number}</p>
                          </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">
                              {new Date(flight.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-sm text-gray-500">{flight.departure_code}</p>
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="h-px bg-gray-300 flex-1" />
                            <div className="text-center px-3">
                              <p className="text-xs text-gray-500">{flight.duration}</p>
                              <p className="text-xs text-gray-400">
                                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                              </p>
                            </div>
                            <div className="h-px bg-gray-300 flex-1" />
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">
                              {new Date(flight.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-sm text-gray-500">{flight.arrival_code}</p>
                          </div>
                        </div>

                        {/* Price & Book */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">${flight.price}</p>
                          <p className="text-sm text-gray-500 mb-2">per person</p>
                          <button
                            onClick={() => handleBookFlight(flight)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Select
                          </button>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                        {flight.amenities.slice(0, 4).map((amenity, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            {amenity.includes('WiFi') && <Wifi className="w-3 h-3" />}
                            {amenity.includes('Baggage') && <Briefcase className="w-3 h-3" />}
                            {amenity}
                          </span>
                        ))}
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          Baggage: {flight.baggage.checked}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hotel Search */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={hotelSearch.city}
                      onChange={(e) => setHotelSearch({ ...hotelSearch, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City or country"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                  <input
                    type="date"
                    value={hotelSearch.checkIn}
                    onChange={(e) => setHotelSearch({ ...hotelSearch, checkIn: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                  <input
                    type="date"
                    value={hotelSearch.checkOut}
                    onChange={(e) => setHotelSearch({ ...hotelSearch, checkOut: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={searchHotels}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Search className="w-5 h-5" />
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Hotel Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {hotelSearch.city ? 'Search Results' : 'Featured Hotels'}
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map(hotel => (
                    <div
                      key={hotel.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      <div className="relative h-48">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-lg">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-sm font-medium">{hotel.rating}</span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <div className="flex gap-0.5">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-1">{hotel.name}</h3>
                        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {hotel.city}, {hotel.country}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">${hotel.price_per_night}</p>
                            <p className="text-xs text-gray-500">per night</p>
                          </div>
                          <button
                            onClick={() => handleBookHotel(hotel)}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Book <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local Services */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={serviceCity}
                      onChange={(e) => setServiceCity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadServices(serviceCity)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => loadServices(serviceCity)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['all', 'restaurant', 'activity', 'transport', 'shopping', 'wellness', 'nightlife'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setServiceCategory(cat as ServiceCategory)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      serviceCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat !== 'all' && SERVICE_ICONS[cat]}
                    <span className="capitalize">{cat === 'all' ? 'All Categories' : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Services Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filterServices().length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No services found for this location.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterServices().map(service => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-40">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          service.category === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                          service.category === 'activity' ? 'bg-green-100 text-green-700' :
                          service.category === 'transport' ? 'bg-blue-100 text-blue-700' :
                          service.category === 'shopping' ? 'bg-pink-100 text-pink-700' :
                          service.category === 'wellness' ? 'bg-purple-100 text-purple-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {SERVICE_ICONS[service.category]}
                          <span className="capitalize">{service.category}</span>
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-lg">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-sm font-medium">{service.rating}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {service.distance || service.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.opening_hours.split(',')[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {service.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">{service.price_range}</span>
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                          View Details <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && bookingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Confirm Booking</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {bookingType === 'flight' ? (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Plane className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{(bookingItem as Flight).airline}</p>
                      <p className="text-sm text-gray-500">{(bookingItem as Flight).flight_number}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Route</span>
                      <span className="font-medium">{(bookingItem as Flight).departure_code} → {(bookingItem as Flight).arrival_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{(bookingItem as Flight).duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Passengers</span>
                      <span className="font-medium">{flightSearch.passengers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cabin</span>
                      <span className="font-medium capitalize">{(bookingItem as Flight).cabin_class.replace('_', ' ')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Total Price</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${(bookingItem as Flight).price * flightSearch.passengers}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={(bookingItem as Hotel).image}
                      alt={(bookingItem as Hotel).name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{(bookingItem as Hotel).name}</p>
                      <p className="text-sm text-gray-500">{(bookingItem as Hotel).city}, {(bookingItem as Hotel).country}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Room Type</span>
                      <span className="font-medium">{(bookingItem as Hotel).room_types[0]?.name || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests</span>
                      <span className="font-medium">{hotelSearch.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nights</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Total Price</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${(bookingItem as Hotel).price_per_night * 3}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">This is a demo booking. No actual charges will be made.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100">
              <button
                onClick={confirmBooking}
                disabled={isBooking}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Confirm & Pay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
