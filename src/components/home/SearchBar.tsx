'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, Banknote, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const OPERATION_TABS = [
  { id: 'buy',   label: 'شراء',  color: 'from-[var(--primary)] to-[var(--primary-container)]' },
  { id: 'rent',  label: 'إيجار', color: 'from-amber-500 to-amber-600' },
  { id: 'build', label: 'بناء',  color: 'from-emerald-600 to-emerald-700' },
] as const;

export function SearchBar() {
  const router = useRouter();
  const [operation, setOperation]       = React.useState<'buy' | 'rent' | 'build'>('buy');
  const [location, setLocation]         = React.useState('');
  const [propertyType, setPropertyType] = React.useState('');
  const [maxPrice, setMaxPrice]         = React.useState('');
  const [categories, setCategories]     = React.useState<{ id: string; name_ar: string }[]>([]);

  React.useEffect(() => {
    supabase
      .from('property_categories')
      .select('id, name_ar')
      .eq('is_active', true)
      .order('name_ar')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const handleSearch = () => {
    if (operation === 'build') {
      router.push('/construction');
      return;
    }
    const params = new URLSearchParams();
    params.set('type', operation);
    if (location.trim())   params.set('city', location.trim());
    if (propertyType)      params.set('propertyType', propertyType);
    if (maxPrice.trim())   params.set('maxPrice', maxPrice.trim());
    router.push(`/properties?${params.toString()}`);
  };

  const activeTab = OPERATION_TABS.find(t => t.id === operation)!;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ── Operation tabs ── */}
      <div className="flex justify-center mb-3">
        <div className="flex items-center bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-1 gap-1">
          {OPERATION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOperation(tab.id)}
              className={cn(
                'px-6 py-2 rounded-xl text-sm font-black transition-all duration-200',
                operation === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main bar ── */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_48px_rgba(0,38,63,0.20)] border border-white/60 overflow-hidden">
        <div className="flex flex-col lg:flex-row">

          {/* Property Type */}
          <div className="flex items-center gap-3 px-5 py-4 border-b lg:border-b-0 lg:border-l border-[var(--outline-variant)] group cursor-pointer min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[var(--secondary-light)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Home className="w-4 h-4 text-[var(--secondary)]" />
            </div>
            <div className="flex flex-col flex-1 text-right min-w-0">
              <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--on-surface-variant)] font-black mb-0.5">نوع العقار</span>
              <div className="relative flex items-center">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-sm font-black text-[var(--primary)] focus:ring-0 cursor-pointer appearance-none"
                >
                  <option value="">كل الأنواع</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name_ar}>{c.name_ar}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--on-surface-variant)] shrink-0 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 px-5 py-4 border-b lg:border-b-0 lg:border-l border-[var(--outline-variant)] group flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--secondary-light)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <MapPin className="w-4 h-4 text-[var(--secondary)]" />
            </div>
            <div className="flex flex-col flex-1 text-right min-w-0">
              <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--on-surface-variant)] font-black mb-0.5">الموقع</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="نواكشوط، تفرغ زينة..."
                className="w-full bg-transparent border-none p-0 text-sm font-black text-[var(--primary)] focus:ring-0 placeholder:text-[var(--on-surface-variant)]/40"
              />
            </div>
          </div>

          {/* Max Price */}
          <div className="flex items-center gap-3 px-5 py-4 border-b lg:border-b-0 lg:border-l border-[var(--outline-variant)] group flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--secondary-light)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Banknote className="w-4 h-4 text-[var(--secondary)]" />
            </div>
            <div className="flex flex-col flex-1 text-right min-w-0">
              <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--on-surface-variant)] font-black mb-0.5">الميزانية القصوى (MRU)</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="5 000 000"
                className="w-full bg-transparent border-none p-0 text-sm font-black text-[var(--primary)] focus:ring-0 placeholder:text-[var(--on-surface-variant)]/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className={cn(
              'flex items-center justify-center gap-2.5 px-8 py-4 font-black text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] shrink-0',
              `bg-gradient-to-r ${activeTab.color}`
            )}
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:block">بحث</span>
          </button>
        </div>
      </div>
    </div>
  );
}
