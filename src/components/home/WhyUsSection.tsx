'use client';

import * as React from 'react';
import { ShieldCheck, Zap, Heart, LayoutGrid, type LucideIcon } from 'lucide-react';
import { RevealSection } from '@/components/ui/RevealSection';

interface Feature {
  title:       string;
  description: string;
  icon:        LucideIcon;
  accent:      string;
  bg:          string;
  number:      string;
}

const features: Feature[] = [
  {
    title:       'كل اللي تدور',
    description: 'من اشري وبيع وكرا وبناء — كل شي في منصة واحدة مزيانة.',
    icon:        LayoutGrid,
    accent:      'var(--secondary)',
    bg:          'var(--secondary-light)',
    number:      '01',
  },
  {
    title:       'سهل وبسيط',
    description: 'واجهة مستخدم عصرية تخليك توصل للي تبغي بضغطات قليلة.',
    icon:        Zap,
    accent:      '#F4A261',
    bg:          '#fef3e8',
    number:      '02',
  },
  {
    title:       'ثقة ومصداقية',
    description: 'نتعاملوا مع أحسن الوسطاء في بلادنا لضمان ديار مزيانة وموثوقة.',
    icon:        ShieldCheck,
    accent:      '#10b981',
    bg:          '#ecfdf5',
    number:      '03',
  },
  {
    title:       'التميز فوق كل شي',
    description: 'نهتموا بالتفاصيل لنقدموا ليك ديار مش بس مساحات، بل تجارب معيشية.',
    icon:        Heart,
    accent:      '#ef4444',
    bg:          '#fef2f2',
    number:      '04',
  },
];

/* ── Feature card with localised cursor spotlight ── */
function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  const cardRef    = React.useRef<HTMLDivElement>(null);
  const spotRef    = React.useRef<HTMLDivElement>(null);
  const enabledRef = React.useRef(false);

  React.useEffect(() => {
    enabledRef.current =
      !window.matchMedia('(hover: none)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const onMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabledRef.current || !cardRef.current || !spotRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    spotRef.current.style.opacity = '1';
    spotRef.current.style.background =
      `radial-gradient(240px circle at ${x}px ${y}px, rgba(77,168,218,0.09), transparent 70%)`;
  }, []);

  const onLeave = React.useCallback(() => {
    if (spotRef.current) spotRef.current.style.opacity = '0';
  }, []);

  return (
    <RevealSection delay={delay}>
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative bg-white rounded-3xl p-7 border border-[var(--outline-variant)] hover:border-transparent hover:shadow-[0_12px_48px_rgba(26,28,30,0.10)] transition-all duration-350 hover:-translate-y-1.5 text-right flex flex-col overflow-hidden h-full"
      >
        {/* Ghost number */}
        <span
          className="absolute top-4 left-4 text-6xl font-black leading-none select-none opacity-[0.055] group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: feature.accent }}
        >
          {feature.number}
        </span>

        {/* Accent stripe on hover */}
        <div
          className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-right rounded-t-full"
          style={{ background: feature.accent }}
        />

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0"
          style={{ background: feature.bg }}
        >
          <feature.icon className="w-6 h-6" style={{ color: feature.accent }} />
        </div>

        <h3 className="text-[15px] font-black text-[var(--primary)] mb-2.5">{feature.title}</h3>
        <p className="text-[var(--on-surface-variant)] text-[13px] leading-relaxed flex-grow">
          {feature.description}
        </p>

        {/* Cursor spotlight — last in DOM, clips to overflow-hidden card boundary */}
        <div
          ref={spotRef}
          className="absolute inset-0 pointer-events-none opacity-0"
          style={{ transition: 'opacity 0.4s ease' }}
          aria-hidden
        />
      </div>
    </RevealSection>
  );
}

/* ── Section ── */
export function WhyUsSection() {
  return (
    <section className="py-28 px-6 bg-white relative overflow-hidden">

      {/* Animated ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[var(--secondary-light)] opacity-50 blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-drift-a animate-glow-pulse" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[var(--gold-light)] opacity-60 blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none animate-drift-b animate-glow-pulse-alt" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <RevealSection className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2.5 mx-auto">
            <span className="h-px w-8 bg-[var(--gold)]" />
            <span className="text-[var(--gold)] text-[11px] font-black uppercase tracking-[0.20em]">
              علاش سكنى موريتانيا؟
            </span>
            <span className="h-px w-8 bg-[var(--gold)]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[var(--primary)]">
            احنا نجددوا تجربة الديار
          </h2>
          <p className="text-[var(--on-surface-variant)] text-base max-w-xl mx-auto leading-relaxed">
            أربعة مبادئ تخلي سكنى الخيار الأول للديار في بلادنا
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
