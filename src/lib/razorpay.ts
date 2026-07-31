import crypto from 'crypto';

export interface CreateRazorpayOrderOptions {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export async function createServerRazorpayOrder(options: CreateRazorpayOrderOptions) {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';

  // If using development placeholders, return simulated order structure
  if (keyId === 'rzp_test_placeholder_key_id' || keySecret === 'placeholder_secret_key') {
    const mockOrderId = `order_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    console.log(`[RAZORPAY SERVICE] Development Mode: Simulated Razorpay Order ID ${mockOrderId}`);
    return {
      id: mockOrderId,
      entity: 'order',
      amount: options.amount,
      amount_paid: 0,
      amount_due: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.description || 'Razorpay order creation HTTP request failed');
  }

  return data;
}

export function verifyRazorpaySignature(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';
  
  if (keySecret === 'placeholder_secret_key') {
    return true; // Allow dev sandbox simulation
  }

  const textToSign = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(textToSign)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf-8'),
    Buffer.from(razorpaySignature, 'utf-8')
  );
}
