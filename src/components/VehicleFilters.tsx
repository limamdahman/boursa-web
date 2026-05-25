import { useState, useEffect, useCallback } from 'react';

interface Brand { id: number; name: string; slug: string; }
interface Model { id: number; name: string; slug: string; }
interface City { id: number; name_fr: string; name_ar: string; }

interface Props {
  brands: Brand[];
  cities: City[];
  lang: 'fr' | 'ar';
  initialFilters: Record<string, string>;
}

const LABELS = {
  fr: {
    filters: 'Filtres',
    reset: 'Réinitialiser',
    close: 'Fermer',
    apply: 'Voir les résultats',
    brand: 'Marque', model: 'Modèle', all: 'Toutes',
    priceMin: 'Prix min', priceMax: 'Prix max',
    yearMin: 'Année min', yearMax: 'Année max',
    mileageMax: 'Km max', city: 'Ville',
    bodyType: 'Carrosserie', fuel: 'Carburant',
    transmission: 'Boîte', condition: 'État',
    dash: '—',
    bodyTypes: { sedan: 'Berline', suv: 'SUV', pickup: 'Pickup', hatchback: 'Compacte', van: 'Utilitaire', coupe: 'Coupé' },
    fuels: { gasoline: 'Essence', diesel: 'Diesel', hybrid: 'Hybride', electric: 'Élec.', lpg: 'GPL' },
    transmissions: { manual: 'Manuelle', automatic: 'Auto' },
    conditions: { new: 'Neuf', used: 'Occasion', imported: 'Importé' },
  },
  ar: {
    filters: 'الفلاتر',
    reset: 'إعادة تعيين',
    close: 'إغلاق',
    apply: 'عرض النتائج',
    brand: 'الماركة', model: 'الموديل', all: 'الكل',
    priceMin: 'السعر الأدنى', priceMax: 'السعر الأقصى',
    yearMin: 'السنة الأدنى', yearMax: 'السنة الأقصى',
    mileageMax: 'كم أقصى', city: 'المدينة',
    bodyType: 'الهيكل', fuel: 'الوقود',
    transmission: 'ناقل الحركة', condition: 'الحالة',
    dash: '—',
    bodyTypes: { sedan: 'سيدان', suv: 'دفع رباعي', pickup: 'بيك أب', hatchback: 'مدمجة', van: 'فان', coupe: 'كوبيه' },
    fuels: { gasoline: 'بنزين', diesel: 'ديزل', hybrid: 'هايبرد', electric: 'كهربائي', lpg: 'غاز' },
    transmissions: { manual: 'يدوي', automatic: 'أوتوماتيكي' },
    conditions: { new: 'جديد', used: 'مستعمل', imported: 'مستورد' },
  },
};

const PRICES = [500000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 10000000, 15000000];
const KMS = [10000, 30000, 50000, 80000, 100000, 150000, 200000];

