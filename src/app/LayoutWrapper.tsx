'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className={!isDashboard ? "min-h-screen pt-20" : "min-h-screen"}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}
