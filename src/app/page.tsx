import Link from 'next/link';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import PromoBanner from '../components/PromoBanner';
import CategoryScroll from '../components/CategoryScroll';
import RestaurantCard from '../components/RestaurantCard';
import Footer from '../components/Footer';
import prisma from '../lib/prisma';

const sections = [
  { id: 'signatures', title: 'Azmar signatures', eyebrow: 'Most loved' },
  { id: 'alfaham', title: 'Flame-grilled favourites', eyebrow: 'From the grill' },
  { id: 'mandi', title: 'Authentic mandi', eyebrow: 'Slow cooked' },
  { id: 'coastal', title: 'Coastal specials', eyebrow: 'Fresh picks' },
  { id: 'beverages', title: 'Juices & coolers', eyebrow: 'Sip something fresh' },
];

export default async function Home() {
  const menuItems = await prisma.menuItem.findMany();
  const recommendedItems = menuItems.filter((item) =>
    item.tags?.some((tag) => ['Best Seller', 'Signature', 'Classic'].includes(tag))
  ).slice(0, 12);

  const popularItems = recommendedItems.length > 0 ? recommendedItems : menuItems.slice(0, 12);

  return (
    <main className="home-shell">
      <div className="home-top">
        <Header />
        <SearchBar />
        <PromoBanner />
      </div>

      <CategoryScroll />

      <section id="recommended" className="menu-section menu-section--first">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Curated for you</span>
            <h2>Popular dishes</h2>
          </div>
          <Link href="/collection/all">See all</Link>
        </div>
        <div className="product-rail hide-scrollbar">
          {popularItems.map((item) => <RestaurantCard key={item.id} item={item} />)}
        </div>
      </section>

      {sections.map((section) => {
        const items = menuItems.filter((item) => item.categoryId === section.id);
        if (items.length === 0) return null;

        return (
          <section id={section.id} key={section.id} className="menu-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">{section.eyebrow}</span>
                <h2>{section.title}</h2>
              </div>
              <Link href={`/collection/${section.id}`}>See all</Link>
            </div>
            <div className="product-rail hide-scrollbar">
              {items.map((item) => <RestaurantCard key={item.id} item={item} />)}
            </div>
          </section>
        );
      })}

      <Footer />
    </main>
  );
}
