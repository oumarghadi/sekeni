'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import {
  Camera, MapPin, ArrowLeft, ArrowRight,
  Save, CheckCircle2, Plus, Loader2, AlertCircle, X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { PickedLocation } from '@/components/property/LocationPicker';

const LocationPicker = dynamic(
  () => import('@/components/property/LocationPicker').then(m => ({ default: m.LocationPicker })),
  { ssr: false, loading: () => (
    <div className="h-[340px] rounded-2xl bg-[var(--surface-low)] flex items-center justify-center text-[var(--on-surface-variant)] gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm font-bold">جاري تحميل الخريطة…</span>
    </div>
  )}
);

// ---------- Types ----------

interface City { id: string; name_ar: string }
interface Category { id: string; name_ar: string; slug: string }

interface FormData {
  operationType: 'buy' | 'rent' | 'build';
  title: string;
  categoryId: string;
  price: string;
  areaSqm: string;
  roomsCount: string;
  bathroomsCount: string;
  parkingCount: string;
  cityId: string;
  addressText: string;
  description: string;
  amenities: string[];
}

const AMENITIES = [
  'مسبح', 'حديقة', 'تكييف مركزي', 'مصعد',
  'غرفة خادمة', 'مطبخ مجهز', 'بيت ذكي', 'صالة سينما',
];

const OPERATION_LABELS: Record<FormData['operationType'], string> = {
  buy: 'شراء',
  rent: 'إيجار',
  build: 'بناء',
};

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 10;
const BUCKET = 'listings';

// ---------- Validation ----------

function validateStep(step: number, form: FormData): string | null {
  if (step === 1) {
    if (!form.title.trim()) return 'عنوان الإعلان مطلوب';
    if (!form.price || parseFloat(form.price) <= 0) return 'السعر يجب أن يكون أكبر من صفر';
  }
  if (step === 2) {
    if (!form.cityId) return 'يرجى اختيار المدينة';
  }
  return null;
}

