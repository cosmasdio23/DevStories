import '../../globals/config';
const createStoryItemTemplate = (story) => {
  // Logika dinamis untuk membuat tombol 'Delete' atau 'Save'
  const saveOrDeleteButton = story.isSaved
    ? `<button
         class="button button-delete-offline"
         data-story-id="${story.id}"
         aria-label="Remove story named ${story.name || 'this'} from offline storage">
         <i class="fas fa-trash-alt" aria-hidden="true"></i> Delete
       </button>`
    : `<button
         class="button button-save-offline"
         data-story-id="${story.id}"
         aria-label="Save story named ${story.name || 'this'} for offline reading">
         <i class="fas fa-bookmark" aria-hidden="true"></i> Save
       </button>`;

  return `
    <article class="story-item" id="story-${story.id}">
      <img class="story-item__thumbnail lazyload"
           data-src="${story.photoUrl}"
           alt="Foto cerita oleh ${story.name}"
           crossorigin="anonymous">
      <div class="story-item__content">
        <h3 class="story-item__title"><a href="#/story/${story.id}">${story.name}</a></h3>
        <p class="story-item__date">${new Date(story.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })}</p>
        <p class="story-item__description">${story.description.substring(0, 150)}...</p>
        ${story.lat && story.lon ? `<div id="map-${story.id}" class="story-item__map" style="height: 150px;">Memuat peta...</div>` : ''}
      </div>
      <div class="story-item__actions">
        ${saveOrDeleteButton}
      </div>
    </article>
  `;
};

// Fungsi untuk detail cerita
const createStoryDetailTemplate = (story) => `
  <article class="story-detail">
    <h2 class="story-detail__name">${story.name}</h2>
    <p class="story-detail__date">Dibuat pada: ${new Date(story.createdAt).toLocaleDateString('id-ID', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
})}</p>
    <figure class="story-detail__figure">
      <img class="story-detail__image lazyload" data-src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" crossorigin="anonymous">
      <figcaption class="visually-hidden">Foto untuk cerita berjudul ${story.name}</figcaption>
    </figure>
    <div class="story-detail__description">
      <h3>Deskripsi Cerita:</h3>
      <p>${story.description.replace(/\n/g, '<br>')}</p> </div>
    ${story.lat && story.lon ? `
      <div class="story-detail__location">
        <h3>Lokasi Cerita:</h3>
        <div id="map-detail-${story.id}" class="story-detail__map-display" style="height: 300px; width: 100%;">
          Memuat peta lokasi...
        </div>
      </div>
    ` : '<p>Tidak ada informasi lokasi untuk cerita ini.</p>'}
    <a href="#/feed" class="button button-outline" style="margin-top: 20px;">Kembali ke Feed</a>
  </article>
`;


export {
  createStoryItemTemplate,
  createStoryDetailTemplate,
};
