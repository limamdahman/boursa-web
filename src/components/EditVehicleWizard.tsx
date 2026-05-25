import { useState, useEffect } from 'react';
import { getToken, listBrands, listCities, getMyVehicle, updateMyVehicle, uploadMyVehicleMedia, deleteMyVehicleMedia, setMyVehicleCover } from '@/lib/api';

const FIELD_LABELS: Record<string, { fr: string; ar: string }> = {
  brand_id: { fr: 'la marque', ar: 'الماركة' },
  vehicle_model_id: { fr: 'le modèle', ar: 'الموديل' },
  year: { fr: "l'année", ar: 'السنة' },
  price_mru: { fr: 'le prix', ar: 'السعر' },
  mileage_km: { fr: 'le kilométrage', ar: 'الكيلومترات' },
  city_id: { fr: 'la ville', ar: 'المدينة' },
  description_fr: { fr: 'la description', ar: 'الوصف' },
  description_ar: { fr: 'la description arabe', ar: 'الوصف العربي' },
  color: { fr: 'la couleur', ar: 'اللون' },
  fuel: { fr: 'le carburant', ar: 'الوقود' },
  transmission: { fr: 'la boîte', ar: 'ناقل الحركة' },
  body_type: { fr: 'la carrosserie', ar: 'الهيكل' },
  condition: { fr: "l'état", ar: 'الحالة' },
};

function translateErrors(errors: Record<string, string[]>, lang: 'fr' | 'ar'): string[] {
  const messages: string[] = [];
  for (const [field, codes] of Object.entries(errors)) {
    const label = FIELD_LABELS[field]?.[lang] || field;
    for (const code of codes) {
      if (code.includes('required')) {
        messages.push(lang === 'ar' ? 'يرجى ملء ' + label : 'Veuillez renseigner ' + label);
      } else if (code === 'validation.min.numeric') {
        if (field === 'price_mru') {
          messages.push(lang === 'ar' ? 'السعر يجب أن يكون 50,000 أوقية على الأقل' : "Le prix doit être d'au moins 50 000 MRU");
        } else if (field === 'year') {
          messages.push(lang === 'ar' ? 'السنة يجب أن تكون 1980 على الأقل' : "L'année doit être au moins 1980");
        } else {
          messages.push(lang === 'ar' ? label + ' صغير جدا' : label + ' est trop petit');
        }
      } else if (code === 'validation.max.numeric') {
        messages.push(lang === 'ar' ? label + ' كبير جدا' : label + ' est trop grand');
      } else if (code.includes('integer') || code.includes('numeric')) {
        messages.push(lang === 'ar' ? label + ' يجب أن يكون رقما' : label + ' doit être un nombre');
      } else if (code.includes('exists')) {
        messages.push(lang === 'ar' ? label + ' غير صالح' : label + " n'est pas valide");
      } else {
        messages.push(lang === 'ar' ? label + ' غير صالح' : label + " n'est pas valide");
      }
    }
  }
  return messages;
}


interface Props {
  lang: 'fr' | 'ar';
  vehicleId: string;
}

