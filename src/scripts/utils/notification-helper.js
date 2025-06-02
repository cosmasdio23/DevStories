const NotificationHelper = {
  show({ message, type = 'info', duration = 3000 }) {
    // Buat elemen notifikasi
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification notification--${type}`;
    notificationElement.textContent = message;

    // Style dasar (bisa dipindahkan ke CSS, tapi agar ingat ini bagian dari helper)
    Object.assign(notificationElement.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 20px',
      borderRadius: '5px',
      color: 'white',
      zIndex: '1000',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      transition: 'opacity 0.5s ease, bottom 0.5s ease',
    });

    if (type === 'success') {
      notificationElement.style.backgroundColor = '#4CAF50'; // Hijau
    } else if (type === 'error') {
      notificationElement.style.backgroundColor = '#f44336'; // Merah
    } else { // info
      notificationElement.style.backgroundColor = '#2196F3'; // Biru
    }

    document.body.appendChild(notificationElement);

    // Animasikan masuk
    setTimeout(() => {
      notificationElement.style.opacity = '1';
      notificationElement.style.bottom = '30px';
    }, 10);


    // Hapus notifikasi setelah durasi tertentu
    setTimeout(() => {
      notificationElement.style.opacity = '0';
      notificationElement.style.bottom = '10px';
      setTimeout(() => {
        notificationElement.remove();
      }, 500); // Tunggu transisi selesai
    }, duration);
  },

  success(message, duration = 3000) {
    this.show({ message, type: 'success', duration });
  },

  error(message, duration = 4000) {
    this.show({ message, type: 'error', duration });
  },

  info(message, duration = 3000) {
    this.show({ message, type: 'info', duration });
  },
};

export default NotificationHelper;
