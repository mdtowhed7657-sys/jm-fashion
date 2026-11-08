import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Memory / File persistence setup
const DATA_DIR = path.join(process.cwd(), 'data_store');
const PRODUCT_FILE = path.join(DATA_DIR, 'product.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions for reading/writing persistence
function readJSONFile(filePath: string, fallback: any) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJSONFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Verify session token helper
function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const sessions = readJSONFile(SESSIONS_FILE, {});
  const session = sessions[token];
  if (!session) return false;

  // Session valid for 30 days
  const now = Date.now();
  if (session.expiresAt && session.expiresAt < now) {
    delete sessions[token];
    writeJSONFile(SESSIONS_FILE, sessions);
    return false;
  }
  return true;
}

// Middleware to protect admin routes (optional/soft or strict)
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Admin login required.' });
  }
  next();
}

// Initial API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ================= ADMIN AUTHENTICATION API ROUTES (FIREBASE AUTH ONLY) =================

const FIREBASE_WEB_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyCJp2wJf9BFj5tt2C_VkzHqrZhNO_P8-2E";

// POST /api/admin/firebase-session (Create server session from client Firebase Auth)
app.post('/api/admin/firebase-session', async (req, res) => {
  try {
    const { email, uid, idToken, name } = req.body || {};
    if (!email || !uid) {
      return res.status(400).json({ success: false, error: 'Email and UID are required' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // Verify idToken with Firebase Identity Toolkit if provided
    if (idToken) {
      try {
        const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
        const lookupData = await lookupRes.json();
        if (!lookupRes.ok || !lookupData.users || lookupData.users.length === 0) {
          return res.status(401).json({ success: false, error: 'অবৈধ ফায়ারবেস সেশন টোকেন (Invalid Firebase ID token)' });
        }
        const verifiedUser = lookupData.users[0];
        if (verifiedUser.localId !== uid) {
          return res.status(401).json({ success: false, error: 'ফায়ারবেস ইউজার আইডি অমিল' });
        }
      } catch (err) {
        console.warn('Firebase token verification warning:', err);
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + (30 * 24 * 60 * 60 * 1000);

    const sessions = readJSONFile(SESSIONS_FILE, {});
    sessions[token] = {
      email: trimmedEmail,
      role: 'admin',
      name: name || trimmedEmail.split('@')[0] || 'JM FASHION Admin',
      firebaseUid: uid,
      createdAt: new Date().toISOString(),
      expiresAt
    };
    writeJSONFile(SESSIONS_FILE, sessions);

    res.json({
      success: true,
      token,
      user: {
        email: trimmedEmail,
        role: 'admin',
        name: name || trimmedEmail.split('@')[0] || 'JM FASHION Admin',
        lastLogin: new Date().toISOString()
      },
      message: 'ফায়ারবেস সেশন তৈরি সফল হয়েছে'
    });
  } catch (err: any) {
    console.error('Firebase session error:', err);
    res.status(500).json({ success: false, error: 'সেশন তৈরি করতে ব্যর্থ হয়েছে' });
  }
});

// POST /api/admin/login (Authenticates EXCLUSIVELY against Firebase Authentication)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'ইমেইল এবং পাসওয়ার্ড দেওয়া আবশ্যক (Email and password are required)'
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPass = String(password).trim();

    // Authenticate exclusively via Google Identity Toolkit (Firebase Auth REST API)
    const fbResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: trimmedEmail,
        password: trimmedPass,
        returnSecureToken: true
      })
    });

    const fbData = await fbResponse.json();

    if (fbResponse.ok && fbData && fbData.idToken) {
      // Firebase authentication verified successfully
      const token = crypto.randomBytes(32).toString('hex');
      const now = Date.now();
      const expiresAt = now + (30 * 24 * 60 * 60 * 1000);

      const sessions = readJSONFile(SESSIONS_FILE, {});
      sessions[token] = {
        email: fbData.email || trimmedEmail,
        role: 'admin',
        name: fbData.displayName || trimmedEmail.split('@')[0] || 'JM FASHION Admin',
        firebaseUid: fbData.localId,
        createdAt: new Date().toISOString(),
        expiresAt
      };
      writeJSONFile(SESSIONS_FILE, sessions);

      return res.json({
        success: true,
        token,
        user: {
          email: fbData.email || trimmedEmail,
          role: 'admin',
          name: fbData.displayName || trimmedEmail.split('@')[0] || 'JM FASHION Admin',
          lastLogin: new Date().toISOString()
        },
        message: 'ফায়ারবেস এডমিন লগইন সফল হয়েছে (Firebase Login Successful)'
      });
    }

    // Login rejected by Firebase Authentication
    const fbErrorMsg = fbData?.error?.message;
    let userMsg = 'ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে ফায়ারবেসে নিবন্ধিত সঠিক তথ্য দিয়ে চেষ্টা করুন।';
    if (fbErrorMsg === 'EMAIL_NOT_FOUND' || fbErrorMsg === 'INVALID_PASSWORD' || fbErrorMsg === 'INVALID_LOGIN_CREDENTIALS') {
      userMsg = 'ভুল ইমেইল অথবা পাসওয়ার্ড। আপনার ফায়ারবেস একাউন্টের সঠিক তথ্য দিন।';
    } else if (fbErrorMsg === 'USER_DISABLED') {
      userMsg = 'এই একাউন্টটি সাময়িকভাবে নিষ্ক্রিয় (Disabled) করা হয়েছে।';
    } else if (fbErrorMsg === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
      userMsg = 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।';
    }

    return res.status(401).json({
      success: false,
      error: userMsg
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'লগইন প্রক্রিয়ায় ত্রুটি হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।'
    });
  }
});

