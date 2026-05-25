import { useState, useEffect } from 'react';
import { getToken, listBrands, listCities, createMyVehicle, uploadMyVehicleMedia } from '@/lib/api';

// Mapper d'erreurs bilingue : transforme codes Laravel en messages clairs
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
      // Codes de validation Laravel les plus courants
      if (code.includes('required')) {
        messages.push(lang === 'ar'
          ? 'يرجى ملء ' + label
          : 'Veuillez renseigner ' + label);
      } else if (code === 'validation.min.numeric') {
        // Min spécifique selon le champ
        if (field === 'price_mru') {
          messages.push(lang === 'ar'
            ? 'السعر يجب أن يكون 50,000 أوقية على الأقل'
            : 'Le prix doit être d\'au moins 50 000 MRU');
        } else if (field === 'year') {
          messages.push(lang === 'ar'
            ? 'السنة يجب أن تكون 1980 على الأقل'
            : 'L\'année doit être au moins 1980');
        } else {
          messages.push(lang === 'ar'
            ? label + ' صغير جدا'
            : label + ' est trop petit');
        }
      } else if (code === 'validation.max.numeric') {
        messages.push(lang === 'ar' ? label + ' كبير جدا' : label + ' est trop grand');
      } else if (code.includes('integer') || code.includes('numeric')) {
        messages.push(lang === 'ar'
          ? label + ' يجب أن يكون رقما'
          : label + ' doit être un nombre');
      } else if (code.includes('exists')) {
        messages.push(lang === 'ar'
          ? label + ' غير صالح'
          : label + ' n\'est pas valide');
      } else if (code.includes('image') || code.includes('mimes')) {
        messages.push(lang === 'ar'
          ? 'الصورة بصيغة غير مدعومة (JPG, PNG, WebP فقط)'
          : 'Format d\'image non supporté (JPG, PNG, WebP uniquement)');
      } else if (code.includes('max.file')) {
        messages.push(lang === 'ar'
          ? 'حجم الصورة كبير جدا (15 ميجا حد أقصى)'
          : 'Photo trop volumineuse (15 Mo max)');
      } else {
        // Fallback générique
        messages.push(lang === 'ar'
          ? label + ' غير صالح'
          : label + ' n\'est pas valide');
      }
    }
  }

  return messages;
}


interface Props {
  lang: 'fr' | 'ar';
}

