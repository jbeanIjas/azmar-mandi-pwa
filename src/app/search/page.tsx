import { SearchX } from 'lucide-react';
import Header from '../../components/Header';
import RestaurantCard from '../../components/RestaurantCard';
import SearchBar from '../../components/SearchBar';
import prisma from '../../lib/prisma';
import { getPhoneSession } from '../../lib/otpSession';

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const phoneSession = await getPhoneSession().catch(() => null);
  const resolvedSearchParams = await searchParams;
  const rawQuery = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q;
  const query = rawQuery?.trim() ?? '';

  let results: Array<{ id: string; name: string; description: string; price: string; image: string; categoryId: string; tags: string[]; specs: any }> = [];
  if (query.length >= 2) {
    try {
      results = await prisma.menuItem.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { categoryId: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Failed to search menu items:', error);
      try {
        const { menuItems: fallbackItems } = await import('../../data/menuData');
        const q = query.toLowerCase();
        results = fallbackItems
          .filter(item => 
            item.name.toLowerCase().includes(q) || 
            item.description.toLowerCase().includes(q) || 
            item.category.toLowerCase().includes(q)
          )
          .map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            categoryId: item.category,
            tags: item.tags || [],
            specs: item.specs || null,
          }));
      } catch {
        results = [];
      }
    }
  }

  return (
    <main className="search-results-page">
      <div className="search-results-top">
        <Header phone={phoneSession?.phone} />
        <SearchBar initialQuery={query} />
      </div>

      <section className="search-results-content">
        <div className="search-results-heading">
          <span>Menu search</span>
          <h1>{query ? `Results for “${query}”` : 'Find your favourite dish'}</h1>
          <p>{query ? `${results.length} ${results.length === 1 ? 'dish' : 'dishes'} found` : 'Search by dish, category or ingredient.'}</p>
        </div>

        {results.length > 0 ? (
          <div className="search-results-grid">
            {results.map((item) => <RestaurantCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="search-results-empty">
            <span><SearchX size={27} /></span>
            <h2>No dishes found</h2>
            <p>Try a simpler search such as “mandi”, “chicken”, “fish” or “juice”.</p>
          </div>
        )}
      </section>
    </main>
  );
}
