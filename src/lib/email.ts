/**
 * Enterprise Resend Email System for Angel Collection
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';
const SUPPORT_EMAIL = 'angelcollections.b4u@gmail.com';
const ADMIN_EMAIL = process.env.OWNER_EMAIL || 'angelcollection2021@gmail.com';

async function sendResendHttpRequest(payload: { from: string; to: string[]; subject: string; html: string }) {
  console.log(`\n📨 [RESEND SERVICE] Initiating Email Request to: ${payload.to.join(', ')}`);
  console.log(`[RESEND SERVICE] Sender: ${payload.from}`);
  console.log(`[RESEND SERVICE] Subject: "${payload.subject}"`);

  if (!RESEND_API_KEY) {
    console.warn('⚠️ [RESEND SERVICE] RESEND_API_KEY is missing from environment. Email was simulated.');
    return { success: true, simulated: true };
  }

  console.log(`[RESEND SERVICE] Key Detected (${RESEND_API_KEY.substring(0, 8)}...). Dispatching HTTP POST to https://api.resend.com/emails...`);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ [RESEND SERVICE ERROR Response]:', data);
      return { success: false, statusCode: res.status, error: data.message || data };
    }

    console.log(`✅ [RESEND SERVICE SUCCESS]: Email ID = ${data.id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ [RESEND SERVICE NETWORK EXCEPTION]:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 1. Welcome Email
 */
