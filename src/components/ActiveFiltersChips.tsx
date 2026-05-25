interface ChipDef {
  key: string;
  label: string;
  value: any;
}

interface Brand { id: number; name: string; }
interface City { id: number; name_fr: string; name_ar: string; }

interface Props {
  activeFilters: Record<string, string>;
  brands: Brand[];
  cities: City[];
  lang: 'fr' | 'ar';
  query?: string;
}

const FILTER_LABELS_FR: Record<string, string> = {
  brand_id: 'Marque',
  vehicle_model_id: 'Modèle',
  city_id: 'Ville',
  price_min: 'Prix min',
  price_max: 'Prix max',
  year_min: 'Année min',
  year_max: 'Année max',
  mileage_max: 'Km max',
  fuel: 'Carburant',
  transmission: 'Boîte',
  body_type: 'Carrosserie',
  condition: 'État',
};

const FILTER_LABELS_AR: Record<string, string> = {
  brand_id: 'الماركة',
  vehicle_model_id: 'الموديل',
  city_id: 'المدينة',
  price_min: 'السعر الأدنى',
  price_max: 'السعر الأقصى',
  year_min: 'السنة الأدنى',
  year_max: 'السنة الأقصى',
  mileage_max: 'كم أقصى',
  fuel: 'الوقود',
  transmission: 'ناقل الحركة',
  body_type: 'الهيكل',
  condition: 'الحالة',
};

const VALUE_LABELS_FR: Record<string, Record<string, string>> = {
  body_type: { sedan: 'Berline', suv: 'SUV', pickup: 'Pickup', hatchback: 'Compacte', van: 'Utilitaire', coupe: 'Coupé' },
  fuel: { gasoline: 'Essence', diesel: 'Diesel', hybrid: 'Hybride', electric: 'Électrique', lpg: 'GPL' },
  transmission: { manual: 'Manuelle', automatic: 'Automatique' },
  condition: { new: 'Neuf', used: 'Occasion', imported: 'Importé' },
};

const VALUE_LABELS_AR: Record<string, Record<string, string>> = {
  body_type: { sedan: 'سيدان', suv: 'دفع رباعي', pickup: 'بيك أب', hatchback: 'مدمجة', van: 'فان', coupe: 'كوبيه' },
  fuel: { gasoline: 'بنزين', diesel: 'ديزل', hybrid: 'هايبرد', electric: 'كهربائي', lpg: 'غاز' },
  transmission: { manual: 'يدوي', automatic: 'أوتوماتيكي' },
  condition: { new: 'جديد', used: 'مستعمل', imported: 'مستورد' },
};

const fmtPrice = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  return Math.round(n / 1000) + 'K';
};

const fmtKm = (n: number, lang: string) => new Intl.NumberFormat(lang === 'ar' ? 'en-US' : 'fr-FR').format(n);

export default function ActiveFiltersChips({ activeFilters, brands, cities, lang, query }: Props) {
  const filterLabels = lang === 'ar' ? FILTER_LABELS_AR : FILTER_LABELS_FR;
  const valueLabels = lang === 'ar' ? VALUE_LABELS_AR : VALUE_LABELS_FR;

  const removeFilter = (key: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    if (key === 'brand_id') url.searchParams.delete('vehicle_model_id');
    if (key === 'q') {
      // Quand on retire q, retirer aussi les filtres qui venaient de q
      ['body_type', 'fuel', 'transmission', 'price_max', 'price_min', 'year_min', 'mileage_max', 'condition', 'brand_id', 'vehicle_model_id', 'city_id'].forEach(k => {
        // Ne pas retirer les filtres définis explicitement par l'utilisateur
        // Pour simplifier, on retire tout ce qui n'a pas été modifié manuellement
      });
    }
    window.location.href = url.toString();
  };

  const clearAll = () => {
    window.location.href = `/${lang}/vehicules`;
  };

  // Construire les chips à afficher
  const chips: { key: string; label: string }[] = [];

  // q en premier (s'il existe)
  if (query) {
    chips.push({ key: 'q', label: `"${query}"` });
  }

  // Tous les autres filtres actifs
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (!value || key === 'sort' || key === 'q') return;

    let displayValue = value;

    // Brand : afficher le nom au lieu de l'id
    if (key === 'brand_id') {
      const brand = brands.find(b => String(b.id) === String(value));
      displayValue = brand?.name || value;
    } else if (key === 'city_id') {
      const city = cities.find(c => String(c.id) === String(value));
      displayValue = city ? (lang === 'ar' ? city.name_ar : city.name_fr) : value;
    } else if (key === 'price_min' || key === 'price_max') {
      displayValue = fmtPrice(Number(value)) + ' MRU';
    } else if (key === 'mileage_max') {
      displayValue = fmtKm(Number(value), lang) + ' km';
    } else if (valueLabels[key]) {
      displayValue = valueLabels[key][value] || value;
    }

    chips.push({
      key,
      label: `${filterLabels[key] || key}: ${displayValue}`,
    });
  });

  if (chips.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center',
      marginBottom: '14px',
    }}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: chip.key === 'q' ? '#F0FDF4' : 'white',
            border: chip.key === 'q' ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 600,
            color: chip.key === 'q' ? '#15803D' : '#0F172A',
          }}
        >
          {chip.key === 'q' && (
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '10px', color: '#16A34A' }}></i>
          )}
          <span>{chip.label}</span>
          <button
            onClick={() => removeFilter(chip.key)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#DC2626',
              padding: '0 2px',
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Retirer"
          >
            ×
          </button>
        </span>
      ))}

      {chips.length > 1 && (
        <button
          onClick={clearAll}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 700,
            color: '#DC2626',
            textDecoration: 'underline',
            marginLeft: '4px',
          }}
        >
          {lang === 'ar' ? 'مسح الكل' : 'Tout effacer'}
        </button>
      )}
    </div>
  );
}
