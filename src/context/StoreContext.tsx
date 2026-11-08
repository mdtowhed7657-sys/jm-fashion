import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ColorVariant, ProductImage, Order, OrderItem, CustomerInfo, OrderStatus, Review, FAQItem, HeroBanner, AdminUser, SelectedColorItem } from '../types';
import { INITIAL_PRODUCT, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_FAQS, INITIAL_HERO_BANNERS } from '../data/initialData';
import { calculatePricing } from '../utils/pricing';
import { generateColorTheme, applyThemeToCssVariables, ThemeTokens } from '../utils/colorTheme';
import {
  loginWithFirebase,
  logoutFromFirebase,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  saveProductToFirestore,
  saveProductsToFirestore,
  getAllProductsFromFirestore,
  deleteProductFromFirestore,
  getOrdersFromFirestore,
  getProductFromFirestore,
  getWebsiteSettingsFromFirestore,
  saveWebsiteSettingsToFirestore,
  deleteImageFromFirebaseStorage,
  auth,
  db
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, collection, doc } from 'firebase/firestore';

interface StoreContextType {
  // Multi-Product Catalog
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  product: Product; // Currently active/selected product
  setProduct: (p: Product) => void;
  addProduct: (newProduct: Omit<Product, 'id'> & { id?: string }) => Promise<boolean>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  openOrderModalForProduct: (product: Product, colorId?: string) => void;

  selectedColorId: string;
  activeColor: ColorVariant;
  theme: ThemeTokens;
  activeImageIndex: number;
  setActiveImageIndex: (idx: number) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: (open: boolean) => void;
  recentOrder: Order | null;
  orders: Order[];
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  reviews: Review[];
  faqs: FAQItem[];
  lightboxImage: ProductImage | null;
  setLightboxImage: (img: ProductImage | null) => void;

  // Admin Authentication & Routing
  currentRoute: string;
  navigate: (path: string) => void;
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  adminAuthToken: string | null;

  // Hero Banner State & Actions
  heroBanners: HeroBanner[];
  activeHeroBanner: HeroBanner | null;
  isHeroBannerEnabled: boolean;
  addHeroBanner: (banner: Omit<HeroBanner, 'id' | 'createdAt'>) => Promise<void>;
  updateHeroBanner: (id: string, updated: Partial<HeroBanner>) => Promise<void>;
  deleteHeroBanner: (id: string) => Promise<boolean>;
  setActiveHeroBanner: (id: string) => Promise<void>;
  reorderHeroBanners: (banners: HeroBanner[]) => Promise<void>;
  setIsHeroBannerEnabled: (enabled: boolean) => Promise<void>;

