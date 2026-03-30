"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { propertiesData, Property } from "@/data/properties";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { MapPin, Star, Heart, TrendingUp, ArrowRight, ChevronRight } from "lucide-react";

const getPropertyViews = (index: number) =>
  (Math.floor(500 + index * 123.45) % 1000) + 500;

export function PropertyGrid() {
  const router = useRouter();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [trendingProperties, setTrendingProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<number[]>([]);

  useEffect(() => {
    if (!db) {
      setProperties(propertiesData);
      return;
    }

    const propertiesRef = collection(db, "properties");
    const unsubProperties = onSnapshot(
      propertiesRef,
      (snapshot) => {
        const list: Property[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          list.push({
            property_id: doc.id,
            type: (d.type?.toLowerCase() || "apartment") as any,
            name: d.name || d.title || "",
            location: d.location || "",
            city: d.city || "",
            price: d.price || 0,
            rental_type: d.rentalType === "RENT" ? "Rent" : "Nightly",
            details: d.details || `${d.bedrooms || 0} BHK, ${d.area || 0} sqft`,
            bedrooms: parseInt(d.bedrooms) || 1,
            bathrooms: parseInt(d.bathrooms) || 1,
            area: d.area || 0,
            image: d.image || d.images?.[0]?.url || "",
            amenities: Array.isArray(d.amenities) ? d.amenities : [],
            description: d.description || "",
          });
        });
        setProperties(list.length > 0 ? list : propertiesData);
      },
      () => setProperties(propertiesData)
    );

    const trendingRef = collection(db, "trending-properties");
    const unsubTrending = onSnapshot(trendingRef, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        if (d.propertyId) ids.push(d.propertyId);
      });
      setTrendingProperties((curr) => {
        const source = curr.length > 0 ? curr : propertiesData;
        return ids
          .map((id) => source.find((p) => p.property_id === id))
          .filter(Boolean) as Property[];
      });
    });

    const handleUpdate = () => console.log("🔄 Manual property update");
    window.addEventListener("properties-updated", handleUpdate);

    return () => {
      unsubProperties();
      unsubTrending();
      window.removeEventListener("properties-updated", handleUpdate);
    };
  }, []);

  const featured = trendingProperties.length > 0 ? trendingProperties : properties.slice(0, 6);

  const toggleSave = (idx: number) => {
    setSavedProperties((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
    toast.success(savedProperties.includes(idx) ? "Removed from favorites ❤️" : "Added to favorites ❤️");
  };

  return (
    <section
      className="py-20 relative z-10"
      style={{ background: "linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)" }}
    >
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 mb-12 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {trendingProperties.length > 0 ? "🔥 Trending Properties" : "Featured Properties"}
              </h2>
              <p className="text-gray-700 text-lg">
                {trendingProperties.length > 0
                  ? "Hand-picked trending properties updated in real-time"
                  : "Hand-picked premium listings available right now"}
              </p>
            </div>
            <Link
              href="/browse-properties"
              className="group flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold text-lg"
            >
              View All Listings
              <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((property: Property, index: number) => (
            <div
              key={property.property_id}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={property.image || "/placeholder-property.jpg"}
                    alt={property.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full">
                      {property.type}
                    </span>
                  </div>

                  {/* Save */}
                  <button
                    onClick={() => toggleSave(index)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all transform hover:scale-110 shadow-lg z-20"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        savedProperties.includes(index) ? "fill-current text-red-500" : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-cyan-950/60 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span className="text-white text-sm font-medium">4.8</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                        {property.name}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{property.bedrooms} BD</span>
                        <span>•</span>
                        <span>{property.bathrooms} BA</span>
                        <span>•</span>
                        <span>{property.area} sqft</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-600 mb-1">
                        ₹{property.price.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">
                        per {property.rental_type === "Nightly" ? "night" : "month"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <TrendingUp className="w-4 h-4" />
                      {getPropertyViews(index)} views
                    </span>
                    <Button
                      onClick={() => {
                        if (!user) {
                          toast.error("Please login to view property details");
                          router.push("/auth/login");
                        } else {
                          router.push(`/properties/${property.property_id}`);
                        }
                      }}
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/browse-properties">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white transform hover:scale-105 transition-all duration-300 font-semibold px-12 shadow-lg hover:shadow-xl"
            >
              Browse All Properties
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
