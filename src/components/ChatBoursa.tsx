import { useState, useEffect, useRef } from 'react';

interface Props {
  lang: 'fr' | 'ar';
  apiUrl: string;
}

const L = {
  fr: {
    title: 'Support Boursa',
    subtitle: 'Nous vous répondons sous 24h',
    placeholder: 'Ecrire un message...',
    login: 'Connectez-vous pour nous contacter',
    loginBtn: 'Se connecter',
    loading: 'Chargement...',
    welcome: 'Bonjour ! Comment pouvons-nous vous aider ?',
    send: '>',
  },
  ar: {
    title: 'دعم بورصة',
    subtitle: 'نرد عليك خلال 24 ساعة',
    placeholder: 'اكتب رسالة...',
    login: 'سجل الدخول للتواصل معنا',
    loginBtn: 'تسجيل الدخول',
    loading: 'جار التحميل...',
    welcome: 'مرحباً! كيف يمكننا مساعدتك؟',
    send: '<',
  },
};

interface Message {
  id: string;
  from: 'user' | 'boursa';
  body: string;
  time: string;
}

export default function ChatBoursa({ lang, apiUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const prevMsgCount = useRef(0);
  const openRef = useRef(false);
  const [agencyName, setAgencyName] = useState<string>('Boursa');
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Vous');
  const [loading, setLoading] = useState(false);
  const [lastSince, setLastSince] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';
  const t = L[lang];

  useEffect(() => {
    const tk = localStorage.getItem('boursa_token');
    setToken(tk);
  }, []);

  function getHeaders(): Record<string, string> {
    const tk = localStorage.getItem('boursa_token');
    return {
      'Content-Type': 'application/json',
      ...(tk ? { Authorization: 'Bearer ' + tk } : {}),
    };
  }

  async function openConv() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl + '/chat/support', {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!data.id) { console.error('No conv id:', data); return; }
      setConvId(data.id);
      if (data.agency) { setAgencyName(data.agency.name || 'Boursa'); setAgencyLogo(data.agency.logo_url || null); }
      if (data.user) setUserName(data.user.name || 'Vous');
      await loadMessages(data.id, null);
    } catch {}
    setLoading(false);
  }

  async function loadMessages(id: string, since: string | null) {
    try {
      const url = apiUrl + '/chat/conversations/' + id + '/messages' + (since ? '?since=' + since : '');
      const res = await fetch(url, { headers: getHeaders() });
      const data: any[] = await res.json();
      if (data.length > 0) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          const news = data.filter(m => !ids.has(m.id)).map(m => ({
            id: m.id,
            from: m.sender_type === 'user' ? 'user' : 'boursa' as 'user' | 'boursa',
            body: m.body,
            time: new Date(m.created_at).toLocaleTimeString(lang === 'ar' ? 'ar' : 'fr', { hour: '2-digit', minute: '2-digit' }),
          }));
          if (news.length > 0) {
            const newFromBoursa = news.filter(m => m.from === 'boursa').length;
            if (newFromBoursa > 0 && !openRef.current) {
              setTimeout(() => {
                setUnread(u => u + newFromBoursa);
                try {
                  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const o = ctx.createOscillator();
                  const g = ctx.createGain();
                  o.connect(g); g.connect(ctx.destination);
                  o.frequency.value = 520; g.gain.value = 0.08;
                  o.start(); o.stop(ctx.currentTime + 0.12);
                } catch {}
              }, 0);
            }
          }
          return [...prev, ...news];
        });
        setLastSince(data[data.length - 1].created_at);
      }
    } catch {}
  }

  async function send() {
    if (!convId || !input.trim()) return;
    const body = input.trim();
    setInput('');
    await fetch(apiUrl + '/chat/conversations/' + convId + '/messages', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ body }),
    });
    await loadMessages(convId, lastSince);
  }

  useEffect(() => {
    if (!open || !convId) return;
    const iv = setInterval(() => loadMessages(convId, lastSince), 5000);
    return () => clearInterval(iv);
  }, [open, convId, lastSince]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !convId && token) openConv();
  }, [open, token]);

  useEffect(() => {
    openRef.current = open;
    if (open) setUnread(0);
  }, [open]);

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: isRtl ? 'auto' : '24px', right: isRtl ? '24px' : 'auto', zIndex: 999 }}>
      {open && (
        <div style={{ width: '320px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden', marginBottom: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '420px' }} dir={isRtl ? 'rtl' : 'ltr'}>
          <div style={{ background: '#0F172A', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>B</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{t.title}</div>
                <div style={{ color: '#16A34A', fontSize: '11px' }}>{t.subtitle}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '18px' }}>x</button>
          </div>

          {!token ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '12px' }}>
              <div style={{ fontSize: '40px' }}>💬</div>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.6 }}>{t.login}</p>
              <a href={'/' + lang + '/connexion'} style={{ background: '#16A34A', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>{t.loginBtn}</a>
            </div>
          ) : loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '14px' }}>{t.loading}</div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.length === 0 && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#15803D', lineHeight: 1.6 }}>
                    {t.welcome}
                  </div>
                )}
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'user' ? 'flex-end' : 'flex-start', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexDirection: m.from === 'user' ? 'row-reverse' : 'row' }}>
                      {/* Avatar */}
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: m.from === 'user' ? '#16A34A' : '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white' }}>
                        {m.from === 'user'
                          ? <span>{userName.charAt(0).toUpperCase()}</span>
                          : agencyLogo
                            ? <img src={agencyLogo} alt={agencyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span>B</span>
                        }
                      </div>
                      {/* Bulle */}
                      <div style={{ maxWidth: '72%', padding: '8px 12px', fontSize: '13px', lineHeight: 1.5, background: m.from === 'user' ? '#16A34A' : '#F1F5F9', color: m.from === 'user' ? 'white' : '#1E293B', borderRadius: m.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px' }}>
                        {m.body}
                        <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px', textAlign: m.from === 'user' ? 'right' : 'left' }}>{m.time}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', paddingInline: '32px' }}>
                      {m.from === 'user' ? userName : agencyName}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '10px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder={t.placeholder}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                />
                <button onClick={send} style={{ background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 700 }}>{t.send}</button>
              </div>
            </>
          )}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ width: '56px', height: '56px', background: '#0F172A', borderRadius: '50%', border: '3px solid #16A34A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', position: 'relative' }}
        >
          <svg width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {unread > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#EF4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
