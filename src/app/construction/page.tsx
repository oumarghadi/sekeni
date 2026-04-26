'use client';

import * as React from 'react';
import Link from 'next/link';
import { Hammer, Ruler, HardHat, Building2, ChevronLeft, Loader2 } from 'lucide-react';
import { ListingsGrid } from '@/components/property/ListingsGrid';
import { fetchListings, Listing } from '@/lib/listings';

const staticServices = [
  { title: 'التخطيط والجدوى',  desc: 'دراسة المشروع ووضع الخطط الزمنية والمالية لضمان نجاحه.', icon: Ruler,     number: '01', accent: 'var(--secondary)', bg: 'var(--secondary-light)' },
  { title: 'التصميم المعماري', desc: 'تصاميم فريدة تعكس هويتك وتجمع بين الجمال والوظيفة.', icon: Building2, number: '02', accent: '#F4A261',           bg: '#fef3e8' },
  { title: 'البناء والتشييد',  desc: 'تنفيذ عالي الجودة باستخدام أحدث التقنيات وأفضل المواد.', icon: Hammer,   number: '03', accent: '#10b981',           bg: '#ecfdf5' },
  { title: 'الإشراف الهندسي', desc: 'متابعة دقيقة لكل تفاصيل التنفيذ لضمان مطابقة المواصفات.', icon: HardHat, number: '04', accent: '#8b5cf6',           bg: '#f5f3ff' },
];

const steps = [
  { step: '01', title: 'طلب استشارة',         desc: 'تواصل معنا واشرح لنا رؤيتك لمشروعك المستقبلي.' },
  { step: '02', title: 'التصميم والتعاقد',    desc: 'نحوّل رؤيتك لتصاميم هندسية ونوقّع عقود التنفيذ.' },
  { step: '03', title: 'البناء والاستلام',    desc: 'نبدأ العمل على أرض الواقع ونسلّمك المفتاح.' },
];

export default function ConstructionPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading,  setLoading]  = React.useState(true);
  const [error,    setError]    = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await fetchListings({ listingType: 'construction_service' });
    if (fetchError) { setError(fetchError); }
    else { setListings(data); setError(null); }
    setLoading(false);
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="bg-[var(--background)] min-h-screen pb-24">

      {/* ── Hero ── */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1800&auto=format&fit=crop&q=85"
          alt="خدمات البناء"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00263f]/85 via-[#00263f]/60 to-[#00263f]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00263f]/40 via-transparent to-transparent" />
        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent" />

        <div className="relative z-10 text-center space-y-8 max-w-4xl px-6 pt-24 pb-20">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-px w-8 bg-[var(--gold)]" />
            <span className="text-[var(--gold)] text-[11px] font-black uppercase tracking-[0.22em]">
              خدمات المقاولات والتعمير
            </span>
            <span className="h-px w-8 bg-[var(--gold)]" />
          </div>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1]"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.35)' }}
          >
            نبني أحلامك<br />
            <span className="text-gradient-secondary">بدقة واحتراف</span>
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            من الفكرة إلى التسليم، سكنى موريتانيا ترافقك في رحلة بناء منزلك الخاص مع نخبة من المقاولين والمهندسين.
          </p>
          <Link href="/contact">
            <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-sm shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all duration-200">
              ابدأ مشروعك الآن
            </button>
          </Link>
        </div>
      </section>

      {/* ── Real listings ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-right mb-12 space-y-2">
          <div className="flex items-center gap-2.5 justify-end">
            <span className="text-[var(--gold)] text-[11px] font-black uppercase tracking-[0.20em]">شركاء البناء</span>
            <span className="h-px w-6 bg-[var(--gold)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[var(--primary)]">خدمات المقاولات المتاحة</h2>
        </div>
        <ListingsGrid listings={listings} loading={loading} error={error} onRetry={loadData} />
      </section>

      {/* ── Services grid ── */}
      <section className="bg-[var(--surface-low)] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2.5 mx-auto">
              <span className="h-px w-8 bg-[var(--gold)]" />
              <span className="text-[var(--gold)] text-[11px] font-black uppercase tracking-[0.20em]">ماذا نقدم لك؟</span>
              <span className="h-px w-8 bg-[var(--gold)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--primary)]">حلول هندسية متكاملة</h2>
            <p className="text-[var(--on-surface-variant)] max-w-md mx-auto text-sm">من الفكرة الأولى إلى تسليم المفاتيح، نحن معك في كل خطوة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staticServices.map((s, i) => (
              <div key={i} className="group relative bg-white rounded-3xl p-7 border border-[var(--outline-variant)] hover:shadow-[0_12px_48px_rgba(26,28,30,0.10)] hover:border-transparent hover:-translate-y-1.5 transition-all duration-300 text-right overflow-hidden">
                <span
                  className="absolute top-4 left-4 text-5xl font-black leading-none select-none opacity-[0.055] group-hover:opacity-[0.09] transition-opacity"
                  style={{ color: s.accent }}
                >
                  {s.number}
                </span>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: s.bg }}
                >
                  <s.icon className="w-6 h-6" style={{ color: s.accent }} />
                </div>
                <h3 className="text-[15px] font-black text-[var(--primary)] mb-2">{s.title}</h3>
                <p className="text-[var(--on-surface-variant)] text-[13px] leading-relaxed">{s.desc}</p>
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-right"
                  style={{ background: s.accent }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2.5 mx-auto">
              <span className="h-px w-8 bg-[var(--gold)]" />
              <span className="text-[var(--gold)] text-[11px] font-black uppercase tracking-[0.20em]">رحلة البناء</span>
              <span className="h-px w-8 bg-[var(--gold)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--primary)]">بساطة في التنفيذ.. دقة في النتائج</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[52px] inset-x-[16.67%] h-px bg-gradient-to-r from-[var(--outline-variant)] via-[var(--gold)]/30 to-[var(--outline-variant)]" />
            {steps.map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-5 text-center">
                <div className="w-[104px] h-[104px] rounded-full bg-white border-2 border-[var(--gold)]/40 shadow-[0_4px_24px_rgba(201,168,76,0.15)] flex flex-col items-center justify-center gap-0.5">
                  <span className="text-[10px] font-black text-[var(--gold)] uppercase tracking-widest">خطوة</span>
                  <span className="text-3xl font-black text-[var(--primary)] leading-none">{item.step}</span>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-ambient border border-[var(--outline-variant)] w-full">
                  <h4 className="text-base font-black text-[var(--primary)] mb-2">{item.title}</h4>
                  <p className="text-[var(--on-surface-variant)] text-[13px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-[var(--primary)] p-10 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-10 text-right">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[var(--secondary)]/10 blur-[80px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[var(--gold)]/10 blur-[60px] translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative z-10 space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-white">هل أنت مقاول أو مهندس؟</h3>
            <p className="text-white/65 text-sm max-w-md leading-relaxed">
              انضم إلى شبكة شركاء سكنى موريتانيا وساهم في بناء مستقبل موريتانيا.
            </p>
          </div>
          <Link href="/auth/register" className="relative z-10 shrink-0">
            <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[var(--primary)] font-black text-sm hover:bg-white/90 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5">
              سجل كشريك بناء
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
