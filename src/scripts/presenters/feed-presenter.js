import UserSession from '../utils/user-session';
import { getAllData, putData, deleteDataByKey, OBJECT_STORE_STORIES } from '../utils/IdbHelper';
import NotificationHelper from '../utils/notification-helper';

class FeedPresenter {
  constructor({ view, storyApiService }) {
    this._view = view;
    this._storyApiService = storyApiService;
    this._idbStoreName = OBJECT_STORE_STORIES;
  }

  async displayStories() {
    this._view.showLoading();
    const token = UserSession.getUserToken();
    if (!token) {
      this._view.redirectToLogin();
      return;
    }

    try {
      // Ambil data dari network dan IDB secara bersamaan untuk efisiensi
      const [storiesResponse, savedStories] = await Promise.all([
        this._storyApiService.getAllStories(token),
        getAllData(this._idbStoreName)
      ]);

      if (storiesResponse.error) throw new Error(storiesResponse.message);

      if (Array.isArray(storiesResponse.listStory)) {
        const savedStoryIds = new Set(savedStories.map(story => story.id));
        const storiesWithSaveStatus = storiesResponse.listStory.map(story => ({
          ...story,
          isSaved: savedStoryIds.has(story.id),
        }));
        this._view.renderStories(storiesWithSaveStatus);
        if (storiesWithSaveStatus.length === 0) {
          this._view.showEmptyStoriesMessage();
        }
      } else {
        throw new Error('Format data dari API tidak valid.');
      }
    } catch (error) {
      console.error('Gagal memuat feed:', error);
      // Fallback: jika network gagal, coba tampilkan dari IDB
      try {
        const idbStories = await getAllData(this._idbStoreName);
        if (idbStories.length > 0) {
          NotificationHelper.info('Gagal memuat data baru. Menampilkan data offline.');
          this._view.renderStories(idbStories.map(story => ({ ...story, isSaved: true })));
        } else {
          this._view.showError(error.message || 'Gagal memuat cerita.');
        }
      } catch (idbError) {
        this._view.showError('Gagal memuat cerita, baik online maupun offline.');
      }
    }
  }

  async saveStoryForOffline(storyData) {
    try {
      await putData(this._idbStoreName, storyData);
      NotificationHelper.success(`Cerita berhasil disimpan.`);
      this._view.updateStoryButtonState(storyData.id, true); // Perintahkan View untuk update tombol
    } catch (error) {
      NotificationHelper.error('Gagal menyimpan cerita.');
    }
  }

  async deleteStoryFromIdb(storyId) {
    try {
      await deleteDataByKey(this._idbStoreName, storyId);
      NotificationHelper.success('Cerita berhasil dihapus.');
      this._view.updateStoryButtonState(storyId, false); // Perintahkan View untuk update tombol
    } catch (error) {
      NotificationHelper.error('Gagal menghapus cerita.');
    }
  }
}

export default FeedPresenter;
