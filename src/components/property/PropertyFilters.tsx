'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const OPERATION_OPTIONS = [
  { id: 'all',   label: 'الكل'   },
  { id: 'buy',   label: 'شراء'   },
  { id: 'rent',  label: 'إيجار'  },
  { id: 'build', label: 'بناء'   },
];

export function PropertyFilters() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [isOpen,       setIsOpen]       = React.useState(false);
  const [operation,    setOperation]    = React.useState(searchParams.get('type') ?? 'all');
  const [location,     setLocation]     = React.useState(searchParams.get('city') ?? '');
  const [categories,   setCategories]   = React.useState<{ id: string; name_ar: string }[]>([]);

  React.useEffect(() => {
    supabase
      .from('property_categories')
      .select('id, name_ar')
      .eq('is_active', true)
      .order('name_ar')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);
  const [selectedType, setSelectedType] = React.useState(searchParams.get('propertyType') ?? '');
  const [maxPrice,     setMaxPrice]     = React.useState(searchParams.get('maxPrice') ?? '');

  React.useEffect(() => {
    setOperation(searchParams.get('type') ?? 'all');
    setLocation(searchParams.get('city') ?? '');
    setSelectedType(searchParams.get('propertyType') ?? '');
    setMaxPrice(searchParams.get('maxPrice') ?? '');
  }, [searchParams]);

  const handleApply = () => {
    const params = new URLSearchParams();
    if (operation !== 'all') params.set('type', operation);
    if (location.trim()) params.set('city', location.trim());
    if (selectedType) params.set('propertyType', selectedType);
    if (maxPrice.trim()) params.set('maxPrice', maxPrice.trim());
    router.push(`/properties?${params.toString()}`);
    setIsOpen(false);
  };

  const handleReset = () => {
    setOperation('all');
    setLocation('');
    setSelectedType('');
    setMaxPrice('');
    router.push('/properties');
    setIsOpen(false);
  };

  const hasActiveFilters = operation !== 'all' || location || selectedType || maxPrice;

  const panelContent = (
    <div className="space-y-7">

      {/* ── Operation type ── */}
      <div>
        <p className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.15em] mb-3">
          نوع العملية
        </p>
        <div className="grid grid-cols-2 gap-2">
          {OPERATION_OPTIONS.map((op) => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id)}
              className={cn(
                'py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200',
                operation === op.id
                  ? 'bg-[var(--primary)] text-white shadow-[0_4px_12px_rgba(0,38,63,0.25)]'
                  : 'bg-[var(--surface-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)]'
              )}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="divider-gold" />

      {/* ── Property type ── */}
      <div>
        <p className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.15em] mb-3">
          نوع العقار
        </p>
        {categories.length === 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-9 rounded-xl bg-[var(--surface-low)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {categories.map(({ id, name_ar }) => (
              <button
                key={id}
                onClick={() => setSelectedType(selectedType === name_ar ? '' : name_ar)}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200',
                  selectedType === name_ar
                    ? 'bg-[var(--secondary)] text-white shadow-[0_4px_12px_rgba(77,168,218,0.30)]'
                    : 'bg-[var(--surface-low)] text-[var(--on-surface-variant)] hover:bg-[var(--secondary-light)] hover:text-[var(--secondary)]'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                {name_ar}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="divider-gold" />

      {/* ── Location ── */}
      <div>
        <p className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.15em] mb-3">
          الموقع
        </p>
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--on-surface-variant)]" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="مدينة أو حي..."
            className="w-full bg-[var(--surface-low)] border border-transparent rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)]/15 transition-all"
          />
        </div>
      </div>

      {/* ── Max price ── */}
      <div>
        <p className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.15em] mb-3">
          السعر الأقصى
        </p>
        <div className="relative">
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="مثلاً: 5 000 000"
            className="w-full bg-[var(--surface-low)] border border-transparent rounded-xl py-2.5 pr-4 pl-16 text-sm focus:outline-none focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)]/15 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--on-surface-variant)]">
            MRU
          </span>
        </div>
        {maxPrice && (
          <p className="text-[11px] text-[var(--secondary)] font-bold mt-2">
            الحد: {parseInt(maxPrice).toLocaleString('fr-FR')} MRU
          </p>
        )}
      </div>

      {/* ── CTA buttons ── */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={handleApply}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] text-white text-sm font-black shadow-[0_4px_16px_rgba(0,38,63,0.25)] hover:shadow-[0_6px_24px_rgba(0,38,63,0.35)] hover:-translate-y-0.5 transition-all duration-200"
        >
          تطبيق الفلاتر
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-xl text-xs font-black text-[var(--on-surface-variant)] hover:text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            مسح الفلاتر
          </button>
        )}
      </div>
    </div>
  );

  return (
    <aside className="w-full lg:w-72 shrink-0">

      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full lg:hidden flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all duration-200 text-sm font-black',
          hasActiveFilters
            ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-[0_4px_16px_rgba(0,38,63,0.25)]'
            : 'bg-white text-[var(--primary)] border-[var(--outline-variant)]'
        )}
      >
        <span>تصفية النتائج</span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] flex items-center justify-center">
              {[operation !== 'all', !!location, !!selectedType, !!maxPrice].filter(Boolean).length}
            </span>
          )}
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </button>

      {/* Desktop panel */}
      <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-ambient border border-[var(--outline-variant)] sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black text-[var(--primary)]">الفلاتر</h3>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
              مسح
            </button>
          )}
        </div>
        {panelContent}
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-fadein">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-[var(--primary)]">تصفية العقارات</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-[var(--surface-low)] flex items-center justify-center hover:bg-[var(--surface-high)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {panelContent}
          </div>
        </div>
      )}
    </aside>
  );
}
