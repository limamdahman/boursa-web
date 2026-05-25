import { useState, useEffect } from 'react';
import { getToken, addFavorite, removeFavorite, getFavoriteIds } from '@/lib/api';

interface Props {
  vehicleId: string;
  lang: 'fr' | 'ar';
  initialActive?: boolean;
}

// Cache global des IDs favoris (chargés une fois par page)
let favoriteIdsCache: Set<string> | null = null;
let cacheLoadPromise: Promise<Set<string>> | null = null;

async function loadFavoriteIds(): Promise<Set<string>> {
  if (favoriteIdsCache) return favoriteIdsCache;
  if (cacheLoadPromise) return cacheLoadPromise;
  cacheLoadPromise = getFavoriteIds().then((ids) => {
    favoriteIdsCache = new Set(ids);
    return favoriteIdsCache;
  });
  return cacheLoadPromise;
}

export default function FavoriteHeart({ vehicleId, lang, initialActive = false }: Props) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getToken()) return;
    loadFavoriteIds().then((ids) => {
      setActive(ids.has(vehicleId));
    });
  }, [vehicleId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (loading) return;

    if (!getToken()) {
      window.location.href = '/' + lang + '/connexion';
      return;
    }

    setLoading(true);
    const newState = !active;
    setActive(newState);
    // Optimistic cache update
    if (favoriteIdsCache) {
      if (newState) favoriteIdsCache.add(vehicleId);
      else favoriteIdsCache.delete(vehicleId);
    }

    try {
      if (newState) {
        await addFavorite(vehicleId);
      } else {
        await removeFavorite(vehicleId);
      }
    } catch (err) {
      // Rollback
      setActive(!newState);
      if (favoriteIdsCache) {
        if (newState) favoriteIdsCache.delete(vehicleId);
        else favoriteIdsCache.add(vehicleId);
      }
      console.error('Favorite toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div style={{
        width: '36px',
        height: '36px',
      }}></div>
    );
  }

  return (
    <button
      onClick={handleClick}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      disabled={loading}
      aria-label={active ? (lang === 'ar' ? 'إزالة من المفضلة' : 'Retirer des favoris') : (lang === 'ar' ? 'إضافة للمفضلة' : 'Ajouter aux favoris')}
      style={{
        width: '36px',
        height: '36px',
        background: 'rgba(255,255,255,0.95)',
        border: 'none',
        borderRadius: '50%',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        transition: 'transform 0.15s',
        zIndex: 5,
      }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(1.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <i
        className={active ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
        style={{
          fontSize: '15px',
          color: active ? '#DC2626' : '#475569',
          transition: 'color 0.15s',
        }}
      ></i>
    </button>
  );
}
