import { useState } from 'react';
import { sendOtp, verifyOtp, login as apiLogin } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const LABELS = {
  fr: {
    title: 'Connexion',
    subtitle: 'Connectez-vous à votre compte Boursa',
    tabPhone: 'Téléphone',
    tabPassword: 'Email / Mot de passe',
    phoneLabel: 'Numéro de téléphone',
    phonePlaceholder: '22XX XX XX',
    sendCode: 'Recevoir le code',
    codeLabel: 'Code reçu par SMS',
    codePlaceholder: '6 chiffres',
    verifyCode: 'Vérifier le code',
    resend: 'Renvoyer le code',
    backToPhone: 'Modifier le téléphone',
    identifierLabel: 'Email ou téléphone',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Au moins 8 caractères',
    loginBtn: 'Se connecter',
    noAccount: 'Pas de compte ?',
    signupLink: 'Créer un compte',
    or: 'OU',
    errorOtp: 'Code incorrect ou expiré',
    errorLogin: 'Identifiants incorrects',
    loading: 'Patientez...',
  },
  ar: {
    title: 'تسجيل الدخول',
    subtitle: 'سجل دخولك إلى حسابك على بورصة',
    tabPhone: 'الهاتف',
    tabPassword: 'البريد / كلمة المرور',
    phoneLabel: 'رقم الهاتف',
    phonePlaceholder: '22XX XX XX',
    sendCode: 'إرسال الرمز',
    codeLabel: 'الرمز المستلم عبر SMS',
    codePlaceholder: '6 أرقام',
    verifyCode: 'التحقق من الرمز',
    resend: 'إعادة إرسال',
    backToPhone: 'تعديل الرقم',
    identifierLabel: 'البريد أو الهاتف',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '8 أحرف على الأقل',
    loginBtn: 'تسجيل الدخول',
    noAccount: 'ليس لديك حساب؟',
    signupLink: 'إنشاء حساب',
    or: 'أو',
    errorOtp: 'الرمز غير صحيح أو منتهي الصلاحية',
    errorLogin: 'بيانات غير صحيحة',
    loading: 'جاري التحميل...',
  },
};

export default function LoginForm({ lang }: Props) {
  const l = LABELS[lang];
  const [tab, setTab] = useState<'phone' | 'password'>('phone');
  const [step, setStep] = useState<'enter' | 'verify'>('enter');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [identifier, setIdentifier] = useState('');
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

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    height: '46px',
    background: '#16A34A',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.15s',
  };

  const tabBtn = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    fontSize: '13px',
    fontWeight: 700,
    background: 'transparent',
    border: 'none',
    borderBottom: isActive ? '2px solid #16A34A' : '2px solid transparent',
    color: isActive ? '#16A34A' : '#64748B',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setError(''); setLoading(true);
    try {
      await sendOtp(phone.trim());
      setStep('verify');
    } catch (e: any) {
      setError(e?.message || l.errorOtp);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!code.trim() || code.length !== 6) return;
    setError(''); setLoading(true);
    try {
      await verifyOtp(phone.trim(), code.trim());
      window.location.href = '/' + lang + '/';
    } catch (e: any) {
      setError(e?.message || l.errorOtp);
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password) return;
    setError(''); setLoading(true);
    try {
      await apiLogin(identifier.trim(), password);
      window.location.href = '/' + lang + '/';
    } catch (e: any) {
      setError(e?.message || l.errorLogin);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '32px 28px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>{l.title}</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{l.subtitle}</p>
        </div>

        <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <button style={tabBtn(tab === 'phone')} onClick={() => { setTab('phone'); setError(''); }}>
            <i className="fa-solid fa-mobile-screen" style={{ marginRight: '6px', fontSize: '12px' }}></i>
            {l.tabPhone}
          </button>
          <button style={tabBtn(tab === 'password')} onClick={() => { setTab('password'); setError(''); setStep('enter'); }}>
            <i className="fa-solid fa-envelope" style={{ marginRight: '6px', fontSize: '12px' }}></i>
            {l.tabPassword}
          </button>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
              {error}
            </div>
          )}

          {tab === 'phone' && step === 'enter' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                {l.phoneLabel}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={l.phonePlaceholder}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                style={inputStyle}
                dir="ltr"
              />
              <button onClick={handleSendOtp} disabled={loading} style={{ ...buttonStyle, marginTop: '16px' }}>
                {loading ? l.loading : l.sendCode}
              </button>
            </div>
          )}

          {tab === 'phone' && step === 'verify' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                {l.codeLabel}
              </label>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }} dir="ltr">→ {phone}</div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder={l.codePlaceholder}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                style={{ ...inputStyle, letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
                dir="ltr"
              />
              <button onClick={handleVerifyOtp} disabled={loading || code.length !== 6} style={{ ...buttonStyle, marginTop: '16px' }}>
                {loading ? l.loading : l.verifyCode}
              </button>
              <button onClick={() => { setStep('enter'); setCode(''); setError(''); }} style={{ width: '100%', background: 'transparent', border: 'none', color: '#475569', fontSize: '12px', fontWeight: 600, marginTop: '10px', cursor: 'pointer' }}>
                {l.backToPhone}
              </button>
            </div>
          )}

          {tab === 'password' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                {l.identifierLabel}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@example.com"
                style={inputStyle}
                dir="ltr"
              />
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '14px', marginBottom: '6px' }}>
                {l.passwordLabel}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={l.passwordPlaceholder}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={inputStyle}
              />
              <button onClick={handleLogin} disabled={loading || !identifier || !password} style={{ ...buttonStyle, marginTop: '16px' }}>
                {loading ? l.loading : l.loginBtn}
              </button>
            </div>
          )}

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
            {l.noAccount}{' '}
            <a href={'/' + lang + '/inscription'} style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}>{l.signupLink}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
