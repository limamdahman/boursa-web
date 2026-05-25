import type { Vehicle, Brand, Model, City, PaginatedResponse, VehicleFilter } from './types';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Token storage helpers (only run in browser)
const TOKEN_KEY = 'boursa_token';
const USER_KEY = 'boursa_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): any {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setStoredUser(user: any) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json', ...extra };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  return headers;
}

async function request<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  const response = await fetch(url.toString(), {
    headers: buildHeaders(),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function postRequest<T>(path: string, body: Record<string, any>): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || `API error: ${response.status}`;
    const err: any = new Error(message);
    err.status = response.status;
    err.errors = data?.errors;
    throw err;
  }
  return data;
}

// ─── Vehicles ────────────────────────────────────────────────────────────────
export async function listVehicles(filter: VehicleFilter & { page?: number; per_page?: number } = {}) {
  return request<PaginatedResponse<Vehicle>>('/vehicles', filter);
}

export async function getVehicle(id: string) {
  const response = await request<{ data: Vehicle }>(`/vehicles/${id}`);
  return response.data;
}

export async function getFeaturedVehicles(limit = 5) {
  const response = await listVehicles({ per_page: limit, sort: 'recent' });
  return response.data;
}

// ─── Reference data ──────────────────────────────────────────────────────────
export async function listBrands() {
  const response = await request<{ data: Brand[] }>('/brands');
  return response.data;
}

export async function listModelsForBrand(brandId: number) {
  const response = await request<{ data: Model[] }>(`/brands/${brandId}/models`);
  return response.data;
}

export async function listCities() {
  const response = await request<{ data: City[] }>('/cities');
  return response.data;
}

// ─── Utils ───────────────────────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price);
}

export function formatKm(km: number): string {
  return new Intl.NumberFormat('fr-FR').format(km);
}

export function fuelLabel(fuel: string): string {
  const map: Record<string, string> = {
    gasoline: 'Essence',
    diesel: 'Diesel',
    hybrid: 'Hybride',
    electric: 'Électrique',
    gpl: 'GPL',
  };
  return map[fuel] ?? fuel;
}

export function transmissionLabel(t: string): string {
  return t === 'manual' ? 'Manuelle' : t === 'automatic' ? 'Automatique' : t;
}

export function bodyTypeLabel(t: string): string {
  const map: Record<string, string> = {
    sedan: 'Berline',
    suv: 'SUV',
    hatchback: 'Compacte',
    pickup: 'Pickup',
    van: 'Utilitaire',
    coupe: 'Coupé',
  };
  return map[t] ?? t;
}

// ─── Agencies ────────────────────────────────────────────────────────────────
export async function listAgencies(filter: { page?: number; per_page?: number; city_id?: number } = {}) {
  return request<any>('/agencies', filter);
}

export async function getAgency(slug: string) {
  const response = await request<{ data: any }>('/agencies/' + slug);
  return response.data;
}

// ─── Auth ────────────────────────────────────────────────────────────────
export async function sendOtp(phone: string) {
  return postRequest<{ message: string }>('/auth/otp/send', { phone });
}

export async function verifyOtp(phone: string, code: string, deviceName?: string) {
  const data = await postRequest<{ token: string; user: any }>('/auth/otp/verify', {
    phone, code, device_name: deviceName || 'web',
  });
  if (data.token) setToken(data.token);
  if (data.user) setStoredUser(data.user);
  return data;
}

export async function login(identifier: string, password: string, deviceName?: string) {
  const data = await postRequest<{ token: string; user: any }>('/auth/login', {
    identifier, password, device_name: deviceName || 'web',
  });
  if (data.token) setToken(data.token);
  if (data.user) setStoredUser(data.user);
  return data;
}

export async function register(payload: {
  name: string; phone: string; email?: string; password: string; language?: 'fr' | 'ar';
}) {
  const data = await postRequest<{ token: string; user: any }>('/auth/register', {
    ...payload, device_name: 'web',
  });
  if (data.token) setToken(data.token);
  if (data.user) setStoredUser(data.user);
  return data;
}

export async function logout() {
  try {
    await postRequest('/auth/logout', {});
  } catch {
    // Continue logout côté client même si l'API échoue
  }
  setToken(null);
  setStoredUser(null);
}

export async function me() {
  return request<{ user: any }>('/me');
}

// ─── Favorites & Profile ────────────────────────────────────────────────────
export async function getFavorites(page = 1, perPage = 20) {
  return request<any>('/favorites', { page, per_page: perPage });
}

export async function getFavoriteIds(): Promise<string[]> {
  try {
    const data = await request<{ data: string[] }>('/favorites/ids');
    return data?.data ?? [];
  } catch {
    return [];
  }
}

export async function addFavorite(vehicleId: string) {
  return postRequest('/favorites/' + vehicleId, {});
}

export async function removeFavorite(vehicleId: string) {
  const response = await fetch(API_URL + '/favorites/' + vehicleId, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || 'Erreur suppression favori');
  }
  return response.json().catch(() => ({}));
}

