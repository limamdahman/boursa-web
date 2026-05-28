import { useState, useEffect } from 'react';

interface Props {
  lang: 'fr' | 'ar';
  apiUrl: string;
}

export default function SubscriptionBanner({ lang, apiUrl }: Props) {
  const [show, setShow] = useState(false);
  const isRtl = lang === 'ar';

  useEffect(() => {
    const token = localStorage.getItem('boursa_token');
    if (!token) return;
    fetch(apiUrl + '/me', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(data => {
        if (data?.agency?.subscription_tier === 'free') setShow(true);
      })
      .catch(() => {});
  }, []);

  if (!show) return null;

  const msg = lang === 'ar' ? 'طور اشتراكك للحصول على إحصاءات ومزايا احترافية' : 'Passez a Pro : stats avancees, chat prospects, annonces illimitees';
  const cta = lang === 'ar' ? 'ترقية' : 'Voir les offres';
  const href = '/' + lang + '/tarifs';

  return (
    <div style={{ background: 'linear-gradient(90deg,#0F172A,#1E3A5F)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>&#128640;</span>
        <span style={{ color: '#CBD5E1', fontSize: '13px' }}>{msg}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href={href} style={{ background: '#16A34A', color: 'white', padding: '6px 18px', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }}>{cta}</a>
        <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>x</button>
      </div>
    </div>
  );
}
