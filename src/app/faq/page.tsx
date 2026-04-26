import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      question: 'كيف أتمكن من نشر إعلان عقاري على المنصة؟',
      answer: 'يمكنك نشر إعلان عقاري من خلال تسجيل حسابك وملء نموذج الإعلان بمعلومات العقار والصور والأسعار المطلوبة.'
    },
    {
      question: 'هل تتقاضى المنصة عمولة عند البيع؟',
      answer: 'نحن نقدم خدماتنا بشكل مجاني تماماً. لا توجد أي رسوم إخفية أو عمولات على المبيعات.'
    },
    {
      question: 'كيف يمكنني التواصل مع بائع أو مستأجر؟',
      answer: 'يمكنك التواصل مباشرة من خلال أيقونة الاتصال أو الرسائل على الإعلان. المنصة توفر قنوات اتصال آمنة وموثوقة.'
    },
    {
      question: 'ما هي مدة إظهار الإعلان على المنصة؟',
      answer: 'الإعلانات تظهر على المنصة بشكل دائم حتى تقوم بحذفها أو تعديل حالتها.'
    },
    {
      question: 'هل يمكنني تعديل إعلاني بعد نشره؟',
      answer: 'نعم، يمكنك تعديل جميع تفاصيل إعلانك في أي وقت من لوحة التحكم الخاصة بك.'
    },
    {
      question: 'كيف أبلغ عن إعلان مريب؟',
      answer: 'يمكنك الإبلاغ عن أي إعلان مريب من خلال زر الإبلاغ على الإعلان، وسيتم فحصه من قبل فريقنا.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--on-surface)]">
              الأسئلة الشائعة
            </h1>
            <p className="text-lg text-[var(--on-surface-variant)]">
              إجابات على أكثر الأسئلة التي يطرحها مستخدمونا
            </p>
          </div>

          {/* FAQs List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details 
                key={index}
                className="group p-6 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] hover:border-[var(--primary)] transition-all cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-[var(--on-surface)] select-none">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-[var(--on-surface-variant)] leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 p-8 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl border border-[var(--outline-variant)] text-center">
            <h3 className="text-xl font-bold text-[var(--on-surface)] mb-3">
              لم تجد إجابة على سؤالك؟
            </h3>
            <p className="text-[var(--on-surface-variant)] mb-4">
              تواصل معنا مباشرة وسيكون فريقنا سعيداً بمساعدتك
            </p>
            <a 
              href="/contact"
              className="inline-block px-6 py-2 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
            >
              اتصل بنا الآن
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
