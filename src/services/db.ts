import { StoredDocument, AppSettings } from '../types';

const DB_NAME = 'sipaten_kemenko_polkam_db';
const DB_VERSION = 1;
const STORE_DOCS = 'documents';
const STORE_SETTINGS = 'settings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDocument(doc: StoredDocument): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, 'readwrite');
    const store = tx.objectStore(STORE_DOCS);
    const req = store.put(doc);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getDocument(id: string): Promise<StoredDocument | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, 'readonly');
    const store = tx.objectStore(STORE_DOCS);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllDocuments(): Promise<StoredDocument[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, 'readonly');
    const store = tx.objectStore(STORE_DOCS);
    const req = store.getAll();
    req.onsuccess = () => {
      const items: StoredDocument[] = req.result || [];
      // Urutkan dari yang terbaru
      items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, 'readwrite');
    const store = tx.objectStore(STORE_DOCS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllData(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_DOCS, STORE_SETTINGS], 'readwrite');
    tx.objectStore(STORE_DOCS).clear();
    tx.objectStore(STORE_SETTINGS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get('app_settings');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve(req.result.value);
        } else {
          resolve({
            selectedModel: 'gemini-3.8-flash',
            defaultTone: 'formal',
            enableAutoVerify: true,
          });
        }
      };
      req.onerror = () => {
        resolve({
          selectedModel: 'gemini-3.8-flash',
          defaultTone: 'formal',
          enableAutoVerify: true,
        });
      };
    });
  } catch {
    return {
      selectedModel: 'gemini-3.8-flash',
      defaultTone: 'formal',
      enableAutoVerify: true,
    };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SETTINGS, 'readwrite');
    const store = tx.objectStore(STORE_SETTINGS);
    const req = store.put({ key: 'app_settings', value: settings });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