const L = {
  fr: {
    title: 'Modifier l\'annonce',
    subtitle: 'Mettez à jour les informations de votre véhicule',
    save: 'Enregistrer les modifications',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    success: 'Annonce mise à jour avec succès',
    backToList: 'Retour à mes annonces',
    loading: 'Chargement...',
    notLogged: 'Vous devez être connecté',
    loginBtn: 'Se connecter',
    notFound: 'Annonce introuvable',
    rejectedNotice: 'Cette annonce avait été refusée. Après modification, elle repassera en attente de modération.',
    brand: 'Marque', model: 'Modèle', year: 'Année', condition: 'État',
    conditions: { new: 'Neuf', used: 'Occasion', imported: 'Importé' },
    mileage: 'Kilométrage (km)', color: 'Couleur',
    fuel: 'Carburant',
    fuels: { gasoline: 'Essence', diesel: 'Diesel', hybrid: 'Hybride', electric: 'Électrique', lpg: 'GPL' },
    transmission: 'Boîte',
    transmissions: { manual: 'Manuelle', automatic: 'Automatique' },
    bodyType: 'Carrosserie',
    bodyTypes: { sedan: 'Berline', suv: 'SUV', pickup: 'Pickup', hatchback: 'Compacte', van: 'Utilitaire', coupe: 'Coupé' },
    price: 'Prix (MRU)', negotiable: 'Prix négociable',
    city: 'Ville', descFr: 'Description (français)', descAr: 'Description (arabe)',
    descPlaceholder: 'Décrivez votre véhicule...',
    selectPlaceholder: '— Choisir —',
    photos: 'Photos',
    addPhotos: 'Ajouter des photos',
    photosHint: 'JPG, PNG, WebP — max 10 photos, 15MB max chacune',
    setCover: 'Définir comme couverture',
    deletePhoto: 'Supprimer cette photo',
    uploading: 'Upload en cours...',
    cover: 'Couverture',
    error: 'Erreur lors de la sauvegarde',
  },
  ar: {
    title: 'تعديل الإعلان',
    subtitle: 'حدث معلومات سيارتك',
    save: 'حفظ التعديلات',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    success: 'تم تحديث الإعلان بنجاح',
    backToList: 'العودة إلى إعلاناتي',
    loading: 'جاري التحميل...',
    notLogged: 'يجب أن تكون مسجل دخول',
    loginBtn: 'تسجيل الدخول',
    notFound: 'الإعلان غير موجود',
    rejectedNotice: 'تم رفض هذا الإعلان سابقا. بعد التعديل، سيعود إلى قائمة الانتظار للمراجعة.',
    brand: 'الماركة', model: 'الموديل', year: 'السنة', condition: 'الحالة',
    conditions: { new: 'جديد', used: 'مستعمل', imported: 'مستورد' },
    mileage: 'الكيلومترات', color: 'اللون',
    fuel: 'الوقود',
    fuels: { gasoline: 'بنزين', diesel: 'ديزل', hybrid: 'هايبرد', electric: 'كهربائي', lpg: 'غاز' },
    transmission: 'ناقل الحركة',
    transmissions: { manual: 'يدوي', automatic: 'أوتوماتيكي' },
    bodyType: 'الهيكل',
    bodyTypes: { sedan: 'سيدان', suv: 'دفع رباعي', pickup: 'بيك أب', hatchback: 'هاتشباك', van: 'فان', coupe: 'كوبيه' },
    price: 'السعر (أوقية)', negotiable: 'السعر قابل للتفاوض',
    city: 'المدينة', descFr: 'الوصف (فرنسي)', descAr: 'الوصف (عربي)',
    descPlaceholder: 'صف سيارتك...',
    selectPlaceholder: '— اختر —',
    photos: 'الصور',
    addPhotos: 'إضافة صور',
    photosHint: 'JPG, PNG, WebP — 10 صور كحد أقصى',
    setCover: 'تعيين كصورة رئيسية',
    deletePhoto: 'حذف هذه الصورة',
    uploading: 'جاري التحميل...',
    cover: 'الرئيسية',
    error: 'خطأ أثناء الحفظ',
  },
};