// GET /api/admin/session (Verify session validity)
app.get('/api/admin/session', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'No session token provided'
    });
  }

  const sessions = readJSONFile(SESSIONS_FILE, {});
  const session = sessions[token];

  if (!session || (session.expiresAt && session.expiresAt < Date.now())) {
    if (session) {
      delete sessions[token];
      writeJSONFile(SESSIONS_FILE, sessions);
    }
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Session expired or invalid'
    });
  }

  res.json({
    success: true,
    authenticated: true,
    user: {
      email: session.email,
      role: 'admin',
      name: session.name || 'JM FASHION Admin',
      lastLogin: session.createdAt
    }
  });
});

// POST /api/admin/logout (Invalidate session token)
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    const sessions = readJSONFile(SESSIONS_FILE, {});
    if (sessions[token]) {
      delete sessions[token];
      writeJSONFile(SESSIONS_FILE, sessions);
    }
  }

  res.json({
    success: true,
    message: 'সফলভাবে লগআউট করা হয়েছে (Logged out successfully)'
  });
});

// ================= STORE & PRODUCT API ROUTES =================

// GET /api/products (List all products)
app.get('/api/products', (req, res) => {
  let products = readJSONFile(PRODUCTS_FILE, null);
  if (!products || !Array.isArray(products) || products.length === 0) {
    const singleProduct = readJSONFile(PRODUCT_FILE, null);
    if (singleProduct) {
      products = [singleProduct];
    } else {
      products = [];
    }
  }
  res.json(products);
});

// POST /api/products (Save/Update full products array)
app.post('/api/products', (req, res) => {
  const productsData = req.body;
  if (!Array.isArray(productsData)) {
    return res.status(400).json({ success: false, error: 'Products payload must be an array' });
  }
  const success = writeJSONFile(PRODUCTS_FILE, productsData);
  if (productsData.length > 0) {
    writeJSONFile(PRODUCT_FILE, productsData[0]);
  }
  if (success) {
    res.json({ success: true, products: productsData });
  } else {
    res.status(500).json({ success: false, error: 'Failed to write products data' });
  }
});

// POST /api/products/:id (Update or insert single product)
app.post('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;
  if (!updatedProduct || typeof updatedProduct !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid product payload' });
  }

  let products = readJSONFile(PRODUCTS_FILE, []);
  if (!Array.isArray(products)) products = [];

  const index = products.findIndex((p: any) => p.id === id);
  if (index >= 0) {
    products[index] = { ...products[index], ...updatedProduct };
  } else {
    products.push({ ...updatedProduct, id });
  }

  writeJSONFile(PRODUCTS_FILE, products);
  if (products.length > 0 && products[0].id === id) {
    writeJSONFile(PRODUCT_FILE, products[0]);
  }
  res.json({ success: true, product: index >= 0 ? products[index] : updatedProduct, products });
});

// DELETE /api/products/:id (Delete a single product)
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  let products = readJSONFile(PRODUCTS_FILE, []);
  if (!Array.isArray(products)) products = [];

  const filtered = products.filter((p: any) => p.id !== id);
  writeJSONFile(PRODUCTS_FILE, filtered);
  if (filtered.length > 0) {
    writeJSONFile(PRODUCT_FILE, filtered[0]);
  }
  res.json({ success: true, remainingCount: filtered.length });
});

// GET /api/product (Backward compatibility for single product)
app.get('/api/product', (req, res) => {
  const products = readJSONFile(PRODUCTS_FILE, null);
  if (Array.isArray(products) && products.length > 0) {
    return res.json(products[0]);
  }
  const product = readJSONFile(PRODUCT_FILE, null);
  res.json(product);
});

