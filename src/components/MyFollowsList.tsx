import { useState, useEffect } from 'react';
import { getToken, getMySellerFollows, formatPrice } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const L = {
  fr: {
    title: 'Mes suivis',
    subtitle: 'Vendeurs et agences que vous suivez',
    empty: 'Vous ne suivez aucun vendeur pour le moment',
    emptyHint: 'Suivez vos vendeurs préférés pour ne rien manquer de leurs nouvelles annonces',
    browse: 'Parcourir les véhicules',
    loading: 'Chargement...',
    notLogged: 'Vous devez être connecté',
    loginBtn: 'Se connecter',
    activeListings: 'annonces actives',
    activeListing: 'annonce active',
    recentListings: 'Annonces récentes',
    noVehicles: 'Aucune annonce active',
    viewProfile: 'Voir le profil',
    seeAll: 'Voir tout',
    agency: 'Agence',
    individual: 'Particulier',
  },
  ar: {
    title: 'متابعاتي',
    subtitle: 'البائعون والوكالات التي تتابعها',
    empty: 'لا تتابع أي بائع حاليا',
    emptyHint: 'تابع بائعيك المفضلين لمعرفة كل إعلاناتهم الجديدة',
    browse: 'تصفح السيارات',
    loading: 'جاري التحميل...',
    notLogged: 'يجب أن تكون مسجل دخول',
    loginBtn: 'تسجيل الدخول',
    activeListings: 'إعلانات نشطة',
    activeListing: 'إعلان نشط',
    recentListings: 'الإعلانات الأخيرة',
    noVehicles: 'لا توجد إعلانات نشطة',
    viewProfile: 'عرض الملف',
    seeAll: 'عرض الكل',
    agency: 'وكالة',
    individual: 'بائع خاص',
  },
};

export default function MyFollowsList({ lang }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [follows, setFollows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!getToken()) return;
    getMySellerFollows().then((d: any) => {
      setFollows(d?.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (!mounted) return null;

  if (!getToken()) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '16px' }}></i>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{l.notLogged}</h2>
        <a href={'/' + lang + '/connexion'} style={{ display: 'inline-block', marginTop: '14px', padding: '12px 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>{l.loginBtn}</a>
      </div>
    );
  }

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'ar' ? 'en-US' : 'fr-FR').format(n);

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>{l.title}</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
          {loading ? l.loading : follows.length + ' ' + (lang === 'ar' ? 'متابعة' : 'suivi' + (follows.length > 1 ? 's' : ''))}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#64748B' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
        </div>
      ) : follows.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', padding: '80px 20px' }}>
          <i className="fa-solid fa-user-plus" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '16px' }}></i>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>{l.empty}</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px' }}>{l.emptyHint}</p>
          <a href={'/' + lang + '/vehicules'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '12px' }}></i>
            {l.browse}
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {follows.map((f: any) => {
            const initials = (f.seller_name || '?').split(' ').slice(0, 2).map((w: string) => w[0] || '').join('').toUpperCase();
            return (
              <div key={f.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                {/* Header seller */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ width: '48px', height: '48px', background: '#0F172A', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', flexShrink: 0, overflow: 'hidden' }}>
                    {f.seller_logo_url ? (
                      <img src={f.seller_logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <a href={'/' + lang + f.profile_url} style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', textDecoration: 'none' }}>{f.seller_name}</a>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: f.seller_type === 'agency' ? '#DCFCE7' : '#F1F5F9', color: f.seller_type === 'agency' ? '#166534' : '#475569', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <i className={f.seller_type === 'agency' ? 'fa-solid fa-building' : 'fa-solid fa-user'} style={{ fontSize: '8px' }}></i>
                        {f.seller_type === 'agency' ? l.agency : l.individual}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      <strong style={{ color: '#16A34A' }}>{f.active_vehicles_count}</strong>{' '}
                      {f.active_vehicles_count > 1 ? l.activeListings : l.activeListing}
                    </div>
                  </div>
                  <a href={'/' + lang + f.profile_url} style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {l.viewProfile}
                    <i className={'fa-solid ' + (lang === 'ar' ? 'fa-arrow-left' : 'fa-arrow-right')} style={{ fontSize: '10px' }}></i>
                  </a>
                </div>

                {/* Recent vehicles grid */}
                <div style={{ padding: '14px 20px 18px' }}>
                  {f.recent_vehicles && f.recent_vehicles.length > 0 ? (
                    <>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        {l.recentListings}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                        {f.recent_vehicles.slice(0, 3).map((v: any) => {
                          const cover = v.cover_image || v.media?.[0]?.url_thumb || v.media?.[0]?.url_md;
                          const brandName = v.brand?.name || '';
                          const modelName = v.model?.name || v.vehicle_model?.name || '';
                          return (
                            <a key={v.id} href={'/' + lang + '/vehicules/' + v.id} style={{ display: 'block', textDecoration: 'none', borderRadius: '8px', overflow: 'hidden', border: '1px solid #F1F5F9', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#F1F5F9'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                              <div style={{ aspectRatio: '16/10', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {cover ? (
                                  <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <i className="fa-solid fa-car" style={{ fontSize: '24px', color: '#CBD5E1' }}></i>
                                )}
                              </div>
                              <div style={{ padding: '8px 10px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brandName} {modelName}</div>
                                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                                  <span dir="ltr">{v.year}</span>
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#D97706' }}>
                                  <span dir="ltr">{fmt(v.price_mru)}</span>
                                  <span style={{ fontSize: '10px', color: '#64748B', marginLeft: '3px' }}>MRU</span>
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '12px' }}>{l.noVehicles}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
