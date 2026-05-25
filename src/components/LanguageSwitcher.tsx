interface Props {
  currentLang: 'fr' | 'ar';
  currentPath: string;
}

const LABELS = {
  fr: { hint: 'Langue' },
  ar: { hint: 'اللغة' },
};

export default function LanguageSwitcher({ currentLang, currentPath }: Props) {
  const switchTo = (lang: 'fr' | 'ar') => {
    if (lang === currentLang) return;
    const otherLang = lang === 'fr' ? 'ar' : 'fr';
    const newPath = currentPath.replace('/' + otherLang + '/', '/' + lang + '/');
    window.location.href = newPath;
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#475569',
    fontFamily: 'JetBrains Mono, monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const pillStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    background: '#E2E8F0',
    border: '1px solid #CBD5E1',
    borderRadius: '100px',
    padding: '3px',
    gap: '0',
    fontFamily: 'JetBrains Mono, monospace',
  };

  const optionStyle = (isActive: boolean): React.CSSProperties => ({
    position: 'relative',
    zIndex: 2,
    padding: '5px 12px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.03em',
    color: isActive ? 'white' : '#475569',
    cursor: isActive ? 'default' : 'pointer',
    background: 'transparent',
    border: 'none',
    borderRadius: '100px',
    transition: 'color 0.2s ease',
    minWidth: '36px',
    textAlign: 'center' as const,
  });

  const sliderStyle: React.CSSProperties = {
    position: 'absolute',
    top: '3px',
    bottom: '3px',
    left: currentLang === 'fr' ? '3px' : 'calc(50%)',
    width: 'calc(50% - 3px)',
    background: '#16A34A',
    borderRadius: '100px',
    transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1,
    boxShadow: '0 1px 3px rgba(22, 163, 74, 0.3)',
  };

  const l = LABELS[currentLang];

  return (
    <div style={wrapperStyle}>
      <span style={labelStyle} className="hidden sm:inline-flex">
        <i className="fa-solid fa-globe" style={{ fontSize: '11px', color: '#16A34A' }}></i>
        {l.hint}
      </span>
      <div style={pillStyle}>
        <div style={sliderStyle}></div>
        <button onClick={() => switchTo('fr')} style={optionStyle(currentLang === 'fr')} aria-label="Français">
          FR
        </button>
        <button onClick={() => switchTo('ar')} style={optionStyle(currentLang === 'ar')} aria-label="العربية">
          AR
        </button>
      </div>
    </div>
  );
}
