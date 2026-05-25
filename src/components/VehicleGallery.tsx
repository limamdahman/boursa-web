import { useState, useEffect, useCallback } from 'react';

interface MediaItem {
  id: string;
  url_thumb: string | null;
  url_md: string | null;
  url_lg: string | null;
  is_cover: boolean;
}

interface Props {
  media: MediaItem[];
  fallbackImage?: string | null;
  lang: 'fr' | 'ar';
}

export default function VehicleGallery({ media, fallbackImage, lang }: Props) {
  // Tri : cover en premier, puis le reste
  const sorted = [...(media ?? [])].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return 0;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = sorted.length;
  const current = sorted[activeIndex];
  const isRtl = lang === 'ar';

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  // Navigation clavier
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpen) {
        setLightboxOpen(false);
        return;
      }
      if (total <= 1) return;
      if (e.key === 'ArrowLeft') isRtl ? goNext() : goPrev();
      if (e.key === 'ArrowRight') isRtl ? goPrev() : goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext, total, isRtl, lightboxOpen]);

  // Lock scroll quand lightbox ouvert
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  // Aucune photo
  if (total === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        aspectRatio: '4/3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}>
        <i className="fa-solid fa-car" style={{ fontSize: '48px', color: '#CBD5E1' }}></i>
        <span style={{ fontSize: '13px', color: '#94A3B8' }}>
          {lang === 'ar' ? 'لا توجد صور' : 'Pas de photo'}
        </span>
      </div>
    );
  }

  const photoUrl = current.url_lg ?? current.url_md ?? current.url_thumb ?? fallbackImage ?? '';

  return (
    <>
      {/* Galerie principale */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        {/* Photo principale */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '4/3',
            background: '#F8FAFC',
            cursor: 'zoom-in',
            overflow: 'hidden',
          }}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={photoUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Compteur X/N */}
          {total > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(15,23,42,0.85)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <i className="fa-solid fa-image" style={{ fontSize: '10px' }}></i>
              <span dir="ltr">{activeIndex + 1} / {total}</span>
            </div>
          )}

          {/* Bouton zoom */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(15,23,42,0.85)',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: '13px' }}></i>
          </div>

          {/* Flèches navigation */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '42px',
                  height: '42px',
                  background: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  color: '#0F172A',
                }}
                aria-label="Photo précédente"
              >
                <i className="fa-solid fa-chevron-left" style={{ fontSize: '14px' }}></i>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '42px',
                  height: '42px',
                  background: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  color: '#0F172A',
                }}
                aria-label="Photo suivante"
              >
                <i className="fa-solid fa-chevron-right" style={{ fontSize: '14px' }}></i>
              </button>
            </>
          )}
        </div>

        {/* Strip thumbnails */}
        {total > 1 && (
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '10px',
            overflowX: 'auto',
            borderTop: '1px solid #E2E8F0',
          }}>
            {sorted.map((m, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '60px',
                    border: isActive ? '2px solid #16A34A' : '2px solid transparent',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0,
                    background: '#F8FAFC',
                    opacity: isActive ? 1 : 0.7,
                    transition: 'opacity 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.7'; }}
                >
                  <img
                    src={m.url_thumb ?? m.url_md ?? ''}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
          }}
        >
          {/* Bouton fermer */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '44px',
              height: '44px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'white',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          {/* Compteur en haut */}
          {total > 1 && (
            <div style={{
              position: 'absolute',
              top: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 14px',
              borderRadius: '6px',
            }} dir="ltr">
              {activeIndex + 1} / {total}
            </div>
          )}

          {/* Image */}
          <img
            src={photoUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95%',
              maxHeight: '85vh',
              objectFit: 'contain',
              cursor: 'default',
            }}
          />

          {/* Flèches lightbox */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '52px',
                  height: '52px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Précédent"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '52px',
                  height: '52px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Suivant"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
