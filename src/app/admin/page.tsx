import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import { ADMIN_COOKIE, verifyAdminSession } from '../../lib/adminAuth';
import AdminDashboard from '../../components/AdminDashboard';
import { getCustomerIdentity } from '../../lib/customerAuth';

export default async function AdminPage() {
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  const customer = await getCustomerIdentity();
  const ownerEmail = (process.env.ADMIN_EMAIL || 'azmarmandi@gmail.com').toLowerCase();
  if (!verifyAdminSession(session) && customer?.email?.toLowerCase() !== ownerEmail) redirect('/admin/login');

  const [categories, products, orders] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { items: true } } }, orderBy: { name: 'asc' } }),
    prisma.menuItem.findMany({ orderBy: { name: 'asc' } }),
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 200 }),
  ]);

  return <AdminDashboard initialCategories={categories} initialProducts={products} initialOrders={orders.map((order) => ({ ...order, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString() }))} />;
}
