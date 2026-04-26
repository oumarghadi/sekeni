'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, User, Phone,
  ShieldCheck, Loader2, Search, Building2,
  Eye, EyeOff, AlertCircle, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

/* ─── Reusable field ─────────────────────────────────────────────────── */
function Field({
  label, icon, rightSlot, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.12em] text-right">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[var(--on-surface-variant)] group-focus-within:text-[var(--gold)] transition-colors duration-200">
          {icon}
        </div>
        <input
          {...props}
          className="w-full bg-[var(--surface-low)] rounded-xl py-3 pr-10 pl-10 text-sm text-[var(--on-surface)] font-bold placeholder:text-[var(--on-surface-variant)]/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[var(--gold)]/30 transition-all duration-200"
        />
        {rightSlot && (
          <div className="absolute inset-y-0 left-3.5 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading]                 = React.useState(false);
  const [error, setError]                     = React.useState<string | null>(null);
  const [success, setSuccess]                 = React.useState(false);
  const [showPassword, setShowPassword]       = React.useState(false);
  const [needsEmailConfirmation, setNeeds]    = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstName:   '',
    lastName:    '',
    email:       '',
    phone:       '',
    password:    '',
    accountType: 'seeker' as 'seeker' | 'lister',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: fullName, phone: formData.phone, account_type: formData.accountType },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) throw signupError;

      setSuccess(true);
      if (!data.session) setNeeds(true);
      setTimeout(() => router.push('/auth/login'), 5000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-low)] p-6" dir="rtl">
        <div className="max-w-sm w-full bg-white rounded-3xl p-10 shadow-ambient-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--primary)]">تم إنشاء الحساب!</h2>
            <p className="text-[var(--on-surface-variant)] text-sm">يمكنك الآن تسجيل الدخول</p>
          </div>
          {needsEmailConfirmation && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold text-amber-700 text-right">
              يرجى تفعيل حسابك عبر الرابط المرسل إلى بريدك الإلكتروني.
            </div>
          )}
          <p className="text-[10px] text-[var(--on-surface-variant)]">سيتم توجيهك تلقائياً خلال لحظات...</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-black text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            تسجيل الدخول الآن
          </button>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className="min-h-screen flex" dir="rtl">

      {/* ── LEFT: Visual Panel ── */}
      <div className="hidden lg:flex w-[44%] relative flex-col overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=85"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#00263f]/95 via-[#00263f]/80 to-[#00263f]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00263f]/70 via-transparent to-[#00263f]/40" />

        <div className="relative z-10 flex flex-col h-full p-12 text-right">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-end gap-3 mb-auto">
            <span className="text-base font-black text-white">
              Sekeni <span className="text-[var(--gold)]">Sa</span>
            </span>
            <Image src="/images/logo.png" alt="Sekeni" width={32} height={32} className="object-contain brightness-0 invert" />
          </Link>

          {/* Copy */}
          <div className="space-y-8 mb-12">
            <div className="flex items-center gap-2.5 justify-end">
              <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[0.22em]">انضم إلى سكنى</span>
              <span className="h-px w-8 bg-[var(--gold)]" />
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15]">
              ابدأ رحلتك<br />
              <span style={{
                background: 'linear-gradient(135deg, var(--secondary) 0%, #7cc7e8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>العقارية الآن.</span>
            </h1>

            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              انضم إلى مجتمعنا من الباحثين والمعلنين وابدأ تجربة عقارية حصرية في موريتانيا.
            </p>

            {/* Benefits */}
            <div className="space-y-3.5 pt-2">
              {[
                'وصول حصري للعقارات المميزة',
                'تواصل مباشر مع كبار المطورين',
                'أدوات إدارة ذكية لمشاريعك',
              ].map((text) => (
                <div key={text} className="flex items-center justify-end gap-3">
                  <span className="text-white/80 text-sm font-bold">{text}</span>
                  <div className="w-5 h-5 rounded-full bg-[var(--gold)]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[var(--gold)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/25 text-[11px]">© 2026 سكنى موريتانيا</p>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-[var(--outline-variant)]">
          <Link href="/auth/login" className="text-sm font-black text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
            دخول
          </Link>
          <span className="text-base font-black text-[var(--primary)]">Sekeni <span className="text-[var(--secondary)]">Sa</span></span>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-10 lg:px-14">
          <div className="w-full max-w-[420px] space-y-7">

            {/* Heading */}
            <div className="text-right space-y-1.5">
              <div className="flex items-center gap-2 justify-end mb-3">
                <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[0.18em]">حساب جديد</span>
                <span className="h-px w-6 bg-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-black text-[var(--primary)]">إنشاء حساب</h2>
              <p className="text-[var(--on-surface-variant)] text-sm">كن جزءاً من نخبة المجتمع العقاري في موريتانيا.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center justify-end gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
                {error}
                <AlertCircle className="w-4 h-4 shrink-0" />
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="الاسم الأول"
                  type="text"
                  placeholder="محمد"
                  icon={<User className="w-4 h-4" />}
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Field
                  label="اسم العائلة"
                  type="text"
                  placeholder="الأحمد"
                  icon={<User className="w-4 h-4" />}
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <Field
                label="البريد الإلكتروني"
                type="email"
                placeholder="ahmed@example.com"
                icon={<Mail className="w-4 h-4" />}
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />

              <Field
                label="رقم الجوال"
                type="tel"
                placeholder="222 XX XX XX"
                icon={<Phone className="w-4 h-4" />}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />

              <Field
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Account type */}
              <div className="space-y-3 pt-1">
                <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.12em] text-right">
                  نوع الحساب
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Seeker */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'seeker' })}
                    className={cn(
                      'relative p-4 rounded-2xl border-2 text-right transition-all duration-200 cursor-pointer',
                      formData.accountType === 'seeker'
                        ? 'border-[var(--secondary)] bg-[var(--secondary-light)] shadow-[0_4px_16px_rgba(77,168,218,0.18)]'
                        : 'border-[var(--outline-variant)] hover:border-[var(--secondary)]/40 bg-white'
                    )}
                  >
                    {formData.accountType === 'seeker' && (
                      <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors',
                      formData.accountType === 'seeker' ? 'bg-[var(--secondary)] text-white' : 'bg-[var(--surface-low)] text-[var(--primary)]'
                    )}>
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="font-black text-sm text-[var(--primary)]">باحث</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)] mt-0.5 font-bold">شراء، إيجار، بناء</p>
                  </button>

                  {/* Lister */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'lister' })}
                    className={cn(
                      'relative p-4 rounded-2xl border-2 text-right transition-all duration-200 cursor-pointer',
                      formData.accountType === 'lister'
                        ? 'border-[var(--primary)] bg-[#00263f]/5 shadow-[0_4px_16px_rgba(0,38,63,0.12)]'
                        : 'border-[var(--outline-variant)] hover:border-[var(--primary)]/40 bg-white'
                    )}
                  >
                    {formData.accountType === 'lister' && (
                      <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors',
                      formData.accountType === 'lister' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-low)] text-[var(--primary)]'
                    )}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <p className="font-black text-sm text-[var(--primary)]">معلن</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)] mt-0.5 font-bold">نشر وإدارة العقارات</p>
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 w-4 h-4 rounded border-[var(--outline-variant)] text-[var(--secondary)] focus:ring-[var(--gold)]/30 shrink-0"
                />
                <span className="text-xs text-[var(--on-surface-variant)] leading-relaxed text-right">
                  أوافق على{' '}
                  <Link href="/terms" className="font-bold text-[var(--secondary)] hover:underline">شروط الخدمة</Link>
                  {' '}و{' '}
                  <Link href="/privacy" className="font-bold text-[var(--secondary)] hover:underline">سياسة الخصوصية</Link>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] text-white font-black text-sm shadow-[0_4px_20px_rgba(0,38,63,0.28)] hover:shadow-[0_8px_32px_rgba(0,38,63,0.38)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  : 'إنشاء الحساب'}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--on-surface-variant)]">
              لديك حساب؟{' '}
              <Link href="/auth/login" className="font-black text-[var(--primary)] hover:text-[var(--secondary)] transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
