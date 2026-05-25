import { useState, useEffect } from 'react';
import type { Brand, Model, City } from '@/lib/types';

const labels = {
  fr: {
    brand: 'Marque',
    model: 'Modèle',
    yearMin: 'Année min',
    kmMax: 'Km max',
    priceMax: 'Prix max',
    allBrands: 'Toutes',
    allModels: 'Tous',
    dash: '—',
    button: 'Rechercher',
    vehicles: 'véhicules',
    seeCount: 'Voir',
    tabCars: 'Voitures',
    tabMotos: 'Motos',
    soon: 'Bientôt',
  },
  ar: {
    brand: 'الماركة',
    model: 'الموديل',
    yearMin: 'السنة الأدنى',
    kmMax: 'الكيلومترات الأقصى',
    priceMax: 'السعر الأقصى',
    allBrands: 'الكل',
    allModels: 'الكل',
    dash: '—',
    button: 'بحث',
    vehicles: 'سيارة',
    seeCount: 'عرض',
    tabCars: 'سيارات',
    tabMotos: 'دراجات',
    soon: 'قريباً',
  },
};

interface Props {
  brands: Brand[];
  cities: City[];
  lang: 'fr' | 'ar';
  totalVehicles: number;
}

export default function SearchBox({ brands, cities, lang, totalVehicles }: Props) {
  const l = labels[lang];
  const [brandId, setBrandId] = useState<string>('');
  const [modelId, setModelId] = useState<string>('');
  const [yearMin, setYearMin] = useState<string>('');
  const [kmMax, setKmMax] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [models, setModels] = useState<Model[]>([]);
  const [liveCount, setLiveCount] = useState<number>(totalVehicles);

  useEffect(() => {
    if (!brandId) {
      setModels([]);
      setModelId('');
      return;
    }
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    fetch(`${apiUrl}/brands/${brandId}/models`)
      .then((r) => r.json())
      .then((data) => setModels(data.data ?? []))
      .catch(() => setModels([]));
  }, [brandId]);

  // Compteur live
  useEffect(() => {
    const params = new URLSearchParams();
    if (brandId) params.set('brand_id', brandId);
    if (modelId) params.set('model_id', modelId);
    if (yearMin) params.set('year_min', yearMin);
    if (kmMax) params.set('mileage_max', kmMax);
    if (priceMax) params.set('price_max', priceMax);
    params.set('per_page', '5');

    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    fetch(`${apiUrl}/vehicles?${params}`)
      .then((r) => r.json())
      .then((data) => setLiveCount(data.meta?.total ?? totalVehicles))
      .catch(() => setLiveCount(totalVehicles));
  }, [brandId, modelId, yearMin, kmMax, priceMax, totalVehicles]);

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (brandId) params.set('brand_id', brandId);
    if (modelId) params.set('model_id', modelId);
    if (yearMin) params.set('year_min', yearMin);
    if (kmMax) params.set('mileage_max', kmMax);
    if (priceMax) params.set('price_max', priceMax);
    window.location.href = `/${lang}/vehicules?${params.toString()}`;
  };

  const fieldStyle = "h-11 px-3 text-sm rounded-md border border-[var(--color-hairline-strong)] bg-white text-[var(--color-text-1)] focus:outline-none focus:border-[var(--color-brand-600)] focus:ring-1 focus:ring-[var(--color-brand-600)] w-full";

  const years = Array.from({ length: 17 }, (_, i) => 2026 - i);
  const kmOptions = [10000, 30000, 50000, 80000, 100000, 150000, 200000];
  const priceOptions = [500000, 1000000, 1500000, 2000000, 3000000, 5000000];

  const fmtNum = (n: number) =>
    new Intl.NumberFormat(lang === 'ar' ? 'en-US' : 'fr-FR').format(n);

  return (
    <div className="bg-white rounded-xl p-5 shadow-2xl max-w-4xl mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[var(--color-hairline)] pb-3">
        <span className="px-3.5 py-2 text-xs font-bold bg-[var(--color-brand-100)] text-[var(--color-brand-700)] rounded-md inline-flex items-center gap-1.5">
          <i className="fa-solid fa-car text-[11px]"></i>
          {l.tabCars}
        </span>
        <span className="px-3.5 py-2 text-xs font-bold text-[var(--color-text-3)] inline-flex items-center gap-1.5 opacity-60">
          <i className="fa-solid fa-motorcycle text-[11px]"></i>
          {l.tabMotos}
          <span className="ms-1 bg-[var(--color-brand-100)] text-[var(--color-brand-700)] px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
            {l.soon}
          </span>
        </span>
      </div>

      {/* Form 5 champs en grille */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="flex flex-col">
          <label className="font-mono text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wider mb-1.5">
            {l.brand}
          </label>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={fieldStyle}>
            <option value="">{l.allBrands}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-mono text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wider mb-1.5">
            {l.model}
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            disabled={!brandId}
            className={`${fieldStyle} ${!brandId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">{l.allModels}</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-mono text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wider mb-1.5">
            {l.yearMin}
          </label>
          <select value={yearMin} onChange={(e) => setYearMin(e.target.value)} className={fieldStyle}>
            <option value="">{l.dash}</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-mono text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wider mb-1.5">
            {l.kmMax}
          </label>
          <select value={kmMax} onChange={(e) => setKmMax(e.target.value)} className={fieldStyle}>
            <option value="">{l.dash}</option>
            {kmOptions.map((k) => (
              <option key={k} value={k} dir="ltr">
                {fmtNum(k)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-mono text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-wider mb-1.5">
            {l.priceMax}
          </label>
          <select value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={fieldStyle}>
            <option value="">{l.dash}</option>
            {priceOptions.map((p) => (
              <option key={p} value={p} dir="ltr">
                {fmtNum(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BOUTON RECHERCHE - styles inline pour garantir visibilité */}
      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          height: '50px',
          background: '#16A34A',
          color: 'white',
          fontWeight: 700,
          fontSize: '16px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
          marginTop: '8px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#15803D')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#16A34A')}
      >
        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '14px' }}></i>
        <span>{l.button}</span>
        <span style={{
          fontFamily: 'monospace',
          background: 'rgba(255,255,255,0.25)',
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '14px'
        }} dir="ltr">{liveCount}</span>
      </button>
    </div>
  );
}
