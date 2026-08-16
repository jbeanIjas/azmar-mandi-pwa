type OrderNotification = {
  orderNumber: string;
  customerEmail: string | null;
  customerPhone: string | null;
  orderType: string;
  paymentMethod: string;
  deliveryAddress: string | null;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
};

const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL || 'azmarmandi@gmail.com';

export async function notifyNewOrder(order: OrderNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`Order ${order.orderNumber} saved. Set RESEND_API_KEY to enable email notifications.`);
    return;
  }

  const itemRows = order.items.map((item) =>
    `<li>${item.quantity} × ${item.name} — ₹${item.price * item.quantity}</li>`
  ).join('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ORDER_EMAIL_FROM || 'Azmar Mandi Orders <onboarding@resend.dev>',
      to: [notificationEmail],
      subject: `New order ${order.orderNumber} — ₹${order.total}`,
      html: `<h1>New order ${order.orderNumber}</h1><p>${order.orderType} · ${order.paymentMethod}</p><p>Customer: ${order.customerEmail || order.customerPhone || 'Unknown'}</p>${order.deliveryAddress ? `<p>Address: ${order.deliveryAddress}</p>` : ''}<ul>${itemRows}</ul><h2>Total: ₹${order.total}</h2>`,
    }),
  });

  if (!response.ok) throw new Error(`Order email failed with status ${response.status}`);
}
