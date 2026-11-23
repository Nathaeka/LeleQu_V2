// Konfigurasi Base URL API Backend NestJS
// Nilai dapat diubah melalui file .env dengan variabel VITE_API_BASE_URL
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
).replace(/\/+$/, '');

export const PRODUCTS_ENDPOINT = `${API_BASE_URL}/products`;
