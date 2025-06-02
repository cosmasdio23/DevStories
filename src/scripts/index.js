import 'regenerator-runtime';
import '../styles/main.css';
import '../styles/responsive.css';
import './utils/accessibility-helper';
import App from './views/app';
// Impor fungsi subscribe dari PushSubscriptionHelper.js
import { subscribeToPushService } from './utils/PushSubscriptionHelper.js';

// Registrasi Service Worker
if ('serviceWorker' in navigator) {
  // Jadikan callback untuk event 'load' menjadi async untuk menggunakan await di dalamnya
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js'); // Path ke sw.js di root output (dist)
      console.log('Service Worker registered successfully:', registration);

      // Setelah Service Worker berhasil terdaftar dan event 'load' selesai,
      // kita bisa mencoba untuk subscribe ke push notification.
      // navigator.serviceWorker.ready akan memastikan SW sudah aktif.
      console.log('Mencoba subscribe ke push notifications setelah SW siap...');
      await subscribeToPushService(); // Panggil fungsi untuk subscribe

    } catch (registrationError) {
      console.log('Service Worker registration failed:', registrationError);
    }
  });
} else {
  console.log('Service Worker not supported in this browser.');
}

// Inisialisasi komponen skip-link jika ada (bisa dipindahkan ke accessibility-helper.js nanti)
const skipLink = document.querySelector('.skip-link');
const mainContent = document.querySelector('#main-content');

if (skipLink && mainContent) {
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    mainContent.focus();
  });
}

const app = new App({
  header: document.querySelector('.app-header'), // Jika header perlu dimanipulasi
  nav: document.querySelector('.app-header__navigation'), // Jika navigasi perlu dimanipulasi
  content: document.querySelector('#main-content'),
  footer: document.querySelector('.app-footer'), // Jika footer perlu dimanipulasi
});

window.addEventListener('hashchange', () => {
  app.renderPage();
});

window.addEventListener('load', () => {
  app.renderPage();
  // Daftarkan Service Worker di sini jika ada (misal untuk PWA)
  // import('./utils/sw-register').then(module => module.default());
  // Baris di atas ini sepertinya duplikat atau sisa dari percobaan sebelumnya,
  // karena registrasi SW sudah dilakukan di atas. Anda bisa menghapusnya jika tidak diperlukan.
});

console.log('Hello from starter-project! Main script loaded.');
