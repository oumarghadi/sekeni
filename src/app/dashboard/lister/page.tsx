'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Users,
  Home,
  Eye,
  ArrowUpRight,
  MoreVertical,
  Loader2,
  PlusCircle,
  FileText,
  CheckCircle2,
  Edit,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { getListingImageUrl } from '@/lib/listings';

interface OwnListing {
  id: string;
  title: string;
  price: number;
  operation_type: 'buy' | 'rent' | 'build';
  listing_type: 'property' | 'construction_service';
  status: string;
  created_at: string;
  listing_images: { storage_path: string; sort_order: number }[];
}

const operationLabel: Record<string, string> = {
  buy: 'للبيع',
  rent: 'للإيجار',
  build: 'للبناء',
};

const statusLabel: Record<string, string> = {
  published: 'منشور',
  draft: 'مسودة',
  pending: 'قيد المراجعة',
  archived: 'مؤرشف',
};

const statusVariant: Record<string, 'success' | 'outline' | 'tertiary' | 'info'> = {
  published: 'success',
  draft: 'outline',
  pending: 'tertiary',
  archived: 'info',
};

export default function ListerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<{ name: string } | null>(null);
  const [listings, setListings] = React.useState<OwnListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) { router.push('/auth/login'); return; }

        // Fetch profile
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('full_name, account_type')
          .eq('id', user.id)
          .single();

        if (profileErr) { setError('حدث خطأ في جلب البيانات'); setLoading(false); return; }
        if (profileData?.account_type !== 'lister') { router.push('/dashboard/seeker'); return; }

        setProfile({ name: profileData.full_name?.split(' ')[0] || user.email?.split('@')[0] || '...' });

        // Fetch only THIS user's own listings
        const { data: listingsData, error: listErr } = await supabase
          .from('listings')
          .select('id, title, price, operation_type, listing_type, status, created_at, listing_images(storage_path, sort_order)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (listErr) { setError('حدث خطأ في جلب الإعلانات'); setLoading(false); return; }

        setListings(
          (listingsData as any[]).map((l) => ({
            ...l,
            listing_images: Array.isArray(l.listing_images) ? l.listing_images : [],
          }))
        );
      } catch {
        setError('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      return;
    }

    setDeletingId(id);
    const { error: deleteError } = await supabase.from('listings').delete().eq('id', id);

    if (deleteError) {
      alert(`فشل الحذف: ${deleteError.message}`);
    } else {
      setListings((previous) => previous.filter((listing) => listing.id !== id));
      setOpenMenuId(null);
    }

    setDeletingId(null);
  }

  // Computed stats from real data
  const published = listings.filter((l) => l.status === 'published').length;
  const drafts = listings.filter((l) => l.status === 'draft').length;
  const pending = listings.filter((l) => l.status === 'pending').length;

  const stats = [
    { label: 'إجمالي إعلاناتي', value: listings.length.toString(), icon: Home, color: 'bg-blue-50 text-blue-600' },
    { label: 'منشورة', value: published.toString(), icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
    { label: 'مسودات', value: drafts.toString(), icon: FileText, color: 'bg-amber-50 text-amber-600' },
    { label: 'قيد المراجعة', value: pending.toString(), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-bold">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl">حاول مجدداً</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-right">
          <h1 className="text-3xl font-black text-[var(--primary)] flex items-center justify-end gap-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `مرحباً، ${profile?.name}`}
          </h1>
          <p className="text-[var(--on-surface-variant)] text-sm mt-1">
            إليك ملخص إعلاناتك وخدماتك المدرجة.
          </p>
        </div>
        {!loading && (
          <Link href="/dashboard/listings/add">
            <Button className="rounded-2xl gap-2 font-bold shadow-lg shadow-[var(--primary)]/10">
              <PlusCircle className="w-5 h-5" />
              أضف إعلان جديد
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-[2rem] p-8 h-32 animate-pulse bg-[var(--surface-low)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-[var(--outline-variant)] flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[var(--primary)]">{stat.value}</p>
                <p className="text-xs font-bold text-[var(--on-surface-variant)] mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Listings Table */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[var(--outline-variant)]">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard/listings">
            <Button variant="ghost" className="text-xs font-bold text-[var(--secondary)]">إدارة الكل</Button>
          </Link>
          <h3 className="text-xl font-black text-[var(--primary)]">إعلاناتي</h3>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="h-16 rounded-2xl bg-[var(--surface-low)] animate-pulse" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--surface-low)] flex items-center justify-center text-[var(--on-surface-variant)]">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <p className="font-black text-[var(--primary)]">لا يوجد إعلانات بعد</p>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">ابدأ بإضافة أول إعلان لك الآن</p>
            </div>
            <Link href="/dashboard/listings/add">
              <Button className="rounded-2xl gap-2 mt-2"><PlusCircle className="w-4 h-4" />أضف إعلان</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--outline-variant)]">
                  <th className="pb-4 text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">الإعلان</th>
                  <th className="pb-4 text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-center">النوع</th>
                  <th className="pb-4 text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider text-center">الحالة</th>
                  <th className="pb-4 text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">السعر</th>
                  <th className="pb-4 text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">التاريخ</th>
                  <th className="pb-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                {listings.slice(0, 8).map((item) => {
                  const firstImg = item.listing_images.sort((a, b) => a.sort_order - b.sort_order)[0];
                  const imgUrl = firstImg
                    ? getListingImageUrl(firstImg.storage_path)
                    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&auto=format&fit=crop';

                  return (
                    <tr key={item.id} className="group hover:bg-[var(--surface-low)] transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[var(--surface-low)]">
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-[var(--primary)] text-sm line-clamp-1 max-w-[200px]">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <Badge variant={item.operation_type === 'buy' ? 'info' : item.operation_type === 'rent' ? 'tertiary' : 'success'}>
                          {operationLabel[item.operation_type] ?? item.operation_type}
                        </Badge>
                      </td>
                      <td className="py-4 text-center">
                        <Badge variant={statusVariant[item.status] ?? 'outline'}>
                          {statusLabel[item.status] ?? item.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <span className="font-black text-[var(--primary)] text-sm">{formatPrice(item.price)}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs text-[var(--on-surface-variant)]">
                          {new Date(item.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="relative inline-flex justify-center" ref={openMenuId === item.id ? menuRef : null}>
                          <button
                            type="button"
                            onClick={() => setOpenMenuId((current) => (current === item.id ? null : item.id))}
                            className="p-2 hover:bg-white rounded-lg transition-all text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
                            aria-label="إجراءات الإعلان"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === item.id && (
                            <div className="absolute left-0 top-full mt-2 w-44 rounded-2xl border border-[var(--outline-variant)] bg-white shadow-xl p-2 z-20 text-right">
                              <Link
                                href={`/properties/${item.id}`}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[var(--primary)] hover:bg-[var(--surface-low)] transition-colors"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <ExternalLink className="w-4 h-4 text-[var(--secondary)]" />
                                <span>Voir</span>
                              </Link>

                              <Link
                                href={`/dashboard/listings/edit/${item.id}`}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[var(--primary)] hover:bg-[var(--surface-low)] transition-colors"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Edit className="w-4 h-4 text-[var(--primary)]" />
                                <span>Modifier</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                <span>Supprimer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
