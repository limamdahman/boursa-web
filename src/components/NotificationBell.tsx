import { useState, useEffect, useRef } from 'react';
import { getToken, getRecentNotifications, getNotificationsUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const L = {
  fr: {
    title: 'Notifications',
    empty: 'Aucune notification',
    markAllRead: 'Tout marquer comme lu',
    viewAll: 'Voir toutes',
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
      vehicle_approved: 'Votre {brand} {model} a été approuvée et publiée',
      vehicle_rejected: 'Votre {brand} {model} a été refusée',
      new_lead: '{leadName} est intéressé par votre {brand} {model}',
    } as Record<string, string>,
  },
  ar: {
    title: 'الإشعارات',
    empty: 'لا توجد إشعارات',
    markAllRead: 'وضع علامة على الكل كمقروء',
    viewAll: 'عرض الكل',
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
      vehicle_approved: 'تمت الموافقة على {brand} {model} ونشره',
      vehicle_rejected: 'تم رفض {brand} {model}',
      new_lead: '{leadName} مهتم بـ {brand} {model}',
    } as Record<string, string>,
  },
};

function formatRelativeTime(iso: string, l: any): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return l.justNow;
  if (diff < 3600) return l.minutesAgo.replace('{n}', String(Math.floor(diff / 60)));
  if (diff < 86400) return l.hoursAgo.replace('{n}', String(Math.floor(diff / 3600)));
  return l.daysAgo.replace('{n}', String(Math.floor(diff / 86400)));
}

export default function NotificationBell({ lang }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchCount = () => {
    if (!getToken()) { setCount(0); return; }
    getNotificationsUnreadCount().then((d) => setCount(d.count || 0)).catch(() => {});
  };

  const fetchRecent = () => {
    if (!getToken()) return;
    setLoading(true);
    getRecentNotifications().then((d) => { setItems(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    setMounted(true);
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchRecent();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  if (!mounted || !getToken()) return null;

  const handleItemClick = async (n: any) => {
    if (!n.read_at) {
      try { await markNotificationAsRead(n.id); setCount((c) => Math.max(0, c - 1)); } catch {}
    }
    if (n.data?.vehicle_id) {
      window.location.href = '/' + lang + '/vehicules/' + n.data.vehicle_id;
    } else {
      window.location.href = '/' + lang + '/notifications';
    }
  };

  const handleMarkAll = async () => {
    try { await markAllNotificationsAsRead(); setCount(0); setItems((arr) => arr.map((n) => ({ ...n, read_at: new Date().toISOString() }))); } catch {}
  };

  const titleFor = (n: any) => l.types[n.data?.type] || n.data?.type || '—';
  const msgFor = (n: any) => {
    const tpl = l.messages[n.data?.type] || '';
    return tpl
      .replace('{brand}', n.data?.brand || '')
      .replace('{model}', n.data?.model || '')
      .replace('{leadName}', n.data?.lead_name || (lang === 'ar' ? 'مستخدم' : 'Un utilisateur'));
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '40px', height: '40px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', borderRadius: '8px',
          cursor: 'pointer', position: 'relative',
        }}
        title={l.title}
      >
        <i className="fa-regular fa-bell" style={{ fontSize: '18px', color: '#0F172A' }}></i>
        {count > 0 && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            minWidth: '16px', height: '16px', padding: '0 4px',
            background: '#DC2626', color: 'white',
            borderRadius: '8px', fontSize: '10px', fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>{count > 9 ? '9+' : count}</span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 8px)',
            insetInlineEnd: 0,
            width: '360px', maxWidth: 'calc(100vw - 32px)',
            background: 'white',
            border: '1px solid #E2E8F0', borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden', zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{l.title}</h3>
            {count > 0 && (
              <button onClick={handleMarkAll} style={{ background: 'transparent', border: 'none', color: '#16A34A', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                {l.markAllRead}
              </button>
            )}
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '18px' }}></i>
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <i className="fa-regular fa-bell-slash" style={{ fontSize: '24px', color: '#CBD5E1', marginBottom: '8px' }}></i>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{l.empty}</p>
              </div>
            ) : (
              items.map((n: any) => {
                const unread = !n.read_at;
                const type = n.data?.type;
                const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
                  vehicle_approved: { icon: 'fa-circle-check', color: '#16A34A', bg: '#DCFCE7' },
                  vehicle_rejected: { icon: 'fa-circle-xmark', color: '#DC2626', bg: '#FEE2E2' },
                  new_lead: { icon: 'fa-envelope', color: '#D97706', bg: '#FEF3C7' },
                };
                const meta = iconMap[type] || { icon: 'fa-bell', color: '#64748B', bg: '#F1F5F9' };

                return (
                  <button key={n.id} onClick={() => handleItemClick(n)} style={{ width: '100%', display: 'flex', gap: '12px', padding: '12px 16px', background: unread ? '#F0FDF4' : 'white', border: 'none', borderBottom: '1px solid #F8FAFC', cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                    <div style={{ width: '36px', height: '36px', background: meta.bg, color: meta.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={'fa-solid ' + meta.icon} style={{ fontSize: '14px' }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{titleFor(n)}</span>
                        {unread && <span style={{ width: '7px', height: '7px', background: '#16A34A', borderRadius: '50%', flexShrink: 0 }}></span>}
                      </div>
                      <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 4px', lineHeight: 1.4 }}>{msgFor(n)}</p>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>{formatRelativeTime(n.created_at, l)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <a href={'/' + lang + '/notifications'} style={{ display: 'block', padding: '12px', textAlign: 'center', background: '#F8FAFC', color: '#16A34A', fontSize: '12px', fontWeight: 700, textDecoration: 'none', borderTop: '1px solid #F1F5F9' }}>
            {l.viewAll}
          </a>
        </div>
      )}
    </div>
  );
}
