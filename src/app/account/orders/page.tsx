import prisma from '../../../lib/prisma';
import { getCustomerIdentity } from '../../../lib/customerAuth';
import OrderHistory from '../../../components/OrderHistory';

type OrderHistoryRecord = {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  paymentMethod: string;
  deliveryAddress: string | null;
  total: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: Array<{ productId: string; name: string; price: number; image: string; quantity: number }>;
};

async function loadOrdersFromDataApi(customerId: string): Promise<OrderHistoryRecord[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) throw new Error('Supabase Data API is not configured.');

  const url = new URL('/rest/v1/Order', baseUrl);
  url.searchParams.set('select', '*,items:OrderItem(productId,name,price,image,quantity)');
  url.searchParams.set('customerId', `eq.${customerId}`);
  url.searchParams.set('order', 'createdAt.desc');

  const response = await fetch(url, {
    cache: 'no-store',
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  if (!response.ok) throw new Error(`Supabase Data API returned ${response.status}.`);
  return response.json() as Promise<OrderHistoryRecord[]>;
}

export default async function OrdersPage() {
  const customer = await getCustomerIdentity();
  let orders: OrderHistoryRecord[] = [];

  if (customer) {
    try {
      orders = await prisma.order.findMany({
        where: { customerId: customer.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.warn('Prisma order-history query failed; using Supabase Data API.', error);
      orders = await loadOrdersFromDataApi(customer.id);
    }
  }

  return <OrderHistory signedIn={Boolean(customer)} orders={orders.map((order) => ({
    ...order,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
  }))} />;
}
