declare module 'razorpay' {
  interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, any>;
  }

  interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt?: string;
    status: string;
    created_at: number;
  }

  export default class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
    };
  }
}
