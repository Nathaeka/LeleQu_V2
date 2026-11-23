import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialArticles, initialSettings } from '../data/initialData.js';
import { productApi } from '../services/productApi.js';
import { API_BASE_URL } from '../config/api.js';

const AppContext = createContext(undefined);

// Helper to sanitize product names and descriptions from legacy Sangkuriang/Grade words
const sanitizeLoadedProducts = (items) => {
  return items.map((p) => {
    let cleanName = p.name
      .replace(/Ikan\s*Lele\s*Sangkuriang\s*Segar\s*—\s*(?:Grade\s*)?/gi, 'Ikan Lele ')
      .replace(/Ikan\s*Lele\s*Segar\s*—\s*(?:Ukuran\s*)?/gi, 'Ikan Lele ')
      .replace(/Sangkuriang/gi, '')
      .replace(/Grade/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      ...p,
      name: cleanName,
      image_url: (p.image_url || '').replace(/^\/public\//, '/'),
      grade: (p.grade || '').replace(/Grade\s*/gi, '').trim(),
      description: (p.description || '')
        .replace(/Sangkuriang/gi, 'pilihan')
        .replace(/Grade/gi, 'ukuran'),
    };
  });
};

const sanitizeLoadedArticles = (items) => {
  return items.map((a) => ({
    ...a,
    thumbnail: (a.thumbnail || '').replace(/^\/public\//, '/'),
  }));
};
export const AppProvider = ({ children }) => {
  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);

  // Articles state
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [errorArticles, setErrorArticles] = useState(null);

  // Settings state (persisted)
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('lelequ_settings_v3');
      return stored ? JSON.parse(stored) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // Admin auth state
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('lelequ_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Toasts state
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState(null);

  // Fetch Products from NestJS Backend API (GET /products)
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err) {
      console.warn('Fetch products from NestJS API failed:', err.message);
      setErrorProducts(
        `Tidak dapat terhubung ke server backend NestJS (${API_BASE_URL}). ${err.message}`
      );
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch Articles using Fetch API from /data/articles.json
  const fetchArticles = useCallback(async () => {
    setLoadingArticles(true);
    setErrorArticles(null);
    try {
      const storedEdits = localStorage.getItem('lelequ_articles_v2');
      if (storedEdits) {
        setArticles(sanitizeLoadedArticles(JSON.parse(storedEdits)));
        setLoadingArticles(false);
        return;
      }

      const response = await fetch('/data/articles.json');
      if (!response.ok) {
        throw new Error(`Gagal memuat data artikel (HTTP ${response.status})`);
      }
      const data = await response.json();
      const sanitized = sanitizeLoadedArticles(data);
      setArticles(sanitized);
      localStorage.setItem('lelequ_articles_v2', JSON.stringify(sanitized));
    } catch (err) {
      console.warn('Fetch articles failed, using fallback:', err.message);
      setErrorArticles(err.message);
      setArticles(sanitizeLoadedArticles(initialArticles));
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  // Initial Data Fetch on Mount
  useEffect(() => {
    fetchProducts();
    fetchArticles();
  }, [fetchProducts, fetchArticles]);

  // Sync articles changes to localStorage for local CRUD persistence

  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('lelequ_articles_v2', JSON.stringify(articles));
    }
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('lelequ_settings_v3', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('lelequ_admin_session', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('lelequ_admin_session');
    }
  }, [currentAdmin]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(-4);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Products CRUD (Terhubung ke NestJS Backend API)
  const addProduct = async (prodData) => {
    try {
      const created = await productApi.create(prodData);
      setProducts((prev) => [created, ...prev]);
      showToast('Produk lele berhasil ditambahkan ke backend.');
      return { success: true, data: created };
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan produk ke server.', 'error');
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id, updated) => {
    try {
      const updatedProduct = await productApi.update(id, updated);
      setProducts((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? updatedProduct : item
        )
      );
      showToast('Data produk berhasil diperbarui di backend.');
      return { success: true, data: updatedProduct };
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui produk di server.', 'error');
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productApi.remove(id);
      setProducts((prev) =>
        prev.filter((item) => String(item.id) !== String(id))
      );
      showToast('Produk telah dihapus dari katalog backend.', 'info');
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Gagal menghapus produk dari server.', 'error');
      return { success: false, error: err.message };
    }
  };

  // Articles CRUD (Admin only - Frontend simulation)
  const addArticle = (artData) => {
    const newArticle = {
      ...artData,
      id: 'art-' + Date.now(),
    };
    setArticles((prev) => [newArticle, ...prev]);
    showToast('Artikel edukasi berhasil diterbitkan.');
  };

  const updateArticle = (id, updated) => {
    setArticles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Artikel berhasil diperbarui.');
  };

  const deleteArticle = (id) => {
    setArticles((prev) => prev.filter((item) => item.id !== id));
    showToast('Artikel telah dihapus.', 'info');
  };

  // Public Order Form Simulation (Section H & F: No admin inbox/orders CRUD, simulation for frontend UTS)
  const addOrder = (orderData) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-2024-${randomSuffix}`;
    const newOrder = {
      ...orderData,
      id: 'ord-' + Date.now(),
      order_number: orderNumber,
      status: 'Menunggu Konfirmasi',
      created_at: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };
    showToast(`Pesanan #${orderNumber} berhasil dibuat! Silakan konfirmasi via WhatsApp.`);
    return newOrder;
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Pengaturan perusahaan berhasil disimpan.');
  };

  const resetAllData = () => {
    localStorage.removeItem('lelequ_articles_v2');
    localStorage.removeItem('lelequ_settings_v3');
    fetchProducts();
    fetchArticles();
    setSettings(initialSettings);
    showToast('Seluruh data berhasil di-reset ke data awal.', 'info');
  };

  // Auth Simulation
  const loginAdmin = (email, pass) => {
    const normalized = email.trim().toLowerCase();
    if (normalized === 'admin@lelequ.com' && pass === 'admin123') {
      const user = {
        name: 'Administrator LeleQu',
        email: 'admin@lelequ.com',
      };
      setCurrentAdmin(user);
      showToast('Login berhasil. Selamat datang di CMS LeleQu!');
      return true;
    }
    if (normalized.includes('@') && pass.length >= 4) {
      const user = {
        name: normalized.split('@')[0],
        email: normalized,
      };
      setCurrentAdmin(user);
      showToast('Login berhasil.');
      return true;
    }
    showToast('Email atau password tidak sesuai.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
    showToast('Anda telah logout dari Admin Dashboard.', 'info');
  };

  const openOrderModal = (prod) => {
    setOrderProduct(prod || products[0] || null);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setOrderProduct(null);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        loadingProducts,
        errorProducts,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        articles,
        loadingArticles,
        errorArticles,
        fetchArticles,
        addArticle,
        updateArticle,
        deleteArticle,
        addOrder,
        settings,
        updateSettings,
        resetAllData,
        currentAdmin,
        loginAdmin,
        logoutAdmin,
        toasts,
        showToast,
        removeToast,
        selectedProduct,
        setSelectedProduct,
        isOrderModalOpen,
        orderProduct,
        openOrderModal,
        closeOrderModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
