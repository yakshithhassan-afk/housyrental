'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import PaymentButton from '@/components/payment/PaymentButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Download, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PaymentSectionProps {
  propertyId: string;
  propertyName: string;
  amount: number;
  description?: string;
}

export default function PaymentSection({ 
  propertyId, 
  propertyName, 
  amount,
  description 
}: PaymentSectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    // Optionally redirect or show confirmation
    setTimeout(() => {
      router.push('/dashboard/payments');
    }, 2000);
  };

  if (!user) {
    return (
      <Card className="border-2 border-cyan-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-cyan-600" />
            Login Required
          </CardTitle>
          <CardDescription>
            Please login to make a payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-bold hover:from-cyan-700 hover:to-teal-700 transition-all"
          >
            Login to Continue
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="border-2 border-cyan-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">💳 Payment Summary</CardTitle>
          <CardDescription className="text-base">
            Complete your payment for the property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Property</p>
              <p className="font-semibold text-gray-900 truncate">{propertyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className="text-2xl font-bold text-cyan-600">₹{amount.toLocaleString()}</p>
            </div>
          </div>
          
          {description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Secure Payment Options
          </CardTitle>
          <CardDescription>
            Choose your preferred payment method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="border rounded-lg p-3 text-center hover:border-cyan-400 transition-all cursor-pointer bg-cyan-50 border-cyan-200">
              <div className="text-2xl mb-2">💳</div>
              <p className="text-xs font-semibold">Cards</p>
              <p className="text-[10px] text-gray-600">All cards accepted</p>
            </div>
            <div className="border rounded-lg p-3 text-center hover:border-cyan-400 transition-all cursor-pointer bg-cyan-50 border-cyan-200">
              <div className="text-2xl mb-2">🏦</div>
              <p className="text-xs font-semibold">Net Banking</p>
              <p className="text-[10px] text-gray-600">All banks supported</p>
            </div>
            <div className="border rounded-lg p-3 text-center hover:border-cyan-400 transition-all cursor-pointer bg-cyan-50 border-cyan-200">
              <div className="text-2xl mb-2">📱</div>
              <p className="text-xs font-semibold">UPI</p>
              <p className="text-[10px] text-gray-600">GPay, PhonePe, Paytm</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            100% Secure Payment
          </CardTitle>
          <CardDescription>
            Your payment information is encrypted and secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>PCI DSS Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>RBI Approved Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <PaymentButton
        amount={amount}
        propertyId={propertyId}
        propertyName={propertyName}
        description={description}
        onSuccess={handlePaymentSuccess}
      />

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By proceeding, you agree to our{' '}
        <a href="/terms" className="text-cyan-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="text-cyan-600 hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
}
