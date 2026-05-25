import { useState, useEffect } from 'react';
import { getToken, canReviewVehicle, submitReview, getUserReviews, getUserRatingSummary, getAgencyReviews, getAgencyRatingSummary } from '@/lib/api';
import StarRating from './StarRating';

interface Props {
  lang: 'fr' | 'ar';
  vehicleId: string;
  sellerType: 'user' | 'agency';
  sellerId: string;
}

const L = {
  fr: {
    title: 'Avis sur ce vendeur',
    noReviews: 'Aucun avis pour le moment',
    leaveReview: 'Laisser un avis',
    editReview: 'Modifier mon avis',
    rating: 'Note',
    comment: 'Commentaire (optionnel)',
    commentPh: 'Partagez votre expérience...',
    submit: 'Publier l\'avis',
    submitting: 'Publication...',
    success: 'Avis publié',
    error: 'Erreur lors de la publication',
    cantReviewNoLead: 'Vous devez contacter le vendeur avant de laisser un avis',
    cantReviewOwn: 'Vous ne pouvez pas évaluer votre propre annonce',
    loginToReview: 'Connectez-vous pour laisser un avis',
    avg: 'Note moyenne',
    based: 'basée sur',
    review: 'avis',
    reviews: 'avis',
    cancel: 'Annuler',
  },
  ar: {
    title: 'تقييمات هذا البائع',
    noReviews: 'لا توجد تقييمات حاليا',
    leaveReview: 'اترك تقييما',
    editReview: 'تعديل تقييمي',
    rating: 'التقييم',
    comment: 'تعليق (اختياري)',
    commentPh: 'شارك تجربتك...',
    submit: 'نشر التقييم',
    submitting: 'جاري النشر...',
    success: 'تم نشر التقييم',
    error: 'خطأ أثناء النشر',
    cantReviewNoLead: 'يجب الاتصال بالبائع قبل ترك تقييم',
    cantReviewOwn: 'لا يمكنك تقييم إعلانك الخاص',
    loginToReview: 'سجل دخولك لترك تقييم',
    avg: 'متوسط التقييم',
    based: 'بناء على',
    review: 'تقييم',
    reviews: 'تقييمات',
    cancel: 'إلغاء',
  },
};

export default function ReviewsSection({ lang, vehicleId, sellerType, sellerId }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<{ count: number; average: number }>({ count: 0, average: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState<{ can_review: boolean; reason?: string; existing_review?: any }>({ can_review: false });
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const reload = async () => {
    try {
      const [sum, list] = await Promise.all([
        sellerType === 'user' ? getUserRatingSummary(sellerId) : getAgencyRatingSummary(sellerId),
        sellerType === 'user' ? getUserReviews(sellerId) : getAgencyReviews(sellerId),
      ]);
      setSummary({ count: sum.count || 0, average: sum.average || 0 });
      setReviews(list?.data || []);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    reload();
    if (getToken()) {
      canReviewVehicle(vehicleId).then((r: any) => {
        setCanReview(r);
        if (r?.existing_review) {
          setRating(r.existing_review.rating);
          setComment(r.existing_review.comment || '');
        }
      });
    }
  }, [vehicleId, sellerId]);

  if (!mounted) return null;

  const handleSubmit = async () => {
    setSubmitting(true); setError(''); setSuccessMessage('');
    try {
      await submitReview({ vehicle_id: vehicleId, rating, comment: comment.trim() || undefined });
      setSuccessMessage(l.success);
      setShowForm(false);
      await reload();
      // Refresh can_review (pour avoir l'existing_review mis à jour)
      const newCan = await canReviewVehicle(vehicleId);
      setCanReview(newCan);
    } catch (e: any) {
      setError(e?.message || l.error);
    } finally { setSubmitting(false); }
  };

  const fmtDate = (s: string) => new Date(s).toLocaleDateString(lang === 'ar' ? 'ar-MR' : 'fr-FR', { year: 'numeric', month: 'long' });

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>{l.title}</h2>

      {summary.count > 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#FFFBEB', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A' }}>{summary.average.toFixed(1)}</div>
          <div>
            <StarRating value={Math.round(summary.average)} readonly size={16} />
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              {l.based} <strong style={{ color: '#0F172A' }}>{summary.count}</strong> {summary.count > 1 ? l.reviews : l.review}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', textAlign: 'center', color: '#64748B', fontSize: '13px', marginBottom: '16px' }}>
          {l.noReviews}
        </div>
      )}

      {/* Form section : visible si user connecté et autorisé */}
      {getToken() && canReview.can_review && (
        <>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '12px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginBottom: '16px' }}>
              <i className="fa-solid fa-pen" style={{ marginRight: '6px', fontSize: '11px' }}></i>
              {canReview.existing_review ? l.editReview : l.leaveReview}
            </button>
          ) : (
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px' }}>{error}</div>
              )}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>{l.rating}</label>
              <div style={{ marginBottom: '14px' }}>
                <StarRating value={rating} onChange={setRating} size={28} />
              </div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>{l.comment}</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={l.commentPh} maxLength={2000} style={{ width: '100%', minHeight: '80px', padding: '10px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => { setShowForm(false); setError(''); }} disabled={submitting} style={{ flex: 1, padding: '10px', background: 'white', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>{l.cancel}</button>
                <button onClick={handleSubmit} disabled={submitting} style={{ flex: 1, padding: '10px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? l.submitting : l.submit}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Hints */}
      {!getToken() && (
        <div style={{ padding: '10px 12px', background: '#F0F9FF', borderRadius: '6px', fontSize: '12px', color: '#0369A1', marginBottom: '16px' }}>
          <i className="fa-solid fa-info-circle" style={{ marginRight: '6px' }}></i>
          <a href={'/' + lang + '/connexion'} style={{ color: '#0369A1', fontWeight: 700 }}>{l.loginToReview}</a>
        </div>
      )}
      {getToken() && !canReview.can_review && canReview.reason === 'no_lead' && (
        <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: '6px', fontSize: '12px', color: '#92400E', marginBottom: '16px' }}>
          <i className="fa-solid fa-info-circle" style={{ marginRight: '6px' }}></i>
          {l.cantReviewNoLead}
        </div>
      )}
      {getToken() && !canReview.can_review && canReview.reason === 'own_vehicle' && (
        <div style={{ padding: '10px 12px', background: '#F0F9FF', borderRadius: '6px', fontSize: '12px', color: '#0369A1', marginBottom: '16px' }}>
          <i className="fa-solid fa-info-circle" style={{ marginRight: '6px' }}></i>
          {l.cantReviewOwn}
        </div>
      )}

      {successMessage && (
        <div style={{ padding: '10px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>{successMessage}
        </div>
      )}

      {/* Liste des reviews */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {reviews.map((r: any) => (
          <div key={r.id} style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', background: '#16A34A', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  {(r.reviewer?.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{r.reviewer?.name || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{fmtDate(r.created_at)}</div>
                </div>
              </div>
              <StarRating value={r.rating} readonly size={14} />
            </div>
            {r.comment && (
              <p style={{ fontSize: '13px', color: '#475569', margin: '6px 0 0', lineHeight: 1.5 }}>{r.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
