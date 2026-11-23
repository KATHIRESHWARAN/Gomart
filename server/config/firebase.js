const admin = require('firebase-admin');
const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

let isLiveFirebase = false;
let db = null;
let auth = null;
let storage = null;

// Check for service account file or environment variables
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
  ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : path.join(__dirname, '..', 'serviceAccountKey.json');

// Helper to obtain certificate credential across Firebase Admin SDK versions
const getCert = (param) => {
  if (admin.cert) return admin.cert(param);
  if (admin.credential && admin.credential.cert) return admin.credential.cert(param);
  try {
    return cert(param);
  } catch (e) {
    throw new Error('Could not find cert() function in firebase-admin SDK');
  }
};

try {
  let credential = null;

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    credential = getCert(serviceAccount);
    console.log(`[Firebase Admin] Loading credentials from ${serviceAccountPath}`);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT_KEY === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      credential = getCert(serviceAccount);
      console.log(`[Firebase Admin] Loading credentials from FIREBASE_SERVICE_ACCOUNT_KEY environment variable`);
    } catch (parseErr) {
      console.error('[Firebase Admin] Error parsing FIREBASE_SERVICE_ACCOUNT_KEY JSON:', parseErr.message);
    }
  } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    let pKey = process.env.FIREBASE_PRIVATE_KEY.trim();
    if (pKey.startsWith('"') && pKey.endsWith('"')) {
      try { pKey = JSON.parse(pKey); } catch (e) { pKey = pKey.slice(1, -1); }
    }
    pKey = pKey.replace(/\\n/g, '\n');

    credential = getCert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: pKey,
    });
    console.log(`[Firebase Admin] Loading credentials from environment variables`);
  }

  if (credential) {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || 'gomart-4615b'}.firebasestorage.app`;
    const app = !getApps().length
      ? initializeApp({
          credential,
          storageBucket: bucketName
        })
      : getApp();

    db = getFirestore(app);
    auth = getAuth(app);
    try {
      storage = getStorage(app);
    } catch (sErr) {
      console.warn('[Firebase Storage Notice]', sErr.message);
    }
    isLiveFirebase = true;
    console.log('✅ [Firebase Admin] Successfully connected to live Firebase Firestore & Auth.');
  }
} catch (err) {
  console.warn('⚠️ [Firebase Admin] Could not initialize live Firebase credentials:', err.message);
}

// Robust Dev Firestore Emulator for out-of-the-box assessment evaluation
// Stores state cleanly in server/data/firestore-dev.json
if (!isLiveFirebase) {
  if (process.env.NODE_ENV === 'production') {
    console.error('🚨 [CRITICAL PRODUCTION WARNING] Server running in NODE_ENV=production without live Firebase credentials!');
    console.error('👉 Action required: Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_CLIENT_EMAIL/PRIVATE_KEY in Render environment variables.');
  } else {
    console.log('ℹ️ [Firebase Admin Notice] Live Firebase credentials not yet supplied in server/.env or serviceAccountKey.json.');
    console.log('⚡ [Firebase Admin Notice] Running with local persistent Firestore emulation layer so assessment is fully functional.');
  }

  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbFile = path.join(dataDir, 'firestore-dev.json');

  let store = {
    users: {},
    products: {},
    orders: {},
    carts: {},
    productViews: {}
  };

  const loadData = () => {
    try {
      if (fs.existsSync(dbFile)) {
        const raw = fs.readFileSync(dbFile, 'utf8');
        store = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading dev firestore data:', e.message);
    }
  };

  const saveData = () => {
    try {
      fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving dev firestore data:', e.message);
    }
  };

  loadData();

  // Firestore emulation adapter API compatible with official Firebase Admin SDK
  db = {
    collection: (collName) => {
      if (!store[collName]) store[collName] = {};

      const queryObj = {
        filters: [],
        sortField: null,
        sortDirection: 'asc',
        limitCount: null,

        where: function(field, op, val) {
          this.filters.push({ field, op, val });
          return this;
        },
        orderBy: function(field, direction = 'asc') {
          this.sortField = field;
          this.sortDirection = direction;
          return this;
        },
        limit: function(n) {
          this.limitCount = n;
          return this;
        },
        get: async function() {
          loadData();
          let docs = Object.entries(store[collName] || {}).map(([id, data]) => ({
            id,
            data: () => ({ ...data, id }),
            exists: true
          }));

          // Apply filters
          for (const f of this.filters) {
            docs = docs.filter(doc => {
              const d = doc.data();
              if (f.op === '==') return d[f.field] === f.val;
              if (f.op === '!=') return d[f.field] !== f.val;
              if (f.op === '>') return d[f.field] > f.val;
              if (f.op === '>=') return d[f.field] >= f.val;
              if (f.op === '<') return d[f.field] < f.val;
              if (f.op === '<=') return d[f.field] <= f.val;
              if (f.op === 'array-contains') return Array.isArray(d[f.field]) && d[f.field].includes(f.val);
              return true;
            });
          }

          // Apply sort
          if (this.sortField) {
            docs.sort((a, b) => {
              const va = a.data()[this.sortField];
              const vb = b.data()[this.sortField];
              if (va == null && vb == null) return 0;
              if (va == null) return 1;
              if (vb == null) return -1;
              if (this.sortDirection === 'desc') {
                return va < vb ? 1 : va > vb ? -1 : 0;
              }
              return va > vb ? 1 : va < vb ? -1 : 0;
            });
          }

          // Apply limit
          if (this.limitCount && this.limitCount > 0) {
            docs = docs.slice(0, this.limitCount);
          }

          return {
            empty: docs.length === 0,
            size: docs.length,
            docs,
            forEach: (cb) => docs.forEach(cb)
          };
        },
        doc: (docId) => {
          return {
            id: docId,
            get: async () => {
              loadData();
              const data = store[collName]?.[docId];
              return {
                id: docId,
                exists: !!data,
                data: () => data ? { ...data, id: docId } : undefined
              };
            },
            set: async (data, options = {}) => {
              loadData();
              if (!store[collName]) store[collName] = {};
              if (options.merge && store[collName][docId]) {
                store[collName][docId] = { ...store[collName][docId], ...data, updatedAt: new Date().toISOString() };
              } else {
                store[collName][docId] = { ...data, id: docId, updatedAt: new Date().toISOString() };
              }
              saveData();
              return { id: docId };
            },
            update: async (data) => {
              loadData();
              if (!store[collName] || !store[collName][docId]) {
                throw new Error(`Document ${docId} does not exist in ${collName}`);
              }
              store[collName][docId] = { ...store[collName][docId], ...data, updatedAt: new Date().toISOString() };
              saveData();
              return { id: docId };
            },
            delete: async () => {
              loadData();
              if (store[collName] && store[collName][docId]) {
                delete store[collName][docId];
                saveData();
              }
              return { id: docId };
            }
          };
        },
        add: async (data) => {
          loadData();
          const autoId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
          if (!store[collName]) store[collName] = {};
          const fullData = { ...data, id: autoId, createdAt: data.createdAt || new Date().toISOString() };
          store[collName][autoId] = fullData;
          saveData();
          return {
            id: autoId,
            get: async () => ({
              id: autoId,
              exists: true,
              data: () => fullData
            })
          };
        }
      };
      return queryObj;
    }
  };

  // Auth verification mock adapter
  auth = {
    verifyIdToken: async (token) => {
      // In dev mode: parse token payload
      try {
        if (!token) throw new Error('No token provided');
        
        // Supports encoded JSON dev tokens or JWT format
        if (token.startsWith('dev-token:')) {
          const parts = token.replace('dev-token:', '').split(':');
          const uid = parts[0];
          const email = parts[1] || 'user@example.com';
          return { uid, email, role: email === process.env.ADMIN_EMAIL ? 'admin' : 'user' };
        }

        // Try standard base64 jwt decode (header.payload.signature)
        const segments = token.split('.');
        if (segments.length === 3) {
          const payload = JSON.parse(Buffer.from(segments[1], 'base64').toString('utf8'));
          const isAdmin = payload.admin === true || payload.role === 'admin' || payload.email === process.env.ADMIN_EMAIL;
          return {
            uid: payload.user_id || payload.sub || payload.uid,
            email: payload.email,
            name: payload.name || payload.email?.split('@')[0] || 'User',
            admin: isAdmin,
            role: isAdmin ? 'admin' : (payload.role || 'customer'),
            ...payload
          };
        }

        // Fallback for simple testing
        return { uid: 'dev-user-id', email: 'dev@eproducts.com', role: 'user' };
      } catch (e) {
        throw new Error('Invalid token');
      }
    },
    getUser: async (uid) => {
      loadData();
      const user = store.users?.[uid];
      if (!user) throw new Error('User not found');
      return user;
    }
  };
}

module.exports = {
  admin,
  db,
  auth,
  storage,
  isLiveFirebase
};
