import { useState } from 'react';
import { register as apiRegister } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const LABELS = {
  fr: {
    title: 'Créer un compte',
    subtitle: 'Inscrivez-vous gratuitement sur Boursa',
    name: 'Nom complet',
    namePh: 'Mohamed Ould Ahmed',
    phone: 'Numéro de téléphone',
    phonePh: '22XX XX XX',
    email: 'Email (optionnel)',
    emailPh: 'email@example.com',
    password: 'Mot de passe',
    passwordPh: 'Au moins 8 caractères',
    create: 'Créer mon compte',
    haveAccount: 'Déjà un compte ?',
    loginLink: 'Se connecter',
    loading: 'Création...',
    error: 'Erreur lors de la création du compte',
  },
  ar: {
    title: 'إنشاء حساب',
    subtitle: 'سجل مجانا على بورصة',
    name: 'الاسم الكامل',
    namePh: 'محمد ولد أحمد',
    phone: 'رقم الهاتف',
    phonePh: '22XX XX XX',
    email: 'البريد الإلكتروني (اختياري)',
    emailPh: 'email@example.com',
    password: 'كلمة المرور',
    passwordPh: '8 أحرف على الأقل',
    create: 'إنشاء حسابي',
    haveAccount: 'لديك حساب بالفعل؟',
    loginLink: 'تسجيل الدخول',
    loading: 'جاري الإنشاء...',
    error: 'خطأ في إنشاء الحساب',
  },
};

export default function RegisterForm({ lang }: Props) {
  const l = LABELS[lang];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '46px',
    padding: '0 14px',
    fontSize: '14px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    background: 'white',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const handleRegister = async () => {
    if (!name || !phone || !password) return;
    if (password.length < 8) {
      setError(lang === 'ar' ? 'كلمة المرور قصيرة جدا' : 'Mot de passe trop court');
      return;
    }
    setError(''); setLoading(true);
    try {
      await apiRegister({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, password, language: lang });
      window.location.href = '/' + lang + '/';
    } catch (e: any) {
      setError(e?.message || l.error);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '32px 28px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>{l.title}</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{l.subtitle}</p>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
              {error}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>{l.name}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={l.namePh} style={inputStyle} />

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '14px', marginBottom: '6px' }}>{l.phone}</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={l.phonePh} style={inputStyle} dir="ltr" />

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '14px', marginBottom: '6px' }}>{l.email}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={l.emailPh} style={inputStyle} dir="ltr" />

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '14px', marginBottom: '6px' }}>{l.password}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={l.passwordPh} style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && handleRegister()} />

          <button onClick={handleRegister} disabled={loading || !name || !phone || !password} style={{ width: '100%', height: '46px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '20px' }}>
            {loading ? l.loading : l.create}
          </button>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
            {l.haveAccount}{' '}
            <a href={'/' + lang + '/connexion'} style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}>{l.loginLink}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
