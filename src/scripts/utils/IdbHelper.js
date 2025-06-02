const DB_NAME = 'devstories-app-db'; // Nama database Anda
const DB_VERSION = 1; // Versi database, naikkan jika ada perubahan skema
const OBJECT_STORE_STORIES = 'stories'; // Nama object store untuk menyimpan cerita

/**
 * Membuka atau membuat database IndexedDB.
 * @returns {Promise<IDBDatabase>} Promise yang resolve dengan objek database.
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      console.error('Browser ini tidak mendukung IndexedDB.');
      return reject(new Error('Browser tidak mendukung IndexedDB.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.errorCode);
      reject(new Error(`Gagal membuka database IndexedDB: ${event.target.errorCode}`));
    };

    request.onsuccess = (event) => {
      console.log('Database IndexedDB berhasil dibuka.');
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('Melakukan upgrade database IndexedDB atau membuat skema baru.');
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OBJECT_STORE_STORIES)) {
        // Buat object store 'stories' dengan 'id' sebagai keyPath.
        // API Dicoding memiliki 'id' unik untuk setiap cerita.
        const store = db.createObjectStore(OBJECT_STORE_STORIES, { keyPath: 'id' });
        // Tambahkan index jika perlu untuk query yang lebih efisien
        // Contoh: store.createIndex('name', 'name', { unique: false });
        // Contoh: store.createIndex('createdAt', 'createdAt', { unique: false });
        console.log(`Object store "${OBJECT_STORE_STORIES}" berhasil dibuat.`);
      }
      // Tambahkan object store lain di sini jika perlu di masa depan
    };
  });
};

/**
 * Menyimpan satu item data ke dalam object store.
 * Jika data dengan key yang sama sudah ada, akan diupdate (upsert).
 * @param {string} storeName - Nama object store.
 * @param {object} data - Data yang akan disimpan.
 * @returns {Promise<Event>} Promise yang resolve saat data berhasil disimpan.
 */
const putData = async (storeName, data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = (event) => {
      resolve(event);
    };
    request.onerror = (event) => {
      console.error(`Error saat menyimpan data ke ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Menyimpan banyak item data (array) ke dalam object store.
 * @param {string} storeName - Nama object store.
 * @param {Array<object>} dataArray - Array data yang akan disimpan.
 * @returns {Promise<void>} Promise yang resolve saat semua data diproses.
 */
const putAllData = async (storeName, dataArray) => {
  if (!Array.isArray(dataArray)) {
    return Promise.reject(new Error('Input harus berupa array.'));
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    dataArray.forEach((data) => {
      // Pastikan data memiliki keyPath yang sesuai (misalnya 'id' untuk stories)
      if (data && typeof data[store.keyPath] !== 'undefined') {
        store.put(data);
      } else {
        console.warn(`Item data dilewati karena tidak memiliki keyPath "${store.keyPath}":`, data);
      }
    });

    transaction.oncomplete = () => {
      console.log(`${dataArray.length} item data berhasil diproses untuk disimpan ke ${storeName}.`);
      resolve();
    };
    transaction.onerror = (event) => {
      console.error(`Error pada transaksi penyimpanan semua data ke ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Mengambil satu item data berdasarkan key (ID).
 * @param {string} storeName - Nama object store.
 * @param {string | number} key - Key (ID) dari data yang akan diambil.
 * @returns {Promise<object|undefined>} Data yang ditemukan atau undefined.
 */
const getDataByKey = async (storeName, key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error(`Error saat mengambil data dengan key ${key} dari ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Mengambil semua data dari object store.
 * @param {string} storeName - Nama object store.
 * @returns {Promise<Array<object>>} Array berisi semua data.
 */
const getAllData = async (storeName) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };
    request.onerror = (event) => {
      console.error(`Error saat mengambil semua data dari ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Menghapus satu item data berdasarkan key (ID).
 * @param {string} storeName - Nama object store.
 * @param {string | number} key - Key (ID) dari data yang akan dihapus.
 * @returns {Promise<Event>} Promise yang resolve saat data berhasil dihapus.
 */
const deleteDataByKey = async (storeName, key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = (event) => {
      resolve(event);
    };
    request.onerror = (event) => {
      console.error(`Error saat menghapus data dengan key ${key} dari ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Menghapus semua data dari object store.
 * @param {string} storeName - Nama object store.
 * @returns {Promise<Event>} Promise yang resolve saat semua data berhasil dihapus.
 */
const clearAllDataFromStore = async (storeName) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = (event) => {
      resolve(event);
    };
    request.onerror = (event) => {
      console.error(`Error saat menghapus semua data dari object store "${storeName}":`, event.target.error);
      reject(event.target.error);
    };
  });
};

export {
  openDB, // Ekspor ini jika Anda perlu melakukan operasi DB yang lebih kustom
  putData,
  putAllData,
  getDataByKey,
  getAllData,
  deleteDataByKey,
  clearAllDataFromStore,
  OBJECT_STORE_STORIES, // Ekspor nama object store jika perlu diakses dari luar
};
