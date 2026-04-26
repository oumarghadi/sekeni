import * as React from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]" dir="rtl">
      <DashboardSidebar />
      <div className="flex-grow flex flex-col">
        <DashboardHeader />
        <main className="p-8 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
