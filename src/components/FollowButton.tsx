import { useState, useEffect } from 'react';
import { getToken, toggleFollowSeller, isFollowingSeller, getFollowersCount } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
  sellerType: 'user' | 'agency';
  sellerId: string;
}

const L = {
  fr: {
    follow: 'Suivre',
    following: 'Suivi',
    unfollow: 'Ne plus suivre',
    loginToFollow: 'Connectez-vous pour suivre',
  },
  ar: {
    follow: 'متابعة',
    following: 'متابع',
    unfollow: 'إلغاء المتابعة',
    loginToFollow: 'سجل الدخول للمتابعة',
  },
};

function fmtCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n < 10_000 ? 1 : 0).replace('.0', '') + 'K';
  return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
}

export default function FollowButton({ lang, sellerType, sellerId }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [following, setFollowing] = useState(false);
  const [hover, setHover] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    getFollowersCount(sellerType, sellerId).then((d) => setCount(d.count || 0)).catch(() => {});
    if (getToken()) {
      isFollowingSeller(sellerType, sellerId).then((d) => setFollowing(d.following || false)).catch(() => {});
    }
  }, [sellerType, sellerId]);

  if (!mounted) return null;

  const handleClick = async () => {
    if (!getToken()) {
      window.location.href = '/' + lang + '/connexion?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    setLoading(true);
    try {
      const r = await toggleFollowSeller({ seller_type: sellerType, seller_id: sellerId });
      setFollowing(r.following);
      setCount((prev) => r.following ? prev + 1 : Math.max(0, prev - 1));
    } catch {}
    finally { setLoading(false); }
  };

  const isLogged = !!getToken();
  const label = !isLogged ? l.follow : (following ? (hover ? l.unfollow : l.following) : l.follow);

  // Couleurs cohérentes avec la palette (brand-600 = #16A34A vert, text-1 = #0F172A noir)
  const bg = !isLogged ? '#0F172A' : (following ? (hover ? '#DC2626' : 'white') : '#0F172A');
  const color = !isLogged ? 'white' : (following ? (hover ? 'white' : '#0F172A') : 'white');
  const border = following && !hover ? '1px solid #0F172A' : 'none';

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        height: '38px',
        padding: '0 16px',
        background: bg,
        color: color,
        border: border,
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '13px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      title={!isLogged ? l.loginToFollow : undefined}
    >
      {loading ? (
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '12px' }}></i>
      ) : (
        <i className={'fa-solid ' + (following && !hover ? 'fa-check' : (following && hover ? 'fa-user-minus' : 'fa-user-plus'))} style={{ fontSize: '12px' }}></i>
      )}
      <span>{label}</span>
      {count > 0 && (
        <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.75, marginInlineStart: '4px', paddingInlineStart: '8px', borderInlineStart: '1px solid ' + (following && !hover ? '#CBD5E1' : 'rgba(255,255,255,0.25)') }}>
          {fmtCount(count)}
        </span>
      )}
    </button>
  );
}
