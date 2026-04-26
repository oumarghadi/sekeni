'use client';

import * as React from 'react';
import { Bell, Search, Menu, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { resolveStoragePublicUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const accountTypeLabel: Record<string, string> = {
  lister: 'معلن / مقدم خدمة',
  seeker: 'باحث عن عقار',
};

interface NotifItem {
  id: string;
  body: string;
  created_at: string;
  conversation_id: string;
  sender_name: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} ي`;
}

export function DashboardHeader() {
  const [userName, setUserName] = React.useState<string>('...');
  const [accountType, setAccountType] = React.useState<string>('');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);

  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from('profiles')
        .select('full_name, account_type, avatar_url')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserName(data.full_name?.split(' ')[0] || user.email?.split('@')[0] || '...');
        setAccountType(data.account_type || 'seeker');
        setAvatarUrl(resolveStoragePublicUrl(data.avatar_url, 'profiles'));
      }
    }
    fetchUser();
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    fetchNotifications(userId);
  }, [userId]);

  async function fetchNotifications(uid: string) {
    const { data } = await supabase
      .from('messages')
      .select(`
        id, body, created_at, conversation_id, is_read,
        sender:sender_id ( full_name ),
        conversation:conversation_id ( initiator_id, receiver_id )
      `)
      .neq('sender_id', uid)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      const filtered = (data as any[]).filter((m) => {
        const c = m.conversation;
        return c && (c.initiator_id === uid || c.receiver_id === uid);
      });

      setNotifications(
        filtered.map((m) => ({
          id: m.id,
          body: m.body,
          created_at: m.created_at,
          conversation_id: m.conversation_id,
          sender_name: (m.sender as any)?.full_name || 'مستخدم',
        }))
      );
      setUnreadCount(filtered.length);
    }
  }

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleBellClick() {
    setNotifOpen((prev) => !prev);
  }

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[var(--outline-variant)] sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="sm" className="p-2">
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      <div className="hidden md:flex items-center bg-[var(--surface-low)] rounded-2xl px-4 py-2 w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--secondary)]/20 transition-all">
        <Search className="w-4 h-4 text-[var(--on-surface-variant)]" />
        <input
          type="text"
          placeholder="ابحث في لوحة التحكم..."
          className="bg-transparent border-none focus:ring-0 text-sm w-full pr-3 text-[var(--primary)] placeholder:text-[var(--on-surface-variant)]/60"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            className="relative p-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-all cursor-pointer"
            aria-label="الإشعارات"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 left-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-black leading-none px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-[var(--outline-variant)] overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--outline-variant)]">
                <span className="font-black text-[var(--primary)] text-sm">الإشعارات</span>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} جديد
                  </span>
                )}
                <button onClick={() => setNotifOpen(false)} className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center gap-3 text-[var(--on-surface-variant)]">
                    <Bell className="w-8 h-8 opacity-30" />
                    <p className="text-xs font-bold">لا توجد إشعارات جديدة</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href="/dashboard/messages"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-start gap-3 px-5 py-4 hover:bg-[var(--surface-low)] transition-colors border-b border-[var(--outline-variant)]/40 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[var(--secondary)]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4 text-[var(--secondary)]" />
                      </div>
                      <div className="flex-1 text-right min-w-0">
                        <p className="text-xs font-black text-[var(--primary)] truncate">{n.sender_name}</p>
                        <p className="text-xs text-[var(--on-surface-variant)] mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-[var(--on-surface-variant)]/50 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[var(--secondary)] shrink-0 mt-2" />
                    </Link>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-[var(--outline-variant)] bg-[var(--surface-low)]">
                <Link
                  href="/dashboard/messages"
                  onClick={() => setNotifOpen(false)}
                  className="block text-center text-xs font-bold text-[var(--secondary)] hover:underline"
                >
                  عرض جميع الرسائل
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-[var(--outline-variant)] mx-2"></div>

        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <p className="text-sm font-black text-[var(--primary)]">{userName}</p>
            <p className="text-[10px] text-[var(--secondary)] font-bold uppercase tracking-widest">
              {accountTypeLabel[accountType] || '...'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-low)] border border-[var(--outline-variant)] overflow-hidden shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--primary)] font-black text-sm">
                {userName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
