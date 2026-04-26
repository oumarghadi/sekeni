import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import LayoutWrapper from './LayoutWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'Sekeni Sa | سكنى موريتانيا - منصة العقارات الأولى',
  description: 'منصة سكنى موريتانيا هي الوجهة الرقمية الرائدة للعقارات في موريتانيا، نقدم تجربة منسقة للباحثين عن التميز المعماري والرفاهية.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-manrope antialiased bg-[var(--background)] text-[var(--on-background)] overflow-x-hidden">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