export default function EditVehicleWizard({ lang, vehicleId }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [vehicle, setVehicle] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [photos, setPhotos] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoActionId, setPhotoActionId] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    brand_id: '', vehicle_model_id: '', year: '', condition: 'used',
    mileage_km: '', fuel: '', transmission: '', body_type: '', color: '',
    price_mru: '', price_negotiable: false, city_id: '',
    description_fr: '', description_ar: '',
  });

  useEffect(() => {
    setMounted(true);
    if (!getToken()) return;

    Promise.all([
      getMyVehicle(vehicleId).catch(() => null),
      listBrands().catch(() => []),
      listCities().catch(() => []),
    ]).then(([v, b, c]) => {
      if (v) {
        setVehicle(v);
        setPhotos(v.media || []);
        setForm({
          brand_id: v.brand_id || '',
          vehicle_model_id: v.vehicle_model_id || '',
          year: v.year || '',
          condition: v.condition || 'used',
          mileage_km: v.mileage_km || '',
          fuel: v.fuel || '',
          transmission: v.transmission || '',
          body_type: v.body_type || '',
          color: v.color || '',
          price_mru: v.price_mru || '',
          price_negotiable: !!v.price_negotiable,
          city_id: v.city_id || '',
          description_fr: v.description_fr || '',
          description_ar: v.description_ar || '',
        });
      }
      setBrands(b);
      setCities(c);
      setLoading(false);
    });
  }, [vehicleId]);

  useEffect(() => {
    if (!form.brand_id) { setModels([]); return; }
    fetch('http://localhost:8000/api/v1/brands/' + form.brand_id + '/models')
      .then(r => r.json()).then(d => setModels(d?.data ?? []))
      .catch(() => setModels([]));
  }, [form.brand_id]);

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload: any = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === null) delete payload[k];
        else if (['brand_id', 'vehicle_model_id', 'year', 'mileage_km', 'price_mru', 'city_id'].includes(k)) {
          payload[k] = parseInt(payload[k], 10);
        }
      });
      await updateMyVehicle(vehicleId, payload);
      setSuccess(true);
      setTimeout(() => { window.location.href = '/' + lang + '/mes-annonces'; }, 1500);
    } catch (e: any) {
      if (e?.errors && typeof e.errors === 'object') {
        const messages = translateErrors(e.errors, lang);
        setError(messages.join(' • '));
      } else {
        setError(e?.message || l.error);
      }
    } finally { setSaving(false); }
  };

  const handleUploadPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingPhoto(true);
    setError('');
    try {
      const arr = Array.from(files).slice(0, 10 - photos.length);
      for (let i = 0; i < arr.length; i++) {
        const result: any = await uploadMyVehicleMedia(vehicleId, arr[i], photos.length === 0 && i === 0);
        if (result?.media) {
          setPhotos((prev) => [...prev, result.media]);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Erreur upload');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (mediaId: string) => {
    setPhotoActionId(mediaId);
    try {
      await deleteMyVehicleMedia(vehicleId, mediaId);
      setPhotos((prev) => prev.filter((p: any) => p.id !== mediaId));
    } catch (e: any) {
      setError(e?.message || 'Erreur suppression photo');
    } finally {
      setPhotoActionId(null);
    }
  };

  const handleSetCover = async (mediaId: string) => {
    setPhotoActionId(mediaId);
    try {
      await setMyVehicleCover(vehicleId, mediaId);
      setPhotos((prev) => prev.map((p: any) => ({ ...p, is_cover: p.id === mediaId })));
    } catch (e: any) {
      setError(e?.message || 'Erreur cover');
    } finally {
      setPhotoActionId(null);
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#64748B' }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i></div>;
  }

  if (!vehicle) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #FECACA', textAlign: 'center' }}>
        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '32px', color: '#DC2626', marginBottom: '16px' }}></i>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{l.notFound}</h2>
        <a href={'/' + lang + '/mes-annonces'} style={{ display: 'inline-block', marginTop: '14px', padding: '12px 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>{l.backToList}</a>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <i className="fa-solid fa-check" style={{ fontSize: '28px', color: 'white' }}></i>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{l.success}</h2>
      </div>
    );
  }

  const input: React.CSSProperties = { width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };
  const label: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' };
  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' };

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <a href={'/' + lang + '/mes-annonces'} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', textDecoration: 'none', marginBottom: '12px' }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: '11px' }}></i>
          {l.backToList}
        </a>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>{l.title}</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{l.subtitle}</p>
      </div>

      {vehicle.status === 'rejected' && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <i className="fa-solid fa-circle-info" style={{ fontSize: '14px', marginTop: '2px' }}></i>
          <span>{l.rejectedNotice}</span>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '16px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>{error}
          </div>
        )}

        <div style={grid2}>
          <div>
            <label style={label}>{l.brand}</label>
            <select value={form.brand_id} onChange={(e) => update('brand_id', e.target.value)} style={input}>
              <option value="">{l.selectPlaceholder}</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>{l.model}</label>
            <select value={form.vehicle_model_id} onChange={(e) => update('vehicle_model_id', e.target.value)} style={input} disabled={!form.brand_id}>
              <option value="">{l.selectPlaceholder}</option>
              {models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>{l.year}</label>
            <input type="number" min="1980" max="2030" value={form.year} onChange={(e) => update('year', e.target.value)} style={input} dir="ltr" />
          </div>
          <div>
            <label style={label}>{l.condition}</label>
            <select value={form.condition} onChange={(e) => update('condition', e.target.value)} style={input}>
              {Object.entries(l.conditions).map(([k, v]: any) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>{l.mileage}</label>
            <input type="number" value={form.mileage_km} onChange={(e) => update('mileage_km', e.target.value)} style={input} dir="ltr" />
          </div>
          <div>
            <label style={label}>{l.color}</label>
            <input type="text" value={form.color} onChange={(e) => update('color', e.target.value)} style={input} />
          </div>
          <div>
            <label style={label}>{l.fuel}</label>
            <select value={form.fuel} onChange={(e) => update('fuel', e.target.value)} style={input}>
              <option value="">{l.selectPlaceholder}</option>
              {Object.entries(l.fuels).map(([k, v]: any) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>{l.transmission}</label>
            <select value={form.transmission} onChange={(e) => update('transmission', e.target.value)} style={input}>
              <option value="">{l.selectPlaceholder}</option>
              {Object.entries(l.transmissions).map(([k, v]: any) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>{l.bodyType}</label>
            <select value={form.body_type} onChange={(e) => update('body_type', e.target.value)} style={input}>
              <option value="">{l.selectPlaceholder}</option>
              {Object.entries(l.bodyTypes).map(([k, v]: any) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>{l.city}</label>
            <select value={form.city_id} onChange={(e) => update('city_id', e.target.value)} style={input}>
              <option value="">{l.selectPlaceholder}</option>
              {cities.map((c: any) => <option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name_fr}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E2E8F0' }}>
          <label style={label}>{l.photos} ({photos.length}/10)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '10px' }}>
            {photos.map((p: any) => {
              const url = p.url_thumb || p.url_webp_md || p.url_original;
              const isBusy = photoActionId === p.id;
              return (
                <div key={p.id} style={{ position: 'relative', aspectRatio: '1', background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden', border: p.is_cover ? '2px solid #16A34A' : '1px solid #E2E8F0', opacity: isBusy ? 0.5 : 1 }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {p.is_cover && (
                    <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#16A34A', color: 'white', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {l.cover}
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                    {!p.is_cover && (
                      <button type="button" onClick={() => handleSetCover(p.id)} disabled={isBusy} title={l.setCover} style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                        <i className="fa-solid fa-star" style={{ fontSize: '10px' }}></i>
                      </button>
                    )}
                    <button type="button" onClick={() => handleDeletePhoto(p.id)} disabled={isBusy} title={l.deletePhoto} style={{ width: '24px', height: '24px', background: 'rgba(220,38,38,0.95)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <i className="fa-solid fa-trash" style={{ fontSize: '9px' }}></i>
                    </button>
                  </div>
                </div>
              );
            })}
            {photos.length < 10 && (
              <label htmlFor="edit-photos-upload" style={{ aspectRatio: '1', border: '2px dashed #CBD5E1', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploadingPhoto ? 'not-allowed' : 'pointer', background: '#F8FAFC', color: '#64748B', gap: '4px' }}>
                {uploadingPhoto ? (
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '18px' }}></i>
                ) : (
                  <>
                    <i className="fa-solid fa-plus" style={{ fontSize: '16px' }}></i>
                    <span style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center', padding: '0 4px' }}>{l.addPhotos}</span>
                  </>
                )}
                <input id="edit-photos-upload" type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={(e) => handleUploadPhotos(e.target.files)} disabled={uploadingPhoto} />
              </label>
            )}
          </div>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>{l.photosHint}</p>
        </div>

        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E2E8F0' }}>
          <label style={label}>{l.price}</label>
          <input type="number" value={form.price_mru} onChange={(e) => update('price_mru', e.target.value)} style={input} dir="ltr" />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.price_negotiable} onChange={(e) => update('price_negotiable', e.target.checked)} />
            {l.negotiable}
          </label>
        </div>

        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E2E8F0' }}>
          <label style={label}>{l.descFr}</label>
          <textarea value={form.description_fr} onChange={(e) => update('description_fr', e.target.value)} placeholder={l.descPlaceholder} style={{ ...input, height: '100px', padding: '12px 14px', resize: 'vertical' }} dir="ltr" />
          <label style={{ ...label, marginTop: '12px' }}>{l.descAr}</label>
          <textarea value={form.description_ar} onChange={(e) => update('description_ar', e.target.value)} placeholder={l.descPlaceholder} style={{ ...input, height: '100px', padding: '12px 14px', resize: 'vertical' }} dir="rtl" />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <a href={'/' + lang + '/mes-annonces'} style={{ padding: '12px 24px', background: 'white', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          {l.cancel}
        </a>
        <button onClick={handleSave} disabled={saving} style={{ padding: '12px 28px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? l.saving : l.save}
        </button>
      </div>
    </div>
  );
}
