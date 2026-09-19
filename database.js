const DB_NAME = 'IMDS_SCHOOL_MANAGER';
const DB_VERSION = 1;
let dbPromise;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      ['students','payments','grades','attendance','finance'].forEach(store => {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, {keyPath:'id', autoIncrement:true});
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function dbAdd(store, value) {
  const db = await openDB();
  return new Promise((resolve,reject) => {
    const tx = db.transaction(store,'readwrite');
    const req = tx.objectStore(store).add({...value, createdAt:new Date().toISOString()});
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbAll(store) {
  const db = await openDB();
  return new Promise((resolve,reject) => {
    const req = db.transaction(store).objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbClear(store) {
  const db = await openDB();
  return new Promise((resolve,reject) => {
    const req = db.transaction(store,'readwrite').objectStore(store).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
async function exportBackup() {
  const data = {};
  for (const s of ['students','payments','grades','attendance','finance']) data[s] = await dbAll(s);
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `imds-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
