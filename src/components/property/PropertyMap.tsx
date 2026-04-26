'use client';

import * as React from 'react';
import { Loader2, MapPin, MapPinOff } from 'lucide-react';

interface PropertyMapProps {
  address: string;
}

interface Coords {
  lat: number;
  lon: number;
}

export function PropertyMap({ address }: PropertyMapProps) {
  const [coords, setCoords]   = React.useState<Coords | null>(null);
  const [status, setStatus]   = React.useState<'loading' | 'found' | 'error'>('loading');
  const [iframeKey, setIframeKey] = React.useState(0);

  React.useEffect(() => {
    if (!address?.trim()) {
      setStatus('error');
      return;
    }

    const query = encodeURIComponent(`${address.trim()}, موريتانيا`);

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=mr`,
      {
        headers: {
          'Accept-Language':  'ar,fr',
          'User-Agent':       'Sekeni-SA/1.0 (real-estate-platform)',
        },
      }
    )
      .then(r => r.json())
      .then((data: Array<{ lat: string; lon: string }>) => {
        if (data && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
          setStatus('found');
          setIframeKey(k => k + 1);
        } else {
          /* Retry without country restriction */
          return fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'ar,fr', 'User-Agent': 'Sekeni-SA/1.0' } }
          )
            .then(r => r.json())
            .then((d: Array<{ lat: string; lon: string }>) => {
              if (d && d.length > 0) {
                setCoords({ lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) });
                setStatus('found');
                setIframeKey(k => k + 1);
              } else {
                setStatus('error');
              }
            });
        }
      })
      .catch(() => setStatus('error'));
  }, [address]);

  /* ── Loading ── */
  if (status === 'loading') {
    return (
      <div className="h-[400px] bg-[var(--surface-low)] rounded-[2rem] flex flex-col items-center justify-center gap-3 text-[var(--on-surface-variant)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--secondary)]" />
        <span className="text-sm font-bold">جاري تحميل الخريطة…</span>
      </div>
    );
  }

  /* ── Not found ── */
  if (status === 'error' || !coords) {
    return (
      <div className="h-[400px] bg-[var(--surface-low)] rounded-[2rem] flex flex-col items-center justify-center gap-3 text-[var(--on-surface-variant)]">
        <MapPinOff className="w-8 h-8 text-[var(--outline)]" />
        <span className="text-sm font-bold">تعذر تحديد موقع العقار على الخريطة</span>
        <span className="text-xs text-[var(--on-surface-variant)]/60">{address}</span>
      </div>
    );
  }

  /* ── Map ── */
  const delta = 0.008;
  const bbox  = [
    coords.lon - delta,
    coords.lat - delta,
    coords.lon + delta,
    coords.lat + delta,
  ].join(',');

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;

  return (
    <div className="relative overflow-hidden rounded-[2rem] h-[400px] group shadow-sm border border-[var(--outline-variant)]">
      <iframe
        key={iframeKey}
        src={src}
        title="موقع العقار"
        loading="lazy"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Address pill overlay */}
      <div className="absolute bottom-4 right-1/2 translate-x-1/2 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5 whitespace-nowrap">
          <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[var(--primary)] font-black text-sm">{address}</span>
        </div>
      </div>
    </div>
  );
}
