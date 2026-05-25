import { useState, useRef } from 'react';

interface Props {
  lang: 'fr' | 'ar';
  placeholder: string;
}

export default function SearchHero({ lang, placeholder }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (!value.trim()) {
      inputRef.current?.focus();
      return;
    }
    const params = new URLSearchParams({ q: value.trim() });
    window.location.href = '/' + lang + '/vehicules?' + params.toString();
  };

  const buttonLabel = lang === 'ar' ? 'بحث' : 'Rechercher';

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '6px',
        paddingInlineStart: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        maxWidth: '768px',
        margin: '0 auto',
      }}
    >
      <i className="fa-solid fa-magnifying-glass" style={{ color: '#64748B', fontSize: '16px', flexShrink: 0 }}></i>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'transparent',
          fontSize: '15px',
          color: '#0F172A',
          padding: '10px 0',
          border: 'none',
          outline: 'none',
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          background: '#16A34A',
          color: 'white',
          padding: '0 24px',
          height: '44px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#15803D')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#16A34A')}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
