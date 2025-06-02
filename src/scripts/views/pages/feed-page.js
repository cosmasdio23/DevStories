import FeedPresenter from '../../presenters/feed-presenter';
import StoryApiService from '../../models/story-api-service'; // Presenter akan butuh ini
import { createStoryItemTemplate } from '../templates/template-creator';
import MapHelper from '../../utils/map-helper'; // Untuk peta
import UserSession from '../../utils/user-session'; // Untuk cek login
import NotificationHelper from '../../utils/notification-helper'; // Opsional, untuk pesan

// Impor Lazysizes
import 'lazysizes';
// Impor plugin unveilhooks untuk background-image jika diperlukan (opsional)
// import 'lazysizes/plugins/unveilhooks/ls.unveilhooks';

const FeedPage = {
  _presenter: null,
  _stories: [], // Simpan data cerita untuk referensi peta

  async render() {
    // Inisialisasi presenter di afterRender setelah elemen UI siap
    return `
      <div class="content feed-container">
        <h2 class="content__heading">Feed Cerita</h2>
        <div id="stories-list" class="stories-list">
          <div class="loader-container"><div class="loader"></div><p>Memuat cerita...</p></div>
        </div>
        <a href="#/add-story" class="button button-fab" aria-label="Tambah cerita baru" title="Tambah Cerita Baru">
          <i class="fas fa-plus"></i> </a>
      </div>
    `;
  },

  async afterRender() {
    this._presenter = new FeedPresenter({
      view: this,
      storyApiService: StoryApiService, // Berikan instance service ke presenter
    });

    // Panggil presenter untuk menampilkan cerita
    await this._presenter.displayStories();

    // Inisialisasi peta untuk item cerita yang sudah ada setelah dirender
    // Ini mungkin perlu dipanggil ulang jika ada pagination atau infinite scroll
    this._initializeMapsForRenderedStories();

    // Pastikan ikon Font Awesome bekerja. Anda perlu link CDN di index.html
    // atau instalasi via npm dan konfigurasi Webpack.
    // Contoh CDN di public/index.html:
    // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  },

  // --- Metode View yang dipanggil oleh Presenter ---
  showLoading() {
    const storiesContainer = document.querySelector('#stories-list');
    if (storiesContainer) {
      storiesContainer.innerHTML = '<div class="loader-container"><div class="loader"></div><p>Memuat cerita...</p></div>';
    }
  },

  hideLoading() {
    const loaderContainer = document.querySelector('#stories-list .loader-container');
    if (loaderContainer && loaderContainer.parentElement.id === 'stories-list' && loaderContainer.parentElement.childElementCount === 1) {
      // Hanya hapus loader jika itu satu-satunya anak, artinya belum ada cerita
      // Jika sudah ada cerita (misal, pagination), loader mungkin terpisah
    }
    // Atau jika loader selalu ada di awal, dan akan diganti dengan cerita/pesan
    // const storiesContainer = document.querySelector('#stories-list');
    // if (storiesContainer && storiesContainer.querySelector('.loader-container')) {
    //   // Biarkan, akan ditimpa oleh renderStories atau showError
    // }
  },

  renderStories(stories) {
    this._stories = stories; // Simpan cerita untuk referensi peta
    const storiesContainer = document.querySelector('#stories-list');
    if (storiesContainer) {
      storiesContainer.innerHTML = ''; // Bersihkan loader atau pesan lama
      if (stories.length === 0) {
        this.showEmptyStoriesMessage();
        return;
      }
      stories.forEach((story) => {
        storiesContainer.innerHTML += createStoryItemTemplate(story);
      });
      // Panggil inisialisasi peta setelah cerita dirender
      this._initializeMapsForRenderedStories();
    }
  },

  _initializeMapsForRenderedStories() {
    // Delay sedikit untuk memastikan DOM update dan elemen peta visible
    // Terutama jika ada transisi halaman atau animasi
    setTimeout(() => {
      this._stories.forEach((story) => {
        if (story.lat && story.lon) {
          const mapElementId = `map-${story.id}`;
          const mapElement = document.getElementById(mapElementId);
          if (mapElement) { // Hanya inisialisasi jika elemen ada
            // Cek apakah elemen visible sebelum inisialisasi peta
            // Ini penting karena Leaflet error jika container tidak visible
            if (mapElement.offsetParent !== null) {
              MapHelper.displayStoryMap(mapElementId, story.lat, story.lon, story.name);
            } else {
              // console.warn(`Map container ${mapElementId} for story ${story.name} is not visible. Map not initialized immediately.`);
              // Observer bisa digunakan di sini untuk init saat visible
              // Untuk sekarang, ini adalah best-effort. Jika CSS menyembunyikan, peta mungkin tidak muncul.
            }
          }
        }
      });
    }, 200); // Tambah delay jika perlu, misal 200ms
  },

  showEmptyStoriesMessage() {
    const storiesContainer = document.querySelector('#stories-list');
    if (storiesContainer) {
      storiesContainer.innerHTML = '<p class="empty-message">Belum ada cerita yang dibagikan. Jadilah yang pertama!</p>';
    }
  },

  showError(message) {
    const storiesContainer = document.querySelector('#stories-list');
    if (storiesContainer) {
      storiesContainer.innerHTML = `<p class="error-message">Gagal memuat cerita: ${message}</p>`;
    }
    // Opsional: gunakan NotificationHelper
    // NotificationHelper.error(`Gagal memuat cerita: ${message}`);
  },

  redirectToLogin() {
    NotificationHelper.info('Sesi Anda berakhir atau Anda belum login. Silakan login kembali.');
    setTimeout(() => {
      UserSession.clearSession(); // Pastikan sesi bersih
      window.location.hash = '#/login';
    }, 1500);
  },
};

export default FeedPage;
