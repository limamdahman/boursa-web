// Types Boursa — alignés sur boursa-api Laravel

export type Brand = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
};

export type Model = {
  id: number;
  name: string;
  brand_id: number;
};

export type City = {
  id: number;
  name_fr: string;
  name_ar: string;
  slug?: string;
};

export type Agency = {
  id: number;
  name: string;
  slug: string;
  phone_whatsapp?: string | null;
  phone_call?: string | null;
  logo_url?: string | null;
  is_verified?: boolean;
  rating?: number | null;
};

export type Media = {
  id: string;
  url_thumb: string;
  url_md: string;
  url_lg: string;
  is_cover: boolean;
};

export type Vehicle = {
  id: string;
  brand: Brand;
  model: Model;
  year: number;
  mileage_km: number;
  price_mru: number;
  fuel: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'gpl';
  transmission: 'manual' | 'automatic';
  body_type: string;
  city?: City | null;
  agency?: Agency | null;
  description?: string | null;
  cover_image?: string | null;
  media?: Media[];
  is_featured?: boolean;
  created_at?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type VehicleFilter = {
  q?: string;
  brand_id?: number;
  vehicle_model_id?: number;
  model_id?: number;
  city_id?: number;
  agency_id?: string;
  exclude?: string;
  price_min?: number;
  price_max?: number;
  year_min?: number;
  year_max?: number;
  mileage_max?: number;
  fuel?: string;
  transmission?: string;
  body_type?: string;
  condition?: string;
  sort?: string;
};
