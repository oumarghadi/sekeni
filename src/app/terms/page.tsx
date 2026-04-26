import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-[var(--primary)]" />
            <h1 className="text-4xl font-bold text-[var(--on-surface)]">
              الشروط والأحكام
            </h1>
          </div>

          {/* Last Updated */}
          <p className="text-sm text-[var(--on-surface-variant)]">
            آخر تحديث: 19 أبريل 2026
          </p>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-6 text-[var(--on-surface-variant)]">
            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">قبول الشروط</h2>
              <p>
                بالتسجيل واستخدام منصة سكنى موريتانيا، فإنك توافق على جميع الشروط والأحكام المحددة هنا. 
                إذا كنت لا توافق على أي شرط، يرجى عدم استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">استخدام المنصة</h2>
              <p>أنت توافق على:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>استخدام المنصة فقط للأغراض المشروعة</li>
                <li>عدم نشر محتوى مسيء أو غير قانوني</li>
                <li>عدم محاولة اختراق أو تعطيل المنصة</li>
                <li>احترام حقوق المستخدمين الآخرين</li>
                <li>توفير معلومات دقيقة وحقيقية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">المسؤولية</h2>
              <p>
                سكنى موريتانيا توفر المنصة "كما هي" دون أي ضمانات. لا نتحمل مسؤولية عن:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>دقة المعلومات المنشورة من المستخدمين</li>
                <li>المعاملات بين المستخدمين</li>
                <li>أي أضرار مباشرة أو غير مباشرة من استخدام المنصة</li>
                <li>فقدان البيانات أو التعطل المؤقت</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">محتوى المستخدمين</h2>
              <p>
                أنت مسؤول بالكامل عن أي محتوى تنشره. بنشرك للمحتوى، فأنت تمنح سكنى موريتانيا 
                الحق في استخدام هذا المحتوى لأغراض المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">الرسوم والدفع</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>المنصة مجانية للاستخدام الأساسي</li>
                <li>قد تكون هناك خدمات إضافية برسوم</li>
                <li>جميع الرسوم يجب أن تدفع مقدماً</li>
                <li>لا استرجاع للرسوم بعد الدفع</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">الإنهاء والحذف</h2>
              <p>
                يمكننا حذف حسابك أو إيقاف الوصول إذا:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>انتهكت هذه الشروط والأحكام</li>
                <li>نشرت محتوى غير قانوني أو مسيء</li>
                <li>قمت بأنشطة احتيالية</li>
                <li>تسببت في أضرار للمنصة أو المستخدمين</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">التعديلات على الشروط</h2>
              <p>
                نحن نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. 
                سيتم إخطارك بأي تعديلات مهمة عبر البريد الإلكتروني أو إشعار على المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">القانون المعمول به</h2>
              <p>
                تخضع هذه الشروط والأحكام للقوانين الموريتانية. 
                أي نزاع سيتم حله في المحاكم الموريتانية المختصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">التواصل معنا</h2>
              <p>
                للاستفسار أو الشكاوى بخصوص هذه الشروط، يرجى التواصل معنا على:
              </p>
              <p className="mt-2 font-semibold">
                البريد الإلكتروني: contact@sekeni.mr<br/>
                الهاتف: +966 9200 12345
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
