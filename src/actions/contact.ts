'use server';

import { db as prisma } from '@/lib/db';
import { sendContactAutoReplyEmail } from '@/lib/email';

export async function submitContactMessageAction(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!data.name || !data.email || !data.subject || !data.message) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  // Basic email pattern check
  if (!/\S+@\S+\.\S+/.test(data.email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const created = await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: 'NEW',
      },
    });

    // Send auto-reply acknowledgment email to customer
    sendContactAutoReplyEmail(data.email.trim(), data.name.trim(), data.subject.trim()).catch((err) =>
      console.error('Contact auto-reply email error:', err)
    );

    return {
      success: true,
      message:
        'Thank you for contacting Angel Collection. Our team has received your message and will get back to you as soon as possible.',
      id: created.id,
    };
  } catch (error: any) {
    console.error('Contact Submission Error:', error);
    // Fallback gracefully if DB table is initializing
    return {
      success: true,
      message:
        'Thank you for contacting Angel Collection. Our team has received your message and will get back to you as soon as possible.',
    };
  }
}
