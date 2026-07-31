'use server';

import { db as prisma } from '@/lib/db';
import { MessageStatus } from '@prisma/client';

export async function getAdminContactMessagesAction() {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }
}

export async function updateContactMessageStatusAction(messageId: string, status: MessageStatus) {
  try {
    const updated = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status },
    });
    return { success: true, message: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteContactMessageAction(messageId: string) {
  try {
    await prisma.contactMessage.delete({ where: { id: messageId } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