const L = {
  fr: {
    title: 'Publier une annonce',
    subtitle: 'Vendez votre véhicule en quelques étapes',
    steps: ['Véhicule', 'Caractéristiques', 'Photos', 'Description'],
    next: 'Suivant',
    prev: 'Précédent',
    submit: 'Publier mon annonce',
    submitting: 'Publication en cours...',
    brand: 'Marque',
    model: 'Modèle',
    year: 'Année',
    condition: 'État',
    conditions: { new: 'Neuf', used: 'Occasion', imported: 'Importé' },
    mileage: 'Kilométrage (km)',
    fuel: 'Carburant',
    fuels: { gasoline: 'Essence', diesel: 'Diesel', hybrid: 'Hybride', electric: 'Électrique', lpg: 'GPL' },
    transmission: 'Boîte',
    transmissions: { manual: 'Manuelle', automatic: 'Automatique' },
    bodyType: 'Carrosserie',
    bodyTypes: { sedan: 'Berline', suv: 'SUV', pickup: 'Pickup', hatchback: 'Compacte', van: 'Utilitaire', coupe: 'Coupé' },
    color: 'Couleur',
    price: 'Prix (MRU)',
    negotiable: 'Prix négociable',
    city: 'Ville',
    photos: 'Photos',
    photosHint: 'Glissez vos photos ici ou cliquez pour parcourir (max 10, jpg/png/webp, 15MB max)',
    photosCount: 'photos sélectionnées',
    descFr: 'Description (français)',
    descAr: 'Description (arabe — optionnel)',
    descPlaceholder: 'Décrivez votre véhicule, son entretien, ses options...',
    selectPlaceholder: '— Choisir —',
    requiredField: 'Champ requis',
    success: 'Annonce créée ! Elle sera visible après modération.',
    successHint: 'Vous serez notifié dès qu\'elle sera approuvée.',
    viewMy: 'Voir mes annonces',
    backHome: 'Retour à l\'accueil',
    notLogged: 'Vous devez être connecté pour publier.',
    loginBtn: 'Se connecter',
  },
  ar: {
    title: 'نشر إعلان',
    subtitle: 'بع سيارتك في خطوات بسيطة',
    steps: ['السيارة', 'المواصفات', 'الصور', 'الوصف'],
    next: 'التالي',
    prev: 'السابق',
    submit: 'نشر الإعلان',
    submitting: 'جاري النشر...',
    brand: 'الماركة',
    model: 'الموديل',
    year: 'السنة',
    condition: 'الحالة',
    conditions: { new: 'جديد', used: 'مستعمل', imported: 'مستورد' },
    mileage: 'الكيلومترات',
    fuel: 'الوقود',
    fuels: { gasoline: 'بنزين', diesel: 'ديزل', hybrid: 'هايبرد', electric: 'كهربائي', lpg: 'غاز' },
    transmission: 'ناقل الحركة',
    transmissions: { manual: 'يدوي', automatic: 'أوتوماتيكي' },
    bodyType: 'الهيكل',
    bodyTypes: { sedan: 'سيدان', suv: 'دفع رباعي', pickup: 'بيك أب', hatchback: 'هاتشباك', van: 'فان', coupe: 'كوبيه' },
    color: 'اللون',
    price: 'السعر (أوقية)',
    negotiable: 'السعر قابل للتفاوض',
    city: 'المدينة',
    photos: 'الصور',
    photosHint: 'اسحب صورك هنا أو انقر للتصفح (10 صور كحد أقصى)',
    photosCount: 'صورة محددة',
    descFr: 'الوصف (فرنسي)',
    descAr: 'الوصف (عربي)',
    descPlaceholder: 'صف سيارتك، صيانتها، خياراتها...',
    selectPlaceholder: '— اختر —',
    requiredField: 'حقل مطلوب',
    success: 'تم إنشاء الإعلان! سيظهر بعد المراجعة.',
    successHint: 'سيتم إشعارك بمجرد الموافقة.',
    viewMy: 'عرض إعلاناتي',
    backHome: 'العودة للرئيسية',
    notLogged: 'يجب تسجيل الدخول للنشر.',
    loginBtn: 'تسجيل الدخول',
  },
};

