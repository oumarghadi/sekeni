'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import {
  clearCorruptedSupabaseAuthStorage,
  isCorruptedSupabaseSessionError,
  supabase,
} from '@/lib/supabase';

/* ─── Reusable field ─────────────────────────────────────────────────── */
function Field({
  label, icon, rightSlot, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-black text-[var(--primary)] uppercase tracking-[0.12em] text-right">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[var(--on-surface-variant)] group-focus-within:text-[var(--gold)] transition-colors duration-200">
          {icon}
        </div>
        <input
          {...props}
          className="w-full bg-[var(--surface-low)] rounded-xl py-3.5 pr-11 pl-12 text-sm text-[var(--on-surface)] font-bold placeholder:text-[var(--on-surface-variant)]/40 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[var(--gold)]/30 transition-all duration-200"
        />
        {rightSlot && (
          <div className="absolute inset-y-0 left-4 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading]           = React.useState(false);
  const [error, setError]               = React.useState<string | null>(null);
  const [formData, setFormData]         = React.useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      clearCorruptedSupabaseAuthStorage();

      let { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError && isCorruptedSupabaseSessionError(loginError)) {
        clearCorruptedSupabaseAuthStorage();
        const retry = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        data = retry.data;
        loginError = retry.error;
      }

      if (loginError) throw loginError;

      const signedInUser = data.user;
      if (!signedInUser) throw new Error('تعذر تحميل بيانات المستخدم.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', signedInUser.id)
        .single();

      if (profileError) {
        const t = signedInUser.user_metadata?.account_type;
        router.push(t === 'lister' ? '/dashboard/lister' : '/dashboard/seeker');
        return;
      }

      router.push(profile?.account_type === 'lister' ? '/dashboard/lister' : '/dashboard/seeker');
    } catch (err: any) {
      if (isCorruptedSupabaseSessionError(err)) {
        clearCorruptedSupabaseAuthStorage();
        setError('تمت إعادة تهيئة الجلسة. حاول مجدداً.');
      } else {
        setError(err?.message || 'بريد إلكتروني أو كلمة مرور خاطئة.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">

      {/* ── LEFT: Visual Panel ── */}
      <div className="hidden lg:flex w-[52%] relative flex-col overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1400&auto=format&fit=crop&q=85"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#00263f]/95 via-[#00263f]/75 to-[#00263f]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00263f]/80 via-transparent to-[#00263f]/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-14 text-right">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-end gap-3 mb-auto">
            <span className="text-lg font-black text-white">
              Sekeni <span className="text-[var(--gold)]">Sa</span>
            </span>
            <Image src="/images/logo.png" alt="Sekeni" width={36} height={36} className="object-contain brightness-0 invert" />
          </Link>

          {/* Main copy */}
          <div className="space-y-8 mb-16">
            <div className="flex items-center gap-2.5 justify-end">
              <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[0.22em]">منصة العقارات الأولى في موريتانيا</span>
              <span className="h-px w-8 bg-[var(--gold)]" />
            </div>

            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1]"
              style={{ textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
              مرحباً بك<br />
              <span style={{
                background: 'linear-gradient(135deg, var(--secondary) 0%, #7cc7e8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>مجدداً.</span>
            </h1>

            <p className="text-white/65 text-base leading-relaxed max-w-sm">
              سجل دخولك للوصول إلى تفضيلاتك، رسائلك، وإدارة عقاراتك في المنصة الأكثر تميزاً في موريتانيا.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-end gap-6 pt-4">
              {[
                { value: '+1K',   label: 'عقار مدرج' },
                { value: '4.8★',  label: 'تقييم المستخدمين' },
                { value: '24/7',  label: 'دعم متواصل' },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <div className="text-xl font-black text-white" dir="ltr">{s.value}</div>
                  <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Avatars */}
          <div className="flex items-center justify-end gap-3">
            <p className="text-white/50 text-[11px] font-bold">+2 500 محترف عقاري</p>
            <div className="flex -space-x-2 space-x-reverse">
              {[1,2,3,4].map(i => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/80?u=sekeni${i}`}
                  alt=""
                  className="w-9 h-9 rounded-full border-2 border-[#00263f] object-cover"
                />
              ))}
            </div>
          </div>

          <p className="text-white/25 text-[11px] mt-8">© 2026 سكنى موريتانيا</p>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">

        {/* Mobile logo bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-[var(--outline-variant)]">
          <Link href="/" className="text-sm font-black text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
            رجوع
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-base font-black text-[var(--primary)]">Sekeni <span className="text-[var(--secondary)]">Sa</span></span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-[400px] space-y-8">

            {/* Heading */}
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 justify-end mb-4">
                <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[0.18em]">تسجيل الدخول</span>
                <span className="h-px w-6 bg-[var(--gold)]" />
              </div>
              <h2 className="text-3xl font-black text-[var(--primary)]">دخول للحساب</h2>
              <p className="text-[var(--on-surface-variant)] text-sm">أدخل بياناتك للوصول إلى حسابك.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center justify-end gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
                {error}
                <AlertCircle className="w-4 h-4 shrink-0" />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <Field
                label="البريد الإلكتروني"
                type="email"
                placeholder="ahmed@example.com"
                icon={<Mail className="w-4.5 h-4.5" />}
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />

              <Field
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                icon={<Lock className="w-4.5 h-4.5" />}
                required
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

              {/* Options row */}
              <div className="flex items-center justify-between pt-1">
                <Link href="#" className="text-xs font-bold text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  نسيت كلمة المرور؟
                </Link>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-[var(--on-surface-variant)]">ابقَ متصلاً</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--outline-variant)] text-[var(--secondary)] focus:ring-[var(--gold)]/30"
                  />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] text-white font-black text-sm shadow-[0_4px_20px_rgba(0,38,63,0.30)] hover:shadow-[0_8px_32px_rgba(0,38,63,0.40)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  : 'تسجيل الدخول'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-[var(--outline-variant)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-widest">
                  أو
                </span>
              </div>
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-[var(--on-surface-variant)]">
              ليس لديك حساب؟{' '}
              <Link href="/auth/register" className="font-black text-[var(--primary)] hover:text-[var(--secondary)] transition-colors">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
