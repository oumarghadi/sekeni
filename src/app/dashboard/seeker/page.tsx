'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Les chercheurs de propriété n'ont pas de dashboard dédié — ils naviguent sur le site public.
export default function SeekerRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return null;
}
