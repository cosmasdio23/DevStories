import UrlParser from '../../routes/url-parser';
import StoryApiService from '../../models/story-api-service';
import UserSession from '../../utils/user-session';
import { createStoryDetailTemplate } from '../templates/template-creator';
import MapHelper from '../../utils/map-helper';
import NotificationHelper from '../../utils/notification-helper';

const DetailStoryPage = {
  _story: null, // Untuk menyimpan data detail cerita

  async render() {
    return `
      <div class="detail-story-container content">
        <div id="story-detail-content">
          <div class="loader-container"><div class="loader"></div><p>Memuat detail cerita...</p></div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const url = UrlParser.parseActiveUrlWithoutCombiner();
    const storyId = url.id; // Ambil ID cerita dari URL

    if (!storyId) {
      this.showError('ID cerita tidak ditemukan di URL.');
      return;
    }

    const token = UserSession.getUserToken();
    if (!token) {
      this.redirectToLogin();
      return;
    }

    const storyDetailContent = document.querySelector('#story-detail-content');
    try {
      const response = await StoryApiService.getStoryDetail(storyId, token);

      if (response.error) {
        this.showError(response.message || 'Gagal mengambil detail cerita.');
        if (response.message && response.message.toLowerCase().includes('not found')) {
          storyDetailContent.innerHTML = '<p class="error-message">Sepertinya Cerita Tidak Disimpan di Server</p>';
        }
        return;
      }

      this._story = response.story; // Simpan data cerita
      storyDetailContent.innerHTML = createStoryDetailTemplate(this._story);

      // Inisialisasi peta jika ada koordinat
      if (this._story.lat && this._story.lon) {
        // Beri sedikit delay agar elemen peta benar-benar ada di DOM dan visible
        setTimeout(() => {
          const mapDetailElementId = `map-detail-${this._story.id}`;
          const mapElement = document.getElementById(mapDetailElementId);
          if (mapElement && mapElement.offsetParent !== null) { // Cek visibilitas
            MapHelper.displayStoryMap(mapDetailElementId, this._story.lat, this._story.lon, `Lokasi ${this._story.name}`);
          } else {
            console.warn(`Map container ${mapDetailElementId} for story detail is not visible. Map not initialized.`);
            if(mapElement) mapElement.innerHTML = 'Peta tidak dapat ditampilkan (kontainer tidak terlihat).';
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error fetching story detail:', error);
      this.showError('Terjadi kesalahan sistem saat mengambil detail cerita.');
    }
  },

  showError(message) {
    const storyDetailContent = document.querySelector('#story-detail-content');
    if (storyDetailContent) {
      storyDetailContent.innerHTML = `<p class="error-message">${message}</p>`;
    }
    NotificationHelper.error(message);
  },

  redirectToLogin() {
    NotificationHelper.info('Sesi Anda berakhir atau Anda belum login. Silakan login kembali.');
    setTimeout(() => {
      UserSession.clearSession();
      window.location.hash = '#/login';
    }, 1500);
  },
};

export default DetailStoryPage;
