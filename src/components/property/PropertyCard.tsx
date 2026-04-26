import * as React from 'react';
import Link from 'next/link';
import { Heart, MapPin, BedDouble, Bath, Square, Sparkles } from 'lucide-react';
import { Property } from '@/types/property';
import { Badge } from '@/components/ui/Badge';
import { cn, formatPrice } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  return (
    <div className={cn('card-lifted group overflow-hidden flex flex-col', className)}>
      {/* Image Area */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.titleAr}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {property.isNew && (
            <Badge variant="tertiary" pulse className="shadow-sm">جديد</Badge>
          )}
          {property.isFeatured && (
            <Badge variant="primary" className="shadow-sm">مميز</Badge>
          )}
        </div>
        <button className="absolute top-4 left-4 p-2.5 rounded-full glass hover:bg-white text-[var(--primary)] transition-all transform hover:scale-110 active:scale-90">
          <Heart className="w-5 h-5" />
        </button>
        {property.isVerified && (
          <div className="absolute bottom-4 right-4 glass px-3 py-1 rounded-full flex items-center gap-1.5 text-[var(--primary)] text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-[var(--secondary)]" />
            عقار موثق
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[var(--primary)] group-hover:text-[var(--secondary)] transition-colors">
              {property.titleAr}
            </h3>
            <div className="flex items-center text-[var(--on-surface-variant)] text-xs gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--secondary)]" />
              <span>{property.locationAr}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-[var(--outline-variant)]">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 text-[var(--on-surface-variant)] text-sm">
              <div className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4" />
                <span>{property.area} م²</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-[var(--primary)]">
              {formatPrice(property.price)}
            </div>
            <Link href={`/properties/${property.id}`}>
              <span className="text-sm font-bold text-[var(--secondary)] hover:underline">
                التفاصيل
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
