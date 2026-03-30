import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Razorpay Webhook Handler
 * Verifies payment signatures and updates payment status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }
    
    const event = JSON.parse(body);
    
    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        console.log('✅ Payment captured:', event.payload.payment.entity.id);
        // Update payment status in Firestore here
        break;
        
      case 'payment.failed':
        console.log('❌ Payment failed:', event.payload.payment.entity.id);
        // Update payment status in Firestore here
        break;
        
      case 'refund.created':
        console.log('💰 Refund initiated:', event.payload.payment.entity.id);
        // Handle refund logic here
        break;
        
      default:
        console.log('ℹ️ Unhandled webhook event:', event.event);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
