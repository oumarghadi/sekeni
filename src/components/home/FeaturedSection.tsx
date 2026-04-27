'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ListingCard } from '@/components/property/ListingsGrid';
import { fetchListings, Listing } from '@/lib/listings';
import { RevealSection } from '@/components/ui/RevealSection';

export function FeaturedSection() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadFeatured() {
      const { data } = await fetchListings({ limit: 3 });
      setListings(data);
      setLoading(false);
    }
    loadFeatured();
  }, []);

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <RevealSection className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="text-right space-y-3">
            <div className="flex items-center gap-2.5 justify-end">
              <span className="text-[var(--gold)] text-[11px] font-black uppercase tracking-[0.20em]">مختارين ليك</span>
              <span className="h-px w-8 bg-[var(--gold)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--primary)]">ديار مميزة</h2>
          </div>
          <Link href="/properties">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--outline)] text-sm font-black text-[var(--primary)] hover:bg-[var(--surface-low)] hover:border-[var(--secondary)] transition-all group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              شوف الكل
            </button>
          </Link>
        </RevealSection>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--secondary)]" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-[var(--on-surface-variant)]">
             لا توجد عقارات مميزة حالياً
          </div>
        ) : (
          <RevealSection delay={80}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </RevealSection>
        )}
      </div>
    </section>
  );
}
