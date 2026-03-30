"use client";
import { useState, useEffect } from "react";
import { Building2, Home, Hotel, Key, MapPin, Search, Filter, Heart, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useBooking } from "@/hooks/useBooking";
import { propertiesData, Property } from "@/data/properties";
import { toast } from "sonner";

export default function BrowsePropertiesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { handleBookNow, isBooking } = useBooking();
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  // Fetch properties from Firebase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const firebaseModule = await import('@/lib/firebase');
        const db = firebaseModule.db;
        if (!db) throw new Error('Firestore not initialized');
        
        const firestore = await import('firebase/firestore');
        const propertiesRef = firestore.collection(db, 'properties');
        const snapshot = await firestore.getDocs(propertiesRef);
        
        const propertyList: Property[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          propertyList.push({
            property_id: doc.id,
            type: (data.type?.toLowerCase() || 'apartment') as any,
            name: data.name || data.title || '',
            location: data.location || '',
            city: data.city || '',
            price: data.price || 0,
            rental_type: data.rentalType === 'RENT' ? 'Rent' : 'Nightly',
            details: data.details || `${data.bedrooms || 0} BHK, ${data.area || 0} sqft`,
            bedrooms: parseInt(data.bedrooms) || 1,
            bathrooms: parseInt(data.bathrooms) || 1,
            area: data.area || 0,
            image: data.image || data.images?.[0]?.url || '',
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            description: data.description || ''
          });
        });
        
        console.log('📊 Browse page fetched:', propertyList.length, 'properties');
        setProperties(propertyList.length > 0 ? propertyList : propertiesData);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties(propertiesData);
      }
    };
    
    fetchProperties();
    
    // Listen for updates
    const handlePropertyUpdate = () => {
      console.log('🔄 Refreshing browse page...');
      fetchProperties();
    };
    
    window.addEventListener('properties-updated', handlePropertyUpdate);
    return () => window.removeEventListener('properties-updated', handlePropertyUpdate);
  }, []);

  const mockProperties = [
    {
      id: 1,
      title: "Luxury 2BHK Apartment",
      type: "apartment",
      price: 25000,
      location: "Mumbai",
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600",
    },
    {
      id: 2,
      title: "Cozy Independent House",
      type: "house",
      price: 45000,
      location: "Bangalore",
      bedrooms: 3,
      bathrooms: 3,
      area: 2000,
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600",
    },
    {
      id: 3,
      title: "Men's PG - Shared Room",
      type: "pg",
      price: 8000,
      location: "Pune",
      bedrooms: 1,
      bathrooms: 1,
      area: 150,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600",
    },
    {
      id: 4,
      title: "Service Apartment - 1BHK",
      type: "hotel",
      price: 3500,
      location: "Delhi",
      bedrooms: 1,
      bathrooms: 1,
      area: 600,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600",
    },
    {
      id: 5,
      title: "Private Room in Shared Flat",
      type: "room",
      price: 12000,
      location: "Hyderabad",
      bedrooms: 1,
      bathrooms: 1,
      area: 200,
      image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600",
    },
    {
      id: 6,
      title: "Spacious 3BHK Flat",
      type: "apartment",
      price: 35000,
      location: "Chennai",
      bedrooms: 3,
      bathrooms: 2,
      area: 1600,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600",
    },
  ];

  const propertyTypes = [
    { value: "all", label: "All Types", icon: Building2 },
    { value: "apartment", label: "Apartments", icon: Building2 },
    { value: "house", label: "Houses", icon: Home },
    { value: "pg", label: "PGs", icon: Building2 },
    { value: "hotel", label: "Hotels", icon: Hotel },
    { value: "room", label: "Rooms", icon: Key },
  ];

  const filteredProperties = properties.filter(property => {
    const matchesType = selectedType === "all" || property.type === selectedType;
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Price filter
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        if (property.price < min || property.price > max) return false;
      } else {
        // For "Above ₹50,000"
        if (property.price < min) return false;
      }
    }
    
    return matchesType && matchesSearch;
  });

  const handleViewProperty = (propertyId: string) => {
    if (!user) {
      toast.error("Please login to view property details");
      router.push("/auth/login");
    } else {
      router.push(`/properties/${propertyId}`);
    }
  };

  const toggleSaveProperty = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Header - Show Dashboard UI for logged-in users */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200" title="Back to Dashboard">
              <svg className="w-5 h-5 text-gray-600 hover:text-cyan-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <span className="text-white font-bold text-lg">HR</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">HousyRental</h1>
                <p className="text-xs text-gray-500">Your Home, Your Way</p>
              </div>
            </Link>
          </div>
          
          {user ? (
            // Logged-in user view
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200">
                <Bell className="w-5 h-5 text-gray-600 hover:text-cyan-900 transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/user')}
                className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-3.5 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <img 
                  src={user?.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.displayName || "User")} 
                  alt={user?.displayName || ""} 
                  className="w-8 h-8 rounded-full ring-2 ring-gray-100" 
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.displayName || "User"}</p>
                  <p className="text-xs text-gray-500">Property Seeker</p>
                </div>
              </button>
            </div>
          ) : (
            // Public view
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">Home</a>
              <a href="/services" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">Services</a>
              <a href="/about" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">About</a>
              <a href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-cyan-900 transition-colors">
                Sign In
              </a>
              <a
                href="/auth/register"
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-md"
              >
                Get Started
              </a>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Browse Properties</h1>
          <p className="text-gray-600 text-lg">Find Apartments, Houses, PGs, Hotels, and Rooms for rent across Karnataka</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location or property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-200"
              />
            </div>
            <div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-200"
              >
                <option value="">Any Price</option>
                <option value="0-10000">Under ₹10,000</option>
                <option value="10000-20000">₹10,000 - ₹20,000</option>
                <option value="20000-35000">₹20,000 - ₹35,000</option>
                <option value="35000-50000">₹35,000 - ₹50,000</option>
                <option value="50000">Above ₹50,000</option>
              </select>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>

        {/* Property Type Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {propertyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedType === type.value
                    ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg scale-105"
                    : "bg-white border border-gray-200 hover:border-cyan-200"
                }`}
              >
                <Icon className="w-5 h-5 inline-block mr-2" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-700 font-medium">
            Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
          </p>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.property_id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <img
                  src={property.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"}
                  alt={property.name || "Property"}
                  className="w-full h-48 object-cover bg-gray-200"
                />
                <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold uppercase">
                  {property.type}
                </div>
                <button 
                  onClick={(e) => toggleSaveProperty(property.property_id, e)}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${savedProperties.includes(property.property_id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 text-gray-900">{property.name}</h3>
                <div className="flex items-center gap-2 mb-3 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.location}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.details}</p>
                <div className="flex justify-between mb-3 text-sm text-gray-600">
                  <span>{property.bedrooms} Beds</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>{property.area} sqft</span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-2xl font-bold text-cyan-900">₹{property.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm">/{property.rental_type === 'Nightly' ? 'night' : 'month'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBookNow(property)}
                      disabled={isBooking}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-cyan-700 hover:to-teal-700 shadow-md transition-all text-center"
                    >
                      {isBooking ? 'Wait...' : 'Book Now'}
                    </button>
                    <button 
                      onClick={() => handleViewProperty(property.property_id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-cyan-700 hover:to-teal-700 shadow-md transition-all text-center"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Properties Found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
