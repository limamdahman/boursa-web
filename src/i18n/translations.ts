// Boursa Web — Traductions FR + AR (Arabe Standard Moderne)

export type Lang = 'fr' | 'ar';

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // Nav
    'nav.buy': 'Acheter',
    'nav.sell': 'Vendre',
    'nav.agencies': 'Agences',
    'nav.magazine': 'Magazine',
    'nav.login': 'Connexion',
    'nav.publish': 'Publier une annonce',

    // Hero
    'hero.title.line1': 'Trouvez votre prochaine voiture',
    'hero.title.line2': 'sur Boursa.',
    'hero.subtitle': "Plus de {count} véhicules d'occasion vérifiés par nos agences partenaires en Mauritanie",
    'hero.chip.toyota': 'Toyota Camry',
    'hero.chip.tucson': 'Hyundai Tucson',
    'hero.chip.pickup': 'Pickup 4×4',
    'hero.chip.budget': 'Moins de 1.5M MRU',
    'hero.chip.nouakchott': 'Nouakchott',

    // Hero amélioré (Phase A)
    'hero.eyebrow': 'MARKETPLACE #1 EN MAURITANIE · {count}+ VÉHICULES EN LIGNE',
    'hero.search.ai.placeholder.1': 'SUV familial moins de 2 millions MRU',
    'hero.search.ai.placeholder.2': 'Toyota Camry diesel automatique',
    'hero.search.ai.placeholder.3': 'Pickup 4×4 à Nouakchott',
    'hero.search.ai.placeholder.4': 'Berline pour première voiture',
    'hero.search.ai.hint': '↑ Recherche intelligente · décris en langage naturel',
    'hero.search.button': 'Voir',
    'hero.search.button.vehicles': 'véhicules',
    'hero.stats.vehicles': 'Véhicules vérifiés',
    'hero.stats.agencies': 'Agences partenaires',
    'hero.stats.cities': 'Villes couvertes',
    'hero.form.tab.cars': 'Voitures',
    'hero.form.tab.motos': 'Motos',
    'hero.form.tab.soon': 'Bientôt',
    'hero.form.yearMin': 'Année min',
    'hero.form.kmMax': 'Km max',
    'hero.form.priceMax': 'Prix max',
    'hero.form.dash': '—',

    // Search
    'search.brand': 'Marque',
    'search.model': 'Modèle',
    'search.priceMax': 'Prix max (MRU)',
    'search.allBrands': 'Toutes les marques',
    'search.allModels': 'Tous',
    'search.noLimit': 'Aucune limite',
    'search.button': 'Rechercher',

    // Categories
    'categories.title': 'Parcourir par catégorie',
    'categories.viewAll': 'Tout voir',
    'categories.sedan': 'Berlines',
    'categories.suv': 'SUV',
    'categories.pickup': 'Pickup',
    'categories.van': 'Utilitaires',
    'categories.hatchback': 'Compactes',
    'categories.electric': 'Hybride / Élec.',

    // Featured
    'featured.title': 'Sélection vedettes',
    'featured.viewAllVehicles': 'Voir tous les véhicules ({count})',
    'featured.vedette': 'VEDETTE',

    // Brands section
    'brands.title': 'Marques populaires',
    'brands.subtitle': 'Trouvez votre voiture par marque préférée',
    'brands.viewAll': 'Voir les {count} marques',

    // Lifestyle section
    'lifestyle.title': 'Pour chaque style de vie',
    'lifestyle.subtitle': 'Sélections curatées pour vous aider à choisir',
    'lifestyle.fromPrice': 'à partir de',
    'lifestyle.vehiclesShort': 'véhicules',
    'lifestyle.family.title': 'Pour la famille',
    'lifestyle.family.tags': 'SUV spacieux, 5+ places, kilométrage modéré',
    'lifestyle.family.badge': 'Famille',
    'lifestyle.premium.title': 'Le premium',
    'lifestyle.premium.tags': 'Land Cruiser, Mercedes, Range Rover sélectionnés',
    'lifestyle.premium.badge': 'Premium',
    'lifestyle.first.title': 'Premier véhicule',
    'lifestyle.first.tags': 'Compacte économique pour démarrer en douceur',
    'lifestyle.first.badge': 'Premier achat',
    'lifestyle.pickup.title': 'Pickup pro',
    'lifestyle.pickup.tags': '4×4 diesel pour travail et désert mauritanien',

    // Vehicle detail page
    'vehicle.allPhotos': 'Toutes les photos',
    'vehicle.equipment': 'Équipements',
    'vehicle.seats': 'Places',
    'vehicle.doors': 'Portes',
    'vehicle.color': 'Couleur',
    'vehicle.otherFromAgency': "Autres véhicules de cette agence",
    'agency.about': "À propos de l'agence",
    'agency.verified': 'Vérifiée',
    'agency.activeListings': 'annonces actives',
    'agency.location': 'Localisation',
    'agency.viewLarger': 'Voir en plus grand',
    'option.airbag': 'Airbag',
    'option.jantes_alu': 'Jantes alu',
    'option.abs': 'ABS',
    'option.sieges_cuir': 'Sièges cuir',
    'option.bluetooth': 'Bluetooth',
    'option.toit_ouvrant': 'Toit ouvrant',
    'option.climatisation': 'Climatisation',
    'option.gps': 'GPS',
    'option.camera_recul': 'Caméra recul',
    'option.regulateur': 'Régulateur',
    'lifestyle.pickup.badge': 'Tout terrain',

    // Listing
    'listing.title': "Véhicules d'occasion en Mauritanie",
    'listing.count': '{count} véhicules trouvés',
    'listing.empty.title': 'Aucun véhicule trouvé',
    'listing.empty.subtitle': 'Essaie de modifier tes filtres',
    'listing.prev': '← Précédent',
    'listing.next': 'Suivant →',
    'listing.pageOf': 'Page {page} / {total}',

    // Vehicle detail
    'vehicle.backToResults': 'Retour aux résultats',
    'vehicle.characteristics': 'Caractéristiques',
    'vehicle.description': 'Description',
    'vehicle.year': 'Année',
    'vehicle.mileage': 'Km',
    'vehicle.fuel': 'Carburant',
    'vehicle.transmission': 'Boîte',
    'vehicle.bodyType': 'Carrosserie',
    'vehicle.city': 'Ville',
    'unit.km': 'km',
    'unit.currency': 'MRU',
    'vehicle.goodPrice': 'Bon prix · sous le marché',
    'vehicle.verified': 'VÉRIFIÉ',
    'vehicle.verifiedAgency': 'Agence vérifiée',
    'vehicle.whatsapp': 'Contacter sur WhatsApp',
    'vehicle.call': 'Appeler maintenant',
    'vehicle.whatsappMessage': "Bonjour, je suis intéressé par votre {brand} {model} {year}. Toujours disponible ?",
    'vehicle.callSeller': 'Appeler',
    'vehicle.verified': 'Vérifié',
    'vehicle.goodPrice': 'Bon prix',
    'agency.about': "À propos de l'agence",
    'agency.verified': 'Vérifiée',
    'agency.activeListings': 'annonces actives',
    'agency.location': 'Localisation',
    'agency.viewLarger': 'Voir en plus grand',
    'agency.viewProfile': 'Voir le profil agence',
    'seller.agency': 'Agence',
    'seller.individual': 'Particulier',
    'seller.about': 'À propos du vendeur',
    'seller.aboutAgency': "À propos de l'agence",
    'vehicle.noPhoto': 'Pas de photo',

    // Fuel types
    'fuel.gasoline': 'Essence',
    'fuel.diesel': 'Diesel',
    'fuel.hybrid': 'Hybride',
    'fuel.electric': 'Électrique',
    'fuel.gpl': 'GPL',

    // Transmission
    'transmission.manual': 'Manuelle',
    'transmission.automatic': 'Automatique',

    // Body types
    'bodyType.sedan': 'Berline',
    'bodyType.suv': 'SUV',
    'bodyType.hatchback': 'Compacte',
    'bodyType.pickup': 'Pickup',
    'bodyType.van': 'Utilitaire',
    'bodyType.coupe': 'Coupé',

    // Agency CTA
    'agency.cta.title': 'Vous êtes une agence ?',
    'agency.cta.subtitle': "Diffusez votre stock auprès de 12 000+ acheteurs mensuels. Outils pros, statistiques temps réel, leads qualifiés.",
    'agency.cta.button': 'Devenir agence partenaire',
    'agency.stat.partners': 'Agences partenaires',
    'agency.stat.listings': 'Annonces actives',
    'agency.stat.visitors': 'Visiteurs / mois',

    // Trust bar
    'trust.verified.title': 'Agences vérifiées',
    'trust.verified.desc': 'Tous nos partenaires sont validés manuellement',
    'trust.prices.title': 'Prix transparents',
    'trust.prices.desc': 'Comparez instantanément au marché',
    'trust.contact.title': 'Contact direct',
    'trust.contact.desc': 'WhatsApp & téléphone, sans intermédiaire',
    'trust.local.title': '100% Mauritanie',
    'trust.local.desc': 'De Nouakchott à Zouérat, partout dans le pays',

    // Footer
    'footer.tagline': 'La marketplace auto n°1 en Mauritanie. Achetez et vendez en toute confiance.',
    'footer.col.boursa': 'Boursa',
    'footer.col.buyers': 'Acheteurs',
    'footer.col.sellers': 'Vendeurs',
    'footer.link.about': 'À propos',
    'footer.link.careers': 'Carrières',
    'footer.link.contact': 'Contact',
    'footer.link.magazine': 'Magazine',
    'footer.link.search': 'Rechercher',
    'footer.link.favorites': 'Mes favoris',
    'footer.link.estimate': 'Estimer un prix',
    'footer.link.buyGuide': "Guide d'achat",
    'footer.link.publish': 'Publier une annonce',
    'footer.link.becomeAgency': 'Devenir agence',
    'footer.link.pricing': 'Tarifs',
    'footer.link.terms': 'Conditions',
    'footer.copyright': '© 2026 Boursa.mr · Tous droits réservés',
    'footer.legal': 'RC: Nouakchott · CGU · Confidentialité',

    // Language
    'lang.switch.to.fr': 'Français',
    'lang.switch.to.ar': 'العربية',
  },

  ar: {
    // Nav
    'nav.buy': 'شراء',
    'nav.sell': 'بيع',
    'nav.agencies': 'الوكالات',
    'nav.magazine': 'المجلة',
    'nav.login': 'تسجيل الدخول',
    'nav.publish': 'نشر إعلان',

    // Hero
    'hero.title.line1': 'ابحث عن سيارتك القادمة',
    'hero.title.line2': 'على بورصا.',
    'hero.subtitle': 'أكثر من {count} سيارة مستعملة معتمدة من وكالاتنا الشريكة في موريتانيا',
    'hero.chip.toyota': 'تويوتا كامري',
    'hero.chip.tucson': 'هيونداي توسان',
    'hero.chip.pickup': 'بيك أب رباعي الدفع',
    'hero.chip.budget': 'أقل من 1.5 مليون أوقية',
    'hero.chip.nouakchott': 'نواكشوط',

    // Hero amélioré (Phase A)
    'hero.eyebrow': 'منصة السيارات #1 في موريتانيا · {count}+ سيارة متاحة',
    'hero.search.ai.placeholder.1': 'سيارة دفع رباعي عائلية بأقل من 2 مليون أوقية',
    'hero.search.ai.placeholder.2': 'تويوتا كامري ديزل أوتوماتيكي',
    'hero.search.ai.placeholder.3': 'بيك أب 4×4 في نواكشوط',
    'hero.search.ai.placeholder.4': 'سيدان لأول سيارة',
    'hero.search.ai.hint': '↑ بحث ذكي · صف ما تريد بكلماتك',
    'hero.search.button': 'عرض',
    'hero.search.button.vehicles': 'سيارة',
    'hero.stats.vehicles': 'سيارة معتمدة',
    'hero.stats.agencies': 'وكالة شريكة',
    'hero.stats.cities': 'مدن مغطاة',
    'hero.form.tab.cars': 'سيارات',
    'hero.form.tab.motos': 'دراجات نارية',
    'hero.form.tab.soon': 'قريباً',
    'hero.form.yearMin': 'السنة الأدنى',
    'hero.form.kmMax': 'الكيلومترات الأقصى',
    'hero.form.priceMax': 'السعر الأقصى',
    'hero.form.dash': '—',

    // Search
    'search.brand': 'الماركة',
    'search.model': 'الموديل',
    'search.priceMax': 'السعر الأقصى (أوقية)',
    'search.allBrands': 'جميع الماركات',
    'search.allModels': 'الكل',
    'search.noLimit': 'بدون حد',
    'search.button': 'بحث',

    // Categories
    'categories.title': 'تصفح حسب الفئة',
    'categories.viewAll': 'عرض الكل',
    'categories.sedan': 'سيدان',
    'categories.suv': 'سيارات الدفع الرباعي',
    'categories.pickup': 'بيك أب',
    'categories.van': 'مركبات تجارية',
    'categories.hatchback': 'مدمجة',
    'categories.electric': 'هجينة / كهربائية',

    // Featured
    'featured.title': 'المختارات المميزة',
    'featured.viewAllVehicles': 'عرض جميع السيارات ({count})',
    'featured.vedette': 'مميزة',

    // Brands section
    'brands.title': 'أشهر الماركات',
    'brands.subtitle': 'تصفح سياراتنا حسب الماركة',
    'brands.viewAll': 'عرض {count} ماركة',

    // Lifestyle section
    'lifestyle.title': 'اختر ما يناسبك',
    'lifestyle.subtitle': 'فئات منتقاة خصيصاً لك',
    'lifestyle.fromPrice': 'ابتداء من',
    'lifestyle.vehiclesShort': 'سيارة',
    'lifestyle.family.title': 'سيارات عائلية',
    'lifestyle.family.tags': 'دفع رباعي رحب لكل أفراد العائلة',
    'lifestyle.family.badge': 'عائلي',
    'lifestyle.premium.title': 'سيارات فاخرة',
    'lifestyle.premium.tags': 'تشكيلة مختارة من لاند كروزر ومرسيدس ورينج روفر',
    'lifestyle.premium.badge': 'فاخر',
    'lifestyle.first.title': 'سيارتك الأولى',
    'lifestyle.first.tags': 'سيارة مدمجة بسعر مناسب لبدايتك',
    'lifestyle.first.badge': 'أول شراء',
    'lifestyle.pickup.title': 'بيك أب للعمل',
    'lifestyle.pickup.tags': 'بيك أب 4×4 ديزل للعمل والصحراء',

    // Vehicle detail page
    'vehicle.allPhotos': 'جميع الصور',
    'vehicle.equipment': 'التجهيزات',
    'vehicle.seats': 'المقاعد',
    'vehicle.doors': 'الأبواب',
    'vehicle.color': 'اللون',
    'vehicle.otherFromAgency': 'سيارات أخرى من نفس الوكالة',
    'agency.about': 'عن الوكالة',
    'agency.verified': 'موثقة',
    'agency.activeListings': 'إعلان نشط',
    'agency.location': 'الموقع',
    'agency.viewLarger': 'عرض أكبر',
    'option.airbag': 'وسادة هوائية',
    'option.jantes_alu': 'جنوط ألمنيوم',
    'option.abs': 'نظام ABS',
    'option.sieges_cuir': 'مقاعد جلدية',
    'option.bluetooth': 'بلوتوث',
    'option.toit_ouvrant': 'فتحة سقف',
    'option.climatisation': 'تكييف',
    'option.gps': 'GPS',
    'option.camera_recul': 'كاميرا خلفية',
    'option.regulateur': 'مثبت سرعة',
    'lifestyle.pickup.badge': 'كل التضاريس',

    // Listing
    'listing.title': 'سيارات مستعملة في موريتانيا',
    'listing.count': 'تم العثور على {count} سيارة',
    'listing.empty.title': 'لم يتم العثور على سيارات',
    'listing.empty.subtitle': 'حاول تعديل عوامل التصفية',
    'listing.prev': 'السابق →',
    'listing.next': '← التالي',
    'listing.pageOf': 'صفحة {page} / {total}',

    // Vehicle detail
    'vehicle.backToResults': 'العودة إلى النتائج',
    'vehicle.characteristics': 'المواصفات',
    'vehicle.description': 'الوصف',
    'vehicle.year': 'السنة',
    'vehicle.mileage': 'كم',
    'vehicle.fuel': 'الوقود',
    'vehicle.transmission': 'ناقل الحركة',
    'vehicle.bodyType': 'نوع الهيكل',
    'vehicle.city': 'المدينة',
    'unit.km': 'كم',
    'unit.currency': 'أوقية',
    'vehicle.goodPrice': 'سعر جيد · أقل من السوق',
    'vehicle.verified': 'معتمد',
    'vehicle.verifiedAgency': 'وكالة معتمدة',
    'vehicle.whatsapp': 'تواصل عبر واتساب',
    'vehicle.call': 'اتصل الآن',
    'vehicle.whatsappMessage': 'السلام عليكم، أنا مهتم بسيارة {brand} {model} {year}. هل لا تزال متاحة؟',
    'vehicle.callSeller': 'اتصل',
    'vehicle.verified': 'موثق',
    'vehicle.goodPrice': 'سعر جيد',
    'agency.about': 'عن الوكالة',
    'agency.verified': 'موثقة',
    'agency.activeListings': 'إعلان نشط',
    'agency.location': 'الموقع',
    'agency.viewLarger': 'عرض الخريطة',
    'agency.viewProfile': 'عرض ملف الوكالة',
    'seller.agency': 'وكالة',
    'seller.individual': 'بائع خاص',
    'seller.about': 'عن البائع',
    'seller.aboutAgency': 'عن الوكالة',
    'vehicle.noPhoto': 'لا توجد صورة',

    // Fuel types
    'fuel.gasoline': 'بنزين',
    'fuel.diesel': 'ديزل',
    'fuel.hybrid': 'هجينة',
    'fuel.electric': 'كهربائية',
    'fuel.gpl': 'غاز',

    // Transmission
    'transmission.manual': 'يدوي',
    'transmission.automatic': 'أوتوماتيكي',

    // Body types
    'bodyType.sedan': 'سيدان',
    'bodyType.suv': 'دفع رباعي',
    'bodyType.hatchback': 'مدمجة',
    'bodyType.pickup': 'بيك أب',
    'bodyType.van': 'مركبة تجارية',
    'bodyType.coupe': 'كوبيه',

    // Agency CTA
    'agency.cta.title': 'هل أنت وكالة؟',
    'agency.cta.subtitle': 'انشر مخزونك لأكثر من 12 ألف مشتري شهرياً. أدوات احترافية، إحصائيات فورية، عملاء محتملون مؤهلون.',
    'agency.cta.button': 'كن وكالة شريكة',
    'agency.stat.partners': 'وكالة شريكة',
    'agency.stat.listings': 'إعلان نشط',
    'agency.stat.visitors': 'زائر شهرياً',

    // Trust bar
    'trust.verified.title': 'وكالات معتمدة',
    'trust.verified.desc': 'جميع شركائنا تم التحقق منهم يدوياً',
    'trust.prices.title': 'أسعار شفافة',
    'trust.prices.desc': 'قارن فوراً مع السوق',
    'trust.contact.title': 'تواصل مباشر',
    'trust.contact.desc': 'واتساب وهاتف، بدون وسيط',
    'trust.local.title': '100% موريتانيا',
    'trust.local.desc': 'من نواكشوط إلى ازويرات، في كل أنحاء البلاد',

    // Footer
    'footer.tagline': 'منصة السيارات رقم 1 في موريتانيا. اشترِ وبع بكل ثقة.',
    'footer.col.boursa': 'بورصا',
    'footer.col.buyers': 'المشترون',
    'footer.col.sellers': 'البائعون',
    'footer.link.about': 'من نحن',
    'footer.link.careers': 'الوظائف',
    'footer.link.contact': 'اتصل بنا',
    'footer.link.magazine': 'المجلة',
    'footer.link.search': 'البحث',
    'footer.link.favorites': 'المفضلة',
    'footer.link.estimate': 'تقدير السعر',
    'footer.link.buyGuide': 'دليل الشراء',
    'footer.link.publish': 'نشر إعلان',
    'footer.link.becomeAgency': 'كن وكالة',
    'footer.link.pricing': 'الأسعار',
    'footer.link.terms': 'الشروط',
    'footer.copyright': '© 2026 بورصا.م.ر · جميع الحقوق محفوظة',
    'footer.legal': 'سجل تجاري: نواكشوط · شروط الاستخدام · الخصوصية',

    // Language
    'lang.switch.to.fr': 'Français',
    'lang.switch.to.ar': 'العربية',
  },
};

export function useTranslations(lang: Lang) {
  return (key: string, vars?: Record<string, string | number>): string => {
    let text = translations[lang]?.[key] ?? translations.fr[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };
}

export function getLang(astroLocale: string | undefined): Lang {
  return astroLocale === 'ar' ? 'ar' : 'fr';
}

export function getDir(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
