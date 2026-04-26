'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
    /* city is optional if user selected a location on the map */
    if (!form.cityId && !form.addressText.trim()) return 'يرجى اختيار المدينة أو تحديد الموقع على الخريطة';
  }
  return null;
}

// ---------- Page ----------

export default function AddListingPage() {
  const router = useRouter();

  const [step, setStep] = React.useState(1);
  const [cities, setCities] = React.useState<City[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [stepError, setStepError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Image state
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
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
    return () => { imagePreviews.forEach(url => URL.revokeObjectURL(url)); };
  }, [imagePreviews]);

  // Load cities + categories
  React.useEffect(() => {
    async function loadLookups() {
      const [citiesRes, catsRes] = await Promise.all([
        supabase.from('cities').select('id, name_ar').eq('is_active', true).order('name_ar'),
        supabase.from('property_categories').select('id, name_ar, slug').eq('is_active', true),
      ]);
      if (citiesRes.data) setCities(citiesRes.data);
      if (catsRes.data) {
        setCategories(catsRes.data);
        if (catsRes.data.length > 0) {
          setForm(f => ({ ...f, categoryId: catsRes.data![0].id }));
        }
      }
    }
    loadLookups();
  }, []);

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
    const merged = [...imageFiles, ...selected].slice(0, MAX_IMAGES);
    setImageFiles(merged);

    // Generate previews
    const oldPreviews = imagePreviews;
    const newPreviews = merged.map((f, i) =>
      i < imageFiles.length && imageFiles[i] === f
        ? imagePreviews[i]           // reuse existing URL
        : URL.createObjectURL(f)
    );
    oldPreviews.forEach((url, i) => { if (!newPreviews.includes(url)) URL.revokeObjectURL(url); });
    setImagePreviews(newPreviews);
    setStepError(null);

    // Reset input so the same file can be re-selected if removed
    e.target.value = '';
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  // ---------- Upload images to Supabase Storage ----------

  async function uploadImages(listingId: string): Promise<void> {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${listingId}/${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) {
        console.error('Image upload error:', uploadError.message);
        continue; // don't block listing creation for image failures
      }

      await supabase.from('listing_images').insert({
        listing_id: listingId,
        storage_path: path,
        sort_order: i,
      });
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('يجب تسجيل الدخول أولاً');

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          owner_id: user.id,
          listing_type: 'property',
          operation_type: form.operationType,
          title: form.title.trim(),
          description: form.description.trim() || null,
          address_text: form.addressText.trim() || null,
          price: parseFloat(form.price) || 0,
          currency_code: 'MRU',
          status,
          city_id: form.cityId || null,
          category_id: form.categoryId || null,
        })
        .select('id')
        .single();

      if (listingError) throw new Error(listingError.message);

      const { error: detailsError } = await supabase
        .from('property_details')
        .insert({
          listing_id: listing.id,
          area_sqm: parseFloat(form.areaSqm) || null,
          rooms_count: parseInt(form.roomsCount) || null,
          bathrooms_count: parseInt(form.bathroomsCount) || null,
          has_parking: parseInt(form.parkingCount) > 0,
          has_pool: form.amenities.includes('مسبح'),
          has_garden: form.amenities.includes('حديقة'),
        });

      if (detailsError) throw new Error(detailsError.message);

      // Upload images (non-blocking failures)
      if (imageFiles.length > 0) {
        await uploadImages(listing.id);
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/listings'), 1500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'حدث خطأ أثناء النشر');
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
          <h2 className="text-2xl font-black text-[var(--primary)]">تم نشر الإعلان بنجاح!</h2>
          <p className="text-sm text-[var(--on-surface-variant)]">جارٍ توجيهك إلى قائمة إعلاناتك...</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-right">
          <h1 className="text-3xl font-black text-[var(--primary)]">إضافة عقار جديد</h1>
          <p className="text-[var(--on-surface-variant)] text-sm mt-1">
            اتبع الخطوات البسيطة لإدراج عقارك في المنصة.
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

              {/* Main image slot (col-span-2) */}
              <div
                onClick={() => imagePreviews.length < MAX_IMAGES && fileInputRef.current?.click()}
                className={cn(
                  'col-span-2 h-64 rounded-[2rem] border-2 border-dashed transition-all relative overflow-hidden',
                  imagePreviews[0]
                    ? 'border-transparent cursor-default'
                    : 'bg-[var(--surface-low)] border-[var(--outline-variant)] hover:border-[var(--secondary)] cursor-pointer group'
                )}
              >
                {imagePreviews[0] ? (
                  <>
                    <img src={imagePreviews[0]} alt="main" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeImage(0); }}
                      className="absolute top-3 left-3 w-8 h-8 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      الصورة الرئيسية
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[var(--on-surface-variant)] group-hover:scale-110 transition-all shadow-sm">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[var(--primary)]">اضغط لرفع الصورة الرئيسية</p>
                      <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider mt-1">
                        PNG, JPG, WEBP — حتى {MAX_SIZE_MB} ميغابايت
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional image slots */}
              {[1, 2].map(i => (
                <div
                  key={i}
                  onClick={() => {
                    if (!imagePreviews[i] && imagePreviews.length < MAX_IMAGES) {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={cn(
                    'h-64 rounded-[2rem] border-2 border-dashed transition-all relative overflow-hidden',
                    imagePreviews[i]
                      ? 'border-transparent cursor-default'
                      : imagePreviews.length >= MAX_IMAGES
                        ? 'bg-[var(--surface-low)] border-[var(--outline-variant)] opacity-40 cursor-not-allowed'
                        : 'bg-[var(--surface-low)] border-[var(--outline-variant)] hover:border-[var(--secondary)] cursor-pointer'
                  )}
                >
                  {imagePreviews[i] ? (
                    <>
                      <img src={imagePreviews[i]} alt={`img-${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeImage(i); }}
                        className="absolute top-3 left-3 w-8 h-8 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--on-surface-variant)]">
                      <Plus className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Image count indicator */}
            <p className="text-xs text-[var(--on-surface-variant)] text-right font-bold">
              {imagePreviews.length} / {MAX_IMAGES} صور مرفوعة
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
                  : <><CheckCircle2 className="w-5 h-5" /> نشر العقار</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
