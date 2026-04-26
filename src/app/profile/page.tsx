'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Shield, LogOut, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { resolveStoragePublicUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';

interface ProfileData {
  full_name: string;
  avatar_url: string;
  phone: string;
  preferred_role: string;
  email?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<ProfileData | null>(null);

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile({
          ...data,
          avatar_url: resolveStoragePublicUrl(data.avatar_url, 'profiles') ?? '',
          email: user.email
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-low)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--secondary)]" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[var(--surface-low)] pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-8">
        {/* Header / Backdrop */}
        <div className="relative h-48 bg-[var(--primary)] rounded-[2.5rem] overflow-hidden shadow-ambient">
           <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-ambient -mt-24 relative z-10 text-right">
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl border-8 border-white bg-[var(--surface-medium)] overflow-hidden shadow-lg transition-transform hover:scale-105">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--surface-medium)]">
                    <User className="w-12 h-12 text-[var(--on-surface-variant)]" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -left-2 bg-[var(--secondary)] p-2 rounded-xl text-white shadow-lg">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-black text-[var(--primary)]">{profile.full_name || 'مستخدم سكنى'}</h1>
              <p className="text-[var(--secondary)] font-bold flex items-center justify-end gap-2 text-sm uppercase tracking-wider">
                {profile.preferred_role === 'buyer' ? 'باحث عن عقار' : 'معلن / مقور'}
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]"></div>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
               <Button onClick={handleLogout} variant="outline" className="rounded-xl border-red-100 text-red-600 hover:bg-red-50 gap-2 font-bold px-6">
                 <LogOut className="w-4 h-4" />
                 خروج
               </Button>
               <Button className="rounded-xl px-8 font-bold gap-2">
                 تعديل
                 <ArrowRight className="w-4 h-4 rtl:rotate-180" />
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 py-8 border-t border-[var(--outline-variant)]">
            <div className="bg-[var(--surface-low)] p-6 rounded-2xl space-y-2 group hover:bg-[var(--secondary)] transition-all">
               <div className="flex items-center justify-end gap-3 text-[var(--on-surface-variant)] group-hover:text-white/60">
                 <span className="text-xs font-bold uppercase tracking-widest">البريد الإلكتروني</span>
                 <Mail className="w-4 h-4" />
               </div>
               <p className="text-[var(--primary)] font-bold group-hover:text-white truncate">{profile.email}</p>
            </div>
            
            <div className="bg-[var(--surface-low)] p-6 rounded-2xl space-y-2 group hover:bg-[var(--secondary)] transition-all">
               <div className="flex items-center justify-end gap-3 text-[var(--on-surface-variant)] group-hover:text-white/60">
                 <span className="text-xs font-bold uppercase tracking-widest">رقم الجوال</span>
                 <Phone className="w-4 h-4" />
               </div>
               <p className="text-[var(--primary)] font-bold group-hover:text-white">{profile.phone || 'غير مسجل'}</p>
            </div>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-ambient text-right space-y-6">
           <h3 className="text-xl font-black text-[var(--primary)]">إحصائيات الحساب</h3>
           <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'إعلاناتي', value: '0' },
                { label: 'المفضلة', value: '0' },
                { label: 'الرسائل', value: '0' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 bg-[var(--surface-low)] rounded-3xl space-y-1">
                   <div className="text-3xl font-black text-[var(--secondary)]">{stat.value}</div>
                   <div className="text-xs font-bold text-[var(--on-surface-variant)] uppercase">{stat.label}</div>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}
