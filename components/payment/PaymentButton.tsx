'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { toast } from 'sonner';

interface PaymentProps {
  amount: number;
  propertyId: string;
  propertyName: string;
  description?: string;
  onSuccess?: (paymentId: string) => void;
}

export default function PaymentButton({ 
  amount, 
  propertyId, 
  propertyName, 
  description,
  onSuccess 
}: PaymentProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to make a payment');
      return;
    }

    setLoading(true);

    try {
      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'HousyRental Real Estate',
        description: description || `Payment for ${propertyName}`,
        image: '/logo.png',
        handler: async function (response: any) {
          // Payment successful - save to Firestore
          await savePayment(response, amount, propertyId, propertyName);
          
          toast.success('✅ Payment successful!');
          if (onSuccess) {
            onSuccess(response.razorpay_payment_id);
          }
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
          contact: '' // You can add phone field if needed
        },
        theme: {
          color: '#0891b2' // Cyan-600 matching your app theme
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
            setLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + error.message);
      setLoading(false);
    }
  };

  const savePayment = async (response: any, amount: number, propertyId: string, propertyName: string) => {
    if (!db || !user) throw new Error('Firestore or user not available');

    const paymentData = {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
      amount: amount,
      currency: 'INR',
      status: 'Paid',
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      propertyId: propertyId,
      propertyName: propertyName,
      paymentMethod: 'Razorpay',
      transactionId: response.razorpay_payment_id,
      paidAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Save to payments collection
    const paymentRef = doc(collection(db, 'payments'));
    await setDoc(paymentRef, paymentData);

    console.log('Payment saved to Firestore:', paymentData);
    setLoading(false);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-cyan-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
          </svg>
          Pay ₹{amount.toLocaleString()}
        </>
      )}
    </button>
  );
}
