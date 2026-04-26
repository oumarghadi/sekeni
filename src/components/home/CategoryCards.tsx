import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RevealSection } from '@/components/ui/RevealSection';

const categories = [
  {
    title:    'شراء',
    subtitle: 'تملّك منزل أحلامك اليوم',
    tag:      'للبيع',
    image:    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80',
    href:     '/properties?type=buy',
    gradient: 'from-[var(--primary)] to-[var(--primary-container)]',
    tagColor: 'bg-[var(--secondary)]',
  },
  {
    title:    'استئجار',
    subtitle: 'خيارات مرنة للحياة العصرية',
    tag:      'للإيجار',
    image:    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80',
    href:     '/properties?type=rent',
    gradient: 'from-amber-700 to-amber-500',
    tagColor: 'bg-amber-500',
  },
  {
    title:    'بناء',
    subtitle: 'حوّل رؤيتك إلى واقع ملموس',
    tag:      'خدمات',
    image:    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=80',
    href:     '/construction',
    gradient: 'from-emerald-800 to-emerald-600',
    tagColor: 'bg-emerald-500',
  },
];

export function CategoryCards() {
  return (
    <section className="py-24 px-6 bg-[var(--surface-low)]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <RevealSection className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2.5 mx-auto">
            <span className="h-px w-8 bg-[var(--gold)]" />
            <span className="text-[var(--gold)] text-[11px] font-black uppercase tracking-[0.20em]">ابدأ رحلتك العقارية</span>
            <span className="h-px w-8 bg-[var(--gold)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[var(--primary)]">اختر ما يناسبك</h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <RevealSection key={cat.title} delay={i * 90}>
              <Link
                href={cat.href}
                className="group relative h-80 overflow-hidden rounded-3xl block shadow-ambient hover:shadow-ambient-lg transition-all duration-400 hover:-translate-y-2"
              >
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Base overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

                {/* Light sweep — DOM-ordered before UI elements */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="card-shine-inner" />
                </div>

                {/* Tag */}
                <div className={`absolute top-4 right-4 ${cat.tagColor} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg`}>
                  {cat.tag}
                </div>

                {/* Gold dot accent on hover */}
                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 right-0 left-0 p-7 text-right">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">{cat.subtitle}</p>
                  <h3
                    className="text-4xl font-black text-white mb-4"
                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
                  >
                    {cat.title}
                  </h3>
                  <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${cat.gradient} text-white text-xs font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300`}>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    اكتشف المزيد
                  </div>
                </div>

                {/* Bottom gradient stripe */}
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${cat.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-right`} />
              </Link>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
