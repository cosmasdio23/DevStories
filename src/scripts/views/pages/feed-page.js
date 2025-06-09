import FeedPresenter from '../../presenters/feed-presenter';
import StoryApiService from '../../models/story-api-service';
import { createStoryItemTemplate } from '../templates/template-creator';
import MapHelper from '../../utils/map-helper';
import NotificationHelper from '../../utils/notification-helper';
import 'lazysizes';

const FeedPage = {
  _presenter: null,
  _stories: [],

  async render() {
    return `
      <div class="content feed-container">
        <h2 class="content__heading">Feed Cerita</h2>
        <div id="stories-list" class="stories-list">
          <div class="loader-container"><div class="loader"></div><p>Memuat cerita...</p></div>
        </div>
        <a href="#/add-story" class="button button-fab" aria-label="Tambah cerita baru" title="Tambah Cerita Baru">
          <i class="fas fa-plus"></i>
        </a>
      </div>
    `;
  },

  async afterRender() {
    this._presenter = new FeedPresenter({
      view: this,
      storyApiService: StoryApiService,
    });
    this._initStoryActionsListener();
    await this._presenter.displayStories();
  },

  renderStories(stories) {
    this._stories = stories;
    const storiesContainer = document.querySelector('#stories-list');
    if (!storiesContainer) return;
    storiesContainer.innerHTML = '';
    if (stories.length === 0) {
      this.showEmptyStoriesMessage();
      return;
    }
    stories.forEach((story) => {
      storiesContainer.innerHTML += createStoryItemTemplate(story);
    });
    this._initializeMapsForRenderedStories();
  },

  _initStoryActionsListener() {
    const storiesContainer = document.querySelector('#stories-list');
    if (!storiesContainer) return;

    storiesContainer.addEventListener('click', (event) => {
      const target = event.target;
      const storyId = target.dataset.storyId;
      if (!storyId || !this._presenter) return;

      if (target.matches('.button-save-offline')) {
        event.stopPropagation();
        const storyData = this._stories.find((story) => story.id === storyId);
        if (storyData) this._presenter.saveStoryForOffline(storyData);
        return;
      }

      if (target.matches('.button-delete-offline')) {
        event.stopPropagation();
        this._presenter.deleteStoryFromIdb(storyId);
      }
    });
  },

  updateStoryButtonState(storyId, isSaved) {
    const storyElement = document.querySelector(`#story-${storyId}`);
    if (!storyElement) return;

    const storyData = this._stories.find(story => story.id === storyId);
    if (storyData) {
      storyData.isSaved = isSaved;
      const actionsContainer = storyElement.querySelector('.story-item__actions');
      if (actionsContainer) {
        actionsContainer.innerHTML = createStoryItemTemplate(storyData).match(/<div class="story-item__actions">([\s\S]*)<\/div>/)[1];
      }
    }
  },

  showLoading() {
    const storiesContainer = document.querySelector('#stories-list');
    if (storiesContainer) {
      storiesContainer.innerHTML = '<div class="loader-container"><div class="loader"></div><p>Memuat cerita...</p></div>';
    }
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
  },

  _initializeMapsForRenderedStories() {
    setTimeout(() => {
      this._stories.forEach((story) => {
        if (story.lat && story.lon) {
          const mapElementId = `map-${story.id}`;
          const mapElement = document.getElementById(mapElementId);
          if (mapElement && mapElement.offsetParent !== null) {
            MapHelper.displayStoryMap(mapElementId, story.lat, story.lon, story.name);
          }
        }
      });
    }, 200);
  },

  redirectToLogin() {
    NotificationHelper.info('Sesi Anda berakhir atau Anda belum login. Silakan login kembali.');
    setTimeout(() => {
      UserSession.clearSession();
      window.location.hash = '#/login';
    }, 1500);
  },
};

export default FeedPage;
