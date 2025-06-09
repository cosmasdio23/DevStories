import SavedStoriesPresenter from '../../presenters/saved-stories-presenter';
import { createStoryItemTemplate } from '../templates/template-creator';

const SavedStoriesPage = {
  _presenter: null,

  async render() {
    return `
      <div class="content saved-stories-container">
        <h2 class="content__heading">Cerita Tersimpan (Offline)</h2>
        <div id="saved-stories-list" class="stories-list">
          <div class="loader-container"><div class="loader"></div></div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    this._presenter = new SavedStoriesPresenter({ view: this }); // Simpan instance presenter ke this._presenter
    this._initStoryActionsListener();
  },

  renderStories(stories) {
    const storiesContainer = document.querySelector('#saved-stories-list');
    storiesContainer.innerHTML = '';
    if (stories.length === 0) {
      storiesContainer.innerHTML = '<p class="empty-message">Anda belum memiliki cerita yang disimpan.</p>';
      return;
    }
    stories.forEach((story) => {
      storiesContainer.innerHTML += createStoryItemTemplate(story);
    });
  },

  _initStoryActionsListener() {
    const storiesContainer = document.querySelector('#saved-stories-list');
    storiesContainer.addEventListener('click', (event) => {
      if (event.target.matches('.button-delete-offline')) {
        event.stopPropagation();
        const storyId = event.target.dataset.storyId;
        if (storyId) {
          this._presenter.deleteStory(storyId);
        }
      }
    });
  },

  showLoading() {
    document.querySelector('#saved-stories-list').innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
  },

  showError(message) {
    document.querySelector('#saved-stories-list').innerHTML = `<p class="error-message">${message}</p>`;
  },
};

export default SavedStoriesPage;
