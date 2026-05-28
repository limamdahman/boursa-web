import { useState, useEffect } from 'react';
import { getStoredUser, getToken, updateMe, updatePassword, logout as apiLogout, listMyVehicles, getFavorites, getMySellerFollows } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const LABELS = {
  fr: {
    welcomeBack: 'Bon retour',
    quickAccess: 'Accès rapide',
    myListings: 'Mes annonces',
    myListingsHint: 'Gérer mes véhicules',
    myFavorites: 'Mes favoris',
    myFavoritesHint: 'Véhicules sauvegardés',
    publish: 'Publier',
    publishHint: 'Nouvelle annonce',
    title: 'Mon compte',
    subtitle: 'Gérez vos informations personnelles',
    profileSection: 'Informations personnelles',
    name: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    language: 'Langue préférée',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    saved: 'Modifications enregistrées',
    error: 'Erreur lors de la mise à jour',
    accountSection: 'Compte',
    role: 'Rôle',
    memberSince: 'Membre depuis',
    danger: 'Zone de danger',
    logoutBtn: 'Se déconnecter',
    notLogged: 'Vous devez être connecté',
    redirecting: 'Redirection...',
    listings: 'annonces',
    favorites: 'favoris',
    myFollows: 'Mes suivis',
    myFollowsHint: 'Vendeurs que je suis',
    follows: 'suivis',
    securitySection: 'Sécurité',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    changePassword: 'Changer le mot de passe',
    passwordChanged: 'Mot de passe mis à jour',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    passwordHint: 'Minimum 6 caractères',
    noPasswordYet: "Vous n'avez pas encore défini de mot de passe (compte créé via OTP)",
  },
  ar: {
    welcomeBack: 'مرحبا بعودتك',
    quickAccess: 'الوصول السريع',
    myListings: 'إعلاناتي',
    myListingsHint: 'إدارة سياراتي',
    myFavorites: 'المفضلة',
    myFavoritesHint: 'السيارات المحفوظة',
    publish: 'نشر',
    publishHint: 'إعلان جديد',
    title: 'حسابي',
    subtitle: 'إدارة معلوماتك الشخصية',
    profileSection: 'المعلومات الشخصية',
    name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    language: 'اللغة المفضلة',
    save: 'حفظ',
    saving: 'جاري الحفظ...',
    saved: 'تم حفظ التعديلات',
    error: 'خطأ في التحديث',
    accountSection: 'الحساب',
    role: 'الدور',
    memberSince: 'عضو منذ',
    danger: 'منطقة الخطر',
    logoutBtn: 'تسجيل الخروج',
    notLogged: 'يجب أن تكون مسجل دخول',
    redirecting: 'جاري التحويل...',
    listings: 'إعلان',
    favorites: 'مفضلة',
    myFollows: 'متابعاتي',
    myFollowsHint: 'البائعون الذين أتابعهم',
    follows: 'متابعة',
    securitySection: 'الأمان',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور الجديدة',
    changePassword: 'تغيير كلمة المرور',
    passwordChanged: 'تم تحديث كلمة المرور',
    passwordMismatch: 'كلمتا المرور غير متطابقتين',
    passwordHint: '6 أحرف على الأقل',
    noPasswordYet: 'لم تقم بتعيين كلمة مرور بعد (حساب مسجل بـ OTP)',
  },
};

const ROLE_LABELS_FR: Record<string, string> = {
  user: 'Utilisateur', agency_owner: "Propriétaire d'agence", agency_manager: 'Manager agence', moderator: 'Modérateur', admin: 'Administrateur',
};
const ROLE_LABELS_AR: Record<string, string> = {
  user: 'مستخدم', agency_owner: 'مالك وكالة', agency_manager: 'مدير وكالة', moderator: 'مشرف', admin: 'مسؤول',
};

