'use client';

import * as React from 'react';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin, RotateCcw } from 'lucide-react';

export interface PickedLocation {
  lat: number;
  lon: number;
  address: string;
  cityName?: string; /* raw city/town name from Nominatim (Arabic) */
}

interface LocationPickerProps {
  onSelect: (location: PickedLocation) => void;
  defaultAddress?: string;
}

/* Nouakchott centre by default */
const DEFAULT_CENTER: [number, number] = [18.0735, -15.9582];
const DEFAULT_ZOOM = 13;

export function LocationPicker({ onSelect, defaultAddress }: LocationPickerProps) {
  const containerRef  = React.useRef<HTMLDivElement>(null);
  const mapRef        = React.useRef<any>(null);
  const markerRef     = React.useRef<any>(null);

  const [picked, setPicked]     = React.useState<PickedLocation | null>(null);
  const [geocoding, setGeocoding] = React.useState(false);

  /* ── Init Leaflet once on mount (client-only via dynamic import) ── */
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;

    (async () => {
      /* dynamic import avoids SSR errors */
      const L = (await import('leaflet')).default;

      if (!mounted || !containerRef.current) return;

      /* Fix missing default marker icons when bundled */
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom:   DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      /* Click handler → reverse geocode + update parent */
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;

        /* move/create marker */
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        setGeocoding(true);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
            { headers: { 'User-Agent': 'Sekeni-SA/1.0' } }
          );
          const data = await res.json();

          /* build a compact address from Nominatim parts */
          const cityName: string | undefined =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county;

          const parts = [
            data.address?.neighbourhood || data.address?.suburb,
            cityName,
          ].filter(Boolean);

          const address = parts.length > 0
            ? parts.join('، ')
            : data.display_name?.split(',').slice(0, 2).join('،') ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

          const location: PickedLocation = { lat, lon: lng, address, cityName };
          setPicked(location);
          onSelect(location);
        } catch {
          const address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          const location: PickedLocation = { lat, lon: lng, address };
          setPicked(location);
          onSelect(location);
        } finally {
          setGeocoding(false);
        }
      });

      mapRef.current = map;
    })();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  /* Reset */
  function handleReset() {
    if (markerRef.current && mapRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    setPicked(null);
    onSelect({ lat: 0, lon: 0, address: '' });
  }

  return (
    <div className="space-y-3">
      {/* Instruction */}
      <p className="text-xs text-[var(--on-surface-variant)] text-right font-medium">
        انقر على الخريطة لتثبيت موقع العقار بدقة
      </p>

      {/* Map container */}
      <div
        ref={containerRef}
        className="h-[340px] w-full rounded-2xl overflow-hidden border border-[var(--outline-variant)] z-0 relative"
        style={{ isolation: 'isolate' }}
      />

      {/* Status bar */}
      <div className="flex items-center gap-3 min-h-[42px]">
        {geocoding && (
          <div className="flex items-center gap-2 text-[var(--secondary)] text-xs font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري تحديد العنوان…
          </div>
        )}

        {picked && !geocoding && (
          <div className="flex-1 flex items-center gap-2 bg-[var(--secondary-light)] border border-[var(--secondary)]/20 rounded-xl px-4 py-2.5">
            <MapPin className="w-4 h-4 text-[var(--secondary)] shrink-0" />
            <span className="text-xs text-[var(--primary)] font-bold flex-1 text-right">
              {picked.address}
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="إعادة التعيين"
              className="text-[var(--on-surface-variant)] hover:text-red-500 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!picked && !geocoding && (
          <p className="text-xs text-[var(--on-surface-variant)]/60 text-right w-full">
            لم يتم تحديد موقع بعد
          </p>
        )}
      </div>
    </div>
  );
}
