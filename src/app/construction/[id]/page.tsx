'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronRight, 
  MapPin, 
  Share2, 
  Heart, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar, 
  Info, 
  Sparkles, 
  Loader2,
  Clock,
  Briefcase,
  Wrench
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ImageGallery } from '@/components/property/ImageGallery';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatPrice } from '@/lib/utils';

export default function ConstructionServiceDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchListing() {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id,
            title,
            description,
            address_text,
            price,
            operation_type,
            is_featured,
            created_at,
            owner_id,
            cities (name_ar),
            listing_images(storage_path, sort_order),
            construction_service_details(service_type, estimated_duration, budget_min, budget_max)
          `)
          .eq('id', id)
          .single();

        if (!error && data) {
          const images = Array.isArray(data.listing_images) 
            ? (data.listing_images as any[]).map((img: any) => 
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${img.storage_path}`
              )
            : [];

          const serviceDetailsRaw = data.construction_service_details;
          const serviceDetails = Array.isArray(serviceDetailsRaw)
            ? (serviceDetailsRaw.length > 0 ? serviceDetailsRaw[0] : null)
            : serviceDetailsRaw;

          setListing({
            ...data,
            images,
            serviceDetails,
            city: Array.isArray(data.cities) ? data.cities[0]?.name_ar : (data.cities as any)?.name_ar
          });
        }
      } catch (err) {
        console.error('Error fetching construction service:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-[var(--primary)] font-bold">جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold">لم يتم العثور على الخدمة</p>
          <Link href="/construction">
            <Button variant="outline" className="mt-4 rounded-xl">العودة للبناء</Button>
          </Link>
        </div>
      </div>
    );
  }

  const details = listing.serviceDetails;

  return (
    <div className="bg-[var(--background)] min-h-screen pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-2 text-[var(--on-surface-variant)] text-xs">
        <Link href="/" className="hover:text-[var(--secondary)]">الرئيسية</Link>
        <ChevronRight className="w-3 h-3 rtl:rotate-180" />
        <Link href="/construction" className="hover:text-[var(--secondary)]">خدمات البناء</Link>
        <ChevronRight className="w-3 h-3 rtl:rotate-180" />
        <span className="text-[var(--primary)] font-bold">{listing.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   {listing.is_featured && <Badge variant="primary">خدمة مميزة</Badge>}
                   <Badge variant="success">بناء</Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-[var(--primary)]">{listing.title}</h1>
                <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
                  <MapPin className="w-4 h-4 text-[var(--secondary)]" />
                  <span className="text-sm font-medium">{listing.city || listing.address_text || 'نواكشوط'}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--on-surface-variant)] font-bold uppercase tracking-wider block mb-1">السعر التقريبي</span>
                <span className="text-4xl md:text-5xl font-black text-[var(--secondary)] whitespace-nowrap">
                   {formatPrice(listing.price)}
                </span>
              </div>
            </div>

            {/* Gallery */}
            <ImageGallery images={listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop']} />

            {/* Service Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="bg-white rounded-[1.5rem] p-6 flex flex-col items-center text-center shadow-sm border border-[var(--outline-variant)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-low)] flex items-center justify-center text-[var(--secondary)] mb-4">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-black text-[var(--primary)]">{details?.service_type || 'مقاولات عامة'}</span>
                  <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-tight">نوع الخدمة</span>
               </div>
               <div className="bg-white rounded-[1.5rem] p-6 flex flex-col items-center text-center shadow-sm border border-[var(--outline-variant)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-low)] flex items-center justify-center text-[var(--secondary)] mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-black text-[var(--primary)]">{details?.estimated_duration || 'حسب المشروع'}</span>
                  <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-tight">مدة التنفيذ</span>
               </div>
               <div className="bg-white rounded-[1.5rem] p-6 flex flex-col items-center text-center shadow-sm border border-[var(--outline-variant)] hidden md:flex">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-low)] flex items-center justify-center text-[var(--secondary)] mb-4">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-black text-[var(--primary)]">جاهز للعمل</span>
                  <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-tight">الحالة</span>
               </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm space-y-6">
              <h3 className="text-2xl font-extrabold text-[var(--primary)]">عن الخدمة والمقاول</h3>
              <p className="text-[var(--on-surface-variant)] leading-relaxed text-lg">
                {listing.description || 'لا يوجد وصف متاح لهذه الخدمة حالياً.'}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm space-y-8">
              <h3 className="text-2xl font-extrabold text-[var(--primary)]">ضمانات الجودة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 group p-4 rounded-2xl bg-[var(--surface-low)]">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-green-500 shadow-sm">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-[var(--primary)]">هوية موثقة</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">تم التحقق من الوثائق الرسمية للمقاول</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group p-4 rounded-2xl bg-[var(--surface-low)]">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-[var(--primary)]">تقييم ممتاز</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">سمعة طيبة وتاريخ حافل بالمشاريع الناجحة</p>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-32 h-fit">
            {/* Contact Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-ambient border border-[var(--outline-variant)] space-y-8">
              <div className="text-center space-y-4">
                 <div className="w-24 h-24 rounded-full bg-[var(--surface-low)] mx-auto overflow-hidden border-4 border-white shadow-lg">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop" alt="Contractor" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h4 className="font-black text-[var(--primary)] text-xl">مؤسسة البناء الحديث</h4>
                    <p className="text-xs text-[var(--on-surface-variant)] font-bold mt-1">مقاول مصنف أول - نواكشوط</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <Button className="w-full py-4 rounded-2xl gap-2 font-bold transition-all hover:scale-[1.02]">
                   <Mail className="w-5 h-5" />
                   طلب استشارة مجانية
                 </Button>
                 <Button variant="outline" className="w-full py-4 rounded-2xl gap-2 font-bold">
                   <Phone className="w-5 h-5" />
                   اتصال مباشر
                 </Button>
              </div>

              <div className="pt-6 border-t border-[var(--outline-variant)] flex items-center justify-center gap-6">
                <button className="flex items-center gap-2 text-xs font-bold text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors">
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
                <div className="w-px h-4 bg-[var(--outline-variant)]"></div>
                <button className="flex items-center gap-2 text-xs font-bold text-[var(--on-surface-variant)] hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  حفظ
                </button>
              </div>
            </div>

            {/* Why choose card */}
            <div className="bg-[var(--primary)] hero-gradient rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               <div className="relative z-10 space-y-4">
                 <h4 className="font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--secondary)]" />
                    لماذا نوصي بهذا المقاول؟
                 </h4>
                 <ul className="text-white/70 text-xs space-y-3">
                    <li className="flex gap-2"><span>•</span> التزام بالمواعيد النهائية</li>
                    <li className="flex gap-2"><span>•</span> شفافية كاملة في التسعير</li>
                    <li className="flex gap-2"><span>•</span> فريق عمل متخصص وذو خبرة</li>
                 </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
