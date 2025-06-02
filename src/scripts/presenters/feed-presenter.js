import UserSession from '../utils/user-session';
// Impor fungsi-fungsi dari IdbHelper.js dan nama object store
import { getAllData, putAllData, OBJECT_STORE_STORIES } from '../utils/IdbHelper';
// NotificationHelper bisa ditambahkan jika ingin notifikasi "gagal update" yang non-intrusif
// import NotificationHelper from '../utils/notification-helper';

class FeedPresenter {
  constructor({ view, storyApiService }) {
    this._view = view;
    this._storyApiService = storyApiService;
    this._idbStoreName = OBJECT_STORE_STORIES; // Gunakan konstanta dari IdbHelper
  }

  async displayStories() {
    const token = UserSession.getUserToken();
    if (!token) {
      this._view.redirectToLogin();
      return;
    }

    this._view.showLoading();
    let displayedFromIdb = false;

    try {
      // 1. Coba ambil dan tampilkan data dari IndexedDB terlebih dahulu
      console.log('FeedPresenter: Mencoba mengambil cerita dari IndexedDB...');
      const idbStories = await getAllData(this._idbStoreName);
      if (idbStories && idbStories.length > 0) {
        console.log('FeedPresenter: Menampilkan cerita dari IndexedDB.');
        this._view.renderStories(idbStories);
        displayedFromIdb = true;
      }
      // this._view.hideLoading(); // Opsional: sembunyikan loading di sini jika IDB ada data
      // Namun, lebih baik tunggu network attempt jika UX diinginkan seperti itu.
    } catch (idbError) {
      console.error('FeedPresenter: Error saat mengambil data dari IndexedDB:', idbError);
      // Jangan langsung tampilkan error ke view jika kita masih akan mencoba network
      // Kecuali jika ini adalah satu-satunya sumber data yang diharapkan saat offline total.
    }

    try {
      // 2. Selalu coba ambil data terbaru dari network (API)
      console.log('FeedPresenter: Mengambil cerita dari network...');
      const storiesResponse = await this._storyApiService.getAllStories(token);

      if (!storiesResponse.error && storiesResponse.listStory) {
        console.log('FeedPresenter: Cerita berhasil diambil dari network.');
        // Tampilkan cerita dari network (akan me-refresh jika ada data dari IDB)
        this._view.renderStories(storiesResponse.listStory);

        // Simpan data terbaru ke IndexedDB
        console.log('FeedPresenter: Menyimpan cerita dari network ke IndexedDB...');
        await putAllData(this._idbStoreName, storiesResponse.listStory);

        if (storiesResponse.listStory.length === 0) {
          this._view.showEmptyStoriesMessage(); // Jika API mengembalikan list kosong
        }
        displayedFromIdb = true; // Anggap sudah ada data yang ditampilkan (meskipun kosong)
      } else {
        // Terjadi error dari API (error: true atau listStory tidak ada)
        console.error('FeedPresenter: API Error:', storiesResponse.message);
        if (!displayedFromIdb) { // Hanya tampilkan error jika belum ada data dari IDB
          this._view.showError(storiesResponse.message || 'Gagal mendapatkan data cerita dari server.');
        } else {
          // Sudah ada data dari IDB, mungkin tampilkan notifikasi non-intrusif
          console.warn('FeedPresenter: Gagal memperbarui cerita dari network, data dari IDB tetap ditampilkan.');
          // NotificationHelper.info('Gagal memperbarui cerita. Menampilkan data offline.'); // Contoh
        }

        // Penanganan khusus untuk error otorisasi
        if (storiesResponse.message &&
          (storiesResponse.message.toLowerCase().includes('unauthorized') ||
            storiesResponse.message.toLowerCase().includes('token tidak valid') ||
            storiesResponse.message.toLowerCase().includes('token tidak ditemukan'))) {
          this._view.redirectToLogin();
        }
      }
    } catch (systemError) {
      console.error('FeedPresenter: System Error saat mengambil data dari network:', systemError);
      if (!displayedFromIdb) { // Hanya tampilkan error jika belum ada data dari IDB
        this._view.showError('Terjadi kesalahan pada sistem saat mengambil data cerita.');
      } else {
        console.warn('FeedPresenter: Gagal total mengambil cerita dari network, data dari IDB tetap ditampilkan.');
        // NotificationHelper.info('Gagal mengambil data terbaru. Menampilkan data offline.'); // Contoh
      }
    } finally {
      // `hideLoading()` mungkin tidak selalu diperlukan jika `renderStories`, `showEmptyStoriesMessage`,
      // atau `showError` di dalam view sudah mengganti konten loader secara keseluruhan.
      // Jika view Anda tidak secara eksplisit menghapus loader saat kondisi di atas,
      // maka panggil `this._view.hideLoading()` di sini.
      // Contoh: this._view.hideLoading(); (jika metode ini ada di view dan berfungsi menghapus loader)
    }
  }
}

export default FeedPresenter;
