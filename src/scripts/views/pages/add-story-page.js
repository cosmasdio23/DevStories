import AddStoryPresenter from '../../presenters/add-story-presenter';
// StoryApiService akan diurus oleh Presenter
import UserSession from '../../utils/user-session';
import CameraHelper from '../../utils/camera-helper';
import MapHelper from '../../utils/map-helper';
import NotificationHelper from '../../utils/notification-helper';

const AddStoryPage = {
  _presenter: null,
  _mapPickerInitialized: false, // Flag untuk mencegah inisialisasi peta ganda

  async render() {
    // Inisialisasi presenter di afterRender
    return `
      <div class="add-story-container auth-container"> <h2>Bagikan Cerita Baru Anda</h2>
        <form id="addStoryForm" enctype="multipart/form-data">
          <div class="form-group">
            <label for="storyDescription">Deskripsi:</label>
            <textarea id="storyDescription" name="description" rows="5" required aria-describedby="descriptionHelp"></textarea>
            <small id="descriptionHelp" class="form-text text-muted">Ceritakan kisah Anda.</small>
          </div>

          <div class="form-group">
            <label for="storyPhotoSource">Sumber Foto:</label>
            <div class="photo-source-options">
                <button type="button" id="useCameraButton" class="button button-outline">Gunakan Kamera</button>
                <span style="margin: 0 8px;">atau</span>
                <label for="storyPhotoFile" class="button button-outline">Pilih File Gambar</label>
                <input type="file" id="storyPhotoFile" name="photo" accept="image/*" class="file-input-hidden" aria-label="Pilih file gambar">
            </div>
            <video id="cameraFeed" class="camera-feed hidden" autoplay playsinline aria-label="Tampilan kamera"></video>
            <canvas id="photoCanvas" class="hidden" aria-hidden="true"></canvas>
            <button type="button" id="capturePhotoButton" class="button hidden">Ambil Foto</button>
            <button type="button" id="stopCameraButton" class="button button-danger hidden">Tutup Kamera</button>
            <img id="previewPhoto" src="#" alt="Pratinjau Foto" class="preview-image hidden">
          </div>

          <div class="form-group">
            <label for="map-picker">Lokasi Cerita (opsional, klik pada peta):</label>
            <div id="map-picker" style="height: 300px; width: 100%; border: 1px solid var(--color-border);">
                Memuat peta...
            </div>
            <input type="hidden" id="latitude" name="lat" aria-label="Latitude">
            <input type="hidden" id="longitude" name="lon" aria-label="Longitude">
            <p>Koordinat: <span id="coords-display">Belum dipilih</span></p>
          </div>

          <button type="submit" id="submitStoryButton" class="button button-primary">Publikasikan Cerita</button>
        </form>
        <div id="add-story-message-container">
            <p id="add-story-message" class="message"></p>
        </div>
        <div id="add-story-loader" class="loader-container hidden">
            <div class="loader"></div>
            <p id="add-story-loading-text">Mengunggah...</p>
        </div>
      </div>
    `;
  },

  async afterRender() {
    this._presenter = new AddStoryPresenter({ view: this });

    if (!UserSession.isUserLoggedIn()) {
      this.redirectToLogin();
      return;
    }

    this._initFormInteractions();
    this._initCamera(); // Panggil init camera
    if (!this._mapPickerInitialized) { // Hanya inisialisasi peta jika belum
      this._initMapPicker();
      this._mapPickerInitialized = true;
    }

    console.log('AddStoryPage rendered and presenter initialized.');
  },

  destroy() {
    // **Feedback Dicoding di Saran Pertama, Matikan kamera**
    if (this.cameraService) {
      this.cameraService.stopCamera();
    }
    // Panggil destroy dari parent class untuk membersihkan hal lain
    super.destroy();
    console.log('AddStoryPageView destroyed and camera stream stopped.');
  },

  _initFormInteractions() {
    const form = document.querySelector('#addStoryForm');
    const photoFileInput = document.querySelector('#storyPhotoFile');
    const previewPhoto = document.querySelector('#previewPhoto');

    if (photoFileInput) {
      photoFileInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewPhoto.src = e.target.result;
            previewPhoto.classList.remove('hidden');
          };
          reader.readAsDataURL(event.target.files[0]);
          CameraHelper.stopStream(); // Pastikan kamera berhenti jika file dipilih
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const description = document.querySelector('#storyDescription').value;
        // Ambil file dari CameraHelper jika itu sumbernya, atau dari input file
        const photoFile = CameraHelper.getCapturedFile() || photoFileInput.files[0];
        const lat = document.querySelector('#latitude').value;
        const lon = document.querySelector('#longitude').value;

        if (!description || !photoFile) {
          this.displayError('Deskripsi dan foto wajib diisi.');
          return;
        }

        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photoFile, photoFile.name); // Tambahkan nama file
        if (lat && lon) { // Hanya tambahkan lat/lon jika ada nilainya
          formData.append('lat', parseFloat(lat));
          formData.append('lon', parseFloat(lon));
        }

        await this._presenter.submitStory(formData);
      });
    }
  },

  _initCamera() {
    const useCameraButton = document.querySelector('#useCameraButton');
    const capturePhotoButton = document.querySelector('#capturePhotoButton');
    const stopCameraButton = document.querySelector('#stopCameraButton');
    const cameraFeed = document.querySelector('#cameraFeed');
    const photoCanvas = document.querySelector('#photoCanvas');
    const photoFileInput = document.querySelector('#storyPhotoFile'); // Untuk menyimpan hasil capture
    const previewPhoto = document.querySelector('#previewPhoto');

    CameraHelper.init({
      cameraFeedElement: cameraFeed,
      photoCanvasElement: photoCanvas,
      photoInputElement: photoFileInput, // CameraHelper akan mengisi input file ini
      previewPhotoElement: previewPhoto,
      // triggerElement: useCameraButton, // Kita handle trigger secara manual
      captureTriggerElement: capturePhotoButton, // Tombol capture terpisah
    });

    if(useCameraButton) {
      useCameraButton.addEventListener('click', () => {
        CameraHelper.startCamera();
        useCameraButton.classList.add('hidden');
        capturePhotoButton.classList.remove('hidden');
        stopCameraButton.classList.remove('hidden');
        if (photoFileInput) photoFileInput.value = ''; // Kosongkan input file
        if (previewPhoto) previewPhoto.classList.add('hidden'); // Sembunyikan preview file
      });
    }
    if(capturePhotoButton) {
      capturePhotoButton.addEventListener('click', () => {
        CameraHelper.capturePhoto(); // Ini akan memicu 'change' pada photoFileInput
        // Tombol capture & stop bisa disembunyikan di sini, atau di stopStream
      });
    }
    if(stopCameraButton) {
      stopCameraButton.addEventListener('click', () => {
        CameraHelper.stopStream();
        useCameraButton.classList.remove('hidden');
        capturePhotoButton.classList.add('hidden');
        stopCameraButton.classList.add('hidden');
      });
    }
  },

  _initMapPicker() {
    const latitudeInput = document.querySelector('#latitude');
    const longitudeInput = document.querySelector('#longitude');
    const coordsDisplay = document.querySelector('#coords-display');

    // Pastikan elemen peta sudah ada di DOM sebelum Leaflet mencoba menggunakannya
    // Beri sedikit delay jika perlu, terutama jika halaman baru saja dirender
    setTimeout(() => {
      const mapPickerElement = document.getElementById('map-picker');
      if (mapPickerElement && mapPickerElement.offsetParent !== null) { // Cek visibilitas
        MapHelper.initLocationPicker({
          mapId: 'map-picker',
          latInput: latitudeInput,
          lonInput: longitudeInput,
          coordsDisplayElement: coordsDisplay,
        });
      } else {
        console.warn('Map picker element not ready or not visible.');
        if(mapPickerElement) mapPickerElement.innerHTML = 'Peta tidak dapat dimuat. Coba refresh.';
      }
    }, 100); // Delay 100ms
  },

  // --- Metode View untuk Presenter ---
  showLoading(message = 'Mengunggah...') {
    const loader = document.querySelector('#add-story-loader');
    const loadingText = document.querySelector('#add-story-loading-text');
    const submitButton = document.querySelector('#submitStoryButton');
    if (loader) loader.classList.remove('hidden');
    if (loadingText) loadingText.textContent = message;
    if (submitButton) submitButton.disabled = true;
    this.clearMessage();
  },

  hideLoading() {
    const loader = document.querySelector('#add-story-loader');
    const submitButton = document.querySelector('#submitStoryButton');
    if (loader) loader.classList.add('hidden');
    if (submitButton) submitButton.disabled = false;
  },

  displaySuccess(message) {
    const messageElement = document.querySelector('#add-story-message');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = 'message success-message';
    }
    NotificationHelper.success(message);
    this.resetFormVisuals(); // Panggil reset visual form
  },

  displayError(message) {
    const messageElement = document.querySelector('#add-story-message');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = 'message error-message';
    }
    NotificationHelper.error(message);
  },

  clearMessage() {
    const messageElement = document.querySelector('#add-story-message');
    if (messageElement) messageElement.textContent = '';
  },

  resetForm() { // Dipanggil oleh presenter jika perlu reset form data
    const form = document.querySelector('#addStoryForm');
    if (form) form.reset();
    this.resetFormVisuals();
  },

  resetFormVisuals() { // Hanya reset tampilan, bukan data form
    const previewPhoto = document.querySelector('#previewPhoto');
    const coordsDisplay = document.querySelector('#coords-display');
    const photoFileInput = document.querySelector('#storyPhotoFile');

    if (previewPhoto) {
      previewPhoto.src = '#';
      previewPhoto.classList.add('hidden');
    }
    if (coordsDisplay) coordsDisplay.textContent = 'Belum dipilih';
    if (photoFileInput) photoFileInput.value = ''; // Kosongkan input file juga

    CameraHelper.stopStream(); // Pastikan kamera mati
    CameraHelper.clearCapturedFile(); // Hapus file yg dicapture sebelumnya dari helper
    document.querySelector('#useCameraButton')?.classList.remove('hidden');
    document.querySelector('#capturePhotoButton')?.classList.add('hidden');
    document.querySelector('#stopCameraButton')?.classList.add('hidden');


    // Reset peta picker jika ada fungsi resetnya di MapHelper
    // MapHelper.resetPicker('map-picker');
    // Atau re-init jika lebih mudah, tapi hati-hati duplikasi event listener
    // Jika MapHelper.initLocationPicker menghapus instance lama, ini aman:
    if (this._mapPickerInitialized) { // Re-init jika sudah pernah diinisialisasi
      // this._initMapPicker(); // Ini bisa menyebabkan re-render map yang tidak perlu jika viewnya masih sama
    }
  },

  redirectToLogin() {
    NotificationHelper.info('Anda harus login untuk menambahkan cerita.');
    UserSession.clearSession();
    window.location.hash = '#/login';
  },
};

export default AddStoryPage;
