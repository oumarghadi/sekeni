'use client';

import * as React from 'react';
import { LayoutGrid, List, ChevronRight, ChevronLeft } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';

interface PropertyGridProps {
  properties: Property[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');

  return (
    <div className="flex-grow space-y-8">
      {/* Header / Sort */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-3xl p-6 shadow-sm">
        <div className="text-right">
          <h2 className="text-2xl font-extrabold text-[var(--primary)]">العقارات المتاحة</h2>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">عرض {properties.length} من أصل 1,240 عقار منسق في الرياض</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[var(--surface-low)] p-1 rounded-xl flex">
            <button
              onClick={() => setView('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === 'grid' ? "bg-white shadow-sm text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === 'list' ? "bg-white shadow-sm text-[var(--primary)]" : "text-[var(--on-surface-variant)]"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <select className="bg-[var(--surface-low)] border-none rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold text-[var(--primary)] focus:ring-0 cursor-pointer">
            <option>الأحدث أولاً</option>
            <option>السعر: من الأقل للأعلى</option>
            <option>السعر: من الأعلى للأقل</option>
            <option>الأكثر مشاهدة</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className={cn(
        "grid gap-8",
        view === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      )}>
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} className={view === 'list' ? 'flex-row h-64' : ''} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-12 pb-24">
        <button className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--primary)] hover:text-white transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
        {[1, 2, '...', 12].map((page, i) => (
          <button
            key={i}
            className={cn(
              "w-10 h-10 rounded-xl font-bold transition-all",
              page === 1 ? "bg-[var(--primary)] text-white shadow-md" : "bg-white text-[var(--on-surface-variant)] hover:bg-[var(--surface-low)]"
            )}
          >
            {page}
          </button>
        ))}
        <button className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[var(--on-surface-variant)] hover:bg-[var(--primary)] hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
