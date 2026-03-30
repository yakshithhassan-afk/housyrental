import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, receipt, notes } = await req.json();

    // Check for dummy keys to enable "Sandbox/Mock" mode
    const isMockMode = 
      !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === 'rzp_test_YOUR_KEY_ID_HERE' ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET === 'YOUR_SECRET_HERE';

    if (isMockMode) {
      console.log('⚠️ Running Razorpay in Sandbox Mock Mode (Dummy Keys Detected)');
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: receipt || "receipt_" + Math.random().toString(36).substring(7),
        status: "created"
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: receipt || "receipt_" + Math.random().toString(36).substring(7),
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
