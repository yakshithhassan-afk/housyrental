"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useBooking } from "@/hooks/useBooking";
import { propertiesData, Property } from "@/data/properties";
import { ArrowLeft, MapPin, Bed, Bath, Square, Heart, Share2, Building2, Calendar, DollarSign, CreditCard, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const { handleBookNow, isBooking } = useBooking();
  const [property, setProperty] = useState<Property | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!loading && !user) {
      toast.error("Please login to view property details");
      router.push("/auth/login");
      return;
    }

    // Find property by ID
    const fetchProperty = async () => {
      if (!params.id) return;
      const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      // First check static data for backward compatibility/demo properties
      const staticProperty = propertiesData.find(p => p.property_id === propertyId);
      if (staticProperty) {
        setProperty(staticProperty);
        return;
      }

      // If not in static data, fetch from Firestore
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        if (!db) return;
        
        const docRef = doc(db, 'properties', propertyId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProperty({
            property_id: docSnap.id,
            name: data.name || data.title || 'Property',
            location: data.location || 'Unknown Location',
            price: data.price || 0,
            type: data.type || 'Apartment',
            rental_type: data.rental_type || 'Monthly',
            bedrooms: data.bedrooms || 1,
            bathrooms: data.bathrooms || 1,
            area: data.area || 0,
            image: data.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600',
            description: data.description || data.details || 'No description available.',
            amenities: data.amenities || ['Basic Amenities'],
            details: data.details || data.description || '',
            ownerId: data.ownerId,
            ownerName: data.ownerName || data.owner || 'Property Owner'
          });
        } else {
          toast.error("Property not found");
          setTimeout(() => {
            router.push("/browse-properties");
          }, 2000);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("Error loading property details");
      }
    };

    fetchProperty();
  }, [params.id, user, loading, router]);

  const handleSaveProperty = () => {
    if (!user) {
      toast.error("Please login to save properties");
      router.push("/auth/login");
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from favorites" : "Added to favorites");
  };

  const handleContactOwner = () => {
    if (!user) {
      toast.error("Please login to contact property owner");
      router.push("/auth/login");
      return;
    }
    setShowContactModal(true);
  };

  const sendMessage = async () => {
    if (!user || !property || !messageText.trim()) return;

    try {
      setIsSending(true);
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      if (!db) throw new Error('Firestore not initialized');

      await addDoc(collection(db, 'messages'), {
        text: messageText.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderRole: 'USER',
        recipientId: property.ownerId || 'admin',
        recipientName: property.ownerName || 'Property Owner',
        propertyId: property.property_id,
        propertyName: property.name,
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success("Message sent successfully!");
      setMessageText("");
      setShowContactModal(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleVisit = () => {
    if (!user) {
      toast.error("Please login to schedule a visit");
      router.push("/auth/login");
      return;
    }
    toast.info("Opening visit scheduling form...");
    // TODO: Implement scheduling form
  };

  if (loading || !property) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-200 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-cyan-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800">HousyRental</span>
              <p className="text-xs text-gray-500">Find Your Perfect Home</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSaveProperty}
              className={`p-2 rounded-full transition-colors ${
                isSaved ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Property Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={property.image} 
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video rounded-xl overflow-hidden shadow-md">
                <img 
                  src={property.image} 
                  alt={`${property.name} view ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Property Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Price */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full uppercase">
                      {property.type}
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                      {property.rental_type}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-900">₹{property.price.toLocaleString()}</div>
                  <p className="text-gray-500">per {property.rental_type === 'Nightly' ? 'night' : 'month'}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Bed className="w-8 h-8 text-cyan-900" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bath className="w-8 h-8 text-cyan-900" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Square className="w-8 h-8 text-cyan-900" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.area}</p>
                    <p className="text-sm text-gray-500">Sq Ft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Property</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
              <div className="mt-4 p-4 bg-cyan-50 rounded-xl">
                <p className="text-sm text-gray-700"><strong className="font-semibold">Details:</strong> {property.details}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in this property?</h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleBookNow(property)}
                  disabled={isBooking}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 mb-2"
                >
                  <CreditCard className="w-5 h-5" />
                  {isBooking ? 'Processing...' : 'Book Now Securely'}
                </button>

                <button
                  onClick={handleScheduleVisit}
                  className="w-full py-3 bg-white border-2 border-cyan-200 text-cyan-900 hover:bg-cyan-50 font-semibold rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule a Visit
                </button>
                
                <button
                  onClick={handleContactOwner}
                  className="w-full py-3 border-2 border-cyan-200 text-cyan-900 hover:bg-cyan-50 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Contact Owner
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Property
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  This property is managed by HousyRental
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact Owner Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
              <div>
                <h3 className="text-xl font-bold text-white">Contact Owner</h3>
                <p className="text-cyan-100 text-xs mt-0.5">Inquiry for {property?.name}</p>
              </div>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-cyan-50 rounded-2xl border border-cyan-100 flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-900">{property?.name}</p>
                  <p className="text-xs text-cyan-700">{property?.location}</p>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">Your Message</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="I'm interested in this property. Could you please provide more details?"
                className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-400"
              ></textarea>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  disabled={isSending || !messageText.trim()}
                  className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