export async function sendWelcomeEmail(toEmail: string, name: string) {
  return sendResendHttpRequest({
    from: SENDER_EMAIL,
    to: [toEmail],
    subject: 'Welcome to Angel Collection House of Luxury ✦',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0F1117; color: #FFFFFF; padding: 40px 15px; margin: 0;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #171B24; border: 1px solid #242A36; border-radius: 20px; padding: 40px 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          <!-- BRAND LOGO HEADER -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="white-space: nowrap !important; font-family: 'Playfair Display', 'Cinzel', 'Cormorant Garamond', Georgia, serif; color: #D4AF37; font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 0 0 6px 0; text-transform: uppercase; text-align: center;">ANGEL COLLECTION</h1>
            <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 4px; color: #D4AF37; font-weight: 700; margin: 0;">HOUSE OF HAUTE COUTURE</p>
          </div>

          <h2 style="color: #FFFFFF; font-size: 20px; font-weight: 600; text-align: center; margin: 30px 0 15px 0;">Welcome to Privilege Club, ${name}!</h2>
          <p style="color: #A0A5B5; font-size: 14px; line-height: 1.7; text-align: center;">
            Thank you for joining Angel Collection. Your account has been activated, granting you VIP access to private couture collections, custom tailoring, and seasonal drops.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="http://localhost:3000/shop" style="background-color: #D4AF37; color: #0F1117; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
              Explore New Arrivals
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #242A36; margin: 30px 0;" />
          <p style="color: #A0A5B5; font-size: 12px; text-align: center; line-height: 1.6; margin: 0;">
            For personal concierge support, contact us at ${SUPPORT_EMAIL} or +91 98765 43210.<br/>
            Thank you for choosing Angel Collection.
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * 2. Premium Luxury Order Confirmation Email (Dior / Louis Vuitton / Sabyasachi Aesthetic)
 */
export async function sendOrderConfirmationEmail(toEmail: string, orderDetails: {
  orderNumber: string;
  customerName: string;
  total: number;
  items: Array<{ title: string; quantity: number; price: number }>;
  shippingAddress: string;
  subtotal?: number;
  shippingFee?: number;
  tax?: number;
}) {
  const subtotalVal = orderDetails.subtotal || orderDetails.total;
  const shippingVal = orderDetails.shippingFee || 0;
  const taxVal = orderDetails.tax || Math.round(subtotalVal * 0.18);

  const itemsListHtml = orderDetails.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #242A36;">
        <td style="padding: 14px 12px; color: #FFFFFF; font-size: 13px; text-align: left; font-weight: 500;">
          ${item.title}
        </td>
        <td style="padding: 14px 12px; color: #A0A5B5; font-size: 13px; text-align: center; font-weight: 600;">
          ×${item.quantity}
        </td>
        <td style="padding: 14px 12px; color: #D4AF37; font-size: 13px; font-weight: 700; text-align: right;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  return sendResendHttpRequest({
    from: SENDER_EMAIL,
    to: [toEmail],
    subject: `Order Confirmation #${orderDetails.orderNumber} ✦ Angel Collection`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0F1117; color: #FFFFFF; padding: 40px 15px; margin: 0;">
        <div style="max-width: 620px; width: 100%; margin: 0 auto; background-color: #171B24; border: 1px solid #242A36; border-radius: 20px; padding: 40px 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); box-sizing: border-box;">
          
          <!-- BRAND LOGO HEADER (SINGLE LINE UNWRAPPED) -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="white-space: nowrap !important; font-family: 'Playfair Display', 'Cinzel', 'Cormorant Garamond', Georgia, serif; color: #D4AF37; font-size: 30px; font-weight: 700; letter-spacing: 6px; margin: 0 0 8px 0; text-transform: uppercase; text-align: center; display: inline-block;">
              ANGEL COLLECTION
            </h1>
            <div style="color: #D4AF37; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">
              ✔ ORDER CONFIRMED
            </div>
            <div style="color: #A0A5B5; font-size: 13px; font-family: monospace; font-weight: 600; margin-top: 6px;">
              #${orderDetails.orderNumber}
            </div>
          </div>

          <!-- GREETING & ATELIER NOTE -->
          <div style="margin-bottom: 28px; line-height: 1.7; font-size: 14px;">
            <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
              Dear ${orderDetails.customerName},
            </p>
            <p style="color: #A0A5B5; margin: 0 0 8px 0;">
              Thank you for your purchase.
            </p>
            <p style="color: #A0A5B5; margin: 0;">
              Our atelier artisans are carefully preparing your order with exceptional craftsmanship.
            </p>
          </div>

          <!-- ORDER SUMMARY TABLE -->
          <div style="margin: 25px 0; background-color: #0F1117; border: 1px solid #242A36; border-radius: 16px; overflow: hidden; padding: 4px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background-color: #171B24; border-bottom: 1px solid #242A36;">
                  <th style="padding: 12px; color: #A0A5B5; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: left;">
                    Item Description
                  </th>
                  <th style="padding: 12px; color: #A0A5B5; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: center;">
                    Qty
                  </th>
                  <th style="padding: 12px; color: #A0A5B5; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: right;">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>
          </div>

          <!-- FINANCIAL SUMMARY -->
          <div style="margin: 20px 0 25px 0; padding: 16px; background-color: #0F1117; border-radius: 14px; border: 1px solid #242A36; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #A0A5B5;">
              <span>Subtotal</span>
              <span style="color: #FFFFFF; font-weight: 600;">₹${subtotalVal.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #A0A5B5;">
              <span>Estimated Shipping</span>
              <span style="color: #10B981; font-weight: 700;">${shippingVal === 0 ? 'FREE' : '₹' + shippingVal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #A0A5B5;">
              <span>GST Tax (18%)</span>
              <span style="color: #FFFFFF; font-weight: 600;">₹${taxVal.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0 4px 0; margin-top: 8px; border-top: 1px solid #242A36; font-size: 16px; font-weight: 700; color: #FFFFFF;">
              <span>Total Amount</span>
              <span style="color: #D4AF37; font-size: 18px;">₹${orderDetails.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <!-- SHIPPING ADDRESS BOX -->
          <div style="background-color: #0F1117; border: 1px solid #242A36; border-radius: 14px; padding: 16px; margin-bottom: 25px;">
            <div style="color: #D4AF37; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
              SHIPPING DESTINATION
            </div>
            <div style="color: #A0A5B5; font-size: 12px; line-height: 1.6;">
              ${orderDetails.shippingAddress}
            </div>
          </div>

          <!-- FOOTER -->
          <hr style="border: none; border-top: 1px solid #242A36; margin: 30px 0 24px 0;" />
          <div style="color: #A0A5B5; font-size: 13px; text-align: center; line-height: 1.8;">
            <p style="margin: 0 0 12px 0;">We'll notify you again when your order is shipped.</p>
            <p style="margin: 0; font-weight: 600; color: #FFFFFF;">Thank you for choosing Angel Collection.</p>
          </div>

        </div>
      </div>
    `,
  });
}

/**
 * 3. Order Shipped Email
 */
export async function sendOrderShippedEmail(toEmail: string, orderNumber: string, trackingNumber: string, carrier: string) {
  return sendResendHttpRequest({
    from: SENDER_EMAIL,
    to: [toEmail],
    subject: `Your Order #${orderNumber} Has Been Shipped 🚚 | Angel Collection`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F1117; color: #FFFFFF; padding: 40px 15px; text-align: center;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #171B24; border: 1px solid #242A36; border-radius: 20px; padding: 40px 30px;">
          <h1 style="white-space: nowrap !important; font-family: 'Playfair Display', 'Cinzel', Georgia, serif; color: #D4AF37; font-size: 28px; font-weight: 700; letter-spacing: 5px; margin: 0 0 10px 0; text-transform: uppercase;">ANGEL COLLECTION</h1>
          <h2 style="color: #FFFFFF; font-size: 20px; margin-bottom: 15px;">Your Shipment Is En Route</h2>
          <p style="color: #A0A5B5; font-size: 14px; line-height: 1.6;">
            Order <strong>#${orderNumber}</strong> has been dispatched via <strong>${carrier}</strong>.
          </p>
          <div style="background-color: #0F1117; border: 1px solid #242A36; padding: 20px; border-radius: 16px; margin: 25px 0;">
            <p style="font-size: 10px; text-transform: uppercase; color: #A0A5B5; margin: 0; letter-spacing: 2px;">Waybill Tracking ID</p>
            <p style="font-family: monospace; font-size: 20px; font-weight: 700; color: #D4AF37; margin: 6px 0 0 0;">${trackingNumber}</p>
          </div>
          <a href="http://localhost:3000/track-order?tracking=${trackingNumber}" style="background-color: #D4AF37; color: #0F1117; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
            Track Shipment Live
          </a>
        </div>
      </div>
    `,
  });
}

/**
 * 4. Order Delivered Email
 */
export async function sendOrderDeliveredEmail(toEmail: string, orderNumber: string, customerName: string) {
  return sendResendHttpRequest({
    from: SENDER_EMAIL,
    to: [toEmail],
    subject: `Order #${orderNumber} Delivered ✦ | Angel Collection`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F1117; color: #FFFFFF; padding: 40px 15px; text-align: center;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #171B24; border: 1px solid #242A36; border-radius: 20px; padding: 40px 30px;">
          <h1 style="white-space: nowrap !important; font-family: 'Playfair Display', 'Cinzel', Georgia, serif; color: #D4AF37; font-size: 28px; font-weight: 700; letter-spacing: 5px; margin: 0 0 10px 0; text-transform: uppercase;">ANGEL COLLECTION</h1>
          <h2 style="color: #10B981; font-size: 22px;">Package Successfully Delivered ✓</h2>
          <p style="color: #A0A5B5; font-size: 14px; line-height: 1.6;">
            Dear ${customerName}, your package for Order <strong>#${orderNumber}</strong> has been delivered. We hope you adore your luxury pieces!
          </p>
          <div style="margin: 30px 0;">
            <a href="http://localhost:3000/account/orders" style="background-color: #D4AF37; color: #0F1117; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
              Leave A Product Review
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

/**
 * 5. Password Reset Email
 */
export async function sendPasswordResetEmail(toEmail: string, resetLink: string) {
  return sendResendHttpRequest({
    from: SENDER_EMAIL,
    to: [toEmail],
    subject: 'Reset Your Password | Angel Collection Security',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F1117; color: #FFFFFF; padding: 40px 15px; text-align: center;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #171B24; border: 1px solid #242A36; border-radius: 20px; padding: 40px 30px;">
          <h1 style="white-space: nowrap !important; font-family: 'Playfair Display', 'Cinzel', Georgia, serif; color: #D4AF37; font-size: 28px; font-weight: 700; letter-spacing: 5px; margin: 0 0 10px 0; text-transform: uppercase;">ANGEL COLLECTION</h1>
          <h2 style="color: #FFFFFF; font-size: 20px;">Password Reset Request</h2>
          <p style="color: #A0A5B5; font-size: 14px; line-height: 1.6;">
            We received a request to reset your Angel Collection password. Click the button below to secure your account:
          </p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #D4AF37; color: #0F1117; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="color: #A0A5B5; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });
}

/**
 * 6. Contact Form Auto Reply
 */
export async function sendContactAutoReplyEmail(toEmail: string, name: string, subject: string) {
  return sendResendHttpRequest({
    from: SENDER_EMAIL,
    to: [toEmail],
    subject: `Inquiry Received: ${subject} | Angel Concierge`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F1117; color: #FFFFFF; padding: 40px 15px; text-align: center;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #171B24; border: 1px solid #242A36; border-radius: 20px; padding: 40px 30px;">
          <h1 style="white-space: nowrap !important; font-family: 'Playfair Display', 'Cinzel', Georgia, serif; color: #D4AF37; font-size: 28px; font-weight: 700; letter-spacing: 5px; margin: 0 0 10px 0; text-transform: uppercase;">ANGEL COLLECTION</h1>
          <h2 style="color: #FFFFFF; font-size: 20px;">We Received Your Concierge Inquiry</h2>
          <p style="color: #A0A5B5; font-size: 14px; line-height: 1.6;">
            Dear ${name}, thank you for reaching out regarding <strong>"${subject}"</strong>. Our personal concierge team has received your message and will respond within 24 hours.
          </p>
          <p style="color: #A0A5B5; font-size: 12px; margin-top: 30px; border-top: 1px solid #242A36; padding-top: 20px;">
            Immediate Urgent Support: Call +91 98765 43210
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * 7. Admin New Order Alert Notification
 */
export async function sendAdminOrderNotificationEmail(orderDetails: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
}) {
  return sendResendHttpRequest({
    from: SENDER_EMAIL,
    to: [ADMIN_EMAIL],
    subject: `🚨 NEW ORDER #${orderDetails.orderNumber} (₹${orderDetails.total.toLocaleString('en-IN')})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F1117; color: #FFFFFF; padding: 40px 15px;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #171B24; border: 1px solid #D4AF37; border-radius: 20px; padding: 40px 30px;">
          <h1 style="white-space: nowrap !important; font-family: 'Playfair Display', 'Cinzel', Georgia, serif; color: #D4AF37; font-size: 24px; margin-bottom: 10px; text-transform: uppercase;">ANGEL ADMIN ALERT</h1>
          <h2 style="color: #10B981; font-size: 20px;">New Store Order Received!</h2>
          <div style="background-color: #0F1117; padding: 20px; border-radius: 14px; margin: 20px 0; font-size: 14px; color: #FFFFFF;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderDetails.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${orderDetails.customerName} (${orderDetails.customerEmail})</p>
            <p style="margin: 5px 0;"><strong>Grand Total:</strong> ₹${orderDetails.total.toLocaleString('en-IN')}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/admin/orders" style="background-color: #D4AF37; color: #0F1117; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
              View Order In Admin Panel
            </a>
          </div>
        </div>
      </div>
    `,
  });
}
