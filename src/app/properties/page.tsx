'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { ListingsGrid } from '@/components/property/ListingsGrid';
import { fetchListings, Listing } from '@/lib/listings';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [error,   setError]     = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      const typeParam        = searchParams.get('type');          // buy | rent | build | null
      const city             = searchParams.get('city') ?? undefined;
      const propertyTypeName = searchParams.get('propertyType') ?? undefined;
      const maxPriceParam    = searchParams.get('maxPrice');
      const maxPrice         = maxPriceParam ? parseInt(maxPriceParam, 10) : undefined;

      // "build" maps to construction_service listings
      const isBuild     = typeParam === 'build';
      const listingType = isBuild ? 'construction_service' : 'property';
      const operationType = (!isBuild && (typeParam === 'buy' || typeParam === 'rent'))
        ? typeParam
        : undefined;

      // Resolve category name → ID for the property type filter
      let categoryId: string | undefined;
      if (propertyTypeName && !isBuild) {
        const { data: catData } = await supabase
          .from('property_categories')
          .select('id')
          .eq('name_ar', propertyTypeName)
          .maybeSingle();
        categoryId = catData?.id ?? undefined;
      }

      const { data, error: fetchError } = await fetchListings({
        listingType,
        ...(operationType ? { operationType } : {}),
        ...(maxPrice      ? { maxPrice }      : {}),
        ...(categoryId    ? { categoryId }    : {}),
      });

      if (fetchError) {
        setError(fetchError);
        setListings([]);
      } else {
        // City: client-side match on city name or address text
        const filtered = city
          ? data.filter(l =>
              l.cities?.name_ar?.includes(city) ||
              l.address_text?.toLowerCase().includes(city.toLowerCase())
            )
          : data;
        setListings(filtered);
      }

      setLoading(false);
    }

    loadData();
  }, [searchParams]);

  const typeParam = searchParams.get('type');
  const pageTitle = typeParam === 'buy'   ? 'عقارات للبيع'
                  : typeParam === 'rent'  ? 'عقارات للإيجار'
                  : typeParam === 'build' ? 'خدمات البناء'
                  : 'العقارات المتاحة';

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <aside className="w-full lg:w-72 shrink-0">
        <PropertyFilters />
      </aside>
      <main className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-8 text-right">
          <h1 className="text-2xl font-black text-[var(--primary)]">{pageTitle}</h1>
          {!loading && (
            <span className="text-[var(--on-surface-variant)] text-xs font-bold">
              {listings.length} نتيجة
            </span>
          )}
        </div>
        <ListingsGrid
          listings={listings}
          loading={loading}
          error={error}
          onRetry={() => setListings([])}
        />
      </main>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <div className="bg-[var(--background)] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-24">
        <React.Suspense fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--secondary)]" />
          </div>
        }>
          <PropertiesContent />
        </React.Suspense>
      </div>
    </div>
  );
}
