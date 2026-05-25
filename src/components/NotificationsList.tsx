import { useState, useEffect } from 'react';
import { getToken, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const L = {
  fr: {
    title: 'Notifications',
    subtitle: 'Toutes vos notifications',
    empty: 'Aucune notification',
    emptyHint: "Vous serez informé ici de l'activité sur vos annonces",
    markAllRead: 'Tout marquer comme lu',
    loading: 'Chargement...',
    notLogged: 'Vous devez être connecté',
    loginBtn: 'Se connecter',
    loadMore: 'Charger plus',
    justNow: "à l'instant",
    minutesAgo: 'il y a {n} min',
    hoursAgo: 'il y a {n} h',
    daysAgo: 'il y a {n} j',
    types: {
      vehicle_approved: 'Annonce approuvée',
      vehicle_rejected: 'Annonce refusée',
      new_lead: 'Nouveau contact',
    } as Record<string, string>,
    messages: {
      vehicle_approved: 'Votre {brand} {model} {year} a été approuvée et publiée',
      vehicle_rejected: 'Votre {brand} {model} {year} a été refusée',
      new_lead: '{leadName} est intéressé par votre {brand} {model} {year}',
    } as Record<string, string>,
    rejectedReason: 'Raison',
    leadPhone: 'Téléphone',
  },
  ar: {
    title: 'الإشعارات',
    subtitle: 'جميع إشعاراتك',
    empty: 'لا توجد إشعارات',
    emptyHint: 'سيتم إعلامك هنا بنشاط إعلاناتك',
    markAllRead: 'وضع علامة على الكل كمقروء',
    loading: 'جاري التحميل...',
    notLogged: 'يجب أن تكون مسجل دخول',
    loginBtn: 'تسجيل الدخول',
    loadMore: 'تحميل المزيد',
    justNow: 'الآن',
    minutesAgo: 'منذ {n} دقيقة',
    hoursAgo: 'منذ {n} ساعة',
    daysAgo: 'منذ {n} يوم',
    types: {
      vehicle_approved: 'تمت الموافقة على الإعلان',
      vehicle_rejected: 'تم رفض الإعلان',
      new_lead: 'اتصال جديد',
    } as Record<string, string>,
    messages: {
      vehicle_approved: 'تمت الموافقة على {brand} {model} {year} ونشره',
      vehicle_rejected: 'تم رفض {brand} {model} {year}',
      new_lead: '{leadName} مهتم بـ {brand} {model} {year}',
    } as Record<string, string>,
    rejectedReason: 'السبب',
    leadPhone: 'الهاتف',
  },
};

function formatRelative(iso: string, l: any): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return l.justNow;
  if (diff < 3600) return l.minutesAgo.replace('{n}', String(Math.floor(diff / 60)));
  if (diff < 86400) return l.hoursAgo.replace('{n}', String(Math.floor(diff / 3600)));
  return l.daysAgo.replace('{n}', String(Math.floor(diff / 86400)));
}

export default function NotificationsList({ lang }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = (p: number, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    getNotifications(p).then((d: any) => {
      const newItems = d?.data || [];
      setItems((prev) => append ? [...prev, ...newItems] : newItems);
      setLastPage(d?.last_page || 1);
      setPage(p);
    }).catch(() => {}).finally(() => { setLoading(false); setLoadingMore(false); });
  };

  useEffect(() => {
    setMounted(true);
    if (!getToken()) return;
    loadPage(1);
  }, []);

  if (!mounted) return null;

  if (!getToken()) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '16px' }}></i>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{l.notLogged}</h2>
        <a href={'/' + lang + '/connexion'} style={{ display: 'inline-block', marginTop: '14px', padding: '12px 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>{l.loginBtn}</a>
      </div>
    );
  }

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems((arr) => arr.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    } catch {}
  };

  const handleClick = async (n: any) => {
    if (!n.read_at) {
      try {
        await markNotificationAsRead(n.id);
        setItems((arr) => arr.map((x) => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x));
      } catch {}
    }
    if (n.data?.vehicle_id) {
      window.location.href = '/' + lang + '/vehicules/' + n.data.vehicle_id;
    }
  };

  const titleFor = (n: any) => l.types[n.data?.type] || n.data?.type || '—';
  const msgFor = (n: any) => {
    const tpl = l.messages[n.data?.type] || '';
    return tpl
      .replace('{brand}', n.data?.brand || '')
      .replace('{model}', n.data?.model || '')
      .replace('{year}', String(n.data?.year || ''))
      .replace('{leadName}', n.data?.lead_name || (lang === 'ar' ? 'مستخدم' : 'Un utilisateur'));
  };

  const hasUnread = items.some((n) => !n.read_at);

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>{l.title}</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{l.subtitle}</p>
        </div>
        {hasUnread && (
          <button onClick={handleMarkAll} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', color: '#16A34A', border: '1px solid #16A34A', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            <i className="fa-solid fa-check-double" style={{ fontSize: '11px' }}></i>
            {l.markAllRead}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#64748B' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', padding: '80px 20px' }}>
          <i className="fa-regular fa-bell-slash" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '16px' }}></i>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>{l.empty}</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{l.emptyHint}</p>
        </div>
      ) : (
        <>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {items.map((n: any, idx: number) => {
              const unread = !n.read_at;
              const type = n.data?.type;
              const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
                vehicle_approved: { icon: 'fa-circle-check', color: '#16A34A', bg: '#DCFCE7' },
                vehicle_rejected: { icon: 'fa-circle-xmark', color: '#DC2626', bg: '#FEE2E2' },
                new_lead: { icon: 'fa-envelope', color: '#D97706', bg: '#FEF3C7' },
              };
              const meta = iconMap[type] || { icon: 'fa-bell', color: '#64748B', bg: '#F1F5F9' };

              return (
                <button key={n.id} onClick={() => handleClick(n)} style={{ width: '100%', display: 'flex', gap: '14px', padding: '16px 20px', background: unread ? '#F0FDF4' : 'white', border: 'none', borderBottom: idx < items.length - 1 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                  <div style={{ width: '44px', height: '44px', background: meta.bg, color: meta.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={'fa-solid ' + meta.icon} style={{ fontSize: '16px' }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{titleFor(n)}</span>
                      {unread && <span style={{ width: '8px', height: '8px', background: '#16A34A', borderRadius: '50%', flexShrink: 0 }}></span>}
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 6px', lineHeight: 1.5 }}>{msgFor(n)}</p>

                    {/* Détails supplémentaires selon type */}
                    {type === 'vehicle_rejected' && n.data?.reason && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', background: '#FEF2F2', borderRadius: '6px', fontSize: '12px', color: '#991B1B' }}>
                        <strong>{l.rejectedReason}:</strong> {n.data.reason}
                      </div>
                    )}
                    {type === 'new_lead' && n.data?.lead_phone && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                        <i className="fa-solid fa-phone" style={{ fontSize: '10px', marginInlineEnd: '4px' }}></i>
                        <span dir="ltr">{n.data.lead_phone}</span>
                      </div>
                    )}

                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '6px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>{formatRelative(n.created_at, l)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {page < lastPage && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => loadPage(page + 1, true)} disabled={loadingMore} style={{ padding: '12px 28px', background: 'white', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: loadingMore ? 'not-allowed' : 'pointer', opacity: loadingMore ? 0.7 : 1 }}>
                {loadingMore ? l.loading : l.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
