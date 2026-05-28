import { useState, useEffect } from 'react';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: any;
  image: string | null;
}

interface Props {
  lang: 'fr' | 'ar';
  apiUrl: string;
}

const STORAGE_KEY = 'boursa_recent_vehicles';
const MAX = 6;

export function trackVehicle(v: { id: string; brand: string; model: string; year: number; price: any; image: string | null }) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: Vehicle[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(x => x.id !== v.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([v, ...filtered].slice(0, MAX)));
  } catch {}
}

export default function RecentVehicles({ lang, apiUrl }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const isRtl = lang === 'ar';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setVehicles(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('boursa_token');
    if (!token) return;
    fetch(apiUrl + '/favorites/ids', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => setFavorites(new Set(d.data || [])))
      .catch(() => {});
  }, []);

  async function toggleFav(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const token = localStorage.getItem('boursa_token');
    if (!token) { window.location.href = '/' + lang + '/connexion'; return; }
    await fetch(apiUrl + '/favorites/' + id, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (vehicles.length === 0) return null;

  const title = lang === 'ar' ? 'آخر السيارات المشاهدة' : 'Derniers véhicules consultés';
  const fmt = (n: any) => n ? Number(n).toLocaleString('fr-FR') + ' MRU' : '';
  const base = '/' + lang + '/vehicules/';

  return (
    <section className="py-10 bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">
          {title}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {vehicles.map(v => (
            <a key={v.id} href={base + v.id} style={{ display: 'block', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', textDecoration: 'none', position: 'relative' }}>
              <button
                onClick={e => toggleFav(e, v.id)}
                style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
              >
                <svg width='16' height='16' viewBox='0 0 24 24' fill={favorites.has(v.id) ? '#ef4444' : 'none'} stroke={favorites.has(v.id) ? '#ef4444' : '#94A3B8'} strokeWidth='2'>
                  <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/>
                </svg>
              </button>
              <div style={{ height: '130px', background: '#F1F5F9', overflow: 'hidden' }}>
                {v.image ? (
                  <img src={v.image} alt={v.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '12px' }}>
                    {v.brand}
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '2px' }}>{v.brand} {v.model}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>{v.year}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#16A34A' }}>{fmt(v.price)}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
