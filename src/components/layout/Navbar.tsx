'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, ChevronDown, Settings, LayoutDashboard } from 'lucide-react';
import { cn, resolveStoragePublicUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const navLinks = [
  { name: 'الرئيسية',   href: '/' },
  { name: 'العقارات',   href: '/properties' },
  { name: 'البناء',     href: '/construction' },
  { name: 'من نحن',    href: '/about' },
  { name: 'تواصل معنا', href: '/contact' },
];

interface Profile {
  account_type: string | null;
  full_name:    string | null;
  avatar_url:   string | null;
}

async function fetchProfile(userId: string): Promise<Profile> {
  const { data } = await supabase
    .from('profiles')
    .select('account_type, full_name, avatar_url')
    .eq('id', userId)
    .single();
  return {
    account_type: data?.account_type ?? null,
    full_name:    data?.full_name ?? null,
    avatar_url:   resolveStoragePublicUrl(data?.avatar_url, 'profiles'),
  };
}

export function Navbar() {
  const [isOpen,       setIsOpen]       = React.useState(false);
  const [isScrolled,   setIsScrolled]   = React.useState(false);
  const [session,      setSession]      = React.useState<any>(null);
  const [profile,      setProfile]      = React.useState<Profile | null>(null);
  const [profileOpen,  setProfileOpen]  = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const pathname   = usePathname();
  const router     = useRouter();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id).then(setProfile);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id).then(setProfile);
      else setProfile(null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    setProfileOpen(false);
    router.push('/auth/login');
  };

  const initials     = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? '?';
  const displayName  = profile?.full_name ?? session?.user?.email ?? '';
  const dashboardHref = profile?.account_type === 'lister' ? '/dashboard/lister' : '/dashboard/profile';

  const isHome        = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  /* ── Floating pill classes ── */
  const navClass = cn(
    'fixed z-50 transition-all duration-500',
    isTransparent
      ? 'top-5 left-4 right-4 bg-transparent'
      : 'top-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-[var(--outline-variant)] shadow-[0_2px_24px_rgba(0,38,63,0.08)]'
  );

  const innerClass = cn(
    'max-w-7xl mx-auto flex items-center justify-between transition-all duration-500',
    isTransparent
      ? 'bg-black/25 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3'
      : 'px-6 py-3.5'
  );

  return (
    <nav className={navClass} aria-label="القائمة الرئيسية">
      <div className={innerClass}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="36" height="36" rx="10" fill="#4DA8DA" fillOpacity={isTransparent ? '0.25' : '0.12'}/>
            <path d="M18 7L6 17h3v11h7v-7h4v7h7V17h3L18 7z" fill="#4DA8DA"/>
          </svg>
          <span className={cn(
            'text-lg font-black tracking-tight hidden sm:block',
            isTransparent ? 'text-white' : 'text-[var(--primary)]'
          )}>
            Sekeni <span className={isTransparent ? 'text-[var(--gold)]' : 'text-[var(--secondary)]'}>Sa</span>
          </span>
        </Link>

        {/* Desktop nav links — center */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all duration-200',
                  active
                    ? isTransparent
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--secondary-light)] text-[var(--secondary)]'
                    : isTransparent
                      ? 'text-white/85 hover:text-white hover:bg-white/15'
                      : 'text-[var(--on-surface-variant)] hover:text-[var(--primary)] hover:bg-[var(--surface-low)]'
                )}
              >
                {link.name}
                {active && (
                  <span className={cn(
                    'absolute bottom-1 right-1/2 translate-x-1/2 w-1 h-1 rounded-full',
                    isTransparent ? 'bg-[var(--gold)]' : 'bg-[var(--secondary)]'
                  )} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">

          {session ? (
            <>
              {/* Lister CTA */}
              {profile?.account_type === 'lister' && (
                <Link href="/dashboard/lister" className="hidden md:block">
                  <button className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all duration-200',
                    isTransparent
                      ? 'bg-[var(--gold)] text-[#1a1209] hover:opacity-90'
                      : 'bg-[var(--gold)] text-[#1a1209] hover:opacity-90 shadow-[0_2px_12px_rgba(201,168,76,0.35)]'
                  )}>
                    <span>أضف عقارك</span>
                    <span className="text-base leading-none">+</span>
                  </button>
                </Link>
              )}

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200',
                    isTransparent
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-[var(--surface-low)] text-[var(--primary)]'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center ring-2',
                    isTransparent ? 'ring-white/40 bg-[var(--secondary)]' : 'ring-[var(--outline-variant)] bg-[var(--secondary)]'
                  )}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-black">{initials}</span>
                    )}
                  </div>
                  <span className="hidden lg:block text-xs font-black max-w-[90px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className={cn(
                    'hidden lg:block w-3.5 h-3.5 transition-transform duration-200',
                    profileOpen && 'rotate-180'
                  )} />
                </button>

                {profileOpen && (
                  <div className="absolute left-0 top-full mt-2.5 w-60 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,38,63,0.15)] border border-[var(--outline-variant)] overflow-hidden animate-fadein-scale">
                    {/* Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--secondary)] flex items-center justify-center shrink-0 ring-2 ring-white/30">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-black">{initials}</span>
                        )}
                      </div>
                      <div className="text-right overflow-hidden">
                        <p className="text-sm font-black text-white truncate">{displayName}</p>
                        <p className="text-[10px] text-white/60 truncate">{session?.user?.email}</p>
                      </div>
                    </div>
                    {/* Items */}
                    <div className="py-1.5">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-[var(--on-surface)] hover:bg-[var(--surface-low)] transition-colors"
                      >
                        <User className="w-4 h-4 text-[var(--on-surface-variant)]" />
                        <span>الملف الشخصي</span>
                      </Link>
                      <Link
                        href={dashboardHref}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-[var(--on-surface)] hover:bg-[var(--surface-low)] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[var(--on-surface-variant)]" />
                        <span>لوحة التحكم</span>
                      </Link>
                      {profile?.account_type === 'lister' && (
                        <Link
                          href="/dashboard/listings/add"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-[var(--on-surface)] hover:bg-[var(--surface-low)] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-[var(--on-surface-variant)]" />
                          <span>إضافة عقار</span>
                        </Link>
                      )}
                      <div className="mx-4 my-1 h-px bg-[var(--outline-variant)]" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login">
                <button className={cn(
                  'px-4 py-2 rounded-xl text-xs font-black transition-all duration-200',
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/15'
                    : 'text-[var(--primary)] hover:bg-[var(--surface-low)]'
                )}>
                  دخول
                </button>
              </Link>
              <Link href="/auth/register">
                <button className={cn(
                  'px-4 py-2 rounded-xl text-xs font-black transition-all duration-200',
                  isTransparent
                    ? 'bg-white text-[var(--primary)] hover:bg-white/90'
                    : 'bg-[var(--primary)] text-white hover:opacity-90 shadow-[0_2px_12px_rgba(0,38,63,0.25)]'
                )}>
                  إنشاء حساب
                </button>
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={isOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen(p => !p)}
            className={cn(
              'lg:hidden p-2 rounded-xl transition-colors',
              isTransparent
                ? 'text-white hover:bg-white/20'
                : 'text-[var(--primary)] hover:bg-[var(--surface-low)]'
            )}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isOpen && (
        <div className="lg:hidden mx-4 mt-2 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,38,63,0.15)] border border-[var(--outline-variant)] overflow-hidden animate-slidedown">
          {session && (
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)]">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[var(--secondary)] flex items-center justify-center shrink-0 ring-2 ring-white/30">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black">{initials}</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{displayName}</p>
                <p className="text-[10px] text-white/60">{session?.user?.email}</p>
              </div>
            </div>
          )}

          <div className="px-3 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-[13px] font-bold transition-colors text-right',
                  pathname === link.href
                    ? 'bg-[var(--secondary-light)] text-[var(--secondary)]'
                    : 'text-[var(--on-surface)] hover:bg-[var(--surface-low)]'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="px-4 pb-4 pt-2 flex flex-col gap-2 border-t border-[var(--outline-variant)]">
            {session ? (
              <>
                <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--surface-low)] text-[13px] font-black text-[var(--primary)] hover:bg-[var(--surface-high)] transition-colors">
                  <User className="w-4 h-4" />
                  الملف الشخصي
                </Link>
                <button onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-red-50 text-[13px] font-black text-red-500 hover:bg-red-100 transition-colors">
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsOpen(false)}
                  className="block text-center py-3 rounded-xl bg-[var(--surface-low)] text-[13px] font-black text-[var(--primary)] hover:bg-[var(--surface-high)] transition-colors">
                  تسجيل الدخول
                </Link>
                <Link href="/auth/register" onClick={() => setIsOpen(false)}
                  className="block text-center py-3 rounded-xl bg-[var(--primary)] text-[13px] font-black text-white hover:opacity-90 transition-colors">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
