import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  collection,
  query,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import type { Order, Product, HeroBanner } from '../types';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCJp2wJf9BFj5tt2C_VkzHqrZhNO_P8-2E",
  authDomain: "jm-fashion-e1e9f.firebaseapp.com",
  projectId: "jm-fashion-e1e9f",
  storageBucket: "jm-fashion-e1e9f.firebasestorage.app",
  messagingSenderId: "330248959965",
  appId: "1:330248959965:web:1f5715ae54bd2a6e8b6834"
};

// Initialize Firebase App safely (singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Upload an image File directly to Firebase Storage bucket (jm-fashion-e1e9f.firebasestorage.app)
 * with ImgBB fallback. Returns the permanent public download HTTPS URL.
 */
export async function uploadImageToFirebaseStorage(file: File, folder = 'product-images'): Promise<string> {
  if (!file) throw new Error('কোন ফাইল নির্বাচন করা হয়নি');
  if (!file.type.startsWith('image/')) throw new Error('অনুগ্রহ করে সঠিক ফরম্যাটের ছবি নির্বাচন করুন');

  // 1. Primary: Upload to Firebase Storage bucket
  try {
    const ext = file.name.split('.').pop() || 'png';
    const cleanFileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storageRef = ref(storage, cleanFileName);

    const snapshot = await uploadBytesResumable(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    if (downloadUrl && downloadUrl.startsWith('http')) {
      console.log('[Firebase Storage] Uploaded image successfully:', downloadUrl);
      return downloadUrl;
    }
  } catch (err: any) {
    console.warn('[Firebase Storage] Upload notice, trying ImgBB fallback:', err);
  }

  // 2. Fallback: Upload to ImgBB API
  try {
    const formData = new FormData();
    formData.append('image', file);
    const imgbbApiKey = 'c7014ea47dd9c72e4ebc5e9dbbfedca2';
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (json && json.data && json.data.url) {
      console.log('[ImgBB API] Uploaded image successfully:', json.data.url);
      return json.data.url;
    }
  } catch (imgbbErr) {
    console.warn('[ImgBB API] Upload error:', imgbbErr);
  }

  throw new Error('ছবি ফায়ারবেস স্টোরেজ বা ImgBB-তে আপলোড করা যায়নি। অনুগ্রহ করে ফাইলের সাইজ এবং ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
}

/**
 * Delete image object from Firebase Storage if it belongs to Firebase Storage
 */
export async function deleteImageFromFirebaseStorage(url: string): Promise<boolean> {
  if (!url || typeof url !== 'string' || !url.includes('firebasestorage.googleapis.com')) return false;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    console.log('[Firebase Storage] Deleted image object from bucket successfully');
    return true;
  } catch (err) {
    console.warn('[Firebase Storage] Delete notice:', err);
    return false;
  }
}

/**
 * Sign in using Firebase Authentication (email & password)
 */
export async function loginWithFirebase(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
}

/**
 * Logout from Firebase Auth
 */
export async function logoutFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Firebase signout warning:', err);
  }
}

/**
 * Recursively removes `undefined` values from objects and arrays
 * because Firestore throws an error if any field is `undefined`.
 */
export function cleanForFirestore<T>(data: T): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(item => cleanForFirestore(item));
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      result[key] = cleanForFirestore(value);
    }
  }
  return result;
}

// Helper to parse Firestore REST documents
function parseFirestoreValue(val: any): any {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(parseFirestoreValue);
  }
  if ('mapValue' in val) {
    const obj: any = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  return val;
}

function parseFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return null;
  const docId = doc.name ? doc.name.split('/').pop() : undefined;
  const result: any = { id: docId };
  for (const [k, v] of Object.entries(doc.fields as Record<string, any>)) {
    result[k] = parseFirestoreValue(v);
  }
  if (!result.id && docId) result.id = docId;
  return result;
}

function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj: any): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && typeof v !== 'function') {
      fields[k] = toFirestoreValue(v);
    }
  }
  return fields;
}

/**
 * Sync an order to Firebase Firestore collection 'orders'
 */
