'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { SearchBar } from './SearchBar';

const HeroCanvas = dynamic(
  () => import('@/components/3d/HeroCanvas').then(m => ({ default: m.HeroCanvas })),
  { ssr: false }
);

const stats = [
  { value: '+1K',  label: 'دار مسجلة' },
  { value: '4.8★', label: 'تقييم مزيان' },
  { value: '24/7', label: 'خدمة دايمة' },
];

export function HeroSection() {
  const sectionRef    = React.useRef<HTMLElement>(null);
  const imgRef        = React.useRef<HTMLImageElement>(null);
  const spotlightRef  = React.useRef<HTMLDivElement>(null);

  /* ── Parallax on scroll ── */
  React.useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (imgRef.current)
            imgRef.current.style.transform = `translateY(${window.scrollY * 0.22}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Mouse spotlight ── */
  React.useEffect(() => {
    const section   = sectionRef.current;
    const spotlight = spotlightRef.current;
    if (!section || !spotlight) return;

    /* disable on touch screens and reduced-motion */
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (e: MouseEvent) => {
      const { left, top } = section.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      spotlight.style.background =
        `radial-gradient(700px circle at ${x}px ${y}px,` +
        ` rgba(77,168,218,0.11),` +
        ` rgba(201,168,76,0.04) 42%,` +
        ` transparent 68%)`;
      spotlight.style.opacity = '1';
    };

    const onLeave = () => { spotlight.style.opacity = '0'; };

    section.addEventListener('mousemove', onMove,  { passive: true });
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen -mt-20 flex items-center justify-center overflow-hidden"
    >

      {/* ── Background layer ── */}
      <div className="absolute inset-0 z-0">
        <img
          ref={imgRef}
          src="/images/backgroud.jpeg"
          alt=""
          aria-hidden="true"
          loading="eager"
          className="w-full h-[112%] object-cover will-change-transform"
          style={{ transformOrigin: 'center top' }}
        />

        {/* Animated ambient orbs */}
        <div className="absolute top-[18%] left-[6%]  w-[500px] h-[500px] rounded-full bg-[var(--secondary)]/12 blur-[120px] animate-drift-a        pointer-events-none" />
        <div className="absolute bottom-[12%] right-[4%] w-[380px] h-[380px] rounded-full bg-[var(--gold)]/8    blur-[100px] animate-drift-b animate-glow-pulse-alt pointer-events-none" />

        {/* Dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00263f]/90 via-[#00263f]/60 to-[#00263f]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00263f]/50 via-transparent to-transparent" />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />

        {/* 3D floating shapes — above overlays, below spotlight, desktop only */}
        <HeroCanvas />

        {/* Mouse spotlight — last child → paints above overlays, below z-10 content */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none opacity-0"
          style={{ transition: 'opacity 0.55s ease' }}
          aria-hidden
        />
      </div>

      {/* ── Bottom fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-40 z-10 bg-gradient-to-t from-[var(--background)] to-transparent" />

      {/* ── Content ── */}
      <div className="container mx-auto px-6 relative z-10 text-center space-y-10 pt-28 pb-20">

        {/* Eyebrow */}
        <div className="animate-fadein stagger-1 flex flex-col items-center gap-2 mx-auto">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-px w-8 bg-[var(--gold)]" />
            <span className="text-[var(--gold)] text-[11px] font-bold uppercase tracking-[0.22em]">
              المنصة الرائدة للعقارات في موريتانيا
            </span>
            <span className="h-px w-8 bg-[var(--gold)]" />
          </div>
          {/* Hassaniya badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-white/80 text-[11px] font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
            الديار — بيوتكم في يدينكم
          </span>
        </div>

        {/* Logo */}
        <div className="animate-fadein stagger-2 flex justify-center">
          <div className="relative group cursor-default select-none">

            {/* Deep radial glow behind */}
            <div
              className="absolute -inset-6 rounded-[3rem] pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(77,168,218,0.28) 0%, rgba(201,168,76,0.10) 55%, transparent 75%)',
                filter: 'blur(12px)',
              }}
            />

            {/* Outer decorative ring — gold */}
            <div className="absolute -inset-4 rounded-[2.2rem] border border-[#C9A84C]/25 pointer-events-none" />
            {/* Inner decorative ring — blue */}
            <div className="absolute -inset-2 rounded-[1.8rem] border border-[#4DA8DA]/35 pointer-events-none" />

            {/* Corner bracket accents */}
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-[2px] border-r-[2px] border-[#4DA8DA]/80 rounded-tr-lg pointer-events-none" />
            <div className="absolute -top-1.5 -left-1.5  w-5 h-5 border-t-[2px] border-l-[2px] border-[#4DA8DA]/80 rounded-tl-lg pointer-events-none" />
            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-[2px] border-r-[2px] border-[#C9A84C]/80 rounded-br-lg pointer-events-none" />
            <div className="absolute -bottom-1.5 -left-1.5  w-5 h-5 border-b-[2px] border-l-[2px] border-[#C9A84C]/80 rounded-bl-lg pointer-events-none" />

            {/* Logo frame */}
            <div
              className="relative overflow-hidden rounded-2xl transition-all duration-500 group-hover:scale-[1.03]"
              style={{
                boxShadow: '0 8px 40px rgba(0,38,63,0.55), 0 0 0 1px rgba(255,255,255,0.12), 0 0 30px rgba(77,168,218,0.18)',
              }}
            >
              <img
                src="/images/logo-sekeni.png"
                alt="سكنى"
                className="h-24 md:h-32 w-auto object-contain block"
              />
              {/* Shine sweep on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
              {/* Top-left glass highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2 max-w-3xl mx-auto">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] animate-fadein stagger-3"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.35)' }}
          >
            كل ما تحتاجه
          </h1>
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] animate-fadein stagger-3"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.35)' }}
          >
            <span className="text-gradient-secondary">في مكان واحد</span>
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto animate-fadein stagger-4 leading-relaxed mt-4">
            اكتشف أجمل الديار في موريتانيا — مختارة بعناية لتناسب ذوقك الرفيع.
          </p>
        </div>

        {/* Search bar */}
        <div className="animate-fadein stagger-4 px-0 md:px-4">
          <SearchBar />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap animate-fadein stagger-5 pb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl px-6 py-3.5 hover:bg-white/[0.15] hover:border-white/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div dir="ltr" className="text-xl md:text-2xl font-black text-white drop-shadow-sm">
                {stat.value}
              </div>
              <div className="w-px h-5 bg-white/20" />
              <div className="text-[11px] text-white/75 uppercase tracking-widest font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