export default function PublishWizard({ lang }: Props) {
  const l = L[lang];
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<any>({
    brand_id: '', vehicle_model_id: '', year: '', condition: 'used',
    mileage_km: '', fuel: '', transmission: '', body_type: '', color: '',
    price_mru: '', price_negotiable: false, city_id: '',
    description_fr: '', description_ar: '',
  });

  useEffect(() => {
    setMounted(true);
    if (!getToken()) return;
    Promise.all([listBrands().catch(() => []), listCities().catch(() => [])])
      .then(([b, c]) => { setBrands(b); setCities(c); });
  }, []);

  useEffect(() => {
    if (!form.brand_id) { setModels([]); return; }
    fetch('http://localhost:8000/api/v1/brands/' + form.brand_id + '/models')
      .then(r => r.json()).then(d => setModels(d?.data ?? []))
      .catch(() => setModels([]));
  }, [form.brand_id]);

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const validateStep = (s: number): boolean => {
    setError('');
    if (s === 0) {
      if (!form.brand_id || !form.vehicle_model_id || !form.year) {
        setError(l.requiredField); return false;
      }
    }
    if (s === 1) {
      if (!form.price_mru) { setError(l.requiredField); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setLoading(true); setError('');
    try {
      const payload: any = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === null) delete payload[k];
        else if (['brand_id', 'vehicle_model_id', 'year', 'mileage_km', 'price_mru', 'city_id'].includes(k)) {
          payload[k] = parseInt(payload[k], 10);
        }
      });

      const result = await createMyVehicle(payload);
      const vehicleId = result?.data?.id;

      if (vehicleId && photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          try { await uploadMyVehicleMedia(vehicleId, photos[i], i === 0); }
          catch (e) { console.warn('Photo ' + i + ' échouée', e); }
        }
      }

      setSuccess(true);
    } catch (e: any) {
      if (e?.errors && typeof e.errors === 'object') {
        const messages = translateErrors(e.errors, lang);
        setError(messages.join(' • '));
      } else {
        setError(e?.message || (lang === 'ar' ? 'حدث خطأ' : 'Une erreur est survenue'));
      }
    } finally { setLoading(false); }
  };

  if (!mounted) return null;
  if (!getToken()) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '16px' }}></i>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>{l.notLogged}</h2>
        <a href={'/' + lang + '/connexion'} style={{ display: 'inline-block', marginTop: '14px', padding: '12px 24px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>{l.loginBtn}</a>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <i className="fa-solid fa-check" style={{ fontSize: '28px', color: 'white' }}></i>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>{l.success}</h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>{l.successHint}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <a href={'/' + lang + '/mes-annonces'} style={{ padding: '10px 18px', background: '#16A34A', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>{l.viewMy}</a>
          <a href={'/' + lang + '/'} style={{ padding: '10px 18px', background: 'white', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>{l.backHome}</a>
        </div>
      </div>
    );
  }

  const input: React.CSSProperties = { width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', border: '1px solid #CBD5E1', borderRadius: '8px', background: 'white', color: '#0F172A', outline: 'none', boxSizing: 'border-box' };
  const label: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' };
  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' };
  const field = (key: string) => <div><label style={label}>{l[key as keyof typeof l] as string}</label></div>;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 10 - photos.length);
    setPhotos([...photos, ...arr]);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>{l.title}</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{l.subtitle}</p>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {l.steps.map((s, i) => (
          <div key={i} style={{ flex: 1, padding: '10px 8px', textAlign: 'center', background: i === step ? '#16A34A' : i < step ? '#F0FDF4' : '#F1F5F9', color: i === step ? 'white' : i < step ? '#15803D' : '#94A3B8', borderRadius: '8px', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' }}>
            <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>{i + 1}/{l.steps.length}</div>
            {s}
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '16px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>{error}
          </div>
        )}

        {step === 0 && (
          <div style={grid2}>
            <div>
              <label style={label}>{l.brand} *</label>
              <select value={form.brand_id} onChange={(e) => update('brand_id', e.target.value)} style={input}>
                <option value="">{l.selectPlaceholder}</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>{l.model} *</label>
              <select value={form.vehicle_model_id} onChange={(e) => update('vehicle_model_id', e.target.value)} style={input} disabled={!form.brand_id}>
                <option value="">{l.selectPlaceholder}</option>
                {models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>{l.year} *</label>
              <input type="number" min="1980" max="2030" value={form.year} onChange={(e) => update('year', e.target.value)} style={input} dir="ltr" />
            </div>
            <div>
              <label style={label}>{l.condition}</label>
              <select value={form.condition} onChange={(e) => update('condition', e.target.value)} style={input}>
                {Object.entries(l.conditions).map(([k, v]: any) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={grid2}>
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
              <label style={label}>{l.price} *</label>
              <input type="number" value={form.price_mru} onChange={(e) => update('price_mru', e.target.value)} style={input} dir="ltr" placeholder="500000" />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.price_negotiable} onChange={(e) => update('price_negotiable', e.target.checked)} />
                {l.negotiable}
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label style={label}>{l.photos}</label>
            <div style={{ border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer' }} onClick={() => document.getElementById('publish-photos')?.click()}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }}></i>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>{l.photosHint}</p>
              <input id="publish-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
            </div>
            {photos.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}><strong>{photos.length}</strong> {l.photosCount}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {photos.map((f, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '11px' }}>×</button>
                      {i === 0 && <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#16A34A', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>COVER</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <label style={label}>{l.descFr}</label>
            <textarea value={form.description_fr} onChange={(e) => update('description_fr', e.target.value)} placeholder={l.descPlaceholder} style={{ ...input, height: '120px', padding: '12px 14px', resize: 'vertical' }} dir="ltr" />
            <label style={{ ...label, marginTop: '14px' }}>{l.descAr}</label>
            <textarea value={form.description_ar} onChange={(e) => update('description_ar', e.target.value)} placeholder={l.descPlaceholder} style={{ ...input, height: '120px', padding: '12px 14px', resize: 'vertical' }} dir="rtl" />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{ padding: '12px 24px', background: 'white', color: step === 0 ? '#CBD5E1' : '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: step === 0 ? 'not-allowed' : 'pointer' }}>{l.prev}</button>
        {step < 3 ? (
          <button onClick={handleNext} style={{ padding: '12px 28px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>{l.next}</button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '12px 28px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? l.submitting : l.submit}
          </button>
        )}
      </div>
    </div>
  );
}
