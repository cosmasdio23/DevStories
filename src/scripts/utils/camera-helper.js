const CameraHelper = {
  _stream: null,
  _capturedFile: null, // Untuk menyimpan file yang di-capture
  _settings: {
    cameraFeedElement: null,
    photoCanvasElement: null,
    photoInputElement: null,
    previewPhotoElement: null,
    // triggerElement: null, // Dihapus, dihandle manual oleh view
    captureTriggerElement: null,
  },

  init(settings) {
    this._settings = { ...this._settings, ...settings };
  },

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      NotificationHelper.error('Kamera tidak didukung oleh browser Anda.'); // Gunakan Notif Helper
      return;
    }

    try {
      this.stopStream();
      this._stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); // Prioritaskan kamera belakang

      if (this._settings.cameraFeedElement) {
        this._settings.cameraFeedElement.srcObject = this._stream;
        this._settings.cameraFeedElement.classList.remove('hidden');
        this._settings.cameraFeedElement.onloadedmetadata = () => {
          this._settings.cameraFeedElement.play();
        };
        if (this._settings.previewPhotoElement) {
          this._settings.previewPhotoElement.classList.add('hidden');
          this._settings.previewPhotoElement.src = '#';
        }
        if (this._settings.photoInputElement) this._settings.photoInputElement.value = ''; // Kosongkan input file
        this._capturedFile = null; // Bersihkan file yang di-capture sebelumnya
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      NotificationHelper.error('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.');
      // Coba kamera depan jika kamera belakang gagal (beberapa browser mungkin butuh ini)
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        // Ulangi setup srcObject jika berhasil dengan kamera depan
        if (this._settings.cameraFeedElement && this._stream) {
          this._settings.cameraFeedElement.srcObject = this._stream;
          // ... (sisa setup)
        }
      } catch (fallbackErr) {
        console.error('Error accessing fallback camera:', fallbackErr);
      }
    }
  },

  capturePhoto() {
    if (!this._stream || !this._settings.cameraFeedElement || !this._settings.photoCanvasElement || !this._settings.photoInputElement) {
      NotificationHelper.info('Kamera belum siap atau konfigurasi hilang.');
      return;
    }

    const video = this._settings.cameraFeedElement;
    const canvas = this._settings.photoCanvasElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        NotificationHelper.error('Gagal membuat file gambar dari kamera.');
        return;
      }
      this._capturedFile = new File([blob], `capture-${new Date().toISOString()}.jpg`, { type: 'image/jpeg' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(this._capturedFile);
      this._settings.photoInputElement.files = dataTransfer.files;

      if (this._settings.previewPhotoElement) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this._settings.previewPhotoElement.src = e.target.result;
          this._settings.previewPhotoElement.classList.remove('hidden');
        };
        reader.readAsDataURL(this._capturedFile);
      }

      this._settings.photoInputElement.dispatchEvent(new Event('change', { bubbles: true }));
      this.stopStream(); // Otomatis stop stream setelah capture
      // Kembalikan visibilitas tombol
      document.querySelector('#useCameraButton')?.classList.remove('hidden');
      document.querySelector('#capturePhotoButton')?.classList.add('hidden');
      document.querySelector('#stopCameraButton')?.classList.add('hidden');

    }, 'image/jpeg', 0.9); // Kualitas 90%
  },

  stopStream() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
      if (this._settings.cameraFeedElement) {
        this._settings.cameraFeedElement.srcObject = null;
        this._settings.cameraFeedElement.classList.add('hidden');
      }
      // Kembalikan visibilitas tombol jika stream dihentikan manual
      document.querySelector('#useCameraButton')?.classList.remove('hidden');
      document.querySelector('#capturePhotoButton')?.classList.add('hidden');
      document.querySelector('#stopCameraButton')?.classList.add('hidden');
    }
  },

  getCapturedFile() {
    return this._capturedFile;
  },

  clearCapturedFile() {
    this._capturedFile = null;
  }
};

export default CameraHelper;
