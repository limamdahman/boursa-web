import { useState, useEffect } from 'react';

interface Props {
  vehicleId: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image?: string | null;
  lang: 'fr' | 'ar';
}

const KEY = 'boursa_compare';
const MAX = 3;

export function getCompareList(): any[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export default function CompareButton({ vehicleId, brand, model, year, price, image, lang }: Props) {
  const [inList, setInList] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const list = getCompareList();
    setInList(list.some((v: any) => v.id === vehicleId));
    setFull(list.length >= MAX);
    const onStorage = () => {
      const l = getCompareList();
      setInList(l.some((v: any) => v.id === vehicleId));
      setFull(l.length >= MAX);
    };
    window.addEventListener('boursa_compare_updated', onStorage);
    return () => window.removeEventListener('boursa_compare_updated', onStorage);
  }, [vehicleId]);

  function toggle() {
    const list = getCompareList();
    if (inList) {
      const newList = list.filter((v: any) => v.id !== vehicleId);
      localStorage.setItem(KEY, JSON.stringify(newList));
    } else {
      if (list.length >= MAX) return;
      list.push({ id: vehicleId, brand, model, year, price, image });
      localStorage.setItem(KEY, JSON.stringify(list));
    }
    window.dispatchEvent(new Event('boursa_compare_updated'));
    setInList(!inList);
    setFull(getCompareList().length >= MAX);
  }

  const label = lang === 'ar'
    ? (inList ? 'إزالة' : 'مقارنة')
    : (inList ? 'Retirer' : 'Comparer');

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      disabled={!inList && full}
      title={!inList && full ? (lang === 'ar' ? 'الحد الأقصى 3 سيارات' : 'Max 3 véhicules') : label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: inList ? '#0F172A' : 'white',
        color: inList ? 'white' : '#0F172A',
        border: '1px solid #CBD5E1',
        borderRadius: '6px', padding: '5px 10px',
        fontSize: '11px', fontWeight: 700, cursor: (!inList && full) ? 'not-allowed' : 'pointer',
        opacity: (!inList && full) ? 0.4 : 1,
        transition: 'all 0.15s',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
      {label}
    </button>
  );
}