// POST /api/product (Save/Update primary product configuration)
app.post('/api/product', (req, res) => {
  const productData = req.body;
  if (!productData || typeof productData !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid product data payload' });
  }
  const success = writeJSONFile(PRODUCT_FILE, productData);
  let products = readJSONFile(PRODUCTS_FILE, []);
  if (Array.isArray(products) && products.length > 0) {
    const idx = products.findIndex((p: any) => p.id === productData.id);
    if (idx >= 0) {
      products[idx] = productData;
    } else {
      products[0] = productData;
    }
    writeJSONFile(PRODUCTS_FILE, products);
  } else {
    writeJSONFile(PRODUCTS_FILE, [productData]);
  }

  if (success) {
    res.json({ success: true, product: productData });
  } else {
    res.status(500).json({ success: false, error: 'Failed to write product data to storage' });
  }
});

// DELETE /api/product (Reset product data safely)
app.delete('/api/product', (req, res) => {
  try {
    if (fs.existsSync(PRODUCT_FILE)) {
      fs.unlinkSync(PRODUCT_FILE);
    }
    if (fs.existsSync(PRODUCTS_FILE)) {
      fs.unlinkSync(PRODUCTS_FILE);
    }
    res.json({ success: true, message: 'Product configuration reset successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to reset product', details: err.message });
  }
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, []);
  res.json(orders);
});

// POST /api/orders (Create new customer order)
app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder || typeof newOrder !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid order data' });
  }
  if (!newOrder.id) {
    newOrder.id = 'ord-' + Date.now();
  }
  const orders = readJSONFile(ORDERS_FILE, []);
  orders.unshift(newOrder);
  writeJSONFile(ORDERS_FILE, orders);
  res.status(201).json({ success: true, order: newOrder });
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orders = readJSONFile(ORDERS_FILE, []);
  const index = orders.findIndex((o: any) => o.id === id);
  if (index !== -1) {
    orders[index].status = status;
    writeJSONFile(ORDERS_FILE, orders);
    return res.json({ success: true, order: orders[index] });
  }
  res.status(404).json({ success: false, error: 'Order not found' });
});

// Helper to delete order by ID or orderNumber
function removeOrderFromStore(targetId: string) {
  if (!targetId) return { success: false, error: 'Order ID is required' };
  const rawId = String(targetId).trim();
  const decodedId = decodeURIComponent(rawId);

  let orders = readJSONFile(ORDERS_FILE, []);
  const previousLength = orders.length;

  orders = orders.filter((o: any) => {
    if (!o) return false;
    const matchId = o.id && (o.id === rawId || o.id === decodedId);
    const matchNum = o.orderNumber && (o.orderNumber === rawId || o.orderNumber === decodedId);
    return !matchId && !matchNum;
  });

  const success = writeJSONFile(ORDERS_FILE, orders);
  if (!success) {
    return { success: false, error: 'Database write error while deleting order' };
  }

  return {
    success: true,
    deletedId: rawId,
    remainingOrders: orders.length,
    wasFound: previousLength !== orders.length
  };
}

// DELETE /api/orders/:id (Delete single order permanently)
app.delete('/api/orders/:id', (req, res) => {
  const result = removeOrderFromStore(req.params.id);
  if (!result.success && result.error === 'Database write error while deleting order') {
    return res.status(500).json(result);
  }
  res.json(result);
});

// POST /api/orders/delete (Proxy/firewall-safe POST fallback for deleting order)
app.post('/api/orders/delete', (req, res) => {
  const targetId = req.body?.id || req.body?.orderId || req.query?.id;
  if (!targetId) {
    return res.status(400).json({ success: false, error: 'Order ID is required' });
  }
  const result = removeOrderFromStore(String(targetId));
  if (!result.success && result.error === 'Database write error while deleting order') {
    return res.status(500).json(result);
  }
  res.json(result);
});

// POST /api/orders/:id/delete
app.post('/api/orders/:id/delete', (req, res) => {
  const result = removeOrderFromStore(req.params.id);
  if (!result.success && result.error === 'Database write error while deleting order') {
    return res.status(500).json(result);
  }
  res.json(result);
});

// DELETE /api/orders (Clear all orders)
app.delete('/api/orders', (req, res) => {
  const success = writeJSONFile(ORDERS_FILE, []);
  if (success) {
    res.json({ success: true, message: 'All orders deleted' });
  } else {
    res.status(500).json({ success: false, error: 'Database write error' });
  }
});

// Explicit 404 JSON response for any unhandled /api/* request so it never falls through to HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.originalUrl}` });
});

async function startServer() {
  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