// ---------- Page ----------

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams();

  const [step, setStep] = React.useState(1);
  const [cities, setCities] = React.useState<City[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [stepError, setStepError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Image state
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [existingImages, setExistingImages] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = React.useState<FormData>({
    operationType: 'buy',
    title: '',
    categoryId: '',
    price: '',
    areaSqm: '',
    roomsCount: '',
    bathroomsCount: '',
    parkingCount: '',
    cityId: '',
    addressText: '',
    description: '',
    amenities: [],
  });

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => { imagePreviews.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); }); };
  }, [imagePreviews]);

  // Load cities + categories + existing data
  React.useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [citiesRes, catsRes, listingRes] = await Promise.all([
          supabase.from('cities').select('id, name_ar').eq('is_active', true).order('name_ar'),
          supabase.from('property_categories').select('id, name_ar, slug').eq('is_active', true),
          supabase.from('listings').select(`
            *,
            property_details(*),
            listing_images(storage_path, sort_order)
          `).eq('id', id).single()
        ]);

        if (citiesRes.data) setCities(citiesRes.data);
        if (catsRes.data) setCategories(catsRes.data);
        
        if (listingRes.error) throw listingRes.error;
        if (listingRes.data) {
          const l = listingRes.data;
          const d = Array.isArray(l.property_details) ? l.property_details[0] : l.property_details;
          
          const amenities: string[] = [];
          if (d?.has_pool) amenities.push('مسبح');
          if (d?.has_garden) amenities.push('حديقة');
          // Add others if needed...
          
          setForm({
            operationType: l.operation_type,
            title: l.title,
            categoryId: l.category_id || '',
            price: l.price?.toString() || '',
            areaSqm: d?.area_sqm?.toString() || '',
            roomsCount: d?.rooms_count?.toString() || '',
            bathroomsCount: d?.bathrooms_count?.toString() || '',
            parkingCount: d?.has_parking ? '1' : '0',
            cityId: l.city_id || '',
            addressText: l.address_text || '',
            description: l.description || '',
            amenities: amenities,
          });

          if (l.listing_images) {
            const imgs = [...l.listing_images].sort((a,b) => a.sort_order - b.sort_order);
            const urls = imgs.map(img => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${img.storage_path}`);
            setImagePreviews(urls);
            setExistingImages(urls);
          }
        }
      } catch (err: any) {
        setSubmitError(err.message || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }
    if (id) init();
  }, [id]);

  function set(field: keyof FormData, value: string | string[]) {
    setForm(f => ({ ...f, [field]: value }));
    setStepError(null);
  }

  function toggleAmenity(name: string) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(name)
        ? f.amenities.filter(a => a !== name)
        : [...f.amenities, name],
    }));
  }

  // ---------- Image handlers ----------

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    // Validate size
    const oversized = selected.find(f => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setStepError(`الصورة "${oversized.name}" تتجاوز ${MAX_SIZE_MB} ميغابايت`);
      return;
    }

    // Merge with existing, cap at MAX_IMAGES
    const totalCount = imagePreviews.length + selected.length;
    if (totalCount > MAX_IMAGES) {
       setStepError(`يمكنك رفع ${MAX_IMAGES} صور كحد أقصى`);
       return;
    }

    setImageFiles(prev => [...prev, ...selected]);
    const newPreviews = selected.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setStepError(null);
    e.target.value = '';
  }

  function removeImage(index: number) {
    const url = imagePreviews[index];
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      const blobIndex = imagePreviews.filter((u, i) => i < index && u.startsWith('blob:')).length;
      setImageFiles(prev => prev.filter((_, i) => i !== blobIndex));
    } else {
       // It's an existing image. We'll handle deletion later 
       // For simplicity, this version will replace images if user clicks "Save"
       // but here we just remove from preview list
       setExistingImages(prev => prev.filter(u => u !== url));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  // ---------- Upload images to Supabase Storage ----------

  async function updateImages(listingId: string): Promise<void> {
    // For simplicity, in Edit mode, if the user changed images, we'll delete old ones and upload new ones
    // Or we just append new ones. 
    // BUT! Since the user might have removed existing ones, we need to know what stays.
    
    // Clear old image records
    await supabase.from('listing_images').delete().eq('listing_id', listingId);
    
    // 1. Keep surviving existing images
    for (let i = 0; i < imagePreviews.length; i++) {
        const url = imagePreviews[i];
        if (!url.startsWith('blob:')) {
            const path = url.split('/listings/').pop();
            if (path) {
                await supabase.from('listing_images').insert({
                    listing_id: listingId,
                    storage_path: path,
                    sort_order: i
                });
            }
        } else {
            // 2. Upload new blobs
            const blobIndex = imagePreviews.filter((u, idx) => idx <= i && u.startsWith('blob:')).length - 1;
            const file = imageFiles[blobIndex];
            const ext = file.name.split('.').pop() ?? 'jpg';
            const path = `${listingId}/${Date.now()}_${i}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(path, file, { upsert: false, contentType: file.type });

            if (!uploadError) {
                await supabase.from('listing_images').insert({
                    listing_id: listingId,
                    storage_path: path,
                    sort_order: i,
                });
            }
        }
    }
  }

  // ---------- Navigation ----------

  function goNext() {
    const err = validateStep(step, form);
    if (err) { setStepError(err); return; }
    setStepError(null);
    setStep(s => s + 1);
  }

  function goPrev() {
    setStepError(null);
    setStep(s => s - 1);
  }

  // ---------- Submit ----------

  async function handleSubmit(status: 'published' | 'draft') {
    const err = validateStep(step, form);
    if (err) { setStepError(err); return; }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const { error: listingError } = await supabase
        .from('listings')
        .update({
          operation_type: form.operationType,
          title: form.title.trim(),
          description: form.description.trim() || null,
          address_text: form.addressText.trim() || null,
          price: parseFloat(form.price) || 0,
          status,
          city_id: form.cityId || null,
          category_id: form.categoryId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (listingError) throw new Error(listingError.message);

      const { error: detailsError } = await supabase
        .from('property_details')
        .upsert({
          listing_id: id as string,
          area_sqm: parseFloat(form.areaSqm) || null,
          rooms_count: parseInt(form.roomsCount) || null,
          bathrooms_count: parseInt(form.bathroomsCount) || null,
          has_parking: parseInt(form.parkingCount) > 0,
          has_pool: form.amenities.includes('مسبح'),
          has_garden: form.amenities.includes('حديقة'),
        });

      if (detailsError) throw new Error(detailsError.message);

      // Handle images
      await updateImages(id as string);

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/listings'), 1500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحديث');
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Success screen ----------

  if (success) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-[var(--primary)]">تم تحديث الإعلان بنجاح!</h2>
          <p className="text-sm text-[var(--on-surface-variant)]">جارٍ توجيهك إلى قائمة إعلاناتك...</p>
        </div>
      </div>
    );
  }

  if (loading) {
     return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-10 h-10 animate-spin text-[var(--secondary)]" />
           <p className="text-[var(--primary)] font-bold">جاري تحميل بيانات العقار...</p>
        </div>
     );
  }

  // ---------- Render ----------

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-right">
          <h1 className="text-3xl font-black text-[var(--primary)]">تعديل الإعلان</h1>
          <p className="text-[var(--on-surface-variant)] text-sm mt-1">
            قم بتعديل بيانات العقار وسنقوم بتحديثها فوراً.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-[var(--outline-variant)] shadow-sm">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all',
                step === s ? 'bg-[var(--secondary)] text-white'
                  : step > s ? 'bg-green-500 text-white'
                    : 'bg-[var(--surface-low)] text-[var(--on-surface-variant)]'
              )}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className="w-8 h-0.5 bg-[var(--outline-variant)]" />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 lg:p-16 shadow-ambient space-y-12">

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-10 animate-fadein">
            <div className="space-y-2 text-right">
              <h3 className="text-2xl font-extrabold text-[var(--primary)]">معلومات العقار الأساسية</h3>
              <p className="text-sm text-[var(--on-surface-variant)]">حدد نوع العملية ونوع العقار والسعر.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">نوع العملية</label>
                <div className="flex bg-[var(--surface-low)] p-1 rounded-2xl">
                  {(Object.entries(OPERATION_LABELS) as [FormData['operationType'], string][]).map(([val, label]) => (
                    <button key={val} type="button" onClick={() => set('operationType', val)}
                      className={cn('flex-grow py-3 text-xs font-bold rounded-xl transition-all',
                        form.operationType === val
                          ? 'bg-white text-[var(--primary)] shadow-sm'
                          : 'text-[var(--on-surface-variant)] hover:text-[var(--primary)]'
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="عنوان الإعلان" placeholder="فيلا مودرن في حي الملقا" required
                value={form.title} onChange={e => set('title', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[var(--primary)]">نوع العقار</label>
                <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
                  className="w-full bg-[var(--surface-low)] border-none rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-[var(--secondary)]/20 text-right">
                  {categories.length === 0 && <option value="">جاري التحميل...</option>}
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                </select>
              </div>
              <Input label="السعر (أوقية)" placeholder="0" type="number" min="0"
                value={form.price} onChange={e => set('price', e.target.value)} />
              <Input label="المساحة (م²)" placeholder="0" type="number" min="0"
                value={form.areaSqm} onChange={e => set('areaSqm', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input label="عدد غرف النوم" placeholder="0" type="number" min="0"
                value={form.roomsCount} onChange={e => set('roomsCount', e.target.value)} />
              <Input label="عدد دورات المياه" placeholder="0" type="number" min="0"
                value={form.bathroomsCount} onChange={e => set('bathroomsCount', e.target.value)} />
              <Input label="عدد المواقف" placeholder="0" type="number" min="0"
                value={form.parkingCount} onChange={e => set('parkingCount', e.target.value)} />
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-10 animate-fadein">
            <div className="space-y-2 text-right">
              <h3 className="text-2xl font-extrabold text-[var(--primary)]">الموقع والوصف</h3>
              <p className="text-sm text-[var(--on-surface-variant)]">ساعد المشتري على تخيل موقع عقارك.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[var(--primary)]">
                  المدينة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
                  <select value={form.cityId} onChange={e => set('cityId', e.target.value)}
                    className="w-full bg-[var(--surface-low)] border-none rounded-xl py-4 pr-12 pl-6 text-sm focus:ring-2 focus:ring-[var(--secondary)]/20 text-right">
                    <option value="">اختر المدينة</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                  </select>
                </div>
              </div>
              <Input label="العنوان التفصيلي" placeholder="الحي، الشارع، رقم المبنى..."
                value={form.addressText} onChange={e => set('addressText', e.target.value)} />
            </div>

            {/* ── Map picker ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--on-surface-variant)] font-medium">
                  يمكنك أيضاً كتابة العنوان يدوياً أعلاه
                </span>
                <label className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--secondary)]" />
                  تحديد الموقع على الخريطة
                </label>
              </div>
              <LocationPicker
                defaultAddress={form.addressText}
                onSelect={(loc: PickedLocation) => {
                  if (loc.address) set('addressText', loc.address);
                  /* auto-select city from map click */
                  if (loc.cityName && cities.length > 0) {
                    const matched = cities.find(c =>
                      c.name_ar.includes(loc.cityName!) ||
                      (loc.cityName!).includes(c.name_ar)
                    );
                    if (matched) set('cityId', matched.id);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--primary)]">وصف العقار</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full bg-[var(--surface-low)] border-none rounded-2xl py-6 px-8 text-[var(--on-surface)] transition-all focus:bg-white focus:ring-2 focus:ring-[var(--secondary)]/20 focus:outline-none min-h-[200px] text-right resize-none"
                placeholder="اكتب تفاصيل العقار المميزة والخدمات القريبة..." />
            </div>
          </div>
        )}

        {/* ── Step 3: Images & Amenities ── */}
        {step === 3 && (
          <div className="space-y-10 animate-fadein">
            <div className="space-y-2 text-right">
              <h3 className="text-2xl font-extrabold text-[var(--primary)]">الصور والمرافق</h3>
              <p className="text-sm text-[var(--on-surface-variant)]">
                الصور عالية الجودة تزيد من فرص البيع بنسبة 70%.
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Image grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {imagePreviews.map((url, i) => (
                <div
                    key={i}
                    className={cn(
                        'h-64 rounded-[2rem] border-2 border-transparent relative overflow-hidden group',
                        i === 0 ? 'col-span-2' : ''
                    )}
                >
                    <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-3 left-3 w-8 h-8 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {i === 0 && (
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                            الصورة الرئيسية
                        </div>
                    )}
                </div>
              ))}

              {imagePreviews.length < MAX_IMAGES && (
                 <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'h-64 rounded-[2rem] border-2 border-dashed bg-[var(--surface-low)] border-[var(--outline-variant)] hover:border-[var(--secondary)] cursor-pointer flex flex-col items-center justify-center gap-3',
                        imagePreviews.length === 0 ? 'col-span-2' : ''
                    )}
                 >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--on-surface-variant)]">
                        <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--primary)]">أضف صورة</span>
                 </div>
              )}
            </div>

            {/* Image count indicator */}
            <p className="text-xs text-[var(--on-surface-variant)] text-right font-bold">
              {imagePreviews.length} / {MAX_IMAGES} صور
            </p>

            {/* Amenities */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">المرافق المتاحة</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {AMENITIES.map(item => (
                  <label key={item} className={cn(
                    'flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all',
                    form.amenities.includes(item)
                      ? 'bg-[var(--secondary)]/10 ring-2 ring-[var(--secondary)]/30'
                      : 'bg-[var(--surface-low)] hover:bg-white hover:ring-2 hover:ring-[var(--secondary)]/20'
                  )}>
                    <input type="checkbox" checked={form.amenities.includes(item)}
                      onChange={() => toggleAmenity(item)}
                      className="w-5 h-5 rounded border-2 border-[var(--outline-variant)] text-[var(--secondary)] focus:ring-[var(--secondary)]" />
                    <span className="text-xs font-bold text-[var(--primary)]">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {stepError && (
          <div className="flex items-center justify-end gap-2 text-red-600 text-sm font-bold bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
            {stepError}
            <AlertCircle className="w-4 h-4 shrink-0" />
          </div>
        )}
        {submitError && (
          <div className="flex items-center justify-end gap-2 text-red-600 text-sm font-bold bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
            {submitError}
            <AlertCircle className="w-4 h-4 shrink-0" />
          </div>
        )}

        {/* Footer */}
        <div className="pt-12 border-t border-[var(--outline-variant)] flex items-center justify-between">
          <Button type="button" variant="outline" className="rounded-xl px-8"
            onClick={goPrev} disabled={step === 1 || submitting}>
            {step > 1 && <ArrowRight className="w-5 h-5 ml-2" />}
            السابق
          </Button>

          <div className="flex items-center gap-4">
            {step === 3 && (
              <Button type="button" variant="ghost" className="rounded-xl font-bold"
                onClick={() => handleSubmit('draft')} disabled={submitting}>
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4 ml-2" />}
                حفظ كمسودة
              </Button>
            )}

            {step < 3 ? (
              <Button type="button" className="rounded-xl px-12 gap-2"
                onClick={goNext} disabled={submitting}>
                التالي
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </Button>
            ) : (
              <Button type="button" className="rounded-xl px-12 gap-2"
                onClick={() => handleSubmit('published')} disabled={submitting}>
                {submitting
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><CheckCircle2 className="w-5 h-5" /> تحديث الإعلان</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
