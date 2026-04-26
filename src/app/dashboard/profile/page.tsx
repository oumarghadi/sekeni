'use client';

import * as React from 'react';
import { User, Mail, Phone, Camera, Shield, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resolveStoragePublicUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [memberSince, setMemberSince] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSaved, setPasswordSaved] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      const user = session.user;
      setUserId(user.id);
      setEmail(user.email ?? '');
      setMemberSince(new Date(user.created_at).getFullYear().toString());

      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, bio, avatar_url')
        .eq('id', user.id)
        .single();

      if (data) {
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setBio(data.bio ?? '');
        setAvatarUrl(resolveStoragePublicUrl(data.avatar_url, 'profiles'));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingPhoto(true);

    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
      setAvatarUrl(resolveStoragePublicUrl(url, 'profiles'));
    }
    setUploadingPhoto(false);
  }

  async function handleSave(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone, bio }).eq('id', userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  }

  const initials = fullName
    ? fullName.split(' ').map(w => w[0]).join('').slice(0, 2)
    : email[0]?.toUpperCase() ?? '?';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--secondary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <div className="text-right">
        <h1 className="text-3xl font-black text-[var(--primary)]">الملف الشخصي</h1>
        <p className="text-[var(--on-surface-variant)] text-sm mt-1">إدارة معلوماتك الشخصية وصورة الحساب.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-[var(--outline-variant)] flex flex-col items-center gap-6 text-center">
            {/* Avatar upload */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--background)] shadow-xl bg-[var(--secondary)] flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-black">{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 left-0 w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white group-hover:scale-110 transition-all disabled:opacity-60"
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <div>
              <h3 className="text-xl font-black text-[var(--primary)]">{fullName || 'اسمك هنا'}</h3>
              <p className="text-[10px] text-[var(--secondary)] font-bold uppercase tracking-widest mt-1">
                عضو منذ {memberSince}
              </p>
            </div>

            <div className="w-full pt-6 border-t border-[var(--outline-variant)]">
              <p className="text-xs text-[var(--on-surface-variant)] text-center">{email}</p>
            </div>
          </div>

          <div className="bg-[var(--primary)] hero-gradient rounded-[2rem] p-8 text-white space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[var(--secondary)]" />
              <h4 className="font-bold">حالة التوثيق</h4>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              حسابك موثق رسمياً. هذا يمنح إعلاناتك مصداقية أعلى.
            </p>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-10">
          {/* Personal Info */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-[var(--outline-variant)] space-y-8 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> تم الحفظ
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-[var(--primary)]">المعلومات الشخصية</h3>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="الاسم الكامل"
                  placeholder="أدخل اسمك الكامل"
                  icon={<User className="w-5 h-5" />}
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                />
                <Input
                  label="رقم الجوال"
                  placeholder="2xxxxxxxx+"
                  icon={<Phone className="w-5 h-5" />}
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                />
              </div>
              <Input
                label="البريد الإلكتروني"
                placeholder={email}
                icon={<Mail className="w-5 h-5" />}
                value={email}
                disabled
              />
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--primary)] mr-1">نبذة عنك</label>
                <textarea
                  className="w-full bg-[var(--surface-low)] border-none rounded-2xl py-4 px-6 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]/20"
                  placeholder="اكتب نبذة مختصرة عنك..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-xl px-10" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ التغييرات'}
              </Button>
            </form>
          </div>

          {/* Security */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-[var(--outline-variant)] space-y-8 text-right">
            <div className="flex items-center justify-between">
              <div>
                {passwordSaved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> تم تحديث كلمة المرور
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-[var(--secondary)]" />
                <h3 className="text-xl font-black text-[var(--primary)]">الأمان وكلمة المرور</h3>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="كلمة المرور الجديدة"
                  placeholder="••••••••••••"
                  type="password"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                />
                <Input
                  label="تأكيد كلمة المرور"
                  placeholder="••••••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 px-4 py-2 rounded-xl">{passwordError}</p>
              )}
              <Button type="submit" variant="outline" className="rounded-xl" disabled={passwordSaving}>
                {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحديث كلمة المرور'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
