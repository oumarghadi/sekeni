'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Mail, MessageSquare, MapPin, Phone, Send, CheckCircle2, ArrowLeft, Clock } from 'lucide-react';

function buildPrefilledSubject(intent: string | null, title: string | null) {
  if (intent === 'visit' && title) return `طلب معاينة للعقار: ${title}`;
  if (title) return `استفسار عن العقار: ${title}`;
  return 'استفسار عن عقار محدد';
}

function buildPrefilledMessage(params: {
  intent: string | null;
  title: string | null;
  visitDate: string | null;
  visitTime: string | null;
  visitNote: string | null;
  message: string | null;
}) {
  if (params.message) return params.message;
  if (params.intent === 'visit' && params.title) {
    return [
      `أرغب في حجز موعد معاينة للعقار "${params.title}".`,
      params.visitDate ? `التاريخ المقترح: ${params.visitDate}.` : null,
      params.visitTime ? `الوقت المقترح: ${params.visitTime}.` : null,
      params.visitNote ? `ملاحظات إضافية: ${params.visitNote}.` : null,
    ].filter(Boolean).join('\n');
  }
  if (params.title) return `أرغب في التواصل بخصوص العقار "${params.title}".`;
  return '';
}

const PHONE = '+222 41 92 60 83';
const WHATSAPP = '22241926083';

const contactCards = [
  {
    icon: Phone,
    title: 'اتصل بنا',
    detail: PHONE,
    action: `https://wa.me/22241926083`,
    actionLabel: 'اتصل الآن',
    ltr: true,
    accent: '#4DA8DA',
    bg: '#eef7fd',
  },
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    detail: 'contact@sekeni.mr',
    action: 'mailto:contact@sekeni.mr',
    actionLabel: 'أرسل إيميل',
    ltr: false,
    accent: '#00263f',
    bg: '#f0f4f8',
  },
  {
    icon: MapPin,
    title: 'العنوان',
    detail: 'شارع الاستقلال، تفرغ زينة\nنواكشوط، موريتانيا',
    action: 'https://maps.google.com/?q=Nouakchott,Mauritania',
    actionLabel: 'اعرض على الخريطة',
    ltr: false,
    accent: '#F4A261',
    bg: '#fef6ee',
  },
];

