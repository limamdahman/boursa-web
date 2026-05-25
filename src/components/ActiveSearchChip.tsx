interface Props {
  query: string;
  lang: 'fr' | 'ar';
}

export default function ActiveSearchChip({ query, lang }: Props) {
  if (!query) return null;

  const clearSearch = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.location.href = url.toString();
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#F0FDF4',
        border: '1.5px solid #16A34A',
        borderRadius: '8px',
        padding: '8px 12px',
        marginBottom: '14px',
        maxWidth: '100%',
      }}
    >
      <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '11px', color: '#16A34A' }}></i>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
        {lang === 'ar' ? 'البحث:' : 'Recherche :'}
      </span>
      <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 500, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        "{query}"
      </span>
      <button
        onClick={clearSearch}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#DC2626',
          padding: '2px 6px',
          marginLeft: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 700,
        }}
        aria-label={lang === 'ar' ? 'إزالة' : 'Retirer'}
      >
        ×
      </button>
    </div>
  );
}
