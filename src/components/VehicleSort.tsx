import { useCallback } from 'react';

interface Props {
  current: string;
  lang: 'fr' | 'ar';
}

const LABELS = {
  fr: {
    sort: 'Trier par',
    options: {
      recent: 'Plus récents',
      price_asc: 'Prix croissant',
      price_desc: 'Prix décroissant',
      year_desc: 'Plus neufs',
      mileage_asc: 'Moins de km',
    },
  },
  ar: {
    sort: 'الترتيب حسب',
    options: {
      recent: 'الأحدث',
      price_asc: 'السعر تصاعدياً',
      price_desc: 'السعر تنازلياً',
      year_desc: 'الأحدث صناعةً',
      mileage_asc: 'الأقل كيلومترات',
    },
  },
};

export default function VehicleSort({ current, lang }: Props) {
  const l = LABELS[lang];
  const handleChange = useCallback((value: string) => {
    const url = new URL(window.location.href);
    if (value && value !== 'recent') url.searchParams.set('sort', value);
    else url.searchParams.delete('sort');
    window.location.href = url.toString();
  }, []);

  return (
    <select
      value={current || 'recent'}
      onChange={(e) => handleChange(e.target.value)}
      style={{
        height: '38px',
        padding: '0 30px 0 12px',
        fontSize: '13px',
        fontWeight: 600,
        border: '1px solid #CBD5E1',
        borderRadius: '6px',
        background: 'white',
        color: '#0F172A',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {Object.entries(l.options).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  );
}