function ContactPageInner() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('property');
  const title = searchParams.get('title');
  const intent = searchParams.get('intent');
  const visitDate = searchParams.get('visitDate');
  const visitTime = searchParams.get('visitTime');
  const visitNote = searchParams.get('visitNote');
  const fallbackMessage = searchParams.get('message');

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [subject, setSubject] = React.useState(() => buildPrefilledSubject(intent, title));
  const [message, setMessage] = React.useState(() =>
    buildPrefilledMessage({ intent, title, visitDate, visitTime, visitNote, message: fallbackMessage })
  );
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    setSubject(buildPrefilledSubject(intent, title));
    setMessage(buildPrefilledMessage({ intent, title, visitDate, visitTime, visitNote, message: fallbackMessage }));
  }, [fallbackMessage, intent, title, visitDate, visitNote, visitTime]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const whatsappText = title
    ? `مرحباً، أرغب في التواصل بخصوص: ${title}`
    : 'مرحباً، أرغب في الاستفسار عن خدماتكم العقارية.';

  return (
    <div className="bg-white min-h-screen overflow-x-hidden" dir="rtl">

      {/* ─── HERO ─── */}
      <section className="relative bg-[#00263f] pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#4DA8DA]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2.5">
            <MessageSquare className="w-4 h-4 text-[#4DA8DA]" />
            <span className="text-white/80 text-xs font-bold uppercase tracking-widest">تواصل معنا</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
            كيف يمكننا
            <br />
            <span className="text-[#4DA8DA]">مساعدتك؟</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            فريق سكنى موريتانيا موجود دائماً لمساعدتك في رحلتك العقارية. تواصل معنا بأي طريقة تناسبك.
          </p>

          {propertyId && (
            <div className="inline-flex items-center gap-3 bg-[#4DA8DA]/20 border border-[#4DA8DA]/30 rounded-2xl px-6 py-3 text-sm font-bold text-white">
              <MessageSquare className="w-4 h-4 text-[#4DA8DA]" />
              <span>{intent === 'visit' ? 'تم تجهيز طلب المعاينة لهذا العقار' : 'تم تجهيز طلب التواصل لهذا العقار'}</span>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHATSAPP CTA ─── */}
      <section className="py-10 px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-right space-y-1">
            <p className="font-black text-[#00263f] text-lg">تفضّل تحدثنا على واتساب؟</p>
            <p className="text-gray-500 text-sm">سنرد عليك في أسرع وقت ممكن</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1fb95a] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            تواصل عبر واتساب
          </a>
        </div>
      </section>

      {/* ─── CONTACT CARDS ─── */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg hover:border-[#4DA8DA]/20 transition-all duration-300 group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: card.bg }}
                >
                  <card.icon className="w-6 h-6" style={{ color: card.accent }} />
                </div>
                <h4 className="font-black text-[#00263f] text-lg mb-2">{card.title}</h4>
                <p
                  className="text-gray-500 text-sm mb-5 whitespace-pre-line leading-relaxed"
                  dir={card.ltr ? 'ltr' : 'rtl'}
                >
                  {card.detail}
                </p>
                <a
                  href={card.action}
                  target={card.action.startsWith('http') ? '_blank' : undefined}
                  rel={card.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2 text-sm font-bold transition-colors cursor-pointer"
                  style={{ color: card.accent }}
                >
                  {card.actionLabel}
                  <ArrowLeft className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

          {/* Working hours */}
          <div className="mt-6 bg-[#00263f] rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#4DA8DA]/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
              <div className="flex items-center gap-4 md:col-span-1">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-[#4DA8DA]" />
                </div>
                <div>
                  <p className="font-black text-white">ساعات العمل</p>
                  <p className="text-white/50 text-xs">نحن هنا من أجلك</p>
                </div>
              </div>
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { day: 'الأحد – الخميس', time: '09:00 – 18:00', open: true },
                  { day: 'السبت', time: '10:00 – 14:00', open: true },
                  { day: 'الجمعة', time: '—', open: false },
                ].map((h, j) => (
                  <div key={j} className="flex items-center justify-between bg-white/[0.06] rounded-2xl px-5 py-3.5">
                    <span className="text-white/70 text-sm">{h.day}</span>
                    <span className={`text-sm font-bold ${h.open ? 'text-[#4DA8DA]' : 'text-white/30'}`} dir="ltr">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FORM ─── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">

          {/* Left column: text */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-28">
            <span className="inline-block text-[#4DA8DA] text-xs font-bold uppercase tracking-widest">أرسل رسالة</span>
            <h2 className="text-4xl font-black text-[#00263f] leading-tight">
              دعنا نسمع
              <br />
              منك
            </h2>
            <p className="text-gray-500 leading-relaxed">
              أرسل لنا رسالتك وسنرد عليك خلال يوم عمل واحد. بياناتك محمية ولن تُشارك مع أي طرف ثالث.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'رد سريع خلال 24 ساعة',
                'فريق متخصص في العقارات',
                'دعم باللغة العربية والفرنسية',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#4DA8DA] shrink-0" />
                  <span className="text-gray-600 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: form */}
          <div className="lg:col-span-3 bg-[#f8fafc] rounded-3xl p-8 lg:p-12 border border-gray-100">
            {submitted ? (
              <div className="text-center py-12 space-y-5">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-[#00263f]">تم إرسال رسالتك بنجاح</h3>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                  شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.
                </p>
                {propertyId && (
                  <p className="text-xs text-gray-400">مرجع العقار: {propertyId}</p>
                )}
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-2 bg-[#4DA8DA] hover:bg-[#3a97ca] text-white font-bold px-6 py-3 rounded-2xl transition-all duration-200 cursor-pointer"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#00263f]">الاسم الكامل</label>
                    <input
                      type="text"
                      placeholder="محمد أحمد"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#4DA8DA] focus:ring-2 focus:ring-[#4DA8DA]/20 rounded-2xl px-4 py-3.5 text-sm text-[#00263f] placeholder:text-gray-400 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#00263f]">البريد الإلكتروني</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#4DA8DA] focus:ring-2 focus:ring-[#4DA8DA]/20 rounded-2xl px-4 py-3.5 text-sm text-[#00263f] placeholder:text-gray-400 transition-all outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#00263f]">رقم الجوال</label>
                    <input
                      type="tel"
                      placeholder="+222 XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#4DA8DA] focus:ring-2 focus:ring-[#4DA8DA]/20 rounded-2xl px-4 py-3.5 text-sm text-[#00263f] placeholder:text-gray-400 transition-all outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#00263f]">الموضوع</label>
                    <input
                      type="text"
                      placeholder="استفسار عن عقار محدد"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#4DA8DA] focus:ring-2 focus:ring-[#4DA8DA]/20 rounded-2xl px-4 py-3.5 text-sm text-[#00263f] placeholder:text-gray-400 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#00263f]">رسالتك</label>
                  <textarea
                    placeholder="كيف يمكننا مساعدتك اليوم؟"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full bg-white border border-gray-200 focus:border-[#4DA8DA] focus:ring-2 focus:ring-[#4DA8DA]/20 rounded-2xl px-4 py-3.5 text-sm text-[#00263f] placeholder:text-gray-400 transition-all outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#00263f] hover:bg-[#003559] text-white font-bold py-4 rounded-2xl transition-all duration-200 cursor-pointer text-base"
                >
                  <Send className="w-5 h-5" />
                  إرسال الرسالة
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── MAP ─── */}
      <section className="pb-0">
        <div className="w-full h-72 md:h-96 bg-gray-200 overflow-hidden">
          <iframe
            title="موقع سكنى نواكشوط"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-15.9%2C18.08%2C-15.92%2C18.1&layer=mapnik&marker=18.09%2C-15.97"
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactPageInner />
    </Suspense>
  );
}
