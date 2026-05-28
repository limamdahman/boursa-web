import { useState, useEffect } from 'react';
import { getCompareList } from './CompareButton';

interface Props {
  lang: 'fr' | 'ar';
}

export default function CompareBar({ lang }: Props) {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    setList(getCompareList());
    const onUpdate = () => setList(getCompareList());
    window.addEventListener('boursa_compare_updated', onUpdate);
    return () => window.removeEventListener('boursa_compare_updated', onUpdate);
  }, []);

  function remove(id: string) {
    const newList = list.filter((v: any) => v.id !== id);
    localStorage.setItem('boursa_compare', JSON.stringify(newList));
    window.dispatchEvent(new Event('boursa_compare_updated'));
  }

  function clear() {
    localStorage.setItem('boursa_compare', '[]');
    window.dispatchEvent(new Event('boursa_compare_updated'));
  }

  if (list.length === 0) return null;

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);
  const compareUrl = `/${lang}/comparer?ids=${list.map((v: any) => v.id).join(',')}`;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 998,
      background: '#0F172A', borderTop: '3px solid #16A34A',
      padding: '12px 24px', display: 'flex', alignItems: 'center',
      gap: '16px', flexWrap: 'wrap',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
    }}>
      <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
        {lang === 'ar' ? 'المقارنة' : 'Comparer'} ({list.length}/3)
      </span>

      <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
        {list.map((v: any) => (
          <div key={v.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#1E293B', borderRadius: '8px', padding: '6px 10px',
          }}>
            {v.image && (
              <img src={v.image} alt="" style={{ width: '36px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <div>
              <div style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{v.brand} {v.model}</div>
              <div style={{ color: '#64748B', fontSize: '10px' }}>{v.year} · {fmt(v.price)} MRU</div>
            </div>
            <button onClick={() => remove(v.id)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}>×</button>
          </div>
        ))}

        {/* Slots vides */}
        {Array.from({ length: 3 - list.length }).map((_, i) => (
          <div key={i} style={{
            width: '120px', height: '46px', border: '1px dashed #334155',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#475569', fontSize: '11px',
          }}>
            {lang === 'ar' ? '+ إضافة' : '+ Ajouter'}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={clear} style={{ background: 'none', border: '1px solid #334155', color: '#94A3B8', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer' }}>
          {lang === 'ar' ? 'مسح' : 'Effacer'}
        </button>
        {list.length >= 2 && (
          <a href={compareUrl} style={{
            background: '#16A34A', color: 'white', borderRadius: '6px',
            padding: '8px 20px', fontSize: '13px', fontWeight: 700,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
            {lang === 'ar' ? 'مقارنة الآن' : 'Comparer maintenant'}
          </a>
        )}
      </div>
    </div>
  );
}
