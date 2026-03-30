"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useBooking } from "@/hooks/useBooking";
import { propertiesData } from "@/data/properties";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { confirmBooking, isBooking } = useBooking();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/auth/login?redirect=/properties/${id}/book`);
      return;
    }

    const fetchProperty = async () => {
      try {
        if (db) {
          const docRef = doc(db, "properties", id as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProperty({ property_id: docSnap.id, ...docSnap.data() });
          } else {
            // Fallback to static data
            const staticProp = propertiesData.find((p) => p.property_id === id || (p as any).id === id);
            setProperty(staticProp || null);
          }
        } else {
          const staticProp = propertiesData.find((p) => p.property_id === id || (p as any).id === id);
          setProperty(staticProp || null);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <Button onClick={() => router.push("/")} variant="outline">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <button 
          onClick={() => router.push(`/properties/${id}`)}
          className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Property
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Booking</h1>
            <p className="text-gray-500">Please review the details below before processing payment.</p>
          </div>

          <div className="px-6 py-8 sm:p-10">
            <div className="space-y-6">
              <div className="p-6 bg-cyan-50 rounded-xl flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{property.name || property.title}</h2>
                  <p className="text-gray-600 mt-1">{property.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-600">
                    ₹{property.price?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Security Deposit</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">What happens next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-cyan-600 mr-3 shrink-0 mt-0.5" />
                    <span className="text-gray-600">Your security deposit will be securely held by Razorpay.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-cyan-600 mr-3 shrink-0 mt-0.5" />
                    <span className="text-gray-600">The owner will review your application within 24 hours.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-cyan-600 mr-3 shrink-0 mt-0.5" />
                    <span className="text-gray-600">Fully refundable if the owner rejects your application.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold text-lg"
                  onClick={() => confirmBooking(property)}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <span className="flex items-center justify-center gap-2">
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       Processing...
                    </span>
                  ) : (
                    "Confirm & Pay Securely"
                  )}
                </Button>
                <div className="text-center mt-4">
                  <button 
                    onClick={() => router.push(`/properties/${id}`)}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