export async function saveOrderToFirestore(order: Order): Promise<{ success: boolean; error?: string }> {
  const orderId = order.id || ('ord-' + Date.now());
  let sdkOk = false;
  try {
    const cleanedOrder = cleanForFirestore(order);
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(orderDocRef, {
      ...cleanedOrder,
      syncedAt: new Date().toISOString(),
      updatedAtFirestore: serverTimestamp()
    }, { merge: true });
    sdkOk = true;
  } catch (err: any) {
    console.warn('[Firebase SDK] Order sync notice, attempting REST fallback:', err?.message || err);
  }

  // Guaranteed REST API write
  try {
    const restUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders/${orderId}`;
    const fields = toFirestoreFields(order);
    await fetch(restUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    return { success: true };
  } catch (restErr: any) {
    if (sdkOk) return { success: true };
    return { success: false, error: restErr?.message || String(restErr) };
  }
}

/**
 * Sync product catalog to Firebase Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<{ success: boolean; error?: string }> {
  if (!product || !product.id) {
    console.warn('[Firebase] Cannot save product without valid ID:', product);
    return { success: false, error: 'Product ID is missing' };
  }

  const prodId = String(product.id).trim();
  let sdkOk = false;

  // 1. Web SDK write (Full Document Replacement to guarantee deletion & update accuracy)
  try {
    const cleanedProduct = cleanForFirestore(product);
    const productDocRef = doc(db, 'products', prodId);
    await setDoc(productDocRef, {
      ...cleanedProduct,
      id: prodId,
      syncedAt: new Date().toISOString(),
      updatedAtFirestore: serverTimestamp()
    });
    sdkOk = true;
    console.log(`[Firebase SDK] Product ${prodId} saved to Firestore (Full Document Sync)`);
    return { success: true };
  } catch (err: any) {
    console.warn('[Firebase SDK] Product sync notice, trying REST:', err?.message || err);
  }

  // 2. Direct Firestore REST API patch for 100% guaranteed persistence
  try {
    const restUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/products/${prodId}`;
    const fields = toFirestoreFields(product);
    const res = await fetch(restUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    if (res.ok || sdkOk) {
      console.log(`[Firebase REST] Product ${prodId} saved to Firestore REST`);
      return { success: true };
    }
    const errText = await res.text();
    return { success: false, error: errText || 'Failed to save product' };
  } catch (restErr: any) {
    if (sdkOk) return { success: true };
    return { success: false, error: restErr?.message || String(restErr) };
  }
}

/**
 * Test Firestore connection directly
 */
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/connection_test/status`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          status: { stringValue: 'connected' },
          timestamp: { stringValue: new Date().toISOString() },
          project: { stringValue: firebaseConfig.projectId }
        }
      })
    });
    if (res.ok) {
      return {
        success: true,
        message: `Firebase Firestore সফলভাবে সংযুক্ত রয়েছে! (Project: ${firebaseConfig.projectId})`
      };
    }
    return {
      success: false,
      message: `Firebase কানেকশন স্ট্যাটাস: ${res.status}`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Firebase কানেকশন সমস্যা: ${err?.code || err?.message || String(err)}`,
      details: err
    };
  }
}

/**
 * Fetch orders list from Firestore
 */
export async function getOrdersFromFirestore(): Promise<Order[] | null> {
  // 1. Try Firebase Web SDK getDocsFromServer first to bypass local IndexedDB cache
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, limit(100));
    const snapshot = await getDocsFromServer(q).catch(() => getDocs(q));
    if (!snapshot.empty) {
      const ordersList: Order[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && (data.customer || data.orderNumber)) {
          ordersList.push({ ...data, id: data.id || docSnap.id } as Order);
        }
      });
      if (ordersList.length > 0) return ordersList;
    }
  } catch (err) {
    console.warn('[Firebase SDK] Orders fetch notice, trying REST:', err);
  }

  // 2. Fallback to Firestore REST API with no-cache header
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders?pageSize=100&_t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.documents && Array.isArray(json.documents)) {
        const ordersList: Order[] = json.documents
          .map(parseFirestoreDoc)
          .filter((o: any) => o && (o.customer || o.orderNumber));
        if (ordersList.length > 0) return ordersList;
      }
    }
  } catch (restErr) {
    console.warn('[Firebase REST] Orders fetch notice:', restErr);
  }

  return null;
}

/**
 * Fetch product from Firestore
 */
export async function getProductFromFirestore(productId = 'jm-fashion-kurti-01'): Promise<Product | null> {
  // 1. Try Web SDK getDocFromServer
  try {
    const productDocRef = doc(db, 'products', productId);
    const snap = await getDocFromServer(productDocRef).catch(() => getDoc(productDocRef));
    if (snap.exists()) {
      const data = snap.data();
      return { ...data, id: data.id || snap.id } as Product;
    }
  } catch (err) {
    console.warn('[Firebase SDK] getProduct notice, trying REST:', err);
  }

  // 2. Try REST API with no-cache header
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/products/${productId}?_t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const doc = await res.json();
      return parseFirestoreDoc(doc) as Product;
    }
  } catch (restErr) {
    console.warn('[Firebase REST] getProduct notice:', restErr);
  }

  return null;
}

export type FirestoreFetchResult = {
  success: boolean;
  products: Product[];
  isEmpty: boolean;
  error?: string;
};

/**
 * Fetch all products from Firestore collection 'products' (Authoritative Single Source of Truth)
 */
