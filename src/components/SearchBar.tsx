import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  return (
    <form className="menu-search" role="search">
      <Search size={19} aria-hidden="true" />
      <input type="search" placeholder="Search mandi, grills, drinks..." aria-label="Search menu" />
      <button type="button" aria-label="Open filters"><SlidersHorizontal size={18} /></button>
    </form>
  );
}