export async function updateMe(payload: { name?: string; email?: string; language?: 'fr' | 'ar' | 'en' }) {
  const response = await fetch(API_URL + '/me', {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err: any = new Error(data?.message || 'Erreur mise à jour profil');
    err.errors = data?.errors;
    throw err;
  }
  if (data?.user) setStoredUser(data.user);
  return data;
}

// ─── My Vehicles (Particuliers) ─────────────────────────────────────────────
export async function listMyVehicles() {
  return request<any>('/me/vehicles');
}

export async function createMyVehicle(payload: Record<string, any>) {
  return postRequest<{ message: string; data: any }>('/me/vehicles', payload);
}

export async function uploadMyVehicleMedia(vehicleId: string, file: File, isCover = false): Promise<any> {
  const formData = new FormData();
  formData.append('photo', file);
  if (isCover) formData.append('is_cover', '1');

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;

  const response = await fetch(API_URL + '/me/vehicles/' + vehicleId + '/media', {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Upload échoué');
  return data;
}

export async function getMyVehicle(id: string) {
  const response = await request<{ data: any }>('/me/vehicles/' + id);
  return response.data;
}

export async function updateMyVehicle(id: string, payload: Record<string, any>) {
  const response = await fetch(API_URL + '/me/vehicles/' + id, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err: any = new Error(data?.message || 'Erreur mise à jour');
    err.errors = data?.errors;
    throw err;
  }
  return data;
}

export async function deleteMyVehicle(id: string) {
  const response = await fetch(API_URL + '/me/vehicles/' + id, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || 'Erreur suppression');
  }
  return response.json().catch(() => ({}));
}

export async function deleteMyVehicleMedia(vehicleId: string, mediaId: string) {
  const response = await fetch(API_URL + '/me/vehicles/' + vehicleId + '/media/' + mediaId, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || 'Erreur suppression photo');
  }
  return response.json().catch(() => ({}));
}

export async function setMyVehicleCover(vehicleId: string, mediaId: string) {
  const response = await fetch(API_URL + '/me/vehicles/' + vehicleId + '/media/' + mediaId + '/cover', {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: '{}',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || 'Erreur cover');
  }
  return response.json().catch(() => ({}));
}

// ─── Reviews ────────────────────────────────────────────────────────────────
export async function submitReview(payload: { vehicle_id: string; rating: number; comment?: string }) {
  return postRequest<{ message: string; data: any }>('/reviews', payload);
}

export async function canReviewVehicle(vehicleId: string) {
  try {
    const r = await request<any>('/vehicles/' + vehicleId + '/can-review');
    return r;
  } catch {
    return { can_review: false, reason: 'unauthenticated' };
  }
}

export async function getUserReviews(userId: string) {
  return request<any>('/sellers/users/' + userId + '/reviews');
}

export async function getUserRatingSummary(userId: string) {
  return request<{ count: number; average: number }>('/sellers/users/' + userId + '/rating-summary');
}

export async function getAgencyReviews(agencyId: string) {
  return request<any>('/sellers/agencies/' + agencyId + '/reviews');
}

export async function getAgencyRatingSummary(agencyId: string) {
  return request<{ count: number; average: number }>('/sellers/agencies/' + agencyId + '/rating-summary');
}

export async function updatePassword(payload: { current_password?: string; new_password: string; new_password_confirmation: string }) {
  const response = await fetch(API_URL + '/me/password', {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err: any = new Error(data?.message || 'Erreur mot de passe');
    err.errors = data?.errors;
    throw err;
  }
  return data;
}

export async function getSimilarVehicles(vehicleId: string) {
  return request<{ data: any[] }>('/vehicles/' + vehicleId + '/similar');
}

export async function getSellerProfile(userId: string) {
  return request<{ data: any }>('/sellers/users/' + userId);
}

// ─── Seller Follows ────────────────────────────────────────────────────────
export async function toggleFollowSeller(payload: { seller_type: 'user' | 'agency'; seller_id: string }) {
  return postRequest<{ following: boolean; message: string }>('/seller-follows/toggle', payload);
}

export async function isFollowingSeller(sellerType: 'user' | 'agency', sellerId: string) {
  try {
    return await request<{ following: boolean }>('/seller-follows/is-following?seller_type=' + sellerType + '&seller_id=' + sellerId);
  } catch {
    return { following: false };
  }
}

export async function getFollowersCount(sellerType: 'user' | 'agency', sellerId: string) {
  return request<{ count: number }>('/sellers/' + sellerType + '/' + sellerId + '/followers-count');
}

export async function getMySellerFollows() {
  return request<any>('/me/seller-follows');
}

// ─── Notifications ─────────────────────────────────────────────────────────
export async function getRecentNotifications() {
  try {
    return await request<{ data: any[] }>('/me/notifications/recent');
  } catch {
    return { data: [] };
  }
}

export async function getNotificationsUnreadCount() {
  try {
    return await request<{ count: number }>('/me/notifications/unread-count');
  } catch {
    return { count: 0 };
  }
}

export async function getNotifications(page = 1) {
  return request<any>('/me/notifications?page=' + page);
}

export async function markNotificationAsRead(id: string) {
  return postRequest<{ message: string }>('/me/notifications/' + id + '/read', {});
}

export async function markAllNotificationsAsRead() {
  return postRequest<{ message: string }>('/me/notifications/read-all', {});
}