export default function VehicleFilters({ brands, cities, lang, initialFilters }: Props) {
  const l = LABELS[lang];
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [models, setModels] = useState<Model[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const years = Array.from({ length: 17 }, (_, i) => 2026 - i);

  // Détection mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lock body scroll quand drawer ouvert
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, isOpen]);

  // Charger les modèles quand brand change
  useEffect(() => {
    if (!filters.brand_id) {
      setModels([]);
      return;
    }
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    fetch(`${apiUrl}/brands/${filters.brand_id}/models`)
      .then((r) => r.json())
      .then((data) => setModels(data.data ?? []))
      .catch(() => setModels([]));
  }, [filters.brand_id]);

  // Debounced URL update (desktop) OU "Appliquer" manuel (mobile)
  const applyFilters = useCallback((newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    window.location.href = `/${lang}/vehicules${qs ? '?' + qs : ''}`;
  }, [lang]);

  // Auto-apply en desktop, manuel en mobile
  useEffect(() => {
    if (isMobile) return; // pas d'auto-apply en mobile (utilise le bouton "Appliquer")
    const t = setTimeout(() => {
      const sameAsInitial = JSON.stringify(filters) === JSON.stringify(initialFilters);
      if (!sameAsInitial) applyFilters(filters);
    }, 500);
    return () => clearTimeout(t);
  }, [filters, applyFilters, initialFilters, isMobile]);

  const setF = (key: string, value: string) => {
    const next = { ...filters };
    if (value) next[key] = value;
    else delete next[key];
    if (key === 'brand_id') delete next.vehicle_model_id;
    setFilters(next);
  };

  const toggleF = (key: string, value: string) => {
    setF(key, filters[key] === value ? '' : value);
  };

  const reset = () => {
    setFilters({});
    if (!isMobile) {
      window.location.href = `/${lang}/vehicules`;
    }
  };

  const handleApply = () => {
    setIsOpen(false);
    applyFilters(filters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const activeCount = Object.keys(filters).length;
  const fmtPrice = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    return Math.round(n / 1000) + 'K';
  };
  const fmtKm = (n: number) => new Intl.NumberFormat(lang === 'ar' ? 'en-US' : 'fr-FR').format(n);

  const sectionStyle: React.CSSProperties = {
    paddingBottom: '16px',
    marginBottom: '16px',
    borderBottom: '1px solid #E2E8F0',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    fontFamily: 'JetBrains Mono, monospace',
  };
  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: '38px',
    padding: '0 10px',
    fontSize: '13px',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    background: 'white',
    color: '#0F172A',
    outline: 'none',
  };
  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 11px',
    fontSize: '12px',
    fontWeight: 600,
    border: active ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
    borderRadius: '6px',
    background: active ? '#F0FDF4' : 'white',
    color: active ? '#15803D' : '#0F172A',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const filtersContent = (
    <>
      <div style={sectionStyle}>
        <label style={labelStyle}>{l.brand}</label>
        <select style={selectStyle} value={filters.brand_id ?? ''} onChange={(e) => setF('brand_id', e.target.value)}>
          <option value="">{l.all}</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {filters.brand_id && (
          <div style={{ marginTop: '8px' }}>
            <select style={selectStyle} value={filters.vehicle_model_id ?? ''} onChange={(e) => setF('vehicle_model_id', e.target.value)} disabled={!models.length}>
              <option value="">{l.all} {l.model.toLowerCase()}</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>{lang === 'ar' ? 'السعر (MRU)' : 'Prix (MRU)'}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <select style={selectStyle} value={filters.price_min ?? ''} onChange={(e) => setF('price_min', e.target.value)}>
            <option value="">{l.priceMin}</option>
            {PRICES.map((p) => <option key={p} value={p} dir="ltr">{fmtPrice(p)}</option>)}
          </select>
          <select style={selectStyle} value={filters.price_max ?? ''} onChange={(e) => setF('price_max', e.target.value)}>
            <option value="">{l.priceMax}</option>
            {PRICES.map((p) => <option key={p} value={p} dir="ltr">{fmtPrice(p)}</option>)}
          </select>
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>{lang === 'ar' ? 'السنة' : 'Année'}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <select style={selectStyle} value={filters.year_min ?? ''} onChange={(e) => setF('year_min', e.target.value)}>
            <option value="">{l.yearMin}</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select style={selectStyle} value={filters.year_max ?? ''} onChange={(e) => setF('year_max', e.target.value)}>
            <option value="">{l.yearMax}</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>{l.mileageMax}</label>
        <select style={selectStyle} value={filters.mileage_max ?? ''} onChange={(e) => setF('mileage_max', e.target.value)}>
          <option value="">{l.dash}</option>
          {KMS.map((k) => <option key={k} value={k} dir="ltr">{fmtKm(k)} km</option>)}
        </select>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>{l.bodyType}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Object.entries(l.bodyTypes).map(([key, label]) => (
            <button key={key} style={chipStyle(filters.body_type === key)} onClick={() => toggleF('body_type', key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>{l.fuel}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Object.entries(l.fuels).map(([key, label]) => (
            <button key={key} style={chipStyle(filters.fuel === key)} onClick={() => toggleF('fuel', key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>{l.transmission}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Object.entries(l.transmissions).map(([key, label]) => (
            <button key={key} style={chipStyle(filters.transmission === key)} onClick={() => toggleF('transmission', key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>{l.city}</label>
        <select style={selectStyle} value={filters.city_id ?? ''} onChange={(e) => setF('city_id', e.target.value)}>
          <option value="">{l.all}</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name_fr}</option>)}
        </select>
      </div>

      <div style={{ paddingBottom: 0, marginBottom: 0 }}>
        <label style={labelStyle}>{l.condition}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Object.entries(l.conditions).map(([key, label]) => (
            <button key={key} style={chipStyle(filters.condition === key)} onClick={() => toggleF('condition', key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────
  // MOBILE : bouton flottant + drawer overlay
  // ─────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            height: '44px',
            background: '#16A34A',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '14px',
            boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
          }}
        >
          <i className="fa-solid fa-sliders" style={{ fontSize: '13px' }}></i>
          <span>{l.filters}</span>
          {activeCount > 0 && (
            <span style={{
              background: 'white',
              color: '#16A34A',
              borderRadius: '100px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 800,
              marginLeft: '4px',
            }}>
              {activeCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
            }}
          >
            <aside
              onClick={(e) => e.stopPropagation()}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              style={{
                position: 'fixed',
                top: 0,
                [lang === 'ar' ? 'right' : 'left']: 0,
                bottom: 0,
                width: '85%',
                maxWidth: '380px',
                background: 'white',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.25s ease-out',
              }}
            >
              {/* Header drawer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8F0',
                background: 'white',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-sliders" style={{ fontSize: '13px', color: '#16A34A' }}></i>
                  {l.filters}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                    fontSize: '18px',
                  }}
                  aria-label={l.close}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Body drawer (scroll) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {filtersContent}
              </div>

              {/* Footer drawer : Reset + Apply */}
              <div style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 16px',
                borderTop: '1px solid #E2E8F0',
                background: 'white',
              }}>
                {hasActiveFilters && (
                  <button
                    onClick={reset}
                    style={{
                      flex: '0 0 auto',
                      padding: '0 16px',
                      height: '44px',
                      background: 'white',
                      color: '#DC2626',
                      border: '1px solid #DC2626',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fa-solid fa-rotate-left" style={{ fontSize: '11px' }}></i>
                    {l.reset}
                  </button>
                )}
                <button
                  onClick={handleApply}
                  style={{
                    flex: 1,
                    height: '44px',
                    background: '#16A34A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {l.apply}
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px' }}></i>
                </button>
              </div>
            </aside>
          </div>
        )}

        <style>{`
          @keyframes slideIn {
            from { transform: translateX(${lang === 'ar' ? '100%' : '-100%'}); }
            to { transform: translateX(0); }
          }
        `}</style>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // DESKTOP : sidebar classique
  // ─────────────────────────────────────────────────────────────
  return (
    <aside style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: '20px',
      height: 'fit-content',
      position: 'sticky',
      top: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-sliders" style={{ fontSize: '13px', color: '#16A34A' }}></i>
          {l.filters}
        </h2>
        {hasActiveFilters && (
          <button onClick={reset} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '11px', fontWeight: 700, color: '#DC2626',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <i className="fa-solid fa-rotate-left" style={{ fontSize: '10px' }}></i>
            {l.reset}
          </button>
        )}
      </div>
      {filtersContent}
    </aside>
  );
}
