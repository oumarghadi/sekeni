import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const socialLinks = [
  {
    label: 'Instagram',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const quickLinks = [
  { label: 'عقارات للبيع',     href: '/properties?type=buy' },
  { label: 'عقارات للإيجار',   href: '/properties?type=rent' },
  { label: 'خدمات البناء',     href: '/construction' },
  { label: 'المشاريع الحصرية', href: '/projects' },
  { label: 'بحث عن وكلاء',    href: '/agents' },
];

const supportLinks = [
  { label: 'من نحن',          href: '/about' },
  { label: 'تواصل معنا',      href: '/contact' },
  { label: 'الأسئلة الشائعة', href: '/faq' },
  { label: 'سياسة الخصوصية',  href: '/privacy' },
  { label: 'الشروط والأحكام', href: '/terms' },
];

export function Footer() {
  return (
    <footer className="bg-[var(--primary)] pt-20 pb-8 px-6 relative overflow-hidden">
      {/* Subtle dot pattern for texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[var(--secondary)]/40 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* ── Brand ── */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {/* SVG house mark */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect width="36" height="36" rx="10" fill="#4DA8DA" fillOpacity="0.18"/>
                <path d="M18 7L6 17h3v11h7v-7h4v7h7V17h3L18 7z" fill="#4DA8DA"/>
              </svg>
              <span className="text-white text-xl font-black tracking-tight leading-none">
                Sekeni <span className="text-[var(--secondary)]">Sa</span>
              </span>
            </Link>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              منصة سكنى موريتانيا هي الوجهة الرقمية الرائدة للعقارات في موريتانيا، نقدم تجربة منسقة للباحثين عن التميز المعماري في نواكشوط والمدن الكبرى.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ svg, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-[var(--secondary)] hover:text-white transition-all duration-200 border border-white/10 hover:border-[var(--secondary)]"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/55 hover:text-[var(--secondary)] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--secondary)]/40 group-hover:bg-[var(--secondary)] transition-colors shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">الدعم والمساعدة</h4>
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/55 hover:text-[var(--secondary)] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--secondary)]/40 group-hover:bg-[var(--secondary)] transition-colors shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">اتصل بنا</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[var(--secondary)]" />
                </div>
                <span className="text-white/55 text-sm leading-relaxed">
                  شارع الاستقلال، تفرغ زينة، نواكشوط، موريتانيا
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[var(--secondary)]" />
                </div>
                <a href="tel:+22246603985" className="text-white/55 hover:text-[var(--secondary)] text-sm font-medium transition-colors" dir="ltr">+222 46603985</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[var(--secondary)]" />
                </div>
                <span className="text-white/55 text-sm">contact@sekeni.mr</span>
              </li>
            </ul>

            {/* Newsletter mini CTA */}
            <div className="mt-8 p-4 rounded-2xl bg-white/[0.06] border border-white/10">
              <p className="text-white/70 text-xs font-bold mb-3">اشترك في نشرتنا الإخبارية</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  aria-label="بريدك الإلكتروني"
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:ring-0 focus:border-[var(--secondary)] transition-colors"
                />
                <button
                  type="button"
                  className="bg-[var(--secondary)] hover:bg-[var(--secondary)]/90 text-white text-xs font-bold px-4 rounded-xl transition-colors whitespace-nowrap"
                >
                  اشترك
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/35 text-xs">
            © 2026 سكنى موريتانيا. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]/60" />
            <span className="text-white/35 text-[11px] uppercase tracking-widest font-bold">
              Premium Real Estate · Mauritania
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]/60" />
          </div>
        </div>
      </div>
    </footer>
  );
}
