// Minimalist zero-dependency IndexedDB wrapper for local attachment blobs
const DB_NAME = "lean-mode-db";
const DB_VERSION = 1;
const STORE_NAME = "attachments";

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAttachment(id, blobOrDataUrl, meta = {}) {
  try {
    const db = await openDb();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const item = { id, data: blobOrDataUrl, ...meta, updatedAt: new Date().toISOString() };
      const req = store.put(item);
      req.onsuccess = () => resolve(id);
      req.onerror = () => {
        console.warn("IndexedDB saveAttachment failed:", req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn("IndexedDB error in saveAttachment:", err);
    return null;
  }
}

export async function getAttachment(id) {
  if (!id) return null;
  try {
    const db = await openDb();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => {
        console.warn("IndexedDB getAttachment failed:", req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn("IndexedDB error in getAttachment:", err);
    return null;
  }
}

export async function deleteAttachment(id) {
  if (!id) return;
  try {
    const db = await openDb();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn("IndexedDB deleteAttachment failed:", req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn("IndexedDB error in deleteAttachment:", err);
    return false;
  }
}

export async function getAllAttachmentIds() {
  const db = await openDb();
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

