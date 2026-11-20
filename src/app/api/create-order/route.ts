import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayClient, createRazorpayOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { amount, currency = 'INR', receipt, notes } = body;

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount is required and must be a valid number' },
        { status: 400 }
      );
    }

    // If amount is provided in paise (e.g. >= 100) or rupees, normalize to paise
    // Razorpay standard expects amount in paise (minimum 100 paise = ₹1)
    let amountInPaise: number;
    let amountInRupees: number;

    if (body.amountInPaise !== undefined) {
      amountInPaise = Math.round(Number(body.amountInPaise));
      amountInRupees = amountInPaise / 100;
    } else if (amount < 100 && amount > 0) {
      // Amount was passed in Rupees (e.g. 50 Rs = 5000 paise)
      amountInRupees = amount;
      amountInPaise = Math.round(amount * 100);
    } else {
      // Amount passed in paise
      amountInPaise = Math.round(amount);
      amountInRupees = amountInPaise / 100;
    }

    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: 'Minimum amount must be at least 100 paise (₹1.00)' },
        { status: 400 }
      );
    }

    const receiptId = receipt || `rcpt_${Date.now()}`;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay API credentials not configured in environment' },
        { status: 500 }
      );
    }

    // Call Razorpay API using official SDK
    const client = getRazorpayClient();
    if (client) {
      try {
        const rzpOrder = await client.orders.create({
          amount: amountInPaise,
          currency,
          receipt: receiptId,
          notes: notes || { source: 'standard_web_checkout' },
        });

        return NextResponse.json({
          success: true,
          order_id: rzpOrder.id,
          id: rzpOrder.id,
          amount: Number(rzpOrder.amount),
          currency: rzpOrder.currency,
          key_id: keyId,
          receipt: rzpOrder.receipt,
        });
      } catch (err: any) {
        console.error('Razorpay API error in /api/create-order:', err);

        if (err?.statusCode === 401 || err?.error?.code === 'BAD_REQUEST_ERROR') {
          // If credentials returned 401, return proper 401 status
          return NextResponse.json(
            {
              error: err?.error?.description || 'Authentication failed with Razorpay',
              code: 'AUTHENTICATION_FAILED',
            },
            { status: 401 }
          );
        }

        return NextResponse.json(
          {
            error: err?.error?.description || err?.message || 'Failed to create Razorpay order',
          },
          { status: 500 }
        );
      }
    }

    // Fallback if client cannot initialize
    const order = await createRazorpayOrder({
      amount: amountInRupees,
      currency,
      receipt: receiptId,
      notes,
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/create-order:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while creating order' },
      { status: 500 }
    );
  }
}
