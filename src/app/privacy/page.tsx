import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-[var(--primary)]" />
            <h1 className="text-4xl font-bold text-[var(--on-surface)]">
              سياسة الخصوصية
            </h1>
          </div>

          {/* Last Updated */}
          <p className="text-sm text-[var(--on-surface-variant)]">
            آخر تحديث: 19 أبريل 2026
          </p>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-6 text-[var(--on-surface-variant)]">
            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">مقدمة</h2>
              <p>
                نحن في سكنى موريتانيا نحترم خصوصيتك بشدة. تشرح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">المعلومات التي نجمعها</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف</li>
                <li>معلومات المحفظة: عنوان الفاتورة، بيانات الدفع</li>
                <li>معلومات الملف الشخصي: الصور، الوصف الشخصي</li>
                <li>بيانات الاستخدام: سجل الأنشطة، أنماط الاستخدام</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">كيفية استخدام معلوماتك</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>تحسين الخدمات والمنصة</li>
                <li>التواصل معك حول التحديثات والعروض</li>
                <li>منع الاحتيال والأنشطة غير القانونية</li>
                <li>توفير دعم العملاء</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">حماية البيانات</h2>
              <p>
                نستخدم تقنيات التشفير والأمان المتقدمة لحماية معلوماتك من الوصول غير المصرح به. 
                جميع المعاملات تتم عبر اتصالات آمنة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">مشاركة البيانات</h2>
              <p>
                لن نشارك معلوماتك الشخصية مع أطراف ثالثة دون موافقتك الصريحة، إلا في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>متطلبات قانونية</li>
                <li>حماية حقوقنا</li>
                <li>شركاء الخدمة الموثوقين</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">حقوقك</h2>
              <p>
                لديك الحق في:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>الوصول إلى بياناتك الشخصية</li>
                <li>تصحيح المعلومات غير الدقيقة</li>
                <li>حذف حسابك والبيانات المرتبطة</li>
                <li>الاعتراض على معالجة البيانات</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-4">التواصل معنا</h2>
              <p>
                إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا على contact@sekeni.mr
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
