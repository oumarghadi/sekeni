'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Heart,
  Info,
  KeyRound,
  Leaf,
  LineChart,
  Loader2,
  Mail,
  MapPin,
  Share2,
  ShieldCheck,
  Waves,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ImageGallery } from '@/components/property/ImageGallery';
import { PropertyMap } from '@/components/property/PropertyMap';
import { PropertyStats } from '@/components/property/PropertyStats';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, resolveStoragePublicUrl } from '@/lib/utils';
import { Property } from '@/types/property';

type AppErrorLike = {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
  status?: number;
};

type ContactFallbackIntent = 'contact' | 'visit';

type ContactFallbackOptions = {
  intent: ContactFallbackIntent;
  message?: string;
  visitDate?: string;
  visitTime?: string;
  visitNote?: string;
};

const INTERACTIONS_DISABLED_STORAGE_KEY = 'sekeni-interactions-disabled';
// Keep property actions on a guaranteed-working path until the remote Supabase
// interactions grants/policies migration is applied.
const PROPERTY_ACTIONS_USE_CONTACT_FALLBACK = true;

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [property, setProperty] = React.useState<Property | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [ownerProfile, setOwnerProfile] = React.useState<{
    full_name: string | null;
    avatar_url: string | null;
    account_type: string | null;
  } | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [savingFav, setSavingFav] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  const [contactStatus, setContactStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactError, setContactError] = React.useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = React.useState<string | null>(null);

  const [showVisitModal, setShowVisitModal] = React.useState(false);
  const [visitDate, setVisitDate] = React.useState('');
  const [visitTime, setVisitTime] = React.useState('');
  const [visitNote, setVisitNote] = React.useState('');
  const [visitStatus, setVisitStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [visitError, setVisitError] = React.useState<string | null>(null);
  const [visitConversationId, setVisitConversationId] = React.useState<string | null>(null);

  const [showReserveModal, setShowReserveModal] = React.useState(false);
  const [helpPhone, setHelpPhone] = React.useState('');
  const [reserveDate, setReserveDate] = React.useState('');
  const [reserveDuration, setReserveDuration] = React.useState('1');
  const [reserveStatus, setReserveStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  function getReadableErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (error && typeof error === 'object') {
      const appError = error as AppErrorLike;
      const parts = [appError.message, appError.details, appError.hint].filter(Boolean);

      if (parts.length > 0) {
        return parts.join(' ');
      }

      if (appError.code) {
        return `${fallback} (${appError.code})`;
      }
    }

    return fallback;
  }

  function isPermissionError(error: unknown) {
    if (!error || typeof error !== 'object') return false;

    const appError = error as AppErrorLike;
    return appError.code === '42501' || appError.status === 401 || appError.status === 403;
  }

  function shouldUseContactFallback() {
    if (PROPERTY_ACTIONS_USE_CONTACT_FALLBACK) {
      return true;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    return window.sessionStorage.getItem(INTERACTIONS_DISABLED_STORAGE_KEY) === '1';
  }

  function markInteractionsDisabled() {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(INTERACTIONS_DISABLED_STORAGE_KEY, '1');
  }

  async function getSignedInUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.push('/auth/login');
      return null;
    }

    return session.user;
  }

  async function handleSaveFavorite() {
    if (savingFav) return;
    setSavingFav(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/auth/login');
      setSavingFav(false);
      return;
    }
    if (isSaved) {
      await supabase.from('favorites').delete()
        .eq('user_id', session.user.id)
        .eq('listing_id', property!.id);
      setIsSaved(false);
    } else {
      await supabase.from('favorites').insert({
        user_id: session.user.id,
        listing_id: property!.id,
      });
      setIsSaved(true);
    }
    setSavingFav(false);
  }

  async function findConversationBetweenUsers(currentUserId: string, listingOnly: boolean) {
    if (!property?.agentId) return null;

    const participantFilter = `and(initiator_id.eq.${currentUserId},receiver_id.eq.${property.agentId}),and(initiator_id.eq.${property.agentId},receiver_id.eq.${currentUserId})`;
    let query = supabase.from('conversations').select('id');

    if (listingOnly) {
      query = query.eq('listing_id', property.id);
    }

    const { data, error } = await query.or(participantFilter).limit(1).maybeSingle();

    if (error) {
      throw error;
    }

    return data?.id ?? null;
  }

  async function getOrCreateConversation(currentUserId: string) {
    if (!property?.agentId) {
      throw new Error('بيانات المعلن غير متاحة حالياً.');
    }

    if (property.agentId === currentUserId) {
      throw new Error('لا يمكنك مراسلة إعلانك من نفس الحساب.');
    }

    const listingConversationId = await findConversationBetweenUsers(currentUserId, true);
    if (listingConversationId) {
      return listingConversationId;
    }

    const pairConversationId = await findConversationBetweenUsers(currentUserId, false);
    if (pairConversationId) {
      return pairConversationId;
    }

    const { data: createdConversation, error: createConversationError } = await supabase
      .from('conversations')
      .insert({
        listing_id: property.id,
        initiator_id: currentUserId,
        receiver_id: property.agentId,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (createConversationError) {
      const fallbackConversationId = await findConversationBetweenUsers(currentUserId, false);
      if (fallbackConversationId) {
        return fallbackConversationId;
      }

      throw createConversationError;
    }

    return createdConversation.id as string;
  }

  async function createContactRequest(requesterId: string, message: string) {
    if (!property?.agentId) {
      throw new Error('بيانات المعلن غير متاحة حالياً.');
    }

    const { error } = await supabase.from('contact_requests').insert({
      listing_id: property.id,
      requester_id: requesterId,
      owner_id: property.agentId,
      message,
      status: 'pending',
    });

    if (error) {
      throw error;
    }
  }

  async function fallbackToContactPage(options: ContactFallbackOptions) {
    if (!property) return;

    const searchParams = new URLSearchParams({
      property: property.id,
      title: property.titleAr,
      intent: options.intent,
    });

    if (options.message) {
      searchParams.set('message', options.message);
    }

    if (options.visitDate) {
      searchParams.set('visitDate', options.visitDate);
    }

    if (options.visitTime) {
      searchParams.set('visitTime', options.visitTime);
    }

    if (options.visitNote) {
      searchParams.set('visitNote', options.visitNote);
    }

    router.push(`/contact?${searchParams.toString()}`);
  }

  function handleContactAgent() {
    if (!property) return;

    const intentLabel =
      property.operationType === 'rent' ? 'إيجار' :
      property.operationType === 'build' ? 'بناء' : 'شراء';

    const message = encodeURIComponent(
      `مرحباً، أنا مهتم بـ${intentLabel} العقار: "${property.titleAr}". هل يمكنكم مساعدتي؟`
    );

    window.open(`https://wa.me/22246603985?text=${message}`, '_blank');
  }

  function openVisitModal() {
    setVisitStatus('idle');
    setVisitError(null);
    setVisitConversationId(null);
    setShowVisitModal(true);
  }

  function resetVisitModal() {
    setShowVisitModal(false);
    setVisitDate('');
    setVisitTime('');
    setVisitNote('');
    setVisitStatus('idle');
    setVisitError(null);
    setVisitConversationId(null);
  }

  async function handleSubmitVisitRequest() {
    if (!property || !visitDate || !visitTime || visitStatus === 'loading') return;

    setVisitStatus('loading');
    setVisitError(null);

    const user = await getSignedInUser();
    if (!user) {
      setVisitStatus('idle');
      return;
    }

    const visitMessage = [
      `مرحباً، أرغب في حجز موعد معاينة للعقار "${property.titleAr}".`,
      `التاريخ المقترح: ${visitDate}.`,
      `الوقت المقترح: ${visitTime}.`,
      visitNote.trim() ? `ملاحظات إضافية: ${visitNote.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    if (shouldUseContactFallback()) {
      setVisitStatus('idle');
      await fallbackToContactPage({
        intent: 'visit',
        message: visitMessage,
        visitDate,
        visitTime,
        visitNote: visitNote.trim(),
      });
      return;
    }

    try {
      const conversationId = await getOrCreateConversation(user.id);

      const { error: messageError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        body: visitMessage,
      });

      if (messageError) {
        throw messageError;
      }

      const { error: updateConversationError } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (updateConversationError) {
        throw updateConversationError;
      }

      setVisitConversationId(conversationId);
      setVisitStatus('success');
    } catch (conversationError) {
      try {
        await createContactRequest(user.id, visitMessage);
        setVisitConversationId(null);
        setVisitStatus('success');
      } catch (requestError) {
        if (isPermissionError(conversationError) || isPermissionError(requestError)) {
          markInteractionsDisabled();
          await fallbackToContactPage({
            intent: 'visit',
            message: visitMessage,
            visitDate,
            visitTime,
            visitNote: visitNote.trim(),
          });
          return;
        }

        setVisitStatus('error');
        setVisitError(getReadableErrorMessage(requestError, 'تعذر إرسال طلب المعاينة الآن. حاول مرة أخرى بعد قليل.'));
      }
    }
  }

  async function handleConfirmReservation() {
    if (!reserveDate || !property) return;

    setReserveStatus('loading');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setReserveStatus('error');
      return;
    }

    const { error } = await supabase.from('reservations').insert({
      listing_id: property.id,
      user_id: session.user.id,
      start_date: reserveDate,
      duration_months: parseInt(reserveDuration, 10),
      status: 'pending',
    });

    setReserveStatus(error ? 'error' : 'success');
  }

  React.useEffect(() => {
    async function fetchProperty() {
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
            listing_images(storage_path, sort_order),
            property_details(area_sqm, rooms_count, bathrooms_count, has_parking, has_pool, has_garden)
          `)
          .eq('id', id)
          .single();

        if (!error && data) {
          const images = Array.isArray((data as any).listing_images)
            ? ((data as any).listing_images as any[]).map(
                (img: any) =>
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${img.storage_path}`
              )
            : [];

          const propDetailsRaw = (data as any).property_details;
          const propDetails = Array.isArray(propDetailsRaw)
            ? propDetailsRaw.length > 0
              ? propDetailsRaw[0]
              : null
            : propDetailsRaw;

          const convertedProperty: Property = {
            id: (data as any).id,
            title: (data as any).title,
            titleAr: (data as any).title,
            description: (data as any).description || '',
            descriptionAr: (data as any).description || '',
            price: (data as any).price || 0,
            priceLabel: new Intl.NumberFormat('fr-FR').format((data as any).price || 0) + ' MRU',
            location: (data as any).address_text || '',
            locationAr: (data as any).address_text || '',
            city: (data as any).id || '',
            cityAr: (data as any).id || '',
            district: '',
            districtAr: '',
            operationType: (data as any).operation_type || 'buy',
            propertyType: 'villa',
            bedrooms: propDetails?.rooms_count || 0,
            bathrooms: propDetails?.bathrooms_count || 0,
            area: propDetails?.area_sqm || 0,
            parking: propDetails?.has_parking ? 1 : 0,
            images:
              images.length > 0
                ? images
                : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop'],
            amenities: [
              ...(propDetails?.has_parking ? ['موقف سيارات'] : []),
              ...(propDetails?.has_pool    ? ['مسبح']        : []),
              ...(propDetails?.has_garden  ? ['حديقة']       : []),
            ],
            amenitiesAr: [
              ...(propDetails?.has_parking ? ['موقف سيارات'] : []),
              ...(propDetails?.has_pool    ? ['مسبح']        : []),
              ...(propDetails?.has_garden  ? ['حديقة']       : []),
            ],
            status: 'active',
            isFeatured: (data as any).is_featured || false,
            isNew: new Date((data as any).created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
            isVerified: true,
            agentId: (data as any).owner_id,
            createdAt: (data as any).created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            views: 0,
          };

          setProperty(convertedProperty);

          // Fetch owner profile
          const ownerId = (data as any).owner_id;
          if (ownerId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, account_type')
              .eq('id', ownerId)
              .single();
            if (profile) {
              setOwnerProfile({
                full_name: profile.full_name,
                avatar_url: resolveStoragePublicUrl(profile.avatar_url, 'profiles'),
                account_type: profile.account_type,
              });
            }
          }

          // Check if already saved by current user
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setCurrentUserId(session.user.id);
            const { data: fav } = await supabase
              .from('favorites')
              .select('id')
              .eq('user_id', session.user.id)
              .eq('listing_id', (data as any).id)
              .maybeSingle();
            setIsSaved(!!fav);
          }
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-[var(--primary)] font-bold">جاري تحميل تفاصيل العقار...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold">لم يتم العثور على العقار</p>
        </div>
      </div>
    );
  }

  const totalPrice = property.price * parseInt(reserveDuration || '1', 10);

  return (
    <div className="bg-[var(--background)] min-h-screen pb-24">
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6 animate-fadein">
            {visitStatus === 'success' ? (
              <div className="flex flex-col items-center text-center space-y-4 py-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-[var(--primary)]">تم إرسال طلب المعاينة</h3>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  {visitConversationId
                    ? 'تم إنشاء الطلب وإرساله إلى المعلن داخل المحادثة المباشرة.'
                    : 'تم تسجيل طلب المعاينة وإرساله إلى المعلن وسيتم التواصل معك قريباً.'}
                </p>

                {visitConversationId ? (
                  <>
                    <Button
                      className="w-full rounded-2xl"
                      onClick={() => router.push(`/dashboard/messages?conversation=${encodeURIComponent(visitConversationId)}`)}
                    >
                      فتح المحادثة
                    </Button>
                    <Button variant="outline" className="w-full rounded-2xl" onClick={resetVisitModal}>
                      إغلاق
                    </Button>
                  </>
                ) : (
                  <Button className="w-full rounded-2xl" onClick={resetVisitModal}>
                    إغلاق
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <button onClick={resetVisitModal} className="p-2 rounded-xl hover:bg-[var(--surface-low)] transition-colors">
                    <X className="w-5 h-5 text-[var(--on-surface-variant)]" />
                  </button>
                  <h3 className="text-lg font-black text-[var(--primary)]">حجز موعد معاينة</h3>
                </div>

                <div className="bg-[var(--surface-low)] rounded-2xl p-4 text-right space-y-1">
                  <p className="text-xs font-black text-[var(--primary)] line-clamp-1">{property.titleAr}</p>
                  <p className="text-[11px] text-[var(--on-surface-variant)]">
                    اختر التاريخ والوقت المناسبين وسيتم إرسال الطلب مباشرة إلى المعلن.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-[var(--primary)]">التاريخ المفضل</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[var(--surface-low)] border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/30"
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-[var(--primary)]">الوقت المفضل</label>
                    <input
                      type="time"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="w-full bg-[var(--surface-low)] border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/30"
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-[var(--primary)]">ملاحظات إضافية</label>
                    <textarea
                      value={visitNote}
                      onChange={(e) => setVisitNote(e.target.value)}
                      rows={4}
                      placeholder="مثلاً: أفضل المعاينة بعد العصر."
                      className="w-full resize-none bg-[var(--surface-low)] border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/30"
                    />
                  </div>
                </div>

                {visitStatus === 'error' && visitError && (
                  <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-2 rounded-xl">
                    {visitError}
                  </p>
                )}

                <Button
                  className="w-full py-4 rounded-2xl text-sm font-black gap-2"
                  onClick={handleSubmitVisitRequest}
                  disabled={!visitDate || !visitTime || visitStatus === 'loading'}
                >
                  {visitStatus === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  إرسال طلب المعاينة
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6 animate-fadein">
            {reserveStatus === 'success' ? (
              <div className="flex flex-col items-center text-center space-y-4 py-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-[var(--primary)]">تم تأكيد الحجز!</h3>
                <p className="text-sm text-[var(--on-surface-variant)]">سيتواصل معك المعلن قريباً لتأكيد التفاصيل.</p>
                <Button
                  className="w-full rounded-2xl"
                  onClick={() => {
                    setShowReserveModal(false);
                    setReserveStatus('idle');
                  }}
                >
                  إغلاق
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowReserveModal(false)}
                    className="p-2 rounded-xl hover:bg-[var(--surface-low)] transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--on-surface-variant)]" />
                  </button>
                  <h3 className="text-lg font-black text-[var(--primary)]">تأكيد الحجز</h3>
                </div>

                <div className="bg-[var(--surface-low)] rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-[var(--secondary)] font-black text-lg">{formatPrice(totalPrice)}</span>
                  <div className="text-right">
                    <p className="text-xs font-black text-[var(--primary)] line-clamp-1">{property.titleAr}</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)]">إيجار شهري</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-[var(--primary)]">تاريخ بداية الإيجار</label>
                    <input
                      type="date"
                      value={reserveDate}
                      onChange={(e) => setReserveDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[var(--surface-low)] border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/30"
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-[var(--primary)]">مدة الإيجار (بالأشهر)</label>
                    <select
                      value={reserveDuration}
                      onChange={(e) => setReserveDuration(e.target.value)}
                      className="w-full bg-[var(--surface-low)] border border-[var(--outline-variant)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/30"
                    >
                      {[1, 2, 3, 6, 12, 24].map((months) => (
                        <option key={months} value={months}>
                          {months} {months === 1 ? 'شهر' : 'أشهر'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-[var(--outline-variant)] pt-4 flex items-center justify-between text-sm">
                  <span className="font-black text-[var(--secondary)] text-lg">{formatPrice(totalPrice)}</span>
                  <span className="text-[var(--on-surface-variant)] text-xs">
                    الإجمالي لـ {reserveDuration} {parseInt(reserveDuration, 10) === 1 ? 'شهر' : 'أشهر'}
                  </span>
                </div>

                {reserveStatus === 'error' && (
                  <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-2 rounded-xl">
                    حدث خطأ. تأكد من تسجيل الدخول وحاول مجدداً.
                  </p>
                )}

                <Button
                  className="w-full py-4 rounded-2xl text-sm font-black gap-2"
                  onClick={handleConfirmReservation}
                  disabled={!reserveDate || reserveStatus === 'loading'}
                >
                  {reserveStatus === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  تأكيد الحجز
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-2 text-[var(--on-surface-variant)] text-xs">
        <Link href="/" className="hover:text-[var(--secondary)]">
          الرئيسية
        </Link>
        <ChevronRight className="w-3 h-3 rtl:rotate-180" />
        <Link href="/properties" className="hover:text-[var(--secondary)]">
          العقارات
        </Link>
        <ChevronRight className="w-3 h-3 rtl:rotate-180" />
        <span className="text-[var(--primary)] font-bold">{property.titleAr}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {property.isFeatured && <Badge variant="primary">عقار مميز</Badge>}
                  <Badge variant="info">{property.operationType === 'buy' ? 'للبيع' : 'للإيجار'}</Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-[var(--primary)]">{property.titleAr}</h1>
                <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
                  <MapPin className="w-4 h-4 text-[var(--secondary)]" />
                  <span className="text-sm font-medium">{property.locationAr}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[var(--on-surface-variant)] font-bold uppercase tracking-wider block mb-1">
                  السعر المطلوب
                </span>
                <span className="text-4xl md:text-5xl font-black text-[var(--secondary)] whitespace-nowrap">
                  {formatPrice(property.price)}
                </span>
              </div>
            </div>

            <ImageGallery images={property.images} />

            <PropertyStats
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={property.area}
              parking={property.parking}
            />

            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm space-y-6">
              <h3 className="text-2xl font-extrabold text-[var(--primary)]">نظرة عامة على العقار</h3>
              <p className="text-[var(--on-surface-variant)] leading-relaxed text-lg">{property.descriptionAr}</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm space-y-8">
              <h3 className="text-2xl font-extrabold text-[var(--primary)]">المرافق والمميزات</h3>
              {property.amenitiesAr.length === 0 ? (
                <p className="text-[var(--on-surface-variant)] text-sm">لا توجد مرافق مدرجة لهذا العقار.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {property.amenitiesAr.map((amenity, index) => {
                    const Icon =
                      amenity === 'موقف سيارات' ? Car :
                      amenity === 'مسبح'        ? Waves :
                      amenity === 'حديقة'       ? Leaf :
                      ShieldCheck;
                    return (
                      <div key={index} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-[var(--surface-low)] flex items-center justify-center text-[var(--secondary)] group-hover:bg-[var(--secondary)] group-hover:text-white transition-all">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[var(--primary)]">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm space-y-6">
              <h3 className="text-2xl font-extrabold text-[var(--primary)]">الموقع</h3>
              <PropertyMap address={property.locationAr} />
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-ambient border border-[var(--outline-variant)] space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--secondary)]/20 bg-[var(--secondary)] flex items-center justify-center shrink-0">
                  {ownerProfile?.avatar_url ? (
                    <img
                      src={ownerProfile.avatar_url}
                      alt={ownerProfile.full_name ?? 'المعلن'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl font-black">
                      {ownerProfile?.full_name?.[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-[var(--primary)]">
                    {ownerProfile?.full_name ?? 'المعلن'}
                  </h4>
                  <p className="text-[10px] text-[var(--on-surface-variant)] uppercase font-bold tracking-widest">
                    {ownerProfile?.account_type === 'lister' ? 'معلن عقاري' : 'مستخدم'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {currentUserId && currentUserId === property.agentId ? (
                  /* ── Owner view: edit button only ── */
                  <Button
                    className="w-full py-4 rounded-2xl gap-2"
                    onClick={() => router.push(`/dashboard/listings/edit/${property.id}`)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    تعديل الإعلان
                  </Button>
                ) : (
                  /* ── Visitor view: contact + rent + visit ── */
                  <>
                    {property.operationType === 'rent' && (
                      <Button
                        className="w-full py-4 rounded-2xl gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0"
                        onClick={() => { setReserveStatus('idle'); setShowReserveModal(true); }}
                      >
                        <KeyRound className="w-5 h-5" />
                        استأجر الآن
                      </Button>
                    )}

                    <Button
                      className="w-full py-4 rounded-2xl gap-2 bg-[#25D366] hover:bg-[#1ebe5d] border-0 text-white"
                      onClick={handleContactAgent}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      تواصل مع المعلن
                    </Button>

                    <Button variant="outline" className="w-full py-4 rounded-2xl gap-2" onClick={openVisitModal}>
                      <Calendar className="w-5 h-5" />
                      حجز موعد معاينة
                    </Button>

                    {contactSuccess && contactStatus === 'success' && (
                      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-600">
                        {contactSuccess}
                      </p>
                    )}
                    {contactError && contactStatus === 'error' && (
                      <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-xs font-bold text-red-500">
                        {contactError}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="pt-6 border-t border-[var(--outline-variant)] flex items-center justify-center gap-6">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: property.titleAr, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
                <div className="w-px h-4 bg-[var(--outline-variant)]"></div>
                <button
                  onClick={handleSaveFavorite}
                  disabled={savingFav}
                  className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                    isSaved ? 'text-red-500' : 'text-[var(--on-surface-variant)] hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'محفوظ' : 'حفظ'}
                </button>
              </div>
            </div>

            <div className="bg-[var(--primary)] hero-gradient rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">فرصة استثمارية</h4>
                  <LineChart className="w-6 h-6 text-[var(--secondary)]" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {property.locationAr
                    ? `يقع هذا العقار في ${property.locationAr}، من أكثر المناطق طلباً في سوق العقارات الموريتاني. فرصة مثالية للاستثمار أو السكن الفوري.`
                    : 'يقع هذا العقار في موقع استراتيجي بنواكشوط، من أكثر المناطق طلباً في سوق العقارات الموريتاني. فرصة مثالية للاستثمار أو السكن الفوري.'}
                </p>
                <div className="flex items-end gap-4">
                  <div>
                    <div className="text-3xl font-black text-[var(--secondary)]">
                      {property.operationType === 'rent' ? 'إيجار' : property.operationType === 'buy' ? 'للبيع' : 'خدمة بناء'}
                    </div>
                    <span className="text-xs font-normal text-white/50">
                      {property.operationType === 'rent' ? 'دفع شهري مرن' : 'استثمار طويل المدى'}
                    </span>
                  </div>
                  <div className="mr-auto text-left">
                    <div className="text-xl font-black text-white/80">{new Date(property.createdAt).getFullYear()}</div>
                    <span className="text-[10px] text-white/40">سنة الإدراج</span>
                  </div>
                </div>
              </div>
            </div>

            {/* تحتاج مساعدة — functional WhatsApp redirect */}
            <div className="bg-[var(--secondary-light)] rounded-[2.5rem] p-8 space-y-6 border border-[var(--secondary)]/10">
              <div className="flex items-center gap-3 text-[var(--secondary)] font-bold">
                <Info className="w-5 h-5" />
                <span>تحتاج مساعدة؟</span>
              </div>
              <p className="text-[var(--on-surface-variant)] text-xs font-medium">
                أدخل رقمك وسنتواصل معك عبر واتساب فوراً.
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="رقم الجوال"
                  value={helpPhone}
                  onChange={e => setHelpPhone(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && helpPhone.trim()) {
                      const msg = encodeURIComponent(`مرحباً، رقمي ${helpPhone.trim()}. أحتاج مساعدة في العقار: "${property.titleAr}". أرجو التواصل.`);
                      window.open(`https://wa.me/22246603985?text=${msg}`, '_blank');
                    }
                  }}
                  className="flex-grow bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary)]/20"
                />
                <Button
                  className="rounded-xl px-4"
                  disabled={!helpPhone.trim()}
                  onClick={() => {
                    const msg = encodeURIComponent(`مرحباً، رقمي ${helpPhone.trim()}. أحتاج مساعدة في العقار: "${property.titleAr}". أرجو التواصل.`);
                    window.open(`https://wa.me/22246603985?text=${msg}`, '_blank');
                  }}
                >
                  إرسال
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
