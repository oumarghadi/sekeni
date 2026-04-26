'use client';

import * as React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ListingCard } from '@/components/property/ListingsGrid';
import { Listing } from '@/lib/listings';

export default function FavoritesPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFavorites() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('favorites')
        .select(`
          listing_id,
          listings (
            id, title, description, address_text, price, currency_code,
            operation_type, listing_type, is_featured, created_at,
            cities ( name_ar ),
            listing_images ( storage_path, sort_order ),
            property_details ( area_sqm, rooms_count, bathrooms_count, has_parking ),
            construction_service_details ( service_type, estimated_duration, budget_min, budget_max )
          )
        `)
        .eq('user_id', user.id);

      if (data) {
        const transformed: Listing[] = data
          .map((fav: any) => {
            const l = fav.listings;
            if (!l) return null;
            const rawDetails = l.property_details;
            const details = Array.isArray(rawDetails)
              ? (rawDetails.length > 0 ? rawDetails[0] : null)
              : rawDetails;
            return {
              ...l,
              cities: Array.isArray(l.cities) && l.cities.length > 0 ? l.cities[0] : l.cities,
              listing_images: l.listing_images || [],
              property_details: details,
              construction_service_details:
                Array.isArray(l.construction_service_details) && l.construction_service_details.length > 0
                  ? l.construction_service_details[0]
                  : l.construction_service_details,
            } as Listing;
          })
          .filter(Boolean) as Listing[];

        setListings(transformed);
      }
      setLoading(false);
    }

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--secondary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-right">
        <h1 className="text-3xl font-black text-[var(--primary)]">المفضلة</h1>
        <p className="text-[var(--on-surface-variant)] text-sm mt-1">العقارات التي قمت بحفظها للرجوع إليها لاحقاً.</p>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-6 border border-[var(--outline-variant)]">
          <div className="w-20 h-20 rounded-full bg-[var(--surface-low)] flex items-center justify-center text-[var(--on-surface-variant)]">
            <Heart className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--primary)]">لا يوجد عقارات مفضلة بعد</h3>
            <p className="text-sm text-[var(--on-surface-variant)]">ابدأ باستكشاف العقارات وأضف ما يعجبك هنا.</p>
          </div>
        </div>
      )}
    </div>
  );
}
