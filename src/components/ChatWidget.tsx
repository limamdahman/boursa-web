import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender_type: 'user' | 'agency';
  body: string;
  created_at: string;
}

interface Props {
  agencyId: string;
  agencyName: string;
  lang: 'fr' | 'ar';
  apiUrl: string;
  loginUrl: string;
}

const L = {
  fr: {
    title: 'Contacter agence',
    placeholder: 'Ecrire un message...',
    login: 'Connectez-vous pour envoyer un message',
    loginBtn: 'Se connecter',
    loading: 'Chargement...',
  },
  ar: {
    title: 'تواصل مع الوكالة',
    placeholder: 'اكتب رسالة...',
    login: 'سجل الدخول لإرسال رسالة',
    loginBtn: 'تسجيل الدخول',
    loading: 'جار التحميل...',
  },
};

export default function ChatWidget({ agencyId, agencyName, lang, apiUrl, loginUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSince, setLastSince] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';
  const t = L[lang];

  // Lire token depuis localStorage côté client
  useEffect(() => {
    const t = localStorage.getItem('boursa_token');
    setToken(t);
  }, []);

  function getHeaders(): Record<string, string> {
    const t = localStorage.getItem('boursa_token');
    return {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: 'Bearer ' + t } : {}),
    };
  }

  async function openConversation() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl + '/chat/conversations/' + agencyId, { method: 'POST', headers: getHeaders() });
      const data = await res.json();
      setConversationId(data.id);
      await loadMessages(data.id, null);
    } catch {}
    setLoading(false);
  }

  async function loadMessages(convId: string, since: string | null) {
    try {
      const url = apiUrl + '/chat/conversations/' + convId + '/messages' + (since ? '?since=' + since : '');
      const res = await fetch(url, { headers: getHeaders() });
      const data: Message[] = await res.json();
      if (data.length > 0) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          return [...prev, ...data.filter(m => !ids.has(m.id))];
        });
        setLastSince(data[data.length - 1].created_at);
      }
    } catch {}
  }

  async function sendMessage() {
    if (!conversationId || !input.trim()) return;
    const body = input.trim();
    setInput('');
    await fetch(apiUrl + '/chat/conversations/' + conversationId + '/messages', {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ body }),
    });
    await loadMessages(conversationId, lastSince);
  }

  useEffect(() => {
    if (!open || !conversationId) return;
    const interval = setInterval(() => loadMessages(conversationId, lastSince), 5000);
    return () => clearInterval(interval);
  }, [open, conversationId, lastSince]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !conversationId && token) openConversation();
  }, [open, token]);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: isRtl ? 'auto' : '24px', left: isRtl ? '24px' : 'auto', zIndex: 1000 }}>
      {open && (
        <div style={{ width: '340px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden', marginBottom: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '460px' }} dir={isRtl ? 'rtl' : 'ltr'}>
          <div style={{ background: '#0F172A', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px' }}>
                {agencyName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{agencyName}</div>
                <div style={{ color: '#16A34A', fontSize: '11px' }}>{t.title}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '18px' }}>x</button>
          </div>

          {!token ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '12px' }}>
              <div style={{ fontSize: '40px' }}>💬</div>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.6 }}>{t.login}</p>
              <a href={loginUrl} style={{ background: '#16A34A', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>{t.loginBtn}</a>
            </div>
          ) : loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '14px' }}>{t.loading}</div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_type === 'user' ? 'flex-end' : 'flex-start', gap: '2px' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8', paddingInline: '4px' }}>
                      {m.sender_type === 'user' ? (lang === 'ar' ? 'أنت' : 'Vous') : agencyName}
                    </div>
                    <div style={{ maxWidth: '75%', padding: '8px 12px', fontSize: '13px', lineHeight: 1.5, background: m.sender_type === 'user' ? '#16A34A' : 'white', color: m.sender_type === 'user' ? 'white' : '#1E293B', border: m.sender_type === 'user' ? 'none' : '1px solid #E2E8F0', borderRadius: m.sender_type === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px' }}>
                      {m.body}
                      <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
                        {new Date(m.created_at).toLocaleTimeString(lang === 'ar' ? 'ar' : 'fr', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '10px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={t.placeholder}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                />
                <button onClick={sendMessage} style={{ background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 700 }}>
                  {isRtl ? '<' : '>'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ width: '56px', height: '56px', background: '#16A34A', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.4)' }}
        >
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    </div>
  );
}
