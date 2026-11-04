import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialProducts,
  initialArticles,
  initialOrders,
  initialMessages,
  initialSettings,
} from '../data/initialData.js';

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
      grade: p.grade.replace(/Grade\s*/gi, '').trim(),
      description: p.description.replace(/Sangkuriang/gi, 'pilihan').replace(/Grade/gi, 'ukuran'),
    };
  });
};

export const AppProvider = ({ children }) => {
  // Products state (v3 with clean names)
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('lelequ_products_v3');
      if (stored) {
        return sanitizeLoadedProducts(JSON.parse(stored));
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Articles state
  const [articles, setArticles] = useState(() => {
    try {
      const stored = localStorage.getItem('lelequ_articles_v2');
      return stored ? JSON.parse(stored) : initialArticles;
    } catch {
      return initialArticles;
    }
  });

  // Orders state
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('lelequ_orders_v2');
      return stored ? JSON.parse(stored) : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  // Messages state
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('lelequ_messages_v2');
      return stored ? JSON.parse(stored) : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  // Settings state
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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('lelequ_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('lelequ_articles_v2', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('lelequ_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lelequ_messages_v2', JSON.stringify(messages));
  }, [messages]);

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

  // Products CRUD
  const addProduct = (prodData) => {
    const newProduct = {
      ...prodData,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('Produk lele berhasil ditambahkan.');
  };

  const updateProduct = (id, updated) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Data produk berhasil diperbarui.');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    showToast('Produk telah dihapus dari katalog.', 'info');
  };

  // Articles CRUD
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

  // Orders Management (Pickup Only)
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
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Pesanan #${orderNumber} berhasil dibuat! (Pickup Only)`);
    return newOrder;
  };

  const updateOrderStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    showToast(`Status pesanan diubah menjadi: ${status}`);
  };

  const deleteOrder = (id) => {
    setOrders((prev) => prev.filter((item) => item.id !== id));
    showToast('Data pesanan telah dihapus.', 'info');
  };

  // Messages CRUD
  const addMessage = (msgData) => {
    const newMsg = {
      ...msgData,
      id: 'msg-' + Date.now(),
      status: 'unread',
      created_at: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast('Pesan Anda berhasil dikirim ke pengelola LeleQu.');
  };

  const updateMessageStatus = (id, status) => {
    setMessages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    showToast(`Status pesan diubah menjadi: ${status}`);
  };

  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((item) => item.id !== id));
    showToast('Pesan telah dihapus.', 'info');
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Pengaturan perusahaan berhasil disimpan.');
  };

  const resetAllData = () => {
    setProducts(initialProducts);
    setArticles(initialArticles);
    setOrders(initialOrders);
    setMessages(initialMessages);
    setSettings(initialSettings);
    localStorage.clear();
    showToast('Seluruh data berhasil di-reset ke pengaturan awal.', 'info');
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
        addProduct,
        updateProduct,
        deleteProduct,
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        messages,
        addMessage,
        updateMessageStatus,
        deleteMessage,
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
