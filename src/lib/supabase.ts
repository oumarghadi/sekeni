import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

function getSupabaseStorageKey(url: string | undefined) {
  if (!url) {
    return null;
  }

  try {
    return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
  } catch {
    return null;
  }
}

const supabaseStorageKey = getSupabaseStorageKey(supabaseUrl);

function tryParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string) {
  if (typeof window === 'undefined' || typeof window.atob !== 'function') {
    return value;
  }

  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return window.atob(padded);
  } catch {
    return value;
  }
}

function isDoubleEncodedSessionValue(value: string | null) {
  if (!value) {
    return false;
  }

  const parsedOnce = tryParseJson(value);
  if (typeof parsedOnce !== 'string') {
    return false;
  }

  const parsedTwice = tryParseJson(parsedOnce);
  return Boolean(
    parsedTwice &&
      typeof parsedTwice === 'object' &&
      'access_token' in parsedTwice &&
      'refresh_token' in parsedTwice
  );
}

function getCookieChunks(key: string) {
  if (typeof document === 'undefined') {
    return [];
  }

  return document.cookie
    .split('; ')
    .map((cookie) => {
      const separatorIndex = cookie.indexOf('=');
      if (separatorIndex === -1) {
        return null;
      }

      return {
        name: cookie.slice(0, separatorIndex),
        value: cookie.slice(separatorIndex + 1),
      };
    })
    .filter((cookie): cookie is { name: string; value: string } => Boolean(cookie))
    .filter(({ name }) => name === key || name.startsWith(`${key}.`))
    .sort((left, right) => {
      const leftSuffix = Number(left.name.split('.').at(1) ?? '-1');
      const rightSuffix = Number(right.name.split('.').at(1) ?? '-1');
      return leftSuffix - rightSuffix;
    });
}

function readCookieStorageValue(key: string) {
  const chunks = getCookieChunks(key);
  if (chunks.length === 0) {
    return null;
  }

  const combined = chunks.map(({ value }) => value).join('');
  if (!combined) {
    return null;
  }

  if (combined.startsWith('base64-')) {
    return decodeBase64Url(combined.slice('base64-'.length));
  }

  return combined;
}

function removeCookieChunks(key: string) {
  const chunks = getCookieChunks(key);
  for (const { name } of chunks) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  }
}

export function clearCorruptedSupabaseAuthStorage() {
  if (typeof window === 'undefined' || !supabaseStorageKey) {
    return;
  }

  const keysToCheck = [
    supabaseStorageKey,
    `${supabaseStorageKey}-user`,
    `${supabaseStorageKey}-code-verifier`,
  ];

  for (const key of keysToCheck) {
    const storedValue = window.localStorage.getItem(key);
    if (isDoubleEncodedSessionValue(storedValue)) {
      window.localStorage.removeItem(key);
    }

    const cookieValue = readCookieStorageValue(key);
    if (isDoubleEncodedSessionValue(cookieValue)) {
      removeCookieChunks(key);
    }
  }
}

export function isCorruptedSupabaseSessionError(error: unknown) {
  return error instanceof TypeError && error.message.includes("Cannot create property 'user' on string");
}

if (typeof window !== 'undefined') {
  clearCorruptedSupabaseAuthStorage();
}

export const supabase = createBrowserClient(supabaseUrl || '', supabaseAnonKey || '');
