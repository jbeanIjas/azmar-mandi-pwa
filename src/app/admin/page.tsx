import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import { ADMIN_COOKIE, verifyAdminSession } from '../../lib/adminAuth';
import AdminDashboard from '../../components/AdminDashboard';

export default async function AdminPage() {
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSession(session)) redirect('/admin/login');

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { items: true } } }, orderBy: { name: 'asc' } }),
    prisma.menuItem.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return <AdminDashboard initialCategories={categories} initialProducts={products} />;
}
