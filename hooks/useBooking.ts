import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function useBooking() {
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleBookNow = async (property: any) => {
    if (!user) {
      toast.error("Please login to book this property");
      router.push("/auth/login");
      return;
    }
    const propertyId = property.property_id || property.id;
    router.push(`/properties/${propertyId}/book`);
  };

  const confirmBooking = async (property: any, bookingDetails?: any) => {
    if (!user) {
      toast.error("Please login to complete booking");
      router.push("/auth/login");
      return;
    }

    try {
      setIsBooking(true);
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: property.price, receipt: `receipt_${property.property_id || property.id}` })
      });
      
      const order = await res.json();

      if (order.error) {
        throw new Error(order.error);
      }

      // Check if the backend is running in Sandbox/Mock Mode
      if (order.id?.startsWith('order_mock_')) {
        toast.info("Sandbox Mode: Simulating Payment...");
        
        setTimeout(async () => {
          try {
            const { db } = await import('@/lib/firebase');
            if (!db) throw new Error("Firestore not initialized");
            const { collection, addDoc } = await import('firebase/firestore');
            
            await addDoc(collection(db as any, 'bookings'), {
              userId: user.uid,
              userEmail: user.email,
              propertyId: property.property_id || property.id,
              propertyName: property.name || property.title,
              amount: property.price,
              paymentId: `pay_mock_${Date.now()}`,
              orderId: order.id,
              date: new Date().toISOString(),
              status: 'confirmed',
              ...bookingDetails
            });
            
            toast.success("Sandbox Booking Complete!");
            // Force reload dashboard data if we are on it
            window.dispatchEvent(new CustomEvent('bookings-updated'));
            router.push(`/dashboard/${user.role === 'OWNER' ? 'owner' : 'user'}?tab=payments`);
          } catch (e) {
            console.error("Failed to save sandbox booking:", e);
            toast.error("Booking mock failed to save to Database.");
          }
        }, 1500);
        
        return; // Exit early so Razorpay modal doesn't fire
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
        amount: order.amount,
        currency: order.currency,
        name: "HousyRental",
        description: `Booking Security Deposit for ${property.name || property.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          toast.success("Payment Successful! Property Booked.");
          
          try {
            const { db } = await import('@/lib/firebase');
            if (!db) throw new Error("Firestore not initialized");
            const { collection, addDoc } = await import('firebase/firestore');
            await addDoc(collection(db as any, 'bookings'), {
              userId: user.uid,
              userEmail: user.email,
              propertyId: property.property_id || property.id,
              propertyName: property.name || property.title,
              amount: property.price,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              date: new Date().toISOString(),
              status: 'confirmed',
              ...bookingDetails
            });
            window.dispatchEvent(new CustomEvent('bookings-updated'));
            router.push(`/dashboard/${user.role === 'OWNER' ? 'owner' : 'user'}?tab=payments`);
          } catch (e) {
            console.error("Failed to save booking to Firebase:", e);
          }
        },
        prefill: {
          name: user.displayName || "Property Seeker",
          email: user.email || "",
        },
        theme: {
          color: "#0891b2", // matching cyan-600
        },
      };

      const razorpayConstructor = (window as any).Razorpay;
      if (!razorpayConstructor) {
        throw new Error("Razorpay SDK not loaded. Please try again.");
      }

      const rzp = new razorpayConstructor(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment Failed: " + response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Booking Error:", error);
      toast.error(error.message || "Failed to initiate booking");
    } finally {
      setIsBooking(false);
    }
  };

  return { handleBookNow, confirmBooking, isBooking };
}
