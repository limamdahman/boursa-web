import { useState, useEffect, useRef, useCallback } from 'react';
import CompareButton from './CompareButton';

interface Vehicle {
  id: string;
  brand: { name: string; slug: string };
  model: { name: string };
  year: number;
  mileage_km: number;
  price_mru: number;
  original_price?: number | null;
  is_deal?: boolean;
  price_negotiable?: boolean;
  fuel: string;
  status: string;
  cover_image?: string | null;
  price_rating?: string | null;
  price_rating_color?: string | null;
  price_rating_label?: string | null;
  city?: { name_fr: string; name_ar: string } | null;
}

interface Props {
  initialVehicles: Vehicle[];
  initialPage: number;
  lastPage: number;
  apiUrl: string;
  params: Record<string, string>;
  lang: 'fr' | 'ar';
}

const FUEL_LABELS: Record<string, Record<string, string>> = {
  fr: { diesel: 'Diesel', essence: 'Essence', hybride: 'Hybride', electrique: 'Électrique' },
  ar: { diesel: 'ديزل', essence: 'بنزين', hybride: 'هجين', electrique: 'كهربائي' },
};

function formatPrice(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}
function formatKm(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

function VehicleCardReact({ v, lang }: { v: Vehicle; lang: 'fr' | 'ar' }) {
  const isSold   = v.status === 'sold';
  const isDeal   = v.is_deal === true;
  const hasDisc  = !!(v.original_price && v.original_price > v.price_mru);
  const cityName = lang === 'ar' ? v.city?.name_ar : v.city?.name_fr;
  const fuelLabel = FUEL_LABELS[lang]?.[v.fuel] ?? v.fuel;
  const url = `/${lang}/vehicules/${v.id}`;

  return (
    <div
      onClick={() => window.location.href = url}
      style={{
        cursor: 'pointer', borderRadius: '12px', overflow: 'hidden',
        border: '1px solid #E2E8F0', background: isSold ? '#F8FAFC' : 'white',
        opacity: isSold ? 0.75 : 1, transition: 'box-shadow 0.2s', position: 'relative',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3', background: '#F1F5F9', overflow: 'hidden' }}>
        {v.cover_image ? (
          <img src={v.cover_image} alt={`${v.brand.name} ${v.model.name}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M19 17H5v-2l2-6h10l2 6v2zm0 0v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2M9 17v2m6-2v2M3 11h1m16 0h1M7 11l1-4h8l1 4"/>
            </svg>
            <span style={{ fontSize: '11px', marginTop: '4px' }}>{lang === 'ar' ? 'لا توجد صورة' : 'Pas de photo'}</span>
          </div>
        )}
        {isSold && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: 'white', color: '#0F172A', fontSize: '13px', fontWeight: 900, padding: '8px 20px', borderRadius: '100px', textTransform: 'uppercase' }}>
              {lang === 'ar' ? 'تم البيع' : 'VENDU'}
            </span>
          </div>
        )}
        {isDeal && !isSold && (
          <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: 'white', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '100px' }}>
            DEAL
          </span>
        )}
        {v.price_rating && v.price_rating_color && !isSold && (
          <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: v.price_rating_color, color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
            {v.price_rating_label}
          </span>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {v.brand.name} {v.model.name}
        </h3>
        <p style={{ fontSize: '11px', color: '#64748B', margin: '3px 0 8px' }}>
          {v.year} · {formatKm(v.mileage_km)} km · {fuelLabel}
        </p>
        <div>
          {hasDisc && (
            <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through', marginRight: '6px' }}>
              {formatPrice(v.original_price!)} MRU
            </span>
          )}
          <span style={{ fontSize: '15px', fontWeight: 800, color: isSold ? '#94A3B8' : hasDisc ? '#DC2626' : '#0F172A' }}>
            {formatPrice(v.price_mru)} <span style={{ fontSize: '11px', fontWeight: 600 }}>MRU</span>
          </span>
        </div>
        {cityName && (
          <p style={{ fontSize: '10px', color: '#94A3B8', margin: '6px 0 0' }}>📍 {cityName}</p>
        )}
        <div style={{ marginTop: '8px' }} onClick={e => e.stopPropagation()}>
          <CompareButton vehicleId={v.id} brand={v.brand.name} model={v.model.name} year={v.year} price={v.price_mru} image={v.cover_image} lang={lang} />
        </div>
      </div>
    </div>
  );
}

export default function InfiniteVehicleGrid({ initialVehicles, initialPage, lastPage, apiUrl, params, lang }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [page, setPage]         = useState(initialPage);
  const [loading, setLoading]   = useState(false);
  const [hasMore, setHasMore]   = useState(initialPage < lastPage);
  const sentinelRef             = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const qs  = new URLSearchParams({ ...params, page: String(nextPage), per_page: '20' });
      const res = await fetch(`${apiUrl}/vehicles?${qs}`);
      const data = await res.json();
      const newVehicles: Vehicle[] = data.data ?? [];
      setVehicles(prev => [...prev, ...newVehicles]);
      setPage(nextPage);
      setHasMore(nextPage < (data.meta?.last_page ?? 1));
    } catch {}
    setLoading(false);
  }, [loading, hasMore, page, params, apiUrl]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="vehicules-grid">
        {vehicles.map(v => <VehicleCardReact key={v.id} v={v} lang={lang} />)}
      </div>

      <div ref={sentinelRef} style={{ height: '1px' }} />

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
      )}

      {!hasMore && vehicles.length > 0 && (
        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', marginTop: '24px' }}>
          {lang === 'ar' ? `${vehicles.length} سيارة — النهاية` : `${vehicles.length} véhicules — fin des résultats`}
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .vehicules-grid { } @media (max-width: 1024px) { .vehicules-grid { grid-template-columns: repeat(2,1fr) !important; } } @media (max-width: 640px) { .vehicules-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
