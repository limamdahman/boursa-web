import { useState, useEffect } from 'react';
import { getToken, listMyVehicles, deleteMyVehicle } from '@/lib/api';

interface Props {
  lang: 'fr' | 'ar';
}

const L = {
  fr: {
    title: 'Mes annonces',
    subtitle: 'Toutes vos annonces personnelles',
    empty: 'Vous n\'avez pas encore d\'annonce',
    emptyHint: 'Publiez votre première annonce en quelques minutes',
    publish: 'Publier une annonce',
    loading: 'Chargement...',
    pendingHint: 'Visible après modération',
    rejectedHint: 'Annonce refusée',
    status: { pending: 'En attente', active: 'Active', draft: 'Brouillon', sold: 'Vendue', rejected: 'Refusée', expired: 'Expirée' },
    notLogged: 'Vous devez être connecté',
    loginBtn: 'Se connecter',
    edit: 'Modifier',
    delete: 'Supprimer',
    view: 'Voir',
    confirmDelete: 'Supprimer cette annonce ?',
    confirmDeleteHint: 'Cette action est irréversible.',
    cancel: 'Annuler',
    deleteConfirm: 'Oui, supprimer',
    deleted: 'Annonce supprimée',
  },
  ar: {
    title: 'إعلاناتي',
    subtitle: 'جميع إعلاناتك الشخصية',
    empty: 'ليس لديك أي إعلان بعد',
    emptyHint: 'انشر أول إعلان لك في دقائق',
    publish: 'نشر إعلان',
    loading: 'جاري التحميل...',
    pendingHint: 'يظهر بعد المراجعة',
    rejectedHint: 'الإعلان مرفوض',
    status: { pending: 'في انتظار المراجعة', active: 'نشط', draft: 'مسودة', sold: 'مباع', rejected: 'مرفوض', expired: 'منتهي' },
    notLogged: 'يجب أن تكون مسجل دخول',
    loginBtn: 'تسجيل الدخول',
    edit: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    confirmDelete: 'حذف هذا الإعلان؟',
    confirmDeleteHint: 'هذا الإجراء لا يمكن التراجع عنه.',
    cancel: 'إلغاء',
    deleteConfirm: 'نعم، حذف',
    deleted: 'تم حذف الإعلان',
  },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  active: { bg: '#DCFCE7', color: '#166534' },
  draft: { bg: '#F1F5F9', color: '#475569' },
  sold: { bg: '#E0E7FF', color: '#3730A3' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
  expired: { bg: '#F1F5F9', color: '#94A3B8' },
};

export default function MyVehiclesList({ lang }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const loadVehicles = () => {
    setLoading(true);
    listMyVehicles().then((d: any) => {
      setVehicles(d?.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    setMounted(true);
    if (!getToken()) return;
    loadVehicles();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMyVehicle(deleteTarget.id);
      setVehicles(vehicles.filter((v: any) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

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

  const fmtPrice = (n: number) => new Intl.NumberFormat(lang === 'ar' ? 'en-US' : 'fr-FR').format(n);
  const btnSmall: React.CSSProperties = {
    flex: 1, padding: '8px 10px', fontSize: '12px', fontWeight: 700,
    borderRadius: '6px', cursor: 'pointer', border: 'none',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
    textDecoration: 'none',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>{l.title}</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            {loading ? l.loading : vehicles.length + ' ' + (lang === 'ar' ? 'إعلان' : 'annonce' + (vehicles.length > 1 ? 's' : ''))}
          </p>
        </div>
        <a href={'/' + lang + '/publier'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
          <i className="fa-solid fa-plus" style={{ fontSize: '12px' }}></i>
          {l.publish}
        </a>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#64748B' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
        </div>
      ) : vehicles.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', padding: '80px 20px' }}>
          <i className="fa-solid fa-car-side" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '16px' }}></i>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>{l.empty}</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px' }}>{l.emptyHint}</p>
          <a href={'/' + lang + '/publier'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            <i className="fa-solid fa-plus" style={{ fontSize: '12px' }}></i>
            {l.publish}
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {vehicles.map((v: any) => {
            const statusColors = STATUS_COLORS[v.status] || STATUS_COLORS.draft;
            const statusLabel = (l.status as any)[v.status] || v.status;
            const brandName = v.brand?.name || '';
            const modelName = v.vehicle_model?.name || v.vehicleModel?.name || '';
            const detailUrl = '/' + lang + '/vehicules/' + v.id;
            const editUrl = '/' + lang + '/mes-annonces/' + v.id + '/modifier';
            const coverMedia = (v.media || []).find((m: any) => m.is_cover) || (v.media || [])[0];
            const cover = v.cover_image || coverMedia?.url_thumb || coverMedia?.url_webp_md || coverMedia?.url_original;

            return (
              <div key={v.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/10', background: '#F1F5F9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {cover ? (
                    <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fa-solid fa-car" style={{ fontSize: '32px', color: '#CBD5E1' }}></i>
                  )}
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: statusColors.bg, color: statusColors.color, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {statusLabel}
                  </span>
                </div>
                <div style={{ padding: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{brandName} {modelName}</h3>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
                    <span dir="ltr">{v.year}</span>
                    {v.mileage_km ? <> · <span dir="ltr">{fmtPrice(v.mileage_km)} km</span></> : null}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#D97706' }}>
                    <span dir="ltr">{fmtPrice(v.price_mru)}</span>
                    <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '4px' }}>MRU</span>
                  </div>
                  {v.status === 'pending' && (
                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-solid fa-clock" style={{ fontSize: '10px' }}></i>
                      {l.pendingHint}
                    </div>
                  )}
                  {v.status === 'rejected' && (
                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-solid fa-circle-xmark" style={{ fontSize: '10px' }}></i>
                      {l.rejectedHint}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                    {v.status === 'active' && (
                      <a href={detailUrl} style={{ ...btnSmall, background: '#F1F5F9', color: '#0F172A' }}>
                        <i className="fa-solid fa-eye" style={{ fontSize: '11px' }}></i>
                        {l.view}
                      </a>
                    )}
                    <a href={editUrl} style={{ ...btnSmall, background: '#F1F5F9', color: '#0F172A' }}>
                      <i className="fa-solid fa-pen" style={{ fontSize: '11px' }}></i>
                      {l.edit}
                    </a>
                    <button onClick={() => setDeleteTarget(v)} style={{ ...btnSmall, background: '#FEF2F2', color: '#DC2626' }}>
                      <i className="fa-solid fa-trash" style={{ fontSize: '11px' }}></i>
                      {l.delete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => !deleting && setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%' }}>
            <div style={{ width: '48px', height: '48px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '20px', color: '#DC2626' }}></i>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', textAlign: 'center', margin: '0 0 6px' }}>{l.confirmDelete}</h3>
            <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', margin: '0 0 20px' }}>{l.confirmDeleteHint}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>{l.cancel}</button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '12px', background: '#DC2626', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? '...' : l.deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