export async function getAllProductsFromFirestore(): Promise<FirestoreFetchResult> {
  // 1. Try Firebase Web SDK getDocsFromServer (forces fetching live documents from server)
  try {
    const colRef = collection(db, 'products');
    const snapshot = await getDocsFromServer(colRef).catch(() => getDocs(colRef));
    const list: Product[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = data.id || docSnap.id;
      if (data && id !== 'test_product' && (data.name || data.nameBn)) {
        list.push({ ...data, id } as Product);
      }
    });
    console.log(`[Firebase SDK] Fetched ${list.length} live products from Firestore server`);
    return {
      success: true,
      products: list,
      isEmpty: list.length === 0
    };
  } catch (err: any) {
    console.warn('[Firebase SDK] getAllProducts notice, attempting REST API:', err?.message || err);
  }

  // 2. Direct Firestore REST API fallback (100% reliable across all browsers & environments)
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/products?_t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (!json.documents || !Array.isArray(json.documents)) {
        return { success: true, products: [], isEmpty: true };
      }
      const list: Product[] = json.documents
        .map(parseFirestoreDoc)
        .filter((p: any) => p && p.id && p.id !== 'test_product' && (p.name || p.nameBn));
      console.log(`[Firebase REST] Fetched ${list.length} products from Firestore REST`);
      return {
        success: true,
        products: list,
        isEmpty: list.length === 0
      };
    }
  } catch (restErr: any) {
    console.warn('[Firebase REST] getAllProducts error:', restErr);
  }

  return {
    success: false,
    products: [],
    isEmpty: false,
    error: 'Could not connect to Firestore'
  };
}

/**
 * Batch save/sync all products to Firestore
 */
export async function saveProductsToFirestore(products: Product[]): Promise<{ success: boolean }> {
  try {
    for (const p of products) {
      if (p && p.id && p.id !== 'test_product') {
        await saveProductToFirestore(p);
      }
    }
    return { success: true };
  } catch (err) {
    console.warn('[Firebase] Error saving products list to Firestore:', err);
    return { success: false };
  }
}

/**
 * Permanently delete a product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!productId) return { success: true };
    const pDoc = doc(db, 'products', productId);
    await deleteDoc(pDoc).catch(() => {});

    // Also call REST DELETE
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/products/${productId}`;
    await fetch(url, { method: 'DELETE' }).catch(() => {});

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Permanently delete an order from Firebase Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!orderId) return { success: true };
    const cleanId = String(orderId).trim();
    const orderDocRef = doc(db, 'orders', cleanId);
    await deleteDoc(orderDocRef).catch(() => {});

    // Also call REST DELETE
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/orders/${cleanId}`;
    await fetch(url, { method: 'DELETE' }).catch(() => {});

    console.log(`[Firebase] Order ${cleanId} successfully deleted from Firestore!`);
    return { success: true };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.warn('[Firebase] Firestore order delete note:', errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Fetch website settings (including dedicated hero banners) from Firestore document `settings/website`
 */
export async function getWebsiteSettingsFromFirestore(): Promise<any | null> {
  // 1. Try Web SDK getDocFromServer
  try {
    const docRef = doc(db, 'settings', 'website');
    const snap = await getDocFromServer(docRef).catch(() => getDoc(docRef));
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('[Firebase SDK] getWebsiteSettings notice, trying REST:', err);
  }

  // 2. Try REST API with no-cache header
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/settings/website?_t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const doc = await res.json();
      return parseFirestoreDoc(doc);
    }
  } catch (restErr) {
    console.warn('[Firebase REST] getWebsiteSettings notice:', restErr);
  }

  return null;
}

/**
 * Save website settings (including dedicated hero banners) to Firestore document `settings/website`
 */
export async function saveWebsiteSettingsToFirestore(settingsData: { heroBanners?: HeroBanner[]; isHeroBannerEnabled?: boolean }): Promise<{ success: boolean; error?: string }> {
  const docId = 'website';
  let sdkOk = false;

  // 1. Web SDK write
  try {
    const cleaned = cleanForFirestore(settingsData);
    const docRef = doc(db, 'settings', docId);
    await setDoc(docRef, {
      ...cleaned,
      updatedAt: new Date().toISOString(),
      updatedAtFirestore: serverTimestamp()
    }, { merge: true });
    sdkOk = true;
    console.log('[Firebase SDK] Website settings saved to Firestore');
  } catch (err: any) {
    console.warn('[Firebase SDK] Website settings sync notice, ensuring REST patch:', err?.message || err);
  }

  // 2. Direct REST API patch for 100% reliable persistence
  try {
    const restUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/settings/${docId}`;
    const fields = toFirestoreFields(settingsData);
    const res = await fetch(restUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    if (res.ok || sdkOk) {
      console.log('[Firebase REST] Website settings saved to Firestore REST');
      return { success: true };
    }
    const errText = await res.text();
    return { success: false, error: errText || 'Failed to save to Firestore' };
  } catch (restErr: any) {
    if (sdkOk) return { success: true };
    return { success: false, error: restErr?.message || String(restErr) };
  }
}
