import { useState, useEffect } from 'react';

interface NavItem { key: string; label: string; href: string; }

interface Props {
  lang: 'fr' | 'ar';
  active?: string;
  navItems: NavItem[];
  loginLabel: string;
}

export default function MobileMenu({ lang, active, navItems, loginLabel }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isRtl = lang === 'ar';
  const loginUrl = '/' + lang + '/connexion';
  const publishUrl = '/' + lang + '/publier';

  const drawerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: '80%',
    maxWidth: '320px',
    background: 'white',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideInMenu 0.25s ease-out',
  };
  if (isRtl) drawerStyle.left = 0;
  else drawerStyle.right = 0;

  const ctaCommon: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: '44px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="md:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-[var(-o-color-surface-muted)]" aria-label="Menu" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#0F172A' }}>
        <i className="fa-solid fa-bars" style={{ fontSize: '18px' }}></i>
      </button>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }}>
          <aside onClick={(e) => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'} style={drawerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>boursa<span style={{ color: '#16A34A' }}>.</span></span>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '18px' }} aria-label="Close"><i className="fa-solid fa-xmark"></i></button>
            </div>

            <nav style={{ flex: 1, padding: '12px 0' }}>
              {navItems.map((item) => {
                const isActive = active === item.key;
                return (
                  <a key={item.key} href={item.href} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', fontSize: '15px', fontWeight: 600, color: isActive ? '#16A34A' : '#0F172A', background: isActive ? '#F0FDF4' : 'transparent', textDecoration: 'none', borderLeft: isActive ? '3px solid #16A34A' : '3px solid transparent' }}>{item.label}</a>
                );
              })}
            </nav>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href={loginUrl} style={{...ctaCommon, background: 'white', color: '#0F172A', border: '1px solid #CBD1E1' }}><i className="fa-solid fa-arrow-right-to-bracket" style={{ fontSize: '12px' }}></i>{loginLabel}</a>
              <a href={publishUrl} style={{...ctaCommon, background: '#16A34A', color: 'white', border: 'none' }}><i className="fa-solid fa-plus" style={{ fontSize: '12px' }}></i>{lang === 'ar' ? 'نحر إعلان' : 'Publier une annonce'}</a>
            </div>
          </aside>
          <style>{`@keyframes slideInMenu { from { transform: translateX(${isRtl ? '-100%' : '100%'}); } to { transform: translateX(0); } }`}</style>
        </div>
      )}
    </>
  );
}
