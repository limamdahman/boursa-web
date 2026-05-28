import { useState, useEffect } from 'react';

interface Agency {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  subscription_tier: string;
  vehicles_count?: number;
}

interface Props {
  lang: 'fr' | 'ar';
  apiUrl: string;
}

export default function PartnerAgencies({ lang, apiUrl }: Props) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const isRtl = lang === 'ar';

  useEffect(() => {
    fetch(apiUrl + '/agencies?per_page=8')
      .then(r => r.json())
      .then(d => {
        const list = d?.data ?? [];
        const sorted = list.sort((a: Agency, b: Agency) => {
          const order: Record<string, number> = { business: 0, pro: 1, free: 2 };
          return (order[a.subscription_tier] ?? 2) - (order[b.subscription_tier] ?? 2);
        });
        setAgencies(sorted.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  if (agencies.length === 0) return null;

  const title = lang === 'ar' ? 'الوكالات الشريكة' : 'Nos agences partenaires';
  const seeAll = lang === 'ar' ? 'عرض الكل' : 'Voir toutes les agences';
  const base = '/' + lang + '/agences/';

  function getBadge(tier: string) {
    if (tier === 'business') return { label: 'GOLD ✦', bg: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white' };
    if (tier === 'pro') return { label: 'PRO', bg: '#EFF6FF', color: '#2563EB' };
    return null;
  }

  return (
    <section className="py-10 bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
          <a href={base} className="text-sm font-semibold text-green-600 hover:underline">{seeAll} →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {agencies.map(a => {
            const badge = getBadge(a.subscription_tier);
            const initials = a.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
            return (
              <a key={a.id} href={base + a.slug} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '14px', padding: '24px 16px', border: a.subscription_tier === 'business' ? '2px solid #F59E0B' : '1px solid #E2E8F0', textDecoration: 'none', position: 'relative', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = a.subscription_tier === 'business' ? '#F59E0B' : '#86EFAC'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = a.subscription_tier === 'business' ? '#F59E0B' : '#E2E8F0'; }}>
                {badge && (
                  <span style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '100px', whiteSpace: 'nowrap' }}>{badge.label}</span>
                )}
                <div style={{ width: '72px', height: '72px', borderRadius: '14px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '20px', overflow: 'hidden' }}>
                  {a.logo_url ? <img src={a.logo_url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.4 }}>{a.name}</div>
                  {a.vehicles_count !== undefined && (
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      {a.vehicles_count} {lang === 'ar' ? 'سيارة' : 'véh.'}
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
