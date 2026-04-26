import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(price) + ' MRU';
}

export function resolveStoragePublicUrl(
  value: string | null | undefined,
  bucket: string
) {
  if (!value) return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    // Already a public URL — return as-is to avoid doubling /public/
    if (trimmedValue.includes('/storage/v1/object/public/')) {
      return trimmedValue;
    }
    return trimmedValue.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }

  if (trimmedValue.startsWith('/storage/v1/object/')) {
    if (trimmedValue.includes('/storage/v1/object/public/')) {
      return trimmedValue;
    }
    return trimmedValue.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }

  if (!supabaseUrl) {
    return trimmedValue;
  }

  const normalizedPath = trimmedValue
    .replace(/^\/+/, '')
    .replace(new RegExp(`^${bucket}/`), '');

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${normalizedPath}`;
}
