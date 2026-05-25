import { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lng: number;
  agencyName: string;
  address?: string;
  city?: string;
  lang: 'fr' | 'ar';
  height?: number;
}

declare global {
  interface Window { L: any; __leafletLoaded?: boolean; }
}

let leafletScriptLoaded: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (window.L) return Promise.resolve();
  if (leafletScriptLoaded) return leafletScriptLoaded;

  leafletScriptLoaded = new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
    // JS
    const existing = document.querySelector('script[src*="leaflet.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Leaflet load failed'));
    document.head.appendChild(script);
  });

  return leafletScriptLoaded;
}

export default function LeafletAgencyMap({ lat, lng, agencyName, address, city, lang, height = 300 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet().then(() => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const L = window.L;

      // Pin SVG vert Boursa custom
      const pinIcon = L.divIcon({
        html: '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.5 17 25 17 25s17-12.5 17-25c0-9.4-7.6-17-17-17z" fill="#16A34A" stroke="white" stroke-width="2.5"/><circle cx="17" cy="17" r="6" fill="white"/></svg>',
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -38],
        className: 'agency-pin-icon',
      });

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      }).setView([lat, lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Scroll wheel uniquement quand la souris est sur la map
      map.on('mouseover', () => map.scrollWheelZoom.enable());
      map.on('mouseout', () => map.scrollWheelZoom.disable());

      // Marqueur + popup style mobile.de
      const fullAddress = [address, city].filter(Boolean).join(', ');
      const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng;

      const popupLabels = {
        fr: { location: 'Position de l\'agence', directions: 'Itinéraire' },
        ar: { location: 'موقع الوكالة', directions: 'الاتجاهات' },
      };
      const labels = popupLabels[lang];

      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px;">
          <div style="font-size: 10px; font-weight: 700; color: #16A34A; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace;">
            📍 ${labels.location}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 4px;">
            ${agencyName.replace(/</g, '&lt;')}
          </div>
          ${fullAddress ? `<div style="font-size: 12px; color: #64748B; margin-bottom: 10px; line-height: 1.4;">${fullAddress.replace(/</g, '&lt;')}</div>` : ''}
          <a href="${directionsUrl}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #16A34A; color: white; font-size: 12px; font-weight: 700; border-radius: 6px; text-decoration: none;">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            ${labels.directions}
          </a>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(popupHtml, { closeButton: true, autoClose: false, maxWidth: 280 });

      // Ouvrir le popup automatiquement après load
      setTimeout(() => marker.openPopup(), 300);

      mapRef.current = map;
    }).catch((e) => console.warn('Leaflet load error:', e));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
    };
  }, [lat, lng, agencyName, address, city, lang]);

  return (
    <div style={{ position: 'relative', height: height + 'px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }}></div>
      <style>{`
        .agency-pin-icon { background: transparent !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 10px !important; padding: 4px !important; }
        .leaflet-popup-content { margin: 12px 14px !important; }
        .leaflet-popup-tip { background: white !important; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
}
