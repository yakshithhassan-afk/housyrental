"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, MapPin, Home, DollarSign, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    listingType: searchParams.get("listingType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/properties?${params.toString()}`);
  };

  const handleClear = () => {
    setFilters({
      city: "",
      type: "",
      listingType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
    });
    router.push("/properties");
  };

  return (
    <div className="bg-white rounded-xl p-4 card-shadow">
      {/* Main Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by city, address, or ZIP..."
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isOpen && (
        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Property Type</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
              >
                <option value="">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="CONDO">Condo</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Listing Type</label>
            <select
              value={filters.listingType}
              onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
            >
              <option value="">All</option>
              <option value="RENT">For Rent</option>
              <option value="SALE">For Sale</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bedrooms</label>
            <div className="relative">
              <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Price Range</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="border-t mt-4 pt-4 flex justify-end">
          <Button variant="ghost" onClick={handleClear}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
