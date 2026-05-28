import { useState, useEffect } from 'react';

interface Props {
  ids: string;
  lang: 'fr' | 'ar';
  apiUrl: string;
}

const FUEL_FR: Record<string, string> = { diesel: 'Diesel', essence: 'Essence', hybride: 'Hybride', electrique: 'Électrique' };
const FUEL_AR: Record<string, string> = { diesel: 'ديزل', essence: 'بنزين', hybride: 'هجين', electrique: 'كهربائي' };
const TRANS_FR: Record<string, string> = { manual: 'Manuelle', automatic: 'Automatique' };
const TRANS_AR: Record<string, string> = { manual: 'يدوي', automatic: 'أوتوماتيك' };
const BODY_FR: Record<string, string> = { suv: 'SUV', sedan: 'Berline', hatchback: 'Compacte', pickup: 'Pick-up', van: 'Utilitaire', coupe: 'Coupé', minivan: 'Monospace' };
const BODY_AR: Record<string, string> = { suv: 'دفع رباعي', sedan: 'سيدان', hatchback: 'هاتشباك', pickup: 'بيك أب', van: 'فان', coupe: 'كوبيه', minivan: 'ميني فان' };
const RATING_FR: Record<string, string> = { very_good: 'Très bon', good: 'Bon', fair: 'Juste', high: 'Élevé', very_high: 'Très élevé' };
const RATING_AR: Record<string, string> = { very_good: 'ممتاز', good: 'جيد', fair: 'عادل', high: 'مرتفع', very_high: 'مرتفع جداً' };

const SPECS = [
  { key: 'price_mru',    labelFr: 'Prix',           labelAr: 'السعر',
    fmt: (v: any, l?: string) => v ? new Intl.NumberFormat('fr-FR').format(v) + ' MRU' : '—' },
  { key: 'year',         labelFr: 'Année',           labelAr: 'السنة',
    fmt: (v: any, l?: string) => v ?? '—' },
  { key: 'mileage_km',   labelFr: 'Kilométrage',     labelAr: 'المسافة',
    fmt: (v: any, l?: string) => v ? new Intl.NumberFormat('fr-FR').format(v) + ' km' : '—' },
  { key: 'fuel',         labelFr: 'Carburant',       labelAr: 'الوقود',
    fmt: (v: any, l?: string) => (l === 'ar' ? FUEL_AR : FUEL_FR)[v] ?? v ?? '—' },
  { key: 'transmission', labelFr: 'Transmission',    labelAr: 'ناقل الحركة',
    fmt: (v: any, l?: string) => (l === 'ar' ? TRANS_AR : TRANS_FR)[v] ?? v ?? '—' },
  { key: 'body_type',    labelFr: 'Carrosserie',     labelAr: 'نوع الهيكل',
    fmt: (v: any, l?: string) => (l === 'ar' ? BODY_AR : BODY_FR)[v] ?? v ?? '—' },
  { key: 'color',        labelFr: 'Couleur',         labelAr: 'اللون',
    fmt: (v: any, l?: string) => v ?? '—' },
  { key: 'condition',    labelFr: 'État',            labelAr: 'الحالة',
    fmt: (v: any, l?: string) => v === 'new' ? (l === 'ar' ? 'جديد' : 'Neuf') : v === 'used' ? (l === 'ar' ? 'مستعمل' : 'Occasion') : v ?? '—' },
  { key: 'price_rating', labelFr: 'Évaluation prix', labelAr: 'تقييم السعر',
    fmt: (v: any, l?: string) => (l === 'ar' ? RATING_AR : RATING_FR)[v] ?? v ?? '—' },
];

const RATING_COLORS: Record<string, string> = {
  very_good: '#16A34A', good: '#84CC16', fair: '#EAB308', high: '#F97316', very_high: '#DC2626',
};

export default function VehicleComparator({ ids, lang, apiUrl }: Props) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idList = ids.split(',').filter(Boolean);
    if (idList.length < 2) { setLoading(false); return; }

    Promise.all(idList.map(id =>
      fetch(`${apiUrl}/vehicles/${id}`).then(r => r.json()).then(d => d.data ?? d)
    )).then(results => {
      setVehicles(results.filter(Boolean));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [ids]);

  const isRtl = lang === 'ar';

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#64748B' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (vehicles.length < 2) return (
    <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
        {isRtl ? 'مقارنة السيارات' : 'Comparateur de véhicules'}
      </h1>
      <p style={{ color: '#64748B', marginTop: '8px' }}>
        {isRtl ? 'اختر سيارتين على الأقل للمقارنة' : 'Sélectionnez au moins 2 véhicules à comparer depuis la liste.'}
      </p>
      <a href={`/${lang}/vehicules`} style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
        {isRtl ? 'تصفح السيارات' : 'Parcourir les véhicules'}
      </a>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px' }}>
        {isRtl ? 'مقارنة السيارات' : 'Comparateur de véhicules'}
      </h1>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          {/* Header photos */}
          <thead>
            <tr>
              <th style={{ width: '160px', background: '#F8FAFC', padding: '16px', borderBottom: '1px solid #E2E8F0' }}></th>
              {vehicles.map(v => (
                <th key={v.id} style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', textAlign: 'center', minWidth: '200px' }}>
                  <a href={`/${lang}/vehicules/${v.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ aspectRatio: '4/3', background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                      {v.cover_image ? (
                        <img src={v.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19 17H5v-2l2-6h10l2 6v2z"/></svg>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{v.brand?.name} {v.model?.name ?? v.vehicleModel?.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{v.year}</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                      {new Intl.NumberFormat('fr-FR').format(v.price_mru)} MRU
                    </div>
                  </a>
                </th>
              ))}
            </tr>
          </thead>

          {/* Specs rows */}
          <tbody>
            {SPECS.map((spec, i) => {
              const values = vehicles.map(v => v[spec.key]);
              const allSame = values.every(val => val === values[0]);
              return (
                <tr key={spec.key} style={{ background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #F1F5F9' }}>
                    {isRtl ? spec.labelAr : spec.labelFr}
                  </td>
                  {vehicles.map(v => {
                    const val = v[spec.key];
                    const isPrice = spec.key === 'price_mru';
                    const isBest = isPrice && val === Math.min(...vehicles.map(x => x.price_mru));
                    return (
                      <td key={v.id} style={{
                        padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600,
                        borderBottom: '1px solid #F1F5F9', borderLeft: '1px solid #F1F5F9',
                        color: spec.key === 'price_rating' && val ? RATING_COLORS[val] ?? '#0F172A' : isBest ? '#16A34A' : allSame ? '#64748B' : '#0F172A',
                        background: isBest ? '#F0FDF4' : 'transparent',
                      }}>
                        {spec.fmt(val, lang)}
                        {isBest && <span style={{ fontSize: '10px', display: 'block', color: '#16A34A' }}>✓ Meilleur prix</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <a href={`/${lang}/vehicules`} style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
          ← {isRtl ? 'العودة للقائمة' : 'Retour à la liste'}
        </a>
      </div>
    </div>
  );
}
