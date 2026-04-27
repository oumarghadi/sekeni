'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, CheckCircle2 } from 'lucide-react';
import { RevealSection } from '@/components/ui/RevealSection';
import { supabase } from '@/lib/supabase';
import { getFirstImage, operationTypeLabel } from '@/lib/listings';
import type { Listing } from '@/lib/listings';

const benefits = [
  'بيّن دارك في دقايق',
  'آلاف الدايرين يشوفوك',
  'تسيير كامل من لوحة تحكم',
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&auto=format&fit=crop&q=80';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return 'منذ لحظات';
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  return `قبل ${Math.floor(diff / 86400)} يوم`;
}

export function AppSection() {
  const [listing, setListing] = React.useState<Listing | null>(null);

  React.useEffect(() => {
    supabase
      .from('listings')
      .select(`
        id, title, operation_type, listing_type, created_at, price, currency_code,
        description, address_text, is_featured,
        listing_images ( storage_path, sort_order ),
        cities ( name_ar ),
        property_details ( area_sqm, rooms_count, bathrooms_count, has_parking ),
        construction_service_details ( service_type, estimated_duration, budget_min, budget_max )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const raw = data as any;
        setListing({
          ...raw,
          cities:  Array.isArray(raw.cities) ? raw.cities[0] ?? null : raw.cities,
          listing_images: raw.listing_images ?? [],
          property_details: Array.isArray(raw.property_details)
            ? raw.property_details[0] ?? null
            : raw.property_details,
          construction_service_details: Array.isArray(raw.construction_service_details)
            ? raw.construction_service_details[0] ?? null
            : raw.construction_service_details,
        });
      });
  }, []);

  const imgUrl       = listing ? getFirstImage(listing.listing_images) : FALLBACK_IMAGE;
  const notifTitle   = listing ? listing.title : null;
  const notifLabel   = listing ? `تم نشره ${operationTypeLabel[listing.operation_type]}` : 'تم بيع الفيلا!';
  const notifTime    = listing ? `${timeAgo(listing.created_at)} بواسطة سكنى` : 'قبل 3 دقائق بواسطة سكنى';

  return (
    <section className="py-20 px-6 bg-[var(--surface-low)]">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--primary)] p-10 lg:p-16">

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[var(--secondary)]/10 blur-[80px] -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[var(--tertiary)]/10 blur-[80px] translate-x-1/3 translate-y-1/3" />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

              {/* ── Text side ── */}
              <div className="max-w-xl text-right space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)] inline-block" />
                  للبياعين والوسطاء
                </div>

                <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                  واش تبغي<br />
                  <span className="text-[var(--secondary)]">تبيع دارك؟</span>
                </h2>

                <p className="text-white/65 text-base leading-relaxed">
                  نوفروا ليك المنصة الأسرع والأمزيان لعرض دارك عند آلاف الدايرين. ابدأ دروك واكتشف قوة سكنى في بلادنا.
                </p>

                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center justify-end gap-3 text-white/80 text-sm font-bold">
                      <span>{benefit}</span>
                      <CheckCircle2 className="w-5 h-5 text-[var(--secondary)] shrink-0" />
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-4 justify-end pt-2">
                  <Link href="/auth/register">
                    <button className="px-7 py-3.5 rounded-2xl bg-white text-[var(--primary)] font-black text-sm hover:bg-white/90 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5">
                      ابدأ دروك بالمجان
                    </button>
                  </Link>
                  <Link href="/about">
                    <button type="button" className="text-white/70 hover:text-white text-sm font-bold underline underline-offset-4 transition-colors">
                      شوف المزيد
                    </button>
                  </Link>
                </div>
              </div>

              {/* ── Visual side ── */}
              <div className="relative w-full lg:w-[380px] shrink-0">
                <div className="absolute inset-0 bg-[var(--secondary)]/15 rounded-full blur-[60px] scale-90" />

                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-2xl overflow-hidden group">
                  <img
                    src={imgUrl}
                    alt={listing?.title ?? 'عقار سكنى'}
                    loading="lazy"
                    className="rounded-2xl w-full aspect-[4/3] object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700"
                  />

                  {/* Floating notification — real data */}
                  <div className="absolute bottom-8 right-6 left-6">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 text-right translate-y-3 group-hover:translate-y-0 opacity-90 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[var(--primary)] font-black text-sm truncate">
                          {notifTitle ?? notifLabel}
                        </p>
                        <p className="text-[var(--on-surface-variant)] text-[11px]">{notifTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
