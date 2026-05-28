import { useState, useEffect, useRef } from 'react';
import { getToken, getStoredUser, logout as apiLogout } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const LABELS = {
  fr: { login: 'Connexion', myAccount: 'Mon compte', myFavorites: 'Mes favoris', myFollows: 'Mes suivis', myListings: 'Mes annonces', logout: 'Déconnexion' },
  ar: { login: 'تسجيل الدخول', myAccount: 'حسابي', myFavorites: 'مفضلتي', myFollows: 'متابعاتي', myListings: 'إعلاناتي', logout: 'تسجيل الخروج' },
};

export default function UserMenu({ lang }: Props) {
  const l = LABELS[lang];
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const handleLogout = async () => {
    await apiLogout();
    window.location.href = '/' + lang + '/';
  };

  if (!mounted) return null;

  if (!user || !getToken()) {
    return (
      <a href={'/' + lang + '/connexion'} className="hidden md:block px-3 py-2 text-sm font-bold text-[var(--color-text-1)] hover:bg-[var(--color-surface-muted)] rounded-md transition-colors">
        {l.login}
      </a>
    );
  }

  const initials = (user.name || '?').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  return (
    <div ref={ref} style={{ position: 'relative' }} className="hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 4px',
          background: 'transparent',
          border: '1px solid #E2E8F0',
          borderRadius: '100px',
          cursor: 'pointer',
          color: '#0F172A',
        }}
      >
        <div style={{ width: '30px', height: '30px', background: '#16A34A', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
          {user.avatar_url
            ? <img src={user.avatar_url} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : initials
          }
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name?.split(' ')[0] || '?'}
        </span>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px', color: '#64748B' }}></i>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          [lang === 'ar' ? 'left' : 'right']: 0,
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          minWidth: '220px',
          overflow: 'hidden',
          zIndex: 100,
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }} dir="ltr">{user.phone || user.email}</div>
          </div>
          <a href={'/' + lang + '/mon-compte'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#0F172A', textDecoration: 'none' }}>
            <i className="fa-solid fa-user" style={{ fontSize: '11px', color: '#16A34A', width: '14px' }}></i>
            {l.myAccount}
          </a>
          <a href={'/' + lang + '/mes-annonces'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#0F172A', textDecoration: 'none' }}>
            <i className="fa-solid fa-car-side" style={{ fontSize: '11px', color: '#16A34A', width: '14px' }}></i>
            {l.myListings}
          </a>
          <a href={'/' + lang + '/favoris'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#0F172A', textDecoration: 'none' }}>
            <i className="fa-solid fa-heart" style={{ fontSize: '11px', color: '#16A34A', width: '14px' }}></i>
            {l.myFavorites}
          </a>
          <a href={'/' + lang + '/mes-suivis'} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#0F172A', textDecoration: 'none' }}>
            <i className="fa-solid fa-user-plus" style={{ fontSize: '11px', color: '#7C3AED', width: '14px' }}></i>
            {l.myFollows}
          </a>
          <div style={{ borderTop: '1px solid #E2E8F0' }}>
            <button onClick={handleLogout} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '11px', width: '14px' }}></i>
              {l.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
