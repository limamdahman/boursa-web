import { useState } from 'react';

interface BenchmarkData {
  count: number;
  confidence?: 'high' | 'medium' | 'low';
  median?: number;
  min?: number;
  max?: number;
  p25?: number;
  p75?: number;
  criteria?: {
    level: number;
    description?: string;
  };
}

interface Props {
  rating: 'very_good' | 'good' | 'fair' | 'high' | 'very_high' | null;
  label: string;
  color: string;
  description: string;
  score?: number | null;
  price: number;
  benchmark?: BenchmarkData | null;
  lang: 'fr' | 'ar';
}

const RATING_ORDER = ['very_good', 'good', 'fair', 'high', 'very_high'];
const RATING_COLORS: Record<string, string> = {
  very_good: '#16A34A',
  good: '#84CC16',
  fair: '#EAB308',
  high: '#F97316',
  very_high: '#DC2626',
};

const labels: Record<string, { fr: string; ar: string }> = {
  very_good: { fr: 'Très bon', ar: 'ممتاز' },
  good: { fr: 'Bon', ar: 'جيد' },
  fair: { fr: 'Juste', ar: 'عادل' },
  high: { fr: 'Élevé', ar: 'مرتفع' },
  very_high: { fr: 'Très élevé', ar: 'مرتفع جداً' },
};

const formatMRU = (n: number): string =>
  new Intl.NumberFormat('fr-FR').format(Math.round(n));

export default function PriceRatingBadge({
  rating,
  label,
  color,
  description,
  price,
  benchmark,
  lang,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!rating) return null;

  const t = {
    fr: {
      howCalculated: 'Comment c\'est calculé ?',
      methodology: 'Méthodologie',
      basedOn: 'Basé sur',
      similarVehicles: 'véhicules similaires',
      yourPrice: 'Votre prix',
      marketMedian: 'Médiane du marché',
      marketRange: 'Fourchette du marché',
      criteria: 'Critères de comparaison',
      confidence: 'Fiabilité',
      confidenceHigh: 'Élevée',
      confidenceMedium: 'Moyenne',
      confidenceLow: 'Faible',
      lowConfidenceNote: 'Estimation basée sur peu de données. À considérer avec prudence.',
      close: 'Fermer',
    },
    ar: {
      howCalculated: 'كيف يتم الحساب؟',
      methodology: 'المنهجية',
      basedOn: 'بناءً على',
      similarVehicles: 'مركبات مماثلة',
      yourPrice: 'السعر',
      marketMedian: 'متوسط السوق',
      marketRange: 'نطاق السوق',
      criteria: 'معايير المقارنة',
      confidence: 'الموثوقية',
      confidenceHigh: 'عالية',
      confidenceMedium: 'متوسطة',
      confidenceLow: 'منخفضة',
      lowConfidenceNote: 'تقدير قائم على بيانات محدودة. يجب الأخذ بعين الاعتبار بحذر.',
      close: 'إغلاق',
    },
  }[lang];

  const confidenceLabel =
    benchmark?.confidence === 'high' ? t.confidenceHigh :
    benchmark?.confidence === 'medium' ? t.confidenceMedium :
    benchmark?.confidence === 'low' ? t.confidenceLow : '';

  // Position du curseur sur la barre (basé sur le ratio prix/médiane)
  // ratio < 0.7 = 0%, 0.7-0.85 = 20%, 0.85-1.15 = 50%, 1.15-1.3 = 80%, > 1.3 = 100%
  const ratingIndex = RATING_ORDER.indexOf(rating);
  const cursorPosition = ((ratingIndex + 0.5) / 5) * 100;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: color,
          color: 'white',
          fontSize: '12px',
          fontWeight: 700,
          padding: '5px 10px 5px 12px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        aria-label={t.howCalculated}
      >
        <span>{label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '4px' }}>
                  {t.howCalculated}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  {description}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  padding: '4px',
                  fontSize: '24px',
                  lineHeight: 1,
                }}
                aria-label={t.close}
              >×</button>
            </div>

            {/* Barre 5 zones colorées */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ position: 'relative', height: '40px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  {RATING_ORDER.map((r) => (
                    <div
                      key={r}
                      style={{
                        flex: 1,
                        background: RATING_COLORS[r],
                        opacity: r === rating ? 1 : 0.35,
                      }}
                    />
                  ))}
                </div>
                {/* Curseur (pointe vers le bas) */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${cursorPosition}%`,
                    top: '14px',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: `10px solid ${color}`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${cursorPosition}%`,
                    top: '26px',
                    transform: 'translateX(-50%)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatMRU(price)} MRU
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px' }}>
                {RATING_ORDER.map((r) => (
                  <div key={r} style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: r === rating ? 800 : 500,
                      color: r === rating ? RATING_COLORS[r] : '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}>
                      {labels[r][lang]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            {benchmark && benchmark.median && (
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>{t.yourPrice}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: color, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMRU(price)} MRU
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>{t.marketMedian}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                    {formatMRU(benchmark.median)} MRU
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>{t.marketRange}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                    {formatMRU(benchmark.min || 0)} – {formatMRU(benchmark.max || 0)} MRU
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>{t.basedOn}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                    {benchmark.count} {t.similarVehicles}
                  </span>
                </div>
              </div>
            )}

            {/* Critères + confiance */}
            {benchmark?.criteria && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, marginBottom: '6px' }}>
                  {t.criteria}
                </p>
                <p style={{ fontSize: '13px', color: '#0F172A', margin: 0, lineHeight: 1.5 }}>
                  {benchmark.criteria.description || ''}
                </p>
                {confidenceLabel && (
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', marginBottom: 0 }}>
                    <strong>{t.confidence} :</strong> {confidenceLabel}
                  </p>
                )}
              </div>
            )}

            {/* Disclaimer si low confidence */}
            {benchmark?.confidence === 'low' && (
              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '10px 12px', marginTop: '12px' }}>
                <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                  ⚠️ {t.lowConfidenceNote}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
