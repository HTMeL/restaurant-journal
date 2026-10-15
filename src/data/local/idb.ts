/**
 * Minimal IndexedDB wrapper for photo blobs. Only files in src/data/local may import this.
 * One database, one object store ("photos") keyed by photo id.
 */
const DB_NAME = 'restaurant-journal'
const STORE = 'photos'

let dbPromise: Promise<IDBDatabase> | undefined

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      dbPromise = undefined
      reject(req.error)
    }
  })
  return dbPromise
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(req.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export const idbPhotos = {
  put: <T extends { id: string }>(value: T) => run('readwrite', (s) => s.put(value)),
  get: <T>(id: string) => run<T | undefined>('readonly', (s) => s.get(id)),
  delete: (id: string) => run('readwrite', (s) => s.delete(id)),
  clear: () => run('readwrite', (s) => s.clear()),
}
