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
  const phoneSession = await getPhoneSession();
  const resolvedSearchParams = await searchParams;
  const rawQuery = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q;
  const query = rawQuery?.trim() ?? '';

  const results = query.length < 2 ? [] : await prisma.menuItem.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { categoryId: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
  });

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
