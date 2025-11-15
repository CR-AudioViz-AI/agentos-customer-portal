'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Search, Home, Building2, MapPin, Bed, Bath, Maximize,
  Heart, Calendar, FileText, MessageCircle, DollarSign, Filter
} from 'lucide-react';

interface Property {
  id: string;
  category: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  list_price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  property_type: string;
  primary_photo_url: string | null;
}

interface Transaction {
  id: string;
  stage: string;
  property_id: string;
  list_price: number;
  offer_price: number | null;
  closing_date: string | null;
  contract_date: string | null;
}

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('search');
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [minBeds, setMinBeds] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const floridaCities = [
    'Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Myers',
    'Naples', 'Sarasota', 'Tallahassee', 'Fort Lauderdale', 'West Palm Beach'
  ];

  useEffect(() => {
    loadProperties();
  }, [selectedCity, priceRange, minBeds]);

  async function loadProperties() {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .gte('list_price', priceRange[0])
        .lte('list_price', priceRange[1])
        .order('created_at', { ascending: false });

      if (selectedCity !== 'all') {
        query = query.eq('city', selectedCity);
      }

      if (minBeds > 0) {
        query = query.gte('bedrooms', minBeds);
      }

      const { data } = await query.limit(50);
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(propertyId: string) {
    setFavorites(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }

  const filteredProperties = properties.filter(p =>
    searchQuery === '' ||
    p.address_line1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-700">AgentOS Customer Portal</h1>
              <p className="text-sm text-gray-600">Find your dream property in Florida</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Heart className="w-4 h-4" />
                Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8">
            {['search', 'favorites', 'my-transactions', 'documents', 'messages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'search' && (
          <>
            {/* Search & Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by address or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Cities</option>
                    {floridaCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <select
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="250000">$250,000</option>
                    <option value="500000">$500,000</option>
                    <option value="750000">$750,000</option>
                    <option value="1000000">$1,000,000</option>
                    <option value="2000000">$2,000,000</option>
                    <option value="5000000">$5,000,000+</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Bedrooms
                  </label>
                  <select
                    value={minBeds}
                    onChange={(e) => setMinBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="0">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="all">All Types</option>
                    <option value="single_family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi_family">Multi-Family</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredProperties.length}</span> properties
                  {selectedCity !== 'all' && ` in ${selectedCity}`}
                </p>
              </div>
            </div>

            {/* Property Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Property Image */}
                    <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <Home className="w-16 h-16 text-green-600 opacity-50" />
                      <button
                        onClick={() => toggleFavorite(property.id)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.includes(property.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Property Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-xl text-gray-900">
                          ${property.list_price.toLocaleString()}
                        </h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
                          {property.category.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-1">{property.address_line1}</p>
                      <p className="text-sm text-gray-500 mb-3">
                        {property.city}, {property.state} {property.zip_code}
                      </p>

                      {/* Property Features */}
                      {property.bedrooms && (
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} bath</span>
                          </div>
                          {property.square_feet && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Maximize className="w-4 h-4" />
                              <span>{property.square_feet.toLocaleString()} sqft</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          View Details
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Calendar className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Favorite Properties</h3>
            <p className="text-gray-600 mb-4">
              You have {favorites.length} favorite {favorites.length === 1 ? 'property' : 'properties'}
            </p>
            {favorites.length === 0 && (
              <button
                onClick={() => setActiveTab('search')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Start Searching
              </button>
            )}
          </div>
        )}

        {activeTab === 'my-transactions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Transactions</h3>
            <p className="text-gray-600">Track your property transactions and closing progress</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Documents</h3>
            <p className="text-gray-600">Access contracts, inspections, and closing documents</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600">Communicate with your agent and other parties</p>
          </div>
        )}
      </div>
    </div>
  );
}
