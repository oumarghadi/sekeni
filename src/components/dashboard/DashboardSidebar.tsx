'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Heart,
  MessageSquare,
  User,
  Zap,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const seekerMenu = [
  { label: 'المفضلة',       href: '/dashboard/favorites', icon: Heart },
  { label: 'الرسائل',       href: '/dashboard/messages',  icon: MessageSquare },
  { label: 'الملف الشخصي',  href: '/dashboard/profile',   icon: User },
];

const listerMenu = [
  { label: 'نظرة عامة',    href: '/dashboard/lister',   icon: LayoutDashboard },
  { label: 'إعلاناتي',     href: '/dashboard/listings', icon: Home },
  { label: 'الرسائل',      href: '/dashboard/messages', icon: MessageSquare },
  { label: 'الملف الشخصي', href: '/dashboard/profile',  icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userType, setUserType] = React.useState<'seeker' | 'lister' | null>(null);

  React.useEffect(() => {
    async function getUserType() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', user.id)
          .single();
        setUserType(data?.account_type || 'seeker');
      }
    }
    getUserType();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  const menuItems = userType === 'lister' ? listerMenu : seekerMenu;

  return (
    <aside className="w-72 bg-white border-l border-[var(--outline-variant)] flex flex-col h-screen sticky top-0">

      {/* Logo */}
      <div className="p-7 pb-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Sekeni Logo"
            width={120}
            height={40}
            style={{ width: 'auto', height: '38px' }}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-[var(--outline-variant)]" />

      {/* Nav */}
      <nav className="flex-grow px-4 pt-5 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group',
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-primary'
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-low)] hover:text-[var(--primary)]'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  'w-5 h-5 transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-[var(--on-surface-variant)] group-hover:text-[var(--primary)]'
                )} />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              {isActive && <ChevronLeft className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: upgrade card + logout */}
      <div className="p-5 space-y-3">
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] rounded-3xl p-5 text-white">
          {/* Background glow */}
          <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-[var(--secondary)]/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[var(--secondary)]" />
            </div>
            <div className="text-right">
              <p className="text-sm font-black">ترقية الحساب</p>
              <p className="text-[11px] text-white/60 mt-0.5">احصل على ظهور أكبر</p>
            </div>
          </div>

          <button
            type="button"
            className="relative z-10 w-full py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all"
          >
            اكتشف الباقات
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
