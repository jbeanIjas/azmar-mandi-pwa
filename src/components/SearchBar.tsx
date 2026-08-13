"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useEffect, useRef, useState } from 'react';

type SearchSuggestion = {
  id: string;
  name: string;
  price: string;
  image: string;
  categoryId: string;
};

export default function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const controller = new AbortController();

    if (trimmedQuery.length < 2) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/menu-search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.ok) setSuggestions(data.results ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Menu search suggestions failed', error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const closeSuggestions = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeSuggestions);
    return () => document.removeEventListener('pointerdown', closeSuggestions);
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const showSuggestions = isOpen && query.trim().length >= 2;

  return (
    <div className="menu-search-wrap" ref={containerRef}>
      <form className="menu-search" role="search" onSubmit={submitSearch}>
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search mandi, grills, drinks..."
          aria-label="Search menu"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (nextQuery.trim().length < 2) {
              setSuggestions([]);
              setIsLoading(false);
            } else {
              setIsLoading(true);
            }
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button className="menu-search-clear" type="button" aria-label="Clear menu search" onClick={() => { setQuery(''); setSuggestions([]); setIsLoading(false); }}>
            <X size={16} />
          </button>
        )}
        <button className="menu-search-submit" type="submit" aria-label="Search menu items">
          <ArrowRight size={18} />
        </button>
      </form>

      {showSuggestions && (
        <div className="menu-suggestions" aria-label="Menu search suggestions">
          <div className="menu-suggestions-heading">
            <span>Suggested dishes</span>
            {isLoading && <Loader2 size={14} className="location-spinner" />}
          </div>

          {!isLoading && suggestions.length === 0 ? (
            <div className="menu-suggestions-empty">No matching dishes found. Try “mandi” or “chicken”.</div>
          ) : (
            suggestions.map((item) => (
              <Link key={item.id} href={`/search?q=${encodeURIComponent(item.name)}`} className="menu-suggestion" onClick={() => setIsOpen(false)}>
                <span className="menu-suggestion-image"><Image src={item.image} alt="" fill sizes="48px" /></span>
                <span className="menu-suggestion-copy">
                  <strong>{item.name}</strong>
                  <small>{item.categoryId.replaceAll('-', ' ')} · {item.price}</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ))
          )}

          <button className="menu-suggestions-all" type="button" onClick={() => {
            const trimmedQuery = query.trim();
            if (!trimmedQuery) return;
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
          }}>
            View all results for “{query.trim()}” <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
