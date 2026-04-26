import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, Trophy, Lightbulb, ArrowLeft, Building2, Users2, Star, Shield } from 'lucide-react';

const stats = [
  { value: '+15,000', label: 'عقار مدرج', sub: 'في كل أنحاء موريتانيا' },
  { value: '+500K', label: 'مستخدم نشط', sub: 'يثقون في سكنى' },
  { value: '+120', label: 'شراكة معتمدة', sub: 'وكلاء ومطورين' },
  { value: '4.9★', label: 'تقييم المستخدمين', sub: 'على متجر التطبيقات' },
];

const values = [
  {
    icon: Lightbulb,
    title: 'الابتكار',
    desc: 'نسعى دائماً لتحدي المألوف وتقديم حلول تقنية ذكية تخدم الفرد والمستثمر على حدٍّ سواء.',
    accent: '#4DA8DA',
  },
  {
    icon: Shield,
    title: 'الشفافية',
    desc: 'نضع الصدق والوضوح في مقدمة كل تعاملاتنا لبناء علاقة ثقة متينة مع كل عميل.',
    accent: '#00263f',
  },
  {
    icon: Trophy,
    title: 'التميّز',
    desc: 'لا نرضى بأقل من التميز في كل عقار وخدمة، لأن منازلكم تستحق الأفضل دائماً.',
    accent: '#F4A261',
  },
  {
    icon: Users2,
    title: 'المجتمع',
    desc: 'نؤمن بقوة المجتمع وبناء بيئة عقارية صحية تُثري الاقتصاد الوطني الموريتاني.',
    accent: '#4DA8DA',
  },
  {
    icon: CheckCircle2,
    title: 'الموثوقية',
    desc: 'كل إعلان يمر بمراجعة دقيقة، لأن ثقتك هي أثمن ما نحافظ عليه.',
    accent: '#00263f',
  },
  {
    icon: Star,
    title: 'الجودة',
    desc: 'من تجربة المستخدم إلى جودة المحتوى، نرفع المعايير في كل تفصيلة.',
    accent: '#F4A261',
  },
];

const milestones = [
  { year: '2024', title: 'التأسيس', desc: 'إطلاق الفكرة وتكوين الفريق المؤسس في نواكشوط.' },
  { year: '2025', title: 'الإطلاق', desc: 'إطلاق النسخة الأولى من المنصة بأكثر من 500 إعلان مدرج.' },
  { year: '2025', title: 'النمو', desc: 'تجاوز 10,000 مستخدم نشط وتوسيع التغطية لتشمل نواذيبو وكيفة.' },
  { year: '2026', title: 'الريادة', desc: 'أصبحنا المنصة العقارية الأولى في موريتانيا بثقة أكثر من 500,000 مستخدم.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden" dir="rtl">

      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#00263f]">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Diagonal accent */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />
        {/* Blue orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#4DA8DA]/20 blur-3xl pointer-events-none" />
        {/* Gold orb */}
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-[#F4A261]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2.5">
                <Building2 className="w-4 h-4 text-[#4DA8DA]" />
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest">عن سكنى موريتانيا</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
                نصنع مستقبل
                <br />
                <span className="text-[#4DA8DA]">العقار</span> في
                <br />
                موريتانيا
              </h1>

              <p className="text-lg text-white/60 leading-relaxed max-w-lg">
                تأسست سكنى لتكون الوجهة الرقمية الأولى للعقارات في موريتانيا — منصة تجمع التقنية الحديثة بالذوق الرفيع لتقديم تجربة تتجاوز التوقعات.
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2.5 bg-[#4DA8DA] hover:bg-[#3a97ca] text-white font-bold px-7 py-4 rounded-2xl transition-all duration-200 cursor-pointer"
                >
                  استكشف العقارات
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white/80 hover:text-white font-bold px-7 py-4 rounded-2xl transition-all duration-200 cursor-pointer"
                >
                  تواصل معنا
                </Link>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="bg-white/[0.07] border border-white/[0.12] rounded-3xl p-6 hover:bg-white/[0.12] transition-all duration-200 cursor-default"
                >
                  <p dir="ltr" className="text-3xl md:text-4xl font-black text-white mb-1">{s.value}</p>
                  <p className="text-white/80 text-sm font-bold">{s.label}</p>
                  <p className="text-white/40 text-xs mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSION ─── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <span className="inline-block text-[#4DA8DA] text-xs font-bold uppercase tracking-widest">رسالتنا</span>
          <h2 className="text-4xl md:text-6xl font-black text-[#00263f] leading-tight">
            نُعيد تعريف تجربة
            <br />
            البحث عن المسكن
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
            نؤمن بأن إيجاد المنزل المناسب لا يجب أن يكون رحلة شاقة. لذلك بنينا سكنى على مبدأ واحد: تجربة بسيطة، موثوقة، وذات قيمة حقيقية لكل موريتاني.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="w-16 h-px bg-[#4DA8DA]/30" />
            <div className="w-2 h-2 rounded-full bg-[#4DA8DA]" />
            <div className="w-16 h-px bg-[#4DA8DA]/30" />
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-28 px-6 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="inline-block text-[#4DA8DA] text-xs font-bold uppercase tracking-widest">ما الذي يحركنا</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#00263f]">قيمنا الأساسية</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-[#4DA8DA]/30 hover:shadow-lg transition-all duration-300 group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: v.accent + '15' }}
                >
                  <v.icon className="w-6 h-6" style={{ color: v.accent }} />
                </div>
                <h4 className="text-xl font-black text-[#00263f] mb-3 group-hover:text-[#4DA8DA] transition-colors">{v.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="py-28 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="inline-block text-[#4DA8DA] text-xs font-bold uppercase tracking-widest">رحلتنا</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#00263f]">قصة النجاح</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute right-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#4DA8DA]/50 via-[#4DA8DA] to-[#4DA8DA]/50 hidden md:block" />

            <div className="space-y-12">
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row-reverse' : ''} md:flex`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-right md:text-left'}`}>
                    <div
                      className={`bg-[#f8fafc] border border-gray-100 rounded-3xl p-8 hover:border-[#4DA8DA]/30 hover:shadow-lg transition-all duration-300 cursor-default inline-block w-full md:max-w-sm ${i % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}
                    >
                      <span className="text-[#4DA8DA] text-sm font-black uppercase tracking-widest block mb-2">{m.year}</span>
                      <h4 className="text-xl font-black text-[#00263f] mb-2">{m.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex w-6 h-6 rounded-full bg-[#4DA8DA] border-4 border-white shadow-md shrink-0 z-10" />

                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="mx-6 mb-16 rounded-[3rem] overflow-hidden bg-[#00263f] relative">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#4DA8DA]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#F4A261]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 py-20 px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            ابدأ رحلتك العقارية
            <br />
            <span className="text-[#4DA8DA]">مع سكنى اليوم</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto leading-relaxed">
            سواء كنت تبحث عن منزل أحلامك أو تريد تسويق عقارك، سكنى هي وجهتك الأولى والأكثر موثوقية في موريتانيا.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-[#4DA8DA] hover:bg-[#3a97ca] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 cursor-pointer"
            >
              ابحث عن عقار
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white/80 hover:text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 cursor-pointer"
            >
              أنشئ حسابك مجاناً
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
