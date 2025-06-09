import { getAllData, deleteDataByKey, OBJECT_STORE_STORIES } from '../utils/IdbHelper';
import NotificationHelper from '../utils/notification-helper';

class SavedStoriesPresenter {
  constructor({ view }) {
    this._view = view;
    this._idbStoreName = OBJECT_STORE_STORIES;
    this.displaySavedStories();
  }

  async displaySavedStories() {
    this._view.showLoading();
    try {
      const stories = await getAllData(this._idbStoreName);
      // Semua cerita di sini pasti tersimpan, jadi set isSaved ke true
      const storiesToRender = stories.map(story => ({ ...story, isSaved: true }));
      this._view.renderStories(storiesToRender);
    } catch (error) {
      this._view.showError('Gagal memuat cerita yang tersimpan.');
    }
  }

  async deleteStory(storyId) {
    try {
      await deleteDataByKey(this._idbStoreName, storyId);
      NotificationHelper.success('Cerita berhasil dihapus.');
      // Setelah menghapus, tampilkan ulang daftar cerita yang tersisa
      await this.displaySavedStories();
    } catch (error) {
      NotificationHelper.error('Gagal menghapus cerita.');
    }
  }
}

export default SavedStoriesPresenter;
