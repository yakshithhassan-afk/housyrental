import { PropertyCard } from "@/components/property/property-card";
import { SearchFilters } from "@/components/property/search-filters";
import { prisma } from "@/lib/prisma";
import { PropertyStatus, ListingType, PropertyType } from "@prisma/client";

interface SearchParams {
  city?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  listingType?: string;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  // Mock data for now since we don't have database connection
  const mockProperties = [
    {
      id: 1,
      title: "Luxury Downtown Apartment",
      description: "Modern 2-bedroom apartment in the heart of the city with stunning views",
      price: 2500,
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      city: "New York",
      state: "NY",
      zipCode: "10001",
      address: "123 Main St, New York, NY 10001",
      type: "APARTMENT",
      listingType: "RENT",
      status: "AVAILABLE",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop", alt: "Living room" },
        { id: 2, url: "https://images.unsplash.com/photo-1564013799919-600e7555cf07?w=800&h=600&fit=crop", alt: "Bedroom" }
      ],
      amenities: [],
      owner: { name: "John Smith", image: null },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      title: "Cozy Suburban House",
      description: "Beautiful 3-bedroom house with garden and garage",
      price: 3200,
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      address: "456 Oak Ave, Los Angeles, CA 90210",
      type: "HOUSE",
      listingType: "RENT",
      status: "AVAILABLE",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop", alt: "Front view" }
      ],
      amenities: [],
      owner: { name: "Sarah Johnson", image: null },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      title: "Modern Studio Loft",
      description: "Stylish studio with high ceilings and modern amenities",
      price: 1800,
      bedrooms: 1,
      bathrooms: 1,
      area: 800,
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      address: "789 State St, Chicago, IL 60601",
      type: "STUDIO",
      listingType: "RENT",
      status: "AVAILABLE",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop", alt: "Studio interior" }
      ],
      amenities: [],
      owner: { name: "Mike Wilson", image: null },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #ecfdf5 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">HR</span>
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800">HousyRental</span>
              <p className="text-xs text-gray-500">Find Your Perfect Home</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">Home</a>
            <a href="/properties" className="text-cyan-900 font-semibold">Properties</a>
            <a href="/services" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">Services</a>
            <a href="/about" className="text-gray-700 hover:text-cyan-900 transition-colors font-medium">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-cyan-900 transition-colors">
              Sign In
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Available Properties</h1>
          <p className="text-gray-600 text-lg">
            Browse our curated selection of premium rental properties. Find your perfect home from our extensive collection of apartments, houses, and studios.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                placeholder="Enter city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-200">
                <option value="">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="STUDIO">Studio</option>
                <option value="VILLA">Villa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                placeholder="Min price..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                placeholder="Max price..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-200"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg">
              Search
            </button>
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <img
                  src={property.images[0]?.url || "https://images.unsplash.com/photo-1560449018-7e3b44dc3d4?w=800&h=600&fit=crop"}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Available
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{property.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-cyan-900">${property.price}/mo</div>
                  <div className="text-sm text-gray-500">
                    {property.bedrooms} bed • {property.bathrooms} bath • {property.area} sqft
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  📍 {property.address}
                </div>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {mockProperties.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
