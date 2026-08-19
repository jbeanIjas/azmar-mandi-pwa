import OrderSuccessClient from '../../components/OrderSuccessClient';

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string | string[]; order_id?: string | string[]; orderNumber?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawNumber = params.order_id || params.number || params.orderNumber;
  const orderNumber = Array.isArray(rawNumber) ? rawNumber[0] : rawNumber;

  return <OrderSuccessClient orderNumber={orderNumber} />;
}
