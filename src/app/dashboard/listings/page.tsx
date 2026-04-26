'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus, Search, MoreHorizontal, Edit, Trash2,
  ExternalLink, Loader2, Building2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// ---------- Types ----------

interface OwnListing {
  id: string;
  title: string;
  price: number;
  operation_type: 'buy' | 'rent' | 'build';
  status: 'draft' | 'published' | 'archived' | 'pending';
  is_featured: boolean;
  created_at: string;
  cities: { name_ar: string } | null;
  listing_images: Array<{ storage_path: string; sort_order: number }>;
}

const STATUS_LABEL: Record<OwnListing['status'], string> = {
  published: 'منشور',
  draft: 'مسودة',
  pending: 'قيد المراجعة',
  archived: 'مؤرشف',
};

const STATUS_VARIANT: Record<OwnListing['status'], 'success' | 'outline' | 'warning' | 'info'> = {
  published: 'success',
  draft: 'outline',
  pending: 'warning',
  archived: 'info',
};

const OP_LABEL: Record<OwnListing['operation_type'], string> = {
  buy: 'للبيع',
  rent: 'للإيجار',
  build: 'للبناء',
};

function getImageUrl(storagePath: string): string {
  if (storagePath.startsWith('http')) return storagePath;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${storagePath}`;
}

// ---------- Loading skeleton ----------

function TableSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-16 h-12 rounded-xl shrink-0" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// ---------- Page ----------

export default function MyListingsPage() {
  const [listings, setListings] = React.useState<OwnListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const loadListings = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('يجب تسجيل الدخول'); setLoading(false); return; }

    const { data, error: fetchError } = await supabase
      .from('listings')
      .select(`
        id, title, price, operation_type, status, is_featured, created_at,
        cities:city_id ( name_ar ),
        listing_images ( storage_path, sort_order )
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) { setError(fetchError.message); }
    else { setListings((data as any[])?.map(item => ({
      ...item,
      cities: Array.isArray(item.cities) ? item.cities[0] : item.cities
    })) ?? []); }

    setLoading(false);
  }, []);

  React.useEffect(() => { loadListings(); }, [loadListings]);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    setDeleting(id);
    const { error: delError } = await supabase.from('listings').delete().eq('id', id);
    if (delError) { alert('فشل الحذف: ' + delError.message); }
    else { setListings(prev => prev.filter(l => l.id !== id)); }
    setDeleting(null);
  }

  // Filter by search
  const filtered = listings.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- Render ----------

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-right">
          <h1 className="text-3xl font-black text-[var(--primary)]">إعلاناتي</h1>
          <p className="text-[var(--on-surface-variant)] text-sm mt-1">
            {loading ? '...' : `${listings.length} إعلان مسجل`}
          </p>
        </div>
        <Link href="/dashboard/listings/add">
          <Button className="rounded-2xl gap-2 font-bold shadow-lg">
            <Plus className="w-5 h-5" />
            إضافة عقار جديد
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[var(--outline-variant)]">

        {/* Search bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في إعلاناتي..."
              className="w-full bg-[var(--surface-low)] border-none rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/20"
            />
          </div>
          <button
            onClick={loadListings}
            className="text-xs font-bold text-[var(--secondary)] hover:underline"
          >
            تحديث
          </button>
        </div>

        {/* Loading */}
        {loading && <TableSkeleton />}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-12 gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-red-600 font-bold text-sm">{error}</p>
            <Button onClick={loadListings} variant="outline" className="rounded-2xl text-xs">
              حاول مجدداً
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--surface-low)] flex items-center justify-center text-[var(--on-surface-variant)]">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <p className="font-black text-[var(--primary)] text-lg">
                {search ? 'لا توجد نتائج للبحث' : 'لا توجد إعلانات بعد'}
              </p>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                {search ? 'جرب كلمة بحث مختلفة' : 'أضف أول إعلان عقاري لك'}
              </p>
            </div>
            {!search && (
              <Link href="/dashboard/listings/add">
                <Button className="rounded-2xl gap-2 font-bold mt-2">
                  <Plus className="w-4 h-4" />
                  إضافة إعلان
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-[10px] uppercase font-bold text-[var(--on-surface-variant)] tracking-widest">
                  <th className="pb-4 text-right">العقار</th>
                  <th className="pb-4">النوع</th>
                  <th className="pb-4">الحالة</th>
                  <th className="pb-4">السعر</th>
                  <th className="pb-4 text-center">التاريخ</th>
                  <th className="pb-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                {filtered.map(listing => {
                  const images = [...listing.listing_images].sort((a, b) => a.sort_order - b.sort_order);
                  const thumb = images[0] ? getImageUrl(images[0].storage_path) : null;
                  const dateStr = new Date(listing.created_at).toLocaleDateString('fr-FR');

                  return (
                    <tr key={listing.id} className="group hover:bg-[var(--surface-low)] transition-all">
                      {/* Title + thumb */}
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-xl bg-[var(--surface-low)] overflow-hidden shrink-0 border border-[var(--outline-variant)]">
                            {thumb
                              ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-[var(--on-surface-variant)]"><Building2 className="w-5 h-5" /></div>
                            }
                          </div>
                          <div>
                            <p className="font-black text-[var(--primary)] text-sm">{listing.title}</p>
                            {listing.cities?.name_ar && (
                              <p className="text-[10px] text-[var(--on-surface-variant)] mt-0.5">
                                {listing.cities.name_ar}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Operation type */}
                      <td className="py-5">
                        <Badge variant="outline" className="text-[10px]">
                          {OP_LABEL[listing.operation_type]}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-5">
                        <Badge variant={STATUS_VARIANT[listing.status]}>
                          {STATUS_LABEL[listing.status]}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="py-5">
                        <span className="font-bold text-[var(--primary)] text-sm">
                          {formatPrice(listing.price)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-5 text-center text-[var(--on-surface-variant)] text-xs font-medium">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/properties/${listing.id}`}
                            className="p-2.5 rounded-xl bg-white border border-[var(--outline-variant)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white transition-all shadow-sm"
                            title="عرض"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            href={`/dashboard/listings/edit/${listing.id}`}
                            className="p-2.5 rounded-xl bg-white border border-[var(--outline-variant)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(listing.id)}
                            disabled={deleting === listing.id}
                            className="p-2.5 rounded-xl bg-white border border-[var(--outline-variant)] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                            title="حذف"
                          >
                            {deleting === listing.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
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
