import { getCollectionData, setDocumentData } from '@/lib/firebase/firestore';
import { INITIAL_ORDERS } from '@/lib/mock-data';
import { Order } from '@/types';

export class OrderService {
  static async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await getCollectionData<Order>('orders');
      if (orders.length === 0) return INITIAL_ORDERS;
      return orders;
    } catch (e) {
      return INITIAL_ORDERS;
    }
  }

  static async createOrder(order: Partial<Order>): Promise<string> {
    const id = order.id || `ord-${Date.now()}`;
    await setDocumentData('orders', id, { ...order, id });
    return id;
  }

  static async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    await setDocumentData('orders', id, { status });
  }
}