  // Product & Color Actions
  setSelectedColorId: (colorId: string) => void;
  updateProductInfo: (info: Partial<Product>, targetProductId?: string) => Promise<boolean>;
  addColorVariant: (newColor: Omit<ColorVariant, 'id'>, targetProductId?: string) => Promise<boolean>;
  updateColorVariant: (colorId: string, updated: Partial<ColorVariant>, targetProductId?: string) => Promise<boolean>;
  deleteColorVariant: (colorId: string, targetProductId?: string) => Promise<boolean>;
  addColorImage: (colorId: string, imageUrl: string, alt?: string, targetProductId?: string) => Promise<boolean>;
  deleteColorImage: (colorId: string, imageId: string, targetProductId?: string) => Promise<boolean>;
  reorderColorImages: (colorId: string, images: ProductImage[], targetProductId?: string) => Promise<boolean>;
  placeOrder: (
    customer: CustomerInfo,
    paymentMethod: 'cod' | 'bkash' | 'nagad',
    specificProduct?: Product,
    specificColor?: ColorVariant,
    selectedColorsList?: SelectedColorItem[],
    customItems?: OrderItem[],
    customSubtotal?: number,
    customDeliveryFee?: number,
    customTotalAmount?: number
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => Promise<boolean>;
  resetProductToDefaults: () => Promise<boolean>;
  addReview: (review: Omit<Review, 'id' | 'date' | 'verifiedBuyer'>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products catalog state with persistence (Authoritative Firestore Sync)
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('aura_products_catalog');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) { /* fallback */ }
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    return products[0]?.id || INITIAL_PRODUCTS[0].id;
  });

  // Current active product
  const product = useMemo(() => {
    const found = products.find(p => p.id === selectedProductId);
    return found || products[0] || INITIAL_PRODUCT;
  }, [products, selectedProductId]);

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin/login')) return '/admin/login';
      if (pathname.startsWith('/admin')) return '/admin';
      return '/';
    }
    return '/';
  });

  // Admin Auth State
  const [adminAuthToken, setAdminAuthToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jm_admin_token') || null;
    }
    return null;
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Dashboard UI open state
  const [isAdminOpen, setIsAdminOpenState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p.startsWith('/admin') && !p.startsWith('/admin/login');
    }
    return false;
  });

  // Navigate function with history synchronization
  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      setCurrentRoute(path);

      if (path === '/admin' || path === '/admin/dashboard') {
        setIsAdminOpenState(true);
      } else if (path === '/admin/login') {
        setIsAdminOpenState(false);
      } else if (path === '/') {
        setIsAdminOpenState(false);
      }
    }
  }, []);

  const setIsAdminOpen = useCallback((open: boolean) => {
    setIsAdminOpenState(open);
    if (open) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.history.pushState({}, '', '/admin');
      }
      setCurrentRoute('/admin');
    } else {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.history.pushState({}, '', '/');
      }
      setCurrentRoute('/');
    }
  }, []);

  // Check and restore admin session on mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('jm_admin_token');
      if (!savedToken) {
        setIsAdminAuthenticated(false);
        setAdminUser(null);
        setIsAuthLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/session', {
          headers: {
            Authorization: `Bearer ${savedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setIsAdminAuthenticated(true);
            setAdminUser(data.user);
            setAdminAuthToken(savedToken);
          } else {
            localStorage.removeItem('jm_admin_token');
            setAdminAuthToken(null);
            setIsAdminAuthenticated(false);
            setAdminUser(null);
          }
        } else {
          localStorage.removeItem('jm_admin_token');
          setAdminAuthToken(null);
          setIsAdminAuthenticated(false);
          setAdminUser(null);
        }
      } catch (err) {
        console.warn('Session verification fallback offline');
      } finally {
        setIsAuthLoading(false);
      }
    };

    verifySession();

    // Firebase Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        try {
          const idToken = await fbUser.getIdToken();
          const sessionRes = await fetch('/api/admin/firebase-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: fbUser.email,
              uid: fbUser.uid,
              idToken,
              name: fbUser.displayName || fbUser.email.split('@')[0]
            })
          });
          if (sessionRes.ok) {
            const data = await sessionRes.json();
            if (data.token) {
              localStorage.setItem('jm_admin_token', data.token);
              setAdminAuthToken(data.token);
            }
          }
        } catch (e) {
          // ignore background sync error
        }

        setIsAdminAuthenticated(true);
        setAdminUser({
          email: fbUser.email,
          role: 'admin',
          name: fbUser.displayName || fbUser.email.split('@')[0] || 'JM FASHION Admin',
          lastLogin: new Date().toISOString()
        });
      } else {
        const savedToken = localStorage.getItem('jm_admin_token');
        if (!savedToken) {
          setIsAdminAuthenticated(false);
          setAdminUser(null);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin/login')) {
        setCurrentRoute('/admin/login');
        setIsAdminOpenState(false);
      } else if (pathname.startsWith('/admin')) {
        setCurrentRoute('/admin');
        setIsAdminOpenState(true);
      } else {
        setCurrentRoute('/');
        setIsAdminOpenState(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route Guard Effect: Protect /admin and /admin/login routes
  useEffect(() => {
    if (isAuthLoading) return;

    if (currentRoute === '/admin' || currentRoute === '/admin/dashboard' || isAdminOpen) {
      if (!isAdminAuthenticated) {
        // Redirect unauthorized user directly to /admin/login
        setIsAdminOpenState(false);
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
          window.history.replaceState({}, '', '/admin/login');
        }
        setCurrentRoute('/admin/login');
      }
    } else if (currentRoute === '/admin/login') {
      if (isAdminAuthenticated) {
        // If already authenticated, redirect to /admin dashboard
        setIsAdminOpenState(true);
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
          window.history.replaceState({}, '', '/admin');
        }
        setCurrentRoute('/admin');
      }
    }
  }, [currentRoute, isAdminAuthenticated, isAuthLoading, isAdminOpen]);

  // Admin Login action
  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    setIsAuthLoading(true);
    setAuthError(null);

    const trimmedEmail = email.trim();

    // 1. Try Firebase Authentication Client SDK first
    try {
      const fbUser = await loginWithFirebase(trimmedEmail, pass);
      if (fbUser && fbUser.email) {
        let token = '';
        try {
          const idToken = await fbUser.getIdToken();
          const sessionRes = await fetch('/api/admin/firebase-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: fbUser.email,
              uid: fbUser.uid,
              idToken,
              name: fbUser.displayName || fbUser.email.split('@')[0]
            })
          });
          const sessionData = await sessionRes.json();
          token = sessionData.token || ('fb-' + fbUser.uid);
        } catch (sessErr) {
          token = 'fb-' + fbUser.uid;
        }

        localStorage.setItem('jm_admin_token', token);
        setAdminAuthToken(token);
        setIsAdminAuthenticated(true);
        setAdminUser({
          email: fbUser.email,
          role: 'admin',
          name: fbUser.displayName || fbUser.email.split('@')[0] || 'JM FASHION Admin',
          lastLogin: new Date().toISOString()
        });
        setIsAuthLoading(false);
        navigate('/admin');
        return true;
      }
    } catch (fbErr: any) {
      console.log('Firebase client login attempt:', fbErr?.code || fbErr?.message);
      const code = fbErr?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setAuthError('ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে ফায়ারবেসে নিবন্ধিত সঠিক তথ্য দিয়ে চেষ্টা করুন।');
        setIsAuthLoading(false);
        return false;
      }
      if (code === 'auth/invalid-email') {
        setAuthError('অনুগ্রহ করে সঠিক ফরম্যাটের ইমেইল অ্যাড্রেস লিখুন।');
        setIsAuthLoading(false);
        return false;
      }
      if (code === 'auth/too-many-requests') {
        setAuthError('অতিরিক্ত ব্যর্থ চেষ্টার কারণে লগইন সাময়িকভাবে স্থগিত। কিছুক্ষণ পর চেষ্টা করুন।');
        setIsAuthLoading(false);
        return false;
      }
    }

    // 2. Fallback to Server Login (which verifies exclusively with Firebase Authentication REST API)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: pass })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'ভুল ইমেইল অথবা পাসওয়ার্ড। আপনার ফায়ারবেস একাউন্টের সঠিক তথ্য দিন।');
        setIsAuthLoading(false);
        return false;
      }

      // Successful login via Firebase Auth
      const token = data.token;
      localStorage.setItem('jm_admin_token', token);
      setAdminAuthToken(token);
      setIsAdminAuthenticated(true);
      setAdminUser(data.user);
      setIsAuthLoading(false);

      // Redirect to /admin
      navigate('/admin');
      return true;
    } catch (err: any) {
      console.error('Login action error:', err);
      setAuthError('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setIsAuthLoading(false);
      return false;
    }
  };

  // Admin Logout action
  const logoutAdmin = async (): Promise<void> => {
    await logoutFromFirebase();
    const token = adminAuthToken || localStorage.getItem('jm_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        /* Ignore network logout errors */
      }
    }

    localStorage.removeItem('jm_admin_token');
    setAdminAuthToken(null);
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    setIsAdminOpenState(false);
    navigate('/admin/login');
  };

  const [selectedColorId, setSelectedColorIdState] = useState<string>(() => {
    return product.defaultColorId || (product.colors[0]?.id || 'color-maroon');
  });

  // Ensure selectedColorId always belongs to active product colors
  useEffect(() => {
    if (product && Array.isArray(product.colors) && product.colors.length > 0) {
      const colorBelongs = product.colors.some(c => c && c.id === selectedColorId);
      if (!colorBelongs) {
        setSelectedColorIdState(product.defaultColorId || product.colors[0]?.id || '');
      }
    }
  }, [product, selectedColorId]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('Free Size');
  const [quantity, setQuantity] = useState<number>(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [lightboxImage, setLightboxImage] = useState<ProductImage | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem('aura_orders_list');
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return [];
  });

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(() => {
    const local = localStorage.getItem('aura_reviews');
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return INITIAL_REVIEWS;
  });

  const [faqs] = useState<FAQItem[]>(INITIAL_FAQS);

  // Standalone Global Website Hero Banner State & Persistence
  const [websiteHeroBanners, setWebsiteHeroBanners] = useState<HeroBanner[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jm_website_hero_banners');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_HERO_BANNERS;
  });

  const [isHeroBannerEnabledState, setIsHeroBannerEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jm_website_hero_banner_enabled');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  // Save Website Hero Banner Settings to Firestore, localStorage & All Catalog Products
  const saveHeroBannerSettings = async (banners: HeroBanner[], enabled: boolean): Promise<void> => {
    setWebsiteHeroBanners(banners);
    setIsHeroBannerEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jm_website_hero_banners', JSON.stringify(banners));
      localStorage.setItem('jm_website_hero_banner_enabled', String(enabled));
    }

    try {
      await saveWebsiteSettingsToFirestore({
        heroBanners: banners,
        isHeroBannerEnabled: enabled
      });
    } catch (err: any) {
      console.error('Firestore hero banner save error:', err);
      throw new Error('ফায়ারবেসে ব্যানার সেভ করতে সমস্যা হয়েছে। অনুগ্রহ করে ফায়ারবেস কানেকশন চেক করুন।');
    }

    setProducts(prevProducts => {
      const updated = prevProducts.map(p => ({
        ...p,
        heroBanners: banners,
        isHeroBannerEnabled: enabled
      }));
      localStorage.setItem('aura_products_catalog', JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch products & orders from Firestore as the single source of truth on mount
  useEffect(() => {
    const syncData = async () => {
      let isFirestoreLoaded = false;

      // 1. Fetch products from Firestore FIRST (Authoritative Single Source of Truth)
      try {
        const fetchResult = await getAllProductsFromFirestore();
        
        // Fetch dedicated website settings (hero banners) from settings/website
        const websiteSettings = await getWebsiteSettingsFromFirestore();

        if (websiteSettings) {
          if (websiteSettings.heroBanners && Array.isArray(websiteSettings.heroBanners) && websiteSettings.heroBanners.length > 0) {
            setWebsiteHeroBanners(websiteSettings.heroBanners);
            if (typeof window !== 'undefined') {
              localStorage.setItem('jm_website_hero_banners', JSON.stringify(websiteSettings.heroBanners));
            }
          }
          if (websiteSettings.isHeroBannerEnabled !== undefined) {
            setIsHeroBannerEnabledState(websiteSettings.isHeroBannerEnabled);
            if (typeof window !== 'undefined') {
              localStorage.setItem('jm_website_hero_banner_enabled', String(websiteSettings.isHeroBannerEnabled));
            }
          }
        }

        if (fetchResult.success && fetchResult.products && fetchResult.products.length > 0) {
          const validProds = fetchResult.products.filter(p => p && p.id && p.id !== 'test_product' && (p.name || p.nameBn));

          if (validProds.length > 0) {
            validProds.forEach(fp => {
              if (websiteSettings && websiteSettings.heroBanners && Array.isArray(websiteSettings.heroBanners)) {
                fp.heroBanners = websiteSettings.heroBanners;
                if (websiteSettings.isHeroBannerEnabled !== undefined) {
                  fp.isHeroBannerEnabled = websiteSettings.isHeroBannerEnabled;
                }
              }
            });

            // AUTHORITATIVE FIRESTORE PRODUCT DATA: DO NOT SEED OR MERGE HARDCODED INITIAL_PRODUCTS!
            setProducts(validProds);
            localStorage.setItem('aura_products_catalog', JSON.stringify(validProds));
            isFirestoreLoaded = true;
          }
        }
      } catch (e) {
        console.warn('Firestore authoritative fetch note:', e);
      }

      // 2. Only if Firestore was completely empty or offline, fallback to local storage
      if (!isFirestoreLoaded) {
        let loadedProducts: Product[] = [];
        const local = localStorage.getItem('aura_products_catalog');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedProducts = parsed.filter((p: any) => p && p.id && p.id !== 'test_product');
            }
          } catch (e) {}
        }

        if (loadedProducts.length > 0) {
          setProducts(loadedProducts);
        }
      }

      // 3. Fetch & merge orders from localStorage, Server, and Firestore
      const ordersMap = new Map<string, Order>();

      const localOrders = localStorage.getItem('aura_orders_list');
      if (localOrders) {
        try {
          const parsed = JSON.parse(localOrders);
          if (Array.isArray(parsed)) {
            parsed.forEach(o => { if (o && o.id) ordersMap.set(o.id, o); });
          }
        } catch (e) {}
      }

      try {
        const ordRes = await fetch('/api/orders');
        if (ordRes.ok) {
          const serverOrders = await ordRes.json();
          if (Array.isArray(serverOrders)) {
            serverOrders.forEach((o: Order) => { if (o && o.id) ordersMap.set(o.id, o); });
          }
        }
      } catch (e) {}

      try {
        const firestoreOrders = await getOrdersFromFirestore();
        if (firestoreOrders && Array.isArray(firestoreOrders)) {
          firestoreOrders.forEach(o => { if (o && o.id) ordersMap.set(o.id, o); });
        }
      } catch (e) {}

      if (ordersMap.size > 0) {
        const mergedOrders = Array.from(ordersMap.values()).sort((a, b) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setOrders(mergedOrders);
        localStorage.setItem('aura_orders_list', JSON.stringify(mergedOrders));
      }
    };
    syncData();

    // Attach real-time Firestore listeners for instant catalog & hero banner updates across tabs/devices
    let unsubProducts: () => void = () => {};
    let unsubSettings: () => void = () => {};

    try {
      const productsCol = collection(db, 'products');
      unsubProducts = onSnapshot(productsCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = data.id || docSnap.id;
            if (data && id !== 'test_product' && (data.name || data.nameBn)) {
              list.push({ ...data, id } as Product);
            }
          });
          if (list.length > 0) {
            setProducts(list);
            if (typeof window !== 'undefined') {
              localStorage.setItem('aura_products_catalog', JSON.stringify(list));
            }
          }
        }
      }, (err) => {
        console.warn('onSnapshot products listener note:', err);
      });
    } catch (e) {
      console.warn('Realtime products listener init error:', e);
    }

    try {
      const settingsDocRef = doc(db, 'settings', 'website');
      unsubSettings = onSnapshot(settingsDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.heroBanners && Array.isArray(data.heroBanners) && data.heroBanners.length > 0) {
            setWebsiteHeroBanners(data.heroBanners);
            if (typeof window !== 'undefined') {
              localStorage.setItem('jm_website_hero_banners', JSON.stringify(data.heroBanners));
            }
          }
          if (data && data.isHeroBannerEnabled !== undefined) {
            setIsHeroBannerEnabledState(data.isHeroBannerEnabled);
            if (typeof window !== 'undefined') {
              localStorage.setItem('jm_website_hero_banner_enabled', String(data.isHeroBannerEnabled));
            }
          }
        }
      }, (err) => {
        console.warn('onSnapshot website settings listener note:', err);
      });
    } catch (e) {
      console.warn('Realtime settings listener init error:', e);
    }

    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, []);

  // Save all products to localStorage & Firestore
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('aura_products_catalog', JSON.stringify(updatedProducts));
    saveProductsToFirestore(updatedProducts).catch(err => console.warn('Firestore products sync:', err));
    if (updatedProducts.length > 0) {
      localStorage.setItem('aura_product_data', JSON.stringify(updatedProducts[0]));
    }
  };

  // Sync a single product changes to state, localStorage & Firestore
  const saveProduct = async (updatedProd: Product): Promise<{ success: boolean; error?: string }> => {
    if (!updatedProd || !updatedProd.id) return { success: false, error: 'Invalid product' };

    setProducts(prevProducts => {
      const exists = prevProducts.some(p => p.id === updatedProd.id);
      const nextProducts = exists
        ? prevProducts.map(p => p.id === updatedProd.id ? updatedProd : p)
        : [...prevProducts, updatedProd];
      localStorage.setItem('aura_products_catalog', JSON.stringify(nextProducts));
      return nextProducts;
    });

    const firestoreResult = await saveProductToFirestore(updatedProd);

    if (updatedProd.heroBanners && Array.isArray(updatedProd.heroBanners)) {
      saveWebsiteSettingsToFirestore({
        heroBanners: updatedProd.heroBanners,
        isHeroBannerEnabled: updatedProd.isHeroBannerEnabled
      }).catch(err => console.warn('Firestore website settings sync error:', err));
    }

    if (!firestoreResult.success) {
      throw new Error(firestoreResult.error || 'ফায়ারবেসে প্রডাক্ট সেভ করতে ব্যর্থ হয়েছে');
    }

    return firestoreResult;
  };

  const setProduct = (updatedProd: Product) => {
    saveProduct(updatedProd);
  };

  // Add a new product to catalog
  const addProduct = async (newProductData: Omit<Product, 'id'> & { id?: string }): Promise<boolean> => {
    const newId = newProductData.id || 'prod-' + Date.now();
    const created: Product = {
      ...newProductData,
      id: newId,
      isVisible: newProductData.isVisible !== false,
      colors: newProductData.colors || []
    };
    
    setProducts(prevProducts => {
      const next = [...prevProducts, created];
      localStorage.setItem('aura_products_catalog', JSON.stringify(next));
      return next;
    });
    setSelectedProductId(newId);
    await saveProductToFirestore(created);
    return true;
  };

  // Update a product by ID safely
  const updateProduct = async (id: string, updated: Partial<Product>): Promise<boolean> => {
    let targetUpdated: Product | null = null;
    
    setProducts(prevProducts => {
      const next = prevProducts.map(p => {
        if (p.id === id) {
          let colors = p.colors;
          if (updated.basePrice !== undefined) {
            const newPrice = Number(updated.basePrice);
            const newRegPrice = updated.baseRegularPrice !== undefined ? Number(updated.baseRegularPrice) : (p.baseRegularPrice || Math.round(newPrice * 1.3));
            colors = (p.colors || []).map(c => ({
              ...c,
              priceOverride: newPrice,
              regularPriceOverride: newRegPrice
            }));
          }
          const result: Product = {
            ...p,
            ...updated,
            colors: updated.colors || colors
          };
          targetUpdated = result;
          return result;
        }
        return p;
      });
      localStorage.setItem('aura_products_catalog', JSON.stringify(next));
      return next;
    });

    if (targetUpdated) {
      await saveProduct(targetUpdated);
    }
    return true;
  };

  // Delete a product by ID
  const deleteProduct = async (id: string): Promise<boolean> => {
    if (products.length <= 1) {
      throw new Error('কমপক্ষে একটি প্রোডাক্ট থাকা আবশ্যক।');
    }
    const next = products.filter(p => p.id !== id);
    setProducts(next);
    localStorage.setItem('aura_products_catalog', JSON.stringify(next));
    deleteProductFromFirestore(id).catch(() => {});
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    if (selectedProductId === id) {
      setSelectedProductId(next[0]?.id || '');
    }
    return true;
  };

  // Open order modal targeting specific product & optional color
  const openOrderModalForProduct = (targetProd: Product, colorId?: string) => {
    setSelectedProductId(targetProd.id);
    const colorToSelect = colorId || targetProd.defaultColorId || targetProd.colors[0]?.id;
    if (colorToSelect) {
      setSelectedColorIdState(colorToSelect);
    }
    setIsOrderModalOpen(true);
  };

  // Sync orders to localStorage
  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('aura_orders_list', JSON.stringify(updatedOrders));
  };

  // Derived active color
  const activeColor = useMemo(() => {
    const found = product.colors.find(c => c.id === selectedColorId);
    if (found) return found;
    return product.colors[0] || INITIAL_PRODUCT.colors[0];
  }, [product.colors, selectedColorId]);

  // Global Website Hero Banners & Active Banner
  const heroBanners = websiteHeroBanners;
  const isHeroBannerEnabled = isHeroBannerEnabledState;

  const activeHeroBanner = useMemo(() => {
    if (!isHeroBannerEnabled) return null;
    const active = heroBanners.find(b => b.isActive);
    return active || heroBanners[0] || null;
  }, [heroBanners, isHeroBannerEnabled]);

  // Hero Banner Management Actions
  const addHeroBanner = async (bannerData: Omit<HeroBanner, 'id' | 'createdAt'>): Promise<void> => {
    const newBanner: HeroBanner = {
      ...bannerData,
      id: 'banner-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    };
    let updatedList = [...websiteHeroBanners];
    if (newBanner.isActive) {
      updatedList = updatedList.map(b => ({ ...b, isActive: false }));
    }
    if (updatedList.length === 0) {
      newBanner.isActive = true;
    }
    const nextBanners = [newBanner, ...updatedList];
    await saveHeroBannerSettings(nextBanners, true);
  };

  const updateHeroBanner = async (id: string, updatedFields: Partial<HeroBanner>): Promise<void> => {
    let updatedList = websiteHeroBanners.map(b => {
      if (b.id === id) {
        return { ...b, ...updatedFields };
      }
      if (updatedFields.isActive) {
        return { ...b, isActive: false };
      }
      return b;
    });
    await saveHeroBannerSettings(updatedList, isHeroBannerEnabledState);
  };

  const deleteHeroBanner = async (id: string): Promise<boolean> => {
    if (websiteHeroBanners.length <= 1) {
      throw new Error('কমপক্ষে একটি ব্যানার থাকা প্রয়োজন। ব্যানার না দেখাতে চাইলে "ব্যানার প্রদর্শন বন্ধ (Disable)" অপশনটি ব্যবহার করুন।');
    }
    const filtered = websiteHeroBanners.filter(b => b.id !== id);
    const hasActive = filtered.some(b => b.isActive);
    if (!hasActive && filtered.length > 0) {
      filtered[0] = { ...filtered[0], isActive: true };
    }
    await saveHeroBannerSettings(filtered, isHeroBannerEnabledState);
    return true;
  };

  const setActiveHeroBanner = async (id: string): Promise<void> => {
    const updatedList = websiteHeroBanners.map(b => ({
      ...b,
      isActive: b.id === id
    }));
    await saveHeroBannerSettings(updatedList, isHeroBannerEnabledState);
  };

  const reorderHeroBanners = async (newBanners: HeroBanner[]): Promise<void> => {
    await saveHeroBannerSettings(newBanners, isHeroBannerEnabledState);
  };

  const setIsHeroBannerEnabled = async (enabled: boolean): Promise<void> => {
    await saveHeroBannerSettings(websiteHeroBanners, enabled);
  };

  // Derived Dynamic Theme Tokens
  const theme = useMemo(() => {
    return generateColorTheme(
      activeColor.code,
      activeColor.id,
      activeColor.name,
      activeColor.nameBn
    );
  }, [activeColor.code, activeColor.id, activeColor.name, activeColor.nameBn]);

  // Dynamically update document CSS variables on theme change
  useEffect(() => {
    applyThemeToCssVariables(theme);
  }, [theme]);

  // Color change action
  const setSelectedColorId = (colorId: string) => {
    setSelectedColorIdState(colorId);
    setActiveImageIndex(0); // Reset gallery to top image
  };

  // Helper to resolve target product
  const getTargetProduct = (targetProductId?: string) => {
    if (targetProductId) {
      const found = products.find(p => p.id === targetProductId);
      if (found) return found;
    }
    return product;
  };

  // Update product header / basic details
  const updateProductInfo = async (info: Partial<Product>, targetProductId?: string): Promise<boolean> => {
    const target = getTargetProduct(targetProductId);
    const updated = { ...target, ...info };

    if (info.basePrice !== undefined) {
      const newPrice = Number(info.basePrice);
      const newRegPrice = info.baseRegularPrice !== undefined ? Number(info.baseRegularPrice) : (target.baseRegularPrice || Math.round(newPrice * 1.3));
      updated.basePrice = newPrice;
      updated.baseRegularPrice = newRegPrice;
      updated.colors = (target.colors || []).map(c => ({
        ...c,
        priceOverride: newPrice,
        regularPriceOverride: newRegPrice
      }));
    }

    if (info.bundlePrice !== undefined || info.bundleQuantity !== undefined) {
      const bQty = info.bundleQuantity !== undefined ? Number(info.bundleQuantity) : (target.bundleQuantity || 5);
      const bPrice = info.bundlePrice !== undefined ? Number(info.bundlePrice) : (target.bundlePrice || 500);
      updated.bundleQuantity = bQty;
      updated.bundlePrice = bPrice;
      updated.offerText = `1 PIECE = ${updated.basePrice || 120}৳ • ${bQty} PIECES = ${bPrice}৳`;
      updated.offerTextBn = `১ পিস ${updated.basePrice || 120}৳ • ${bQty} পিস ${bPrice}৳ স্পেশাল অফার!`;
    }

    await saveProduct(updated);
    return true;
  };

  // Add Color Variant
  const addColorVariant = async (newColorData: Omit<ColorVariant, 'id'>, targetProductId?: string): Promise<boolean> => {
    const target = getTargetProduct(targetProductId);
    const newId = 'color-' + Date.now();
    const newColor: ColorVariant = {
      ...newColorData,
      id: newId
    };
    const updatedColors = [...target.colors, newColor];
    const updatedProduct = { ...target, colors: updatedColors };
    await saveProduct(updatedProduct);
    if (target.id === selectedProductId) {
      setSelectedColorId(newId);
    }
    return true;
  };

  // Update Color Variant
  const updateColorVariant = async (colorId: string, updatedFields: Partial<ColorVariant>, targetProductId?: string): Promise<boolean> => {
    const target = getTargetProduct(targetProductId);
    const updatedColors = target.colors.map(c => {
      if (c.id === colorId) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    const updatedProduct = { ...target, colors: updatedColors };
    await saveProduct(updatedProduct);
    return true;
  };

  // Delete Color Variant
  const deleteColorVariant = async (colorId: string, targetProductId?: string): Promise<boolean> => {
    const target = getTargetProduct(targetProductId);
    if (target.colors.length <= 1) {
      throw new Error('কমপক্ষে ১টি কালার ভ্যারিয়েন্ট থাকতে হবে। শেষ কালারটি ডিলিট করা যাবে না।');
    }
    const updatedColors = target.colors.filter(c => c.id !== colorId);
    const updatedProduct = { ...target, colors: updatedColors };
    await saveProduct(updatedProduct);
    if (target.id === selectedProductId && selectedColorId === colorId) {
      setSelectedColorId(updatedColors[0].id);
    }
    return true;
  };

  // Add Image to Color
  const addColorImage = async (colorId: string, imageUrl: string, alt?: string, targetProductId?: string): Promise<boolean> => {
    const target = getTargetProduct(targetProductId);
    const color = target.colors.find(c => c.id === colorId);
    if (!color) return false;

    const newImg: ProductImage = {
      id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      url: imageUrl,
      alt: alt || `${color.name} View`,
      isMain: color.images.length === 0
    };

    return await updateColorVariant(colorId, {
      images: [...color.images, newImg]
    }, target.id);
  };

  // Delete Image from Color
  const deleteColorImage = async (colorId: string, imageId: string, targetProductId?: string): Promise<boolean> => {
    const target = getTargetProduct(targetProductId);
    const color = target.colors.find(c => c.id === colorId);
    if (!color) {
      throw new Error('কালার ভ্যারিয়েন্টটি পাওয়া যায়নি।');
    }

    const imageToDeleteObj = color.images.find(img => img.id === imageId);
    const filteredImages = color.images.filter(img => img.id !== imageId);

    // If the deleted image was main, assign isMain to the first remaining image
    if (filteredImages.length > 0) {
      const hasMain = filteredImages.some(img => img.isMain);
      if (!hasMain) {
        filteredImages[0] = { ...filteredImages[0], isMain: true };
      }
    }

    const updatedColors = target.colors.map(c => {
      if (c.id === colorId) {
        return { ...c, images: filteredImages };
      }
      return c;
    });

    const updatedProduct = { ...target, colors: updatedColors };

    if (imageToDeleteObj?.url) {
      deleteImageFromFirebaseStorage(imageToDeleteObj.url).catch(() => {});
    }

    await saveProduct(updatedProduct);

    if (target.id === selectedProductId && activeColor.id === colorId) {
      setActiveImageIndex(0);
    }

    return true;
  };

  // Reorder Images
  const reorderColorImages = async (colorId: string, newImages: ProductImage[], targetProductId?: string): Promise<boolean> => {
    return await updateColorVariant(colorId, { images: newImages }, targetProductId);
  };

  // Place Order
  const placeOrder = async (
    customer: CustomerInfo,
    paymentMethod: 'cod' | 'bkash' | 'nagad',
    specificProduct?: Product,
    specificColor?: ColorVariant,
    selectedColorsList?: SelectedColorItem[],
    customItems?: OrderItem[],
    customSubtotal?: number,
    customDeliveryFee?: number,
    customTotalAmount?: number
  ): Promise<Order> => {
    let orderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    if (customItems && customItems.length > 0) {
      orderItems = customItems;
      calculatedSubtotal = customSubtotal !== undefined ? customSubtotal : customItems.reduce((sum, item) => sum + item.totalPrice, 0);
    } else {
      // 1. Resolve exact target product
      const targetProduct = specificProduct || products.find(p => p.id === selectedProductId) || product;
      
      // 2. Resolve exact target color ensuring it belongs to targetProduct
      let targetColor = specificColor;
      if (!targetColor || !Array.isArray(targetProduct.colors) || !targetProduct.colors.some(c => c && c.id === targetColor?.id)) {
        targetColor = targetProduct.colors?.find(c => c && c.id === selectedColorId) || targetProduct.colors?.[0] || activeColor;
      }

      // 3. Accurate pricing calculation for THIS product
      const pricing = calculatePricing(targetProduct, targetColor, quantity);
      const itemTotal = pricing.subtotal;
      calculatedSubtotal = itemTotal;

      const mainImg = selectedColorsList?.[0]?.imageUrl || targetColor?.images?.[0]?.url || targetProduct.heroBanners?.[0]?.imageUrl || '/assets/products/banner_5models.png';

      const colorNameEn = 'Any Available Colour';
      const colorNameBn = customer.preferredColors || '🌈 আমাদের কাছে সকল কালার available আছে। আপনার পছন্দের কালার স্টক থেকে পাঠানো হবে। ❤️';

      orderItems = [
        {
          productId: targetProduct.id,
          productName: targetProduct.nameBn || targetProduct.name,
          colorId: targetColor?.id || 'default-color',
          colorName: colorNameEn,
          colorNameBn: colorNameBn,
          colorCode: targetColor?.code || '#E6004C',
          size: selectedSize || 'Free Size',
          quantity,
          unitPrice: pricing.unitPrice,
          totalPrice: itemTotal,
          imageUrl: mainImg,
          appliedBundle: pricing.isBundleApplied,
          bundleSavings: pricing.savings
        }
      ];
    }

    const feeInside = 100;
    const feeOutside = 130;
    const deliveryFee = customDeliveryFee !== undefined
      ? customDeliveryFee
      : (customer.deliveryZone === 'inside_dhaka' ? feeInside : feeOutside);
    const totalAmount = customTotalAmount !== undefined
      ? customTotalAmount
      : (calculatedSubtotal + deliveryFee);

    const orderNumber = 'JM-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      customer,
      items: orderItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Try server post
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (e) {
      console.log('Order saved locally');
    }

    // Sync to Firebase Firestore in the background
    saveOrderToFirestore(newOrder).catch((e) => {
      console.warn('Firestore order sync error:', e);
    });

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
    setRecentOrder(newOrder);
    setIsOrderModalOpen(false);
    setIsSuccessModalOpen(true);

    return newOrder;
  };

  // Order status update
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    saveOrders(updated);
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
  };

  // Delete order permanently
  const deleteOrder = async (orderId: string): Promise<boolean> => {
    if (!orderId) {
      throw new Error('অর্ডার আইডি পাওয়া যায়নি');
    }

    const cleanId = String(orderId).trim();

    // 1. Delete from Firebase Firestore in background
    deleteOrderFromFirestore(cleanId).catch((err) => {
      console.warn('Firestore delete order notice:', err);
    });

    // 2. Delete from server store with fallback to POST /api/orders/delete
    try {
      const url = `/api/orders/${encodeURIComponent(cleanId)}`;
      let res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // If DELETE failed or returned non-JSON, try fallback POST /api/orders/delete
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        try {
          const fallbackRes = await fetch('/api/orders/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ id: cleanId })
          });
          if (fallbackRes.ok) {
            res = fallbackRes;
          }
        } catch (e) {
          // ignore network fallback error
        }
      }

      // Check if response is JSON, otherwise parse safely
      const finalContentType = res.headers.get('content-type') || '';
      let data: any = { success: true };
      if (finalContentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.warn('Could not parse server JSON response, continuing with local removal:', jsonErr);
        }
      }

      if (data && data.success === false && data.error && data.error !== 'Order not found') {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.warn('Server delete order warning (proceeding with local removal):', err);
    }

    // 3. Update React state and local storage immediately
    const updated = orders.filter(
      (o) => o && o.id !== cleanId && o.orderNumber !== cleanId
    );
    setOrders(updated);
    localStorage.setItem('aura_orders_list', JSON.stringify(updated));

    if (recentOrder?.id === cleanId || recentOrder?.orderNumber === cleanId) {
      setRecentOrder(null);
    }
    return true;
  };

  // Reset Product to default configuration
  const resetProductToDefaults = async (): Promise<boolean> => {
    try {
      await fetch('/api/product', { method: 'DELETE' });
      setProduct(INITIAL_PRODUCT);
      localStorage.setItem('aura_product_data', JSON.stringify(INITIAL_PRODUCT));
      setSelectedColorId(INITIAL_PRODUCT.defaultColorId || INITIAL_PRODUCT.colors[0].id);
      setActiveImageIndex(0);
      return true;
    } catch (err: any) {
      console.error('Failed to reset product:', err);
      throw new Error('প্রডাক্ট রিসেট করতে ব্যর্থ হয়েছে');
    }
  };

  // Add customer review
  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'verifiedBuyer'>) => {
    const newRev: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: 'Just now',
      verifiedBuyer: true
    };
    const updatedRevs = [newRev, ...reviews];
    setReviews(updatedRevs);
    localStorage.setItem('aura_reviews', JSON.stringify(updatedRevs));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        selectedProductId,
        setSelectedProductId,
        product,
        setProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        openOrderModalForProduct,
        selectedColorId,
        activeColor,
        theme,
        activeImageIndex,
        setActiveImageIndex,
        selectedSize,
        setSelectedSize,
        quantity,
        setQuantity,
        isOrderModalOpen,
        setIsOrderModalOpen,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        recentOrder,
        orders,
        isAdminOpen,
        setIsAdminOpen,
        reviews,
        faqs,
        lightboxImage,
        setLightboxImage,
        currentRoute,
        navigate,
        adminUser,
        isAdminAuthenticated,
        isAuthLoading,
        authError,
        setAuthError,
        loginAdmin,
        logoutAdmin,
        adminAuthToken,
        heroBanners,
        activeHeroBanner,
        isHeroBannerEnabled,
        addHeroBanner,
        updateHeroBanner,
        deleteHeroBanner,
        setActiveHeroBanner,
        reorderHeroBanners,
        setIsHeroBannerEnabled,
        setSelectedColorId,
        updateProductInfo,
        addColorVariant,
        updateColorVariant,
        deleteColorVariant,
        addColorImage,
        deleteColorImage,
        reorderColorImages,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        resetProductToDefaults,
        addReview
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
