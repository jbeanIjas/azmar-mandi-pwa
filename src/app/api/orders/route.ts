import prisma from '../../../lib/prisma';
import { getCustomerIdentity } from '../../../lib/customerAuth';
import { notifyNewOrder } from '../../../lib/orderNotifications';
import { createCashfreeOrder } from '../../../lib/cashfree';

type CheckoutBody = {
  items?: Array<{ productId?: string; quantity?: number }>;
  orderType?: 'delivery' | 'pickup';
  paymentMethod?: 'cashfree' | 'online' | 'cod' | 'upi';
  customerPhone?: string;
  delivery?: { name?: string; address?: string; lat?: number; lng?: number };
};

function numericPrice(price: string) {
  return Math.round(Number(price.replace(/[^0-9.]/g, '')) || 0);
}

export async function GET() {
  const customer = await getCustomerIdentity();
  if (!customer) return Response.json({ error: 'Please sign in to view your orders.' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return Response.json(orders);
}

export async function POST(request: Request) {
  const customer = await getCustomerIdentity();
  if (!customer) return Response.json({ error: 'Please sign in before placing your order.' }, { status: 401 });

  const body = await request.json().catch(() => null) as CheckoutBody | null;
  const requestedItems = Array.isArray(body?.items) ? body.items : [];
  const quantities = new Map<string, number>();
  for (const item of requestedItems) {
    if (typeof item.productId !== 'string') continue;
    const quantity = Math.min(20, Math.max(1, Math.floor(Number(item.quantity) || 0)));
    quantities.set(item.productId, quantity);
  }

  if (!quantities.size) return Response.json({ error: 'Your cart is empty.' }, { status: 400 });
  if (!['delivery', 'pickup'].includes(body?.orderType || '')) return Response.json({ error: 'Choose delivery or pickup.' }, { status: 400 });
  
  const customerPhone = body?.customerPhone?.replace(/\D/g, '').slice(-10) || '';
  if (customerPhone.length !== 10) return Response.json({ error: 'Enter a valid 10-digit WhatsApp number.' }, { status: 400 });
  if (body?.orderType === 'delivery' && (!body.delivery?.address || typeof body.delivery.lat !== 'number' || typeof body.delivery.lng !== 'number')) {
    return Response.json({ error: 'A verified delivery address is required.' }, { status: 400 });
  }

  const products = await prisma.menuItem.findMany({ where: { id: { in: [...quantities.keys()] } } });
  if (products.length !== quantities.size) return Response.json({ error: 'One or more cart items are no longer available.' }, { status: 409 });

  const items = products.map((product) => ({
    productId: product.id,
    name: product.name,
    price: numericPrice(product.price),
    image: product.image,
    quantity: quantities.get(product.id)!,
  }));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderNumber = `AZM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  const paymentMethod = body?.paymentMethod || 'cashfree';

  let paymentSessionId: string | null = null;
  let cfOrderId: string | null = null;

  // Create Cashfree Payment session
  try {
    const cfOrder = await createCashfreeOrder({
      orderId: orderNumber,
      amount: total,
      customerId: customer.id,
      customerPhone: customerPhone,
      customerEmail: customer.email || undefined,
    });
    paymentSessionId = cfOrder.payment_session_id;
    cfOrderId = String(cfOrder.cf_order_id);
  } catch (error: any) {
    console.error('Failed to initialize Cashfree session:', error);
    return Response.json({ error: error.message || 'Could not initiate online payment. Please try again.' }, { status: 500 });
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerEmail: customer.email,
      customerPhone: `+91${customerPhone}`,
      orderType: body!.orderType!,
      paymentMethod,
      paymentStatus: 'PENDING',
      paymentSessionId,
      cfOrderId,
      deliveryName: body?.orderType === 'delivery' ? body.delivery?.name : null,
      deliveryAddress: body?.orderType === 'delivery' ? body.delivery?.address : null,
      deliveryLat: body?.orderType === 'delivery' ? body.delivery?.lat : null,
      deliveryLng: body?.orderType === 'delivery' ? body.delivery?.lng : null,
      total,
      items: { create: items },
    },
    include: { items: true },
  });

  await notifyNewOrder(order).catch((error) => console.error('Order notification failed:', error));
  return Response.json({ ...order, paymentSessionId }, { status: 201 });
}
