import { useState, useEffect, useRef } from 'react';

interface Props {
  lang: 'fr' | 'ar';
  title: string;
  url?: string;
}

const L = {
  fr: {
    share: 'Partager',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    twitter: 'Twitter / X',
    copy: 'Copier le lien',
    copied: 'Lien copié',
  },
  ar: {
    share: 'مشاركة',
    whatsapp: 'واتساب',
    facebook: 'فيسبوك',
    twitter: 'تويتر / X',
    copy: 'نسخ الرابط',
    copied: 'تم نسخ الرابط',
  },
};

export default function ShareButton({ lang, title, url }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  if (!mounted) return null;

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
    } catch {}
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        setOpen(false);
        return true;
      } catch {}
    }
    return false;
  };

  const handleToggle = async () => {
    // Sur mobile : tentative API native d'abord (plus naturel)
    if (typeof navigator !== 'undefined' && navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      const ok = await handleNativeShare();
      if (ok) return;
    }
    setOpen((v) => !v);
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', fontSize: '13px', color: '#0F172A',
    textDecoration: 'none', background: 'transparent', border: 'none',
    width: '100%', cursor: 'pointer', textAlign: 'left',
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '12px',
          background: 'white',
          color: '#0F172A',
          border: '1px solid #CBD5E1',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <i className="fa-solid fa-share-nodes" style={{ fontSize: '13px' }}></i>
        {l.share}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            left: 0,
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
            <a
            href={'https://wa.me/?text=' + encodedTitle + '%20' + encodedUrl}
            target="_blank"
            rel="noopener"
            style={itemStyle}
            onClick={() => setOpen(false)}
          >
            <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', fontSize: '15px', width: '18px' }}></i>
            <span>{l.whatsapp}</span>
          </a>
            <a
            href={'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl}
            target="_blank"
            rel="noopener"
            style={itemStyle}
            onClick={() => setOpen(false)}
          >
            <i className="fa-brands fa-facebook" style={{ color: '#1877F2', fontSize: '15px', width: '18px' }}></i>
            <span>{l.facebook}</span>
          </a>
            <a
            href={'https://twitter.com/intent/tweet?text=' + encodedTitle + '&url=' + encodedUrl}
            target="_blank"
            rel="noopener"
            style={itemStyle}
            onClick={() => setOpen(false)}
          >
            <i className="fa-brands fa-x-twitter" style={{ color: '#0F172A', fontSize: '15px', width: '18px' }}></i>
            <span>{l.twitter}</span>
          </a>
          <button onClick={handleCopy} style={itemStyle}>
            <i className={'fa-solid ' + (copied ? 'fa-check' : 'fa-link')} style={{ color: copied ? '#16A34A' : '#64748B', fontSize: '15px', width: '18px' }}></i>
            <span>{copied ? l.copied : l.copy}</span>
          </button>
        </div>
      )}
    </div>
  );
}
