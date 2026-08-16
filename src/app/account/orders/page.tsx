import prisma from '../../../lib/prisma';
import { getCustomerIdentity } from '../../../lib/customerAuth';
import OrderHistory from '../../../components/OrderHistory';

export default async function OrdersPage() {
  const customer = await getCustomerIdentity();
  const orders = customer ? await prisma.order.findMany({ where: { customerId: customer.id }, include: { items: true }, orderBy: { createdAt: 'desc' } }) : [];
  return <OrderHistory signedIn={Boolean(customer)} orders={orders.map((order) => ({ ...order, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString() }))} />;
}
