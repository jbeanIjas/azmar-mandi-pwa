import { normalizeIndianPhone } from './phone';

export type OrderStage = 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderNotificationDetails {
  id: string;
  orderNumber: string;
  customerPhone: string | null;
  orderType: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  deliveryName?: string | null;
  deliveryAddress?: string | null;
  total: number;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

const STAGE_MESSAGES: Record<OrderStage, { title: string; body: string; emoji: string; defaultNote?: string }> = {
  PLACED: {
    title: 'Order Placed',
    emoji: '🎉',
    body: 'Your order has been placed successfully! We have received your order and are preparing to confirm it.',
  },
  CONFIRMED: {
    title: 'Order Confirmed',
    emoji: '👨‍🍳',
    body: 'Your order has been confirmed by Azmar Mandi and sent to our kitchen team.',
  },
  PREPARING: {
    title: 'Preparing Food',
    emoji: '🔥',
    body: 'Our chefs are cooking your authentic mandi fresh with premium ingredients.',
    defaultNote: '⏱️ Cooking fresh with authentic spices',
  },
  READY: {
    title: 'Out for Delivery / Ready',
    emoji: '🛵',
    body: 'Your order is packed hot & fresh and is ready!',
    defaultNote: '📍 Delivering hot & fresh to your address shortly',
  },
  COMPLETED: {
    title: 'Order Delivered',
    emoji: '❤️',
    body: 'Your order has been delivered. Thank you for dining with Azmar Mandi!',
  },
  CANCELLED: {
    title: 'Order Cancelled',
    emoji: '⚠️',
    body: 'Your order has been cancelled. If you have questions, please contact our support.',
    defaultNote: '📞 Support: +91 85898 89800',
  },
};

/**
 * Send an outbound WhatsApp notification to a customer about their order status via MSG91
 */
export async function sendWhatsAppOrderStatusNotification(
  order: OrderNotificationDetails,
  newStage: string
): Promise<{ success: boolean; message?: string }> {
  const rawPhone = order.customerPhone;
  if (!rawPhone) {
    console.info(`[MSG91 WhatsApp] No phone number available for order ${order.orderNumber}. Skipping notification.`);
    return { success: false, message: 'No customer phone provided' };
  }

  const mobile = normalizeIndianPhone(rawPhone);
  if (!mobile) {
    console.warn(`[MSG91 WhatsApp] Invalid customer phone format: ${rawPhone} for order ${order.orderNumber}`);
    return { success: false, message: 'Invalid phone format' };
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const integratedNumber = process.env.MSG91_INTEGRATED_NUMBER;
  const defaultStatusTemplate = process.env.MSG91_WHATSAPP_TEMPLATE_ORDER_STATUS || 'order_status_update';
  const deliveredTemplate = process.env.MSG91_WHATSAPP_TEMPLATE_ORDER_DELIVERED || 'order_delivered_review';
  const cancelledTemplate = process.env.MSG91_WHATSAPP_TEMPLATE_ORDER_CANCELLED || 'order_cancelled_update';

  if (!authKey || !integratedNumber) {
    console.info(
      `[MSG91 WhatsApp] MSG91_AUTH_KEY or MSG91_INTEGRATED_NUMBER not configured. WhatsApp alert for order ${order.orderNumber} (${newStage}) logged locally.`
    );
    return { success: true, message: 'Logged (MSG91 credentials not provided)' };
  }

  const stageKey = (newStage.toUpperCase() in STAGE_MESSAGES ? newStage.toUpperCase() : 'CONFIRMED') as OrderStage;
  const stageInfo = STAGE_MESSAGES[stageKey] || STAGE_MESSAGES.CONFIRMED;

  const isDelivered = stageKey === 'COMPLETED';
  const isCancelled = stageKey === 'CANCELLED';
  const templateName = isDelivered ? deliveredTemplate : (isCancelled ? cancelledTemplate : defaultStatusTemplate);

  const rawSummary = order.items && order.items.length > 0
    ? order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')
    : `${order.orderType === 'delivery' ? 'Delivery' : 'Pickup'} Order`;
  const itemsSummary = rawSummary.length > 60 ? `${rawSummary.slice(0, 57)}...` : rawSummary;

  // Dynamic components payload based on template type
  let components: Record<string, { type: string; value: string }>;

  if (isDelivered && templateName === deliveredTemplate) {
    // Dedicated Delivery & Google Review Template (1 Variable: Order Number)
    components = {
      body_1: {
        type: 'text',
        value: order.orderNumber,
      },
    };
  } else if (isCancelled && templateName === cancelledTemplate) {
    // Dedicated Cancellation Template (2 Variables: Order Number + Support Phone)
    components = {
      body_1: {
        type: 'text',
        value: order.orderNumber,
      },
      body_2: {
        type: 'text',
        value: '+91 85898 89800',
      },
    };
  } else {
    // Smart Context Note for Variable {{4}} in order_status_update
    let contextNote = stageInfo.defaultNote;
    if (!contextNote) {
      if (stageKey === 'PLACED' || stageKey === 'CONFIRMED') {
        contextNote = `Total: ₹${order.total} • Items: ${itemsSummary}`;
      } else if (stageKey === 'COMPLETED') {
        contextNote = `Total: ₹${order.total} • Enjoy your meal!`;
      } else {
        contextNote = `Total: ₹${order.total}`;
      }
    }

    components = {
      body_1: {
        type: 'text',
        value: order.orderNumber,
      },
      body_2: {
        type: 'text',
        value: `${stageInfo.emoji} ${stageInfo.title}`,
      },
      body_3: {
        type: 'text',
        value: stageInfo.body,
      },
      body_4: {
        type: 'text',
        value: contextNote,
      },
    };
  }

  // Payload for MSG91 Outbound WhatsApp v5 API
  const payload = {
    integrated_number: integratedNumber,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        to_and_components: [
          {
            to: [mobile],
            components,
          },
        ],
      },
    },
  };

  const endpoints = [
    'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
    'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
        signal: AbortSignal.timeout(8_000),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || (result && (result.status === 'error' || result.status === 'fail'))) {
        console.error('[MSG91 WhatsApp] Error response from MSG91:', {
          status: response.status,
          result,
        });
        return { success: false, message: result?.message || 'MSG91 request rejected' };
      }

      console.info(`[MSG91 WhatsApp] Notification for order ${order.orderNumber} (${newStage}) sent successfully to ${mobile}.`);
      return { success: true };
    } catch (error) {
      console.warn(`[MSG91 WhatsApp] Endpoint ${endpoint} failed, trying fallback:`, error);
    }
  }

  console.error(`[MSG91 WhatsApp] All endpoints failed for order ${order.orderNumber}`);
  return { success: false, message: 'Network or timeout error' };
}
