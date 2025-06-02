import StoryApiService from '../models/story-api-service';
import UserSession from '../utils/user-session';

class AddStoryPresenter {
  constructor({ view }) {
    this._view = view;
    // this._storyApiService = StoryApiService; // Contoh. Tapi tidak perlu disimpan jika hanya dipakai sekali
  }

  async submitStory(formData) {
    const token = UserSession.getUserToken();
    if (!token) {
      this._view.redirectToLogin();
      return;
    }

    this._view.showLoading('Memublikasikan cerita Anda...');
    try {
      const response = await StoryApiService.addStory(formData, token);
      if (!response.error) {
        this._view.displaySuccess('Cerita berhasil dipublikasikan!');
        // Presenter memutuskan untuk mereset form setelah sukses
        this._view.resetForm();
        // Opsional: Arahkan ke halaman feed setelah beberapa detik
        // setTimeout(() => { window.location.hash = '#/feed'; }, 2000);
      } else {
        this._view.displayError(`Gagal publikasi: ${response.message || 'Error tidak diketahui.'}`);
      }
    } catch (error) {
      console.error('Add Story Presenter System Error:', error);
      this._view.displayError('Terjadi kesalahan pada sistem saat publikasi cerita.');
    } finally {
      this._view.hideLoading();
    }
  }
}

export default AddStoryPresenter;
