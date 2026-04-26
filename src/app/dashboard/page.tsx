'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    async function redirectByUserType() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', user.id)
        .single();

      if (profile?.account_type === 'lister') {
        router.push('/dashboard/lister');
      } else {
        // Les chercheurs de propriété n'ont pas de dashboard — retour à l'accueil
        router.push('/');
      }
    }

    redirectByUserType();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--secondary)] mx-auto" />
        <p className="text-[var(--primary)] font-bold animate-pulse">جاري تحضير لوحة التحكم الخاصة بك...</p>
      </div>
    </div>
  );
}