export default function ProfileForm({ lang }: Props) {
  const l = LABELS[lang];
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<'fr' | 'ar' | 'en'>('fr');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [listingsCount, setListingsCount] = useState<number | null>(null);
  const [favCount, setFavCount] = useState<number | null>(null);
  const [followCount, setFollowCount] = useState<number | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setMounted(true);
    const u = getStoredUser();
    if (u) {
      setUser(u);
      setName(u.name || '');
      setEmail(u.email || '');
      setLanguage(u.locale || 'fr');
    }

    if (getToken()) {
      listMyVehicles().then((d: any) => setListingsCount(d?.data?.length || 0)).catch(() => setListingsCount(0));
      getFavorites().then((d: any) => setFavCount(d?.data?.length || 0)).catch(() => setFavCount(0));
      getMySellerFollows().then((d: any) => setFollowCount(d?.data?.length || 0)).catch(() => setFollowCount(0));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess(false);
    try {
      await updateMe({ name, email, language });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) { setError(e?.message || l.error); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    window.location.href = '/' + lang + '/';
  };

  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError(l.passwordMismatch);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(l.passwordHint);
      return;
    }
    setPasswordLoading(true);
    try {
      await updatePassword({
        current_password: currentPassword || undefined,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e: any) {
      setPasswordError(e?.message || l.error);
    } finally { setPasswordLoading(false); }
  };

  if (!mounted) return null;

  if (!user) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '16px' }}></i>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{l.notLogged}</h2>
        <a href={'/' + lang + '/connexion'} style={{ display: 'inline-block', marginTop: '14px', padding: '12px 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>{l.redirecting}</a>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const inputStyle: React.CSSProperties = { width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };

  const roleLabels = lang === 'ar' ? ROLE_LABELS_AR : ROLE_LABELS_FR;
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString(lang === 'ar' ? 'ar-MR' : 'fr-FR', { year: 'numeric', month: 'long' }) : '—';
  const initials = (user.name || '?').split(' ').slice(0, 2).map((s: string) => s[0] || '').join('').toUpperCase();

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem('boursa_token');
    if (!token) return;
    setAvatarUploading(true);
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res = await fetch(import.meta.env.PUBLIC_API_URL + '/me/avatar', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: form,
      });
      const data = await res.json();
      if (data.avatar_url) {
        setUser((prev: any) => ({ ...prev, avatar_url: data.avatar_url }));
      }
    } catch {}
    setAvatarUploading(false);
  }

  const navCards = [
    {
      href: '/' + lang + '/mes-annonces',
      icon: 'fa-car-side',
      color: '#16A34A',
      bg: '#DCFCE7',
      title: l.myListings,
      hint: l.myListingsHint,
      count: listingsCount,
      countLabel: l.listings,
    },
    {
      href: '/' + lang + '/favoris',
      icon: 'fa-heart',
      color: '#DC2626',
      bg: '#FEE2E2',
      title: l.myFavorites,
      hint: l.myFavoritesHint,
      count: favCount,
      countLabel: l.favorites,
    },
    {
      href: '/' + lang + '/mes-suivis',
      icon: 'fa-user-plus',
      color: '#7C3AED',
      bg: '#EDE9FE',
      title: l.myFollows,
      hint: l.myFollowsHint,
      count: followCount,
      countLabel: l.follows,
    },
    {
      href: '/' + lang + '/publier',
      icon: 'fa-plus',
      color: '#D97706',
      bg: '#FEF3C7',
      title: l.publish,
      hint: l.publishHint,
      count: null,
      countLabel: null,
    },
  ];

  return (
    <div style={{ maxWidth: '880px', margin: '40px auto', padding: '0 20px' }}>
      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: '16px', padding: '28px', marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
          <div style={{ width: '64px', height: '64px', background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, overflow: 'hidden' }}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          <label style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #0F172A', zIndex: 10 }}>
            <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} />
            {avatarUploading
              ? <span style={{ color: 'white', fontSize: '8px' }}>...</span>
              : <i className="fa-solid fa-camera" style={{ color: 'white', fontSize: '9px' }}></i>
            }
          </label>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{l.welcomeBack}</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>{user.name}</h1>
          <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0 }}>{user.email || user.phone}</p>
        </div>
      </div>

      {/* NAVIGATION RAPIDE */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l.quickAccess}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {navCards.map((card) => (
            <a key={card.title} href={card.href} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: '44px', height: '44px', background: card.bg, color: card.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={'fa-solid ' + card.icon} style={{ fontSize: '18px' }}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>{card.title}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {card.count !== null ? <><strong style={{ color: card.color }}>{card.count}</strong> {card.countLabel}</> : card.hint}
                </div>
              </div>
              <i className={'fa-solid ' + (lang === 'ar' ? 'fa-chevron-left' : 'fa-chevron-right')} style={{ fontSize: '12px', color: '#94A3B8' }}></i>
            </a>
          ))}
        </div>
      </div>

      {/* INFOS PERSONNELLES */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>{l.profileSection}</h2>

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>{l.saved}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>{error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <label style={labelStyle}>{l.name}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{l.email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} dir="ltr" />
          </div>
          <div>
            <label style={labelStyle}>{l.phone}</label>
            <input type="tel" value={user.phone || ''} disabled style={{ ...inputStyle, background: '#F1F5F9', color: '#64748B' }} dir="ltr" />
          </div>
          <div>
            <label style={labelStyle}>{l.language}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as any)} style={inputStyle}>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} style={{ marginTop: '20px', height: '44px', padding: '0 24px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? l.saving : l.save}
        </button>
      </div>

      {/* SÉCURITÉ */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>{l.securitySection}</h2>

        {passwordSuccess && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>{l.passwordChanged}
          </div>
        )}
        {passwordError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>{passwordError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <label style={labelStyle}>{l.currentPassword}</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} dir="ltr" autoComplete="current-password" />
          </div>
          <div>
            <label style={labelStyle}>{l.newPassword}</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} dir="ltr" autoComplete="new-password" />
          </div>
          <div>
            <label style={labelStyle}>{l.confirmPassword}</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} dir="ltr" autoComplete="new-password" />
          </div>
        </div>

        <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '10px' }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: '4px' }}></i>{l.passwordHint}
        </p>

        <button onClick={handleChangePassword} disabled={passwordLoading || !newPassword} style={{ marginTop: '14px', height: '44px', padding: '0 24px', background: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: (passwordLoading || !newPassword) ? 'not-allowed' : 'pointer', opacity: (passwordLoading || !newPassword) ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-lock"></i>
          {passwordLoading ? l.saving : l.changePassword}
        </button>
      </div>

      {/* INFOS COMPTE */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>{l.accountSection}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <div style={{ ...labelStyle, fontFamily: 'JetBrains Mono, monospace' }}>{l.role}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{roleLabels[user.role] || user.role}</div>
          </div>
          <div>
            <div style={{ ...labelStyle, fontFamily: 'JetBrains Mono, monospace' }}>{l.memberSince}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{memberSince}</div>
          </div>
        </div>
      </div>

      {/* DANGER */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #FECACA', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#991B1B', margin: '0 0 14px' }}>{l.danger}</h2>
        <button onClick={handleLogout} style={{ height: '44px', padding: '0 24px', background: 'white', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          {l.logoutBtn}
        </button>
      </div>
    </div>
  );
}
