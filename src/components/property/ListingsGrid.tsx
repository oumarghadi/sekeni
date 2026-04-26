'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, BedDouble, Bath, Square, Heart, Building2, Clock, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  Listing,
  getFirstImage,
  operationTypeLabel,
} from '@/lib/listings';

// ---------- Loading skeleton ----------

function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[var(--outline-variant)]">
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: '4/3' }} />
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-[var(--outline-variant)]">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ---------- Individual listing card ----------

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const imageUrl = getFirstImage(listing.listing_images);
  const details = listing.property_details;
  const href = listing.listing_type === 'property'
    ? `/properties/${listing.id}`
    : `/construction/${listing.id}`;

  const [isFavorited, setIsFavorited] = React.useState(false);
  const [favLoading, setFavLoading] = React.useState(false);

  async function handleCta(e: React.MouseEvent) {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  }

  React.useEffect(() => {
    async function checkFavorite() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('listing_id', listing.id)
        .maybeSingle();
      setIsFavorited(!!data);
    }
    checkFavorite();
  }, [listing.id]);

  async function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      window.location.href = '/auth/login';
      return;
    }
    if (isFavorited) {
      await supabase.from('favorites').delete()
        .eq('user_id', session.user.id)
        .eq('listing_id', listing.id);
      setIsFavorited(false);
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, listing_id: listing.id });
      setIsFavorited(true);
    }
    setFavLoading(false);
  }

  const ctaLabels: Record<string, string> = {
    buy:   'اشترِ الآن',
    rent:  'استأجر الآن',
    build: 'ابدأ البناء',
  };

  const operationAccent: Record<string, string> = {
    buy:   'from-[var(--primary)] to-[var(--primary-container)]',
    rent:  'from-amber-500 to-amber-600',
    build: 'from-emerald-600 to-emerald-700',
  };

  return (
    <div className="card-premium flex flex-col group">

      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-[var(--surface-low)] rounded-t-3xl" style={{ aspectRatio: '16/10' }}>
        <img
          src={imageUrl}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          style={{ transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)' }}
        />

        {/* Gradient overlay bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Operation type badge — top right */}
        <div className="absolute top-3.5 right-3.5">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white',
            `bg-gradient-to-r ${operationAccent[listing.operation_type] ?? operationAccent.buy}`
          )}>
            {operationTypeLabel[listing.operation_type]}
          </span>
        </div>

        {/* Featured pill — top left */}
        {listing.is_featured && (
          <div className="absolute top-3.5 left-3.5">
            <span className="badge-premium badge-pulse">مميز</span>
          </div>
        )}

        {/* Price — bottom overlay */}
        <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-end justify-between">
          <div className="text-white font-black text-lg drop-shadow-md" dir="ltr">
            {formatPrice(listing.price)}
          </div>
          {listing.cities?.name_ar && (
            <div className="flex items-center gap-1 text-white/85 text-[11px] font-medium backdrop-blur-sm bg-black/20 rounded-full px-2.5 py-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{listing.cities.name_ar}</span>
            </div>
          )}
        </div>

        {/* Favourite button */}
        <button
          type="button"
          onClick={handleFavorite}
          disabled={favLoading}
          className={cn(
            "absolute top-12 left-3.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-sm border",
            isFavorited
              ? "bg-red-500 border-red-400 text-white"
              : "bg-white/80 border-white/40 text-[var(--on-surface-variant)] hover:text-red-500 hover:bg-white"
          )}
          aria-label={isFavorited ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
        >
          <Heart className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex flex-col flex-grow text-right">

        {/* Title */}
        <h3 className="font-black text-[var(--primary)] text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-[var(--secondary)] transition-colors duration-200">
          {listing.title}
        </h3>

        {/* Address */}
        {listing.address_text && (
          <p className="text-[11px] text-[var(--on-surface-variant)] mb-3 line-clamp-1 flex items-center justify-end gap-1">
            <span>{listing.address_text}</span>
          </p>
        )}

        {/* Specs divider */}
        <div className="h-px bg-[var(--outline-variant)] mb-3" />

        {/* Specs: Property */}
        {listing.listing_type === 'property' && details && (
          <div className="flex items-center justify-end gap-4 text-xs text-[var(--on-surface-variant)] mb-4">
            {details.rooms_count !== null && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--primary)]">{details.rooms_count}</span>
                <BedDouble className="w-3.5 h-3.5 text-[var(--secondary)]" />
              </div>
            )}
            {details.bathrooms_count !== null && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--primary)]">{details.bathrooms_count}</span>
                <Bath className="w-3.5 h-3.5 text-[var(--secondary)]" />
              </div>
            )}
            {details.area_sqm !== null && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--primary)]">{details.area_sqm}</span>
                <span className="text-[var(--on-surface-variant)]">م²</span>
                <Square className="w-3.5 h-3.5 text-[var(--secondary)]" />
              </div>
            )}
          </div>
        )}

        {/* Specs: Construction */}
        {listing.listing_type === 'construction_service' && listing.construction_service_details && (
          <div className="flex items-center justify-end gap-4 text-xs text-[var(--on-surface-variant)] mb-4">
            {listing.construction_service_details.service_type && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--primary)]">{listing.construction_service_details.service_type}</span>
                <Briefcase className="w-3.5 h-3.5 text-[var(--secondary)]" />
              </div>
            )}
            {listing.construction_service_details.estimated_duration && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[var(--primary)]">{listing.construction_service_details.estimated_duration}</span>
                <Clock className="w-3.5 h-3.5 text-[var(--secondary)]" />
              </div>
            )}
          </div>
        )}

        {/* CTA — full width, premium */}
        <button
          onClick={handleCta}
          className={cn(
            'mt-auto w-full py-2.5 rounded-xl font-black text-[13px] text-white transition-all duration-200 active:scale-[0.98]',
            `bg-gradient-to-r ${operationAccent[listing.operation_type] ?? operationAccent.buy}`,
            'hover:shadow-[0_4px_16px_rgba(0,38,63,0.25)] hover:-translate-y-0.5'
          )}
        >
          {ctaLabels[listing.operation_type] ?? ctaLabels.buy}
        </button>
      </div>
    </div>
  );
}

// ---------- Empty state ----------

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--surface-low)] flex items-center justify-center text-[var(--on-surface-variant)]">
        <Building2 className="w-8 h-8" />
      </div>
      <div>
        <p className="font-black text-[var(--primary)] text-lg">لا توجد عقارات متاحة حالياً</p>
        <p className="text-sm text-[var(--on-surface-variant)] mt-1">
          سيتم إضافة عقارات جديدة قريباً، تابعنا!
        </p>
      </div>
    </div>
  );
}

// ---------- Error state ----------

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-4">
      <p className="text-sm text-red-600 font-bold bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs font-bold text-[var(--secondary)] hover:underline"
      >
        حاول مجدداً
      </button>
    </div>
  );
}

// ---------- Public grid component ----------

interface ListingsGridProps {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

export function ListingsGrid({
  listings,
  loading,
  error,
  onRetry,
  className,
}: ListingsGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6', className)}>
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : listings.length === 0 ? (
        <EmptyState />
      ) : (
        listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
      )}
    </div>
  );
}
