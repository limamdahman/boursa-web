import { useState, useEffect } from 'react';
import { getToken, getFavorites } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const LABELS = {
  fr: {
    title: 'Mes favoris',
    subtitle: 'Tous les véhicules que vous avez sauvegardés',
    empty: 'Aucun favori pour le moment',
    emptyHint: 'Cliquez sur le cœur sur une annonce pour la sauvegarder ici',
    browse: 'Parcourir les véhicules',
    loading: 'Chargement...',
    count: 'véhicule',
    countPlural: 'véhicules',
  },
  ar: {
    title: 'مفضلتي',
    subtitle: 'جميع السيارات التي حفظتها',
    empty: 'لا توجد مفضلة حاليا',
    emptyHint: 'انقر على القلب في إعلان لحفظه هنا',
    browse: 'تصفح السيارات',
    loading: 'جاري التحميل...',
    count: 'سيارة',
    countPlural: 'سيارات',
  },
};

export default function FavoritesList({ lang }: Props) {
  const l = LABELS[lang];
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getToken()) {
      window.location.href = '/' + lang + '/connexion';
      return;
    }
    getFavorites().then((data) => {
      setVehicles(data?.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [lang]);

  if (!mounted) return null;

  const fmtPrice = (n: number) => new Intl.NumberFormat(lang === 'ar' ? 'en-US' : 'fr-FR').format(n);
  const fmtKm = (n: number) => new Intl.NumberFormat(lang === 'ar' ? 'en-US' : 'fr-FR').format(n);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>{l.title}</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
          {loading ? l.loading : (vehicles.length + ' ' + (vehicles.length > 1 ? l.countPlural : l.count))}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
        </div>
      ) : vehicles.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', padding: '80px 20px' }}>
          <i className="fa-regular fa-heart" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '16px' }}></i>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>{l.empty}</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px' }}>{l.emptyHint}</p>
          <a href={'/' + lang + '/vehicules'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '44px', padding: '0 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
            {l.browse}
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }} className="favorites-grid">
          {vehicles.map((v) => {
            const detailUrl = '/' + lang + '/vehicules/' + v.id;
            const brandName = v.brand?.name || '';
            const modelName = v.model?.name || '';
            const cityName = lang === 'ar' && v.city?.name_ar ? v.city.name_ar : v.city?.name_fr;
            return (
              <a key={v.id} href={detailUrl} style={{ display: 'block', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', textDecoration: 'none', transition: 'all 0.15s' }}>
                <div style={{ aspectRatio: '4/3', background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
                  {v.cover_image ? (
                    <img src={v.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <i className="fa-solid fa-car" style={{ fontSize: '36px', color: '#CBD5E1' }}></i>
                    </div>
                  )}
                </div>
                <div style={{ padding: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{brandName} {modelName}</h3>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                    <span dir="ltr">{v.year}</span> · <span dir="ltr">{fmtKm(v.mileage_km)} km</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#D97706' }}>
                    <span dir="ltr">{fmtPrice(v.price_mru)}</span> <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>MRU</span>
                  </div>
                  {cityName && (
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fa-solid fa-location-dot" style={{ fontSize: '10px', color: '#16A34A' }}></i>
                      {cityName}
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) { .favorites-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .favorites-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .favorites-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
