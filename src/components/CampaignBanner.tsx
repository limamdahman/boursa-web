import { useState, useEffect } from 'react';

interface Props {
  lang: 'fr' | 'ar';
}

const STORAGE_KEY = 'boursa_banner_dismissed';
const DISMISS_DAYS = 7;

const LABELS = {
  fr: {
    message: 'Vendez votre voiture en 24h',
    highlight: 'gratuitement',
    cta: 'Publier',
    close: 'Fermer',
  },
  ar: {
    message: 'بع سيارتك في قمرة 24 ساعة',
    highlight: 'مجانا',
    cta: 'نشر',
    close: 'إغلاق',
  },
};

export default function CampaignBanner({ lang }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const ageMs = Date.now() - parseInt(dismissedAt, 10);
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        if (ageDays < DISMISS_DAYS) return;
      }
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch {}
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  const l = LABELS[lang];
  const publishUrl = '/' + lang + '/publier';
  const isRtl = lang === 'ar';

  const closeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
  };
  if (isRtl) closeStyle.left = '12px';
  else closeStyle.right = '12px';

  return (
    <div style={{ background: '#0F172A', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '10px 48px 10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '13px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', background: '#16A34A', borderRadius: '6px', fontSize: '11px' }}>
            <i className="fa-solid fa-gift" style={{ color: 'white' }}></i>
          </span>
          <span style={{ fontWeight: 500, color: '#E2E8F0' }}>
            {l.message} <strong style={{ color: '#4ADE80', fontWeight: 700 }}>{l.highlight}</strong>
          </span>
        </div>

        <a
          href={publishUrl}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#16A34A', color: 'white', fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '100px', textDecoration: 'none', transition: 'background 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#15803D')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#16A34A')}
        >
          <span>{l.cta}</span>
          <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px', transform: isRtl ? 'rotate(180deg)' : 'none' }}></i>
        </a>
      </div>

      <button onClick={handleClose} aria-label={l.close} style={closeStyle} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
        <i className="fa-solid fa-xmark" style={{ fontSize: '13px' }}></i>
      </button>
    </div>
  );
}
