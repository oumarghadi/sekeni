import * as React from 'react';
import { BedDouble, Bath, Square, Car, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyStatsProps {
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  className?: string;
}

export function PropertyStats({ bedrooms, bathrooms, area, parking, className }: PropertyStatsProps) {
  const stats = [
    { label: 'غرف نوم', value: bedrooms, icon: BedDouble },
    { label: 'دورات مياه', value: bathrooms, icon: Bath },
    { label: 'مساحة بالمتر', value: `${area} م²`, icon: Square },
    { label: 'موقف سيارات', value: parking, icon: Car },
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-[1.5rem] p-4 flex flex-col items-center text-center shadow-sm border border-[var(--outline-variant)]">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-low)] flex items-center justify-center text-[var(--secondary)] mb-3">
            <stat.icon className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-[var(--primary)]">{stat.value}</span>
          <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-tight">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
