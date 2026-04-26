'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-low)] p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-ambient text-center space-y-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-[var(--primary)]">حدث خطأ في المصادقة</h2>
          <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
            يبدو أن الرابط المستخدم قد انتهت صلاحيته أو تم استخدامه مسبقاً.
            يرجى المحاولة مجدداً أو طلب رابط جديد.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link href="/auth/register">
            <Button size="xl" className="w-full rounded-2xl font-bold gap-2">
              إنشاء حساب جديد
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Button>
          </Link>
          
          <Link href="/auth/login" className="block text-sm font-bold text-[var(--secondary)] hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </div>

        <p className="text-xs text-[var(--on-surface-variant)]/50 pt-4">
          Sekeni Sa - كل ما تحتاجه في مكان واحد
        </p>
      </div>
    </div>
  );
}
