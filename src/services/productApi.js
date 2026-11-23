import { PRODUCTS_ENDPOINT } from '../config/api.js';

// Normalisasi path gambar lama (/public/assets/...) ke path public Vite (/assets/...)
const normalizeImagePath = (url) => {
  if (!url || typeof url !== 'string') {
    return '/assets/foto/Ikan_lele_segar_5b6a360e.jpg';
  }
  return url.replace(/^\/public\//, '/');
};

// Mapping dari entity backend NestJS -> struktur produk yang digunakan komponen frontend
export const mapBackendProductToFrontend = (item) => {
  const cleanName = (item.name || '')
    .replace(/Ikan\s*Lele\s*Sangkuriang\s*Segar\s*—\s*(?:Grade\s*)?/gi, 'Ikan Lele ')
    .replace(/Ikan\s*Lele\s*Segar\s*—\s*(?:Ukuran\s*)?/gi, 'Ikan Lele ')
    .replace(/Sangkuriang/gi, '')
    .replace(/Grade/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    id: item.id,
    name: cleanName || item.name,
    slug: item.slug,
    description: item.description || '',
    grade: (item.category || '').replace(/Grade\s*/gi, '').trim(),
    price_per_kg: Number(item.price ?? 0),
    image_url: normalizeImagePath(item.image),
    min_order: item.minOrder || '3 kg',
    characteristics: Array.isArray(item.characteristics) ? item.characteristics : [],
    is_available: item.isAvailable ?? true,
    created_at: item.createdAt || new Date().toISOString(),
  };
};

// Mapping dari form/state frontend -> DTO backend NestJS (CreateProductDto / UpdateProductDto)
export const mapFrontendProductToDto = (prodData) => {
  const payload = {};

  if (prodData.name !== undefined) payload.name = String(prodData.name).trim();
  if (prodData.slug !== undefined && prodData.slug !== '') {
    payload.slug = String(prodData.slug).trim();
  }
  if (prodData.description !== undefined) {
    payload.description = String(prodData.description).trim();
  }
  if (prodData.grade !== undefined) {
    payload.category = String(prodData.grade).trim();
  }
  if (prodData.price_per_kg !== undefined) {
    payload.price = Number(prodData.price_per_kg);
  }
  if (prodData.image_url !== undefined) {
    payload.image = normalizeImagePath(prodData.image_url);
  }
  if (prodData.min_order !== undefined) {
    payload.minOrder = String(prodData.min_order).trim();
  }
  if (prodData.characteristics !== undefined) {
    payload.characteristics = Array.isArray(prodData.characteristics)
      ? prodData.characteristics
      : [];
  }
  if (prodData.is_available !== undefined) {
    payload.isAvailable = Boolean(prodData.is_available);
  }

  return payload;
};

const parseApiResponse = async (response) => {
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(' ')
      : rawMessage || `Permintaan gagal (HTTP ${response.status})`;
    throw new Error(message);
  }

  return body;
};

export const productApi = {
  async getAll() {
    const response = await fetch(PRODUCTS_ENDPOINT);
    const body = await parseApiResponse(response);
    const items = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
    return items.map(mapBackendProductToFrontend);
  },

  async getById(id) {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${id}`);
    const body = await parseApiResponse(response);
    const item = body?.data ?? body;
    return mapBackendProductToFrontend(item);
  },

  async create(prodData) {
    const dto = mapFrontendProductToDto(prodData);
    const response = await fetch(PRODUCTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    const body = await parseApiResponse(response);
    const item = body?.data ?? body;
    return mapBackendProductToFrontend(item);
  },

  async update(id, prodData) {
    const dto = mapFrontendProductToDto(prodData);
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    const body = await parseApiResponse(response);
    const item = body?.data ?? body;
    return mapBackendProductToFrontend(item);
  },

  async remove(id) {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    const body = await parseApiResponse(response);
    const item = body?.data ?? body;
    return item ? mapBackendProductToFrontend(item) : null;
  },
};
