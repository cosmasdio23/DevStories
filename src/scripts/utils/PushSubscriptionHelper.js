// src/scripts/utils/PushSubscriptionHelper.js

// =======================================================================
// PERHATIAN: GANTI DENGAN VAPID PUBLIC KEY ASLI DARI API DICODING!
// =======================================================================
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
// =======================================================================

/**
 * Mengubah string base64 URL safe menjadi Uint8Array.
 * Diperlukan untuk VAPID key saat subscribe.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Memeriksa dukungan browser dan meminta izin notifikasi.
 * @returns {Promise<string>} Resolves with permission state ('granted', 'denied', 'default').
 */
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('Browser ini tidak mendukung Notifikasi sistem.');
    alert('Browser Anda tidak mendukung Notifikasi sistem.');
    return Promise.reject(new Error('Browser tidak mendukung Notifikasi.'));
  }
  if (!('PushManager' in window)) {
    console.error('Browser ini tidak mendukung Push API.');
    alert('Browser Anda tidak mendukung Push API.');
    return Promise.reject(new Error('Browser tidak mendukung Push API.'));
  }
  if (!('serviceWorker' in navigator)) {
    console.error('Browser ini tidak mendukung Service Worker (diperlukan untuk push).');
    alert('Browser Anda tidak mendukung Service Worker.');
    return Promise.reject(new Error('Browser tidak mendukung Service Worker.'));
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Izin notifikasi sistem telah diberikan oleh pengguna.');
  } else {
    console.warn('Izin notifikasi sistem tidak diberikan atau diblokir.');
  }
  return permission;
}

/**
 * Melakukan subscribe ke push service menggunakan VAPID public key.
 * @returns {Promise<PushSubscription|null>} Object PushSubscription jika berhasil, atau null.
 */
async function subscribeToPushService() {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.log('Tidak bisa subscribe ke push, izin notifikasi tidak diberikan.');
    return null;
  }

  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === 'MASUKKAN_VAPID_PUBLIC_KEY_DARI_DICODING_API_DI_SINI') {
    console.error('VAPID_PUBLIC_KEY belum dikonfigurasi di PushSubscriptionHelper.js!');
    alert('Konfigurasi VAPID Key belum lengkap untuk Push Notification. Silakan periksa dokumentasi API Dicoding.');
    return null;
  }

  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    console.log('Service worker siap untuk push subscription:', serviceWorkerRegistration);

    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      console.log('Pengguna sudah ter-subscribe ke push notification:', subscription);
      return subscription;
    }

    console.log('Melakukan subscribe baru ke push notification...');
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log('Berhasil subscribe ke push notification:', subscription);

    // PENTING: API Dicoding mungkin mengharuskan Anda mengirim objek 'subscription' ini
    // ke salah satu endpoint mereka agar mereka bisa mengirim push ke pengguna ini.
    // Periksa dokumentasi API Dicoding mengenai langkah ini.
    // Contoh:
    // await sendSubscriptionToDicodingApi(subscription);
    // Jika tidak ada langkah seperti itu, maka hanya dengan subscribe menggunakan VAPID key mereka
    // mungkin sudah cukup.

    return subscription;

  } catch (error) {
    console.error('Gagal melakukan subscribe ke push notification:', error);
    if (Notification.permission === 'denied') {
      console.warn('Izin notifikasi sistem telah diblokir oleh pengguna.');
    }
    return null;
  }
}

// // Contoh fungsi placeholder jika Anda perlu mengirim subscription ke API Dicoding
// async function sendSubscriptionToDicodingApi(subscription) {
//   try {
//     // const response = await fetch('https://story-api.dicoding.dev/v1/????', { // GANTI DENGAN ENDPOINT YANG BENAR
//     //   method: 'POST',
//     //   headers: {
//     //     'Content-Type': 'application/json',
//     //     'Authorization': `Bearer ${UserSession.getUserToken()}` // Jika perlu token
//     //   },
//     //   body: JSON.stringify(subscription.toJSON()), // Kirim sebagai JSON
//     // });
//     // if (!response.ok) throw new Error('Gagal mengirim subscription ke API Dicoding.');
//     // const responseData = await response.json();
//     // console.log('Subscription berhasil dikirim ke API Dicoding:', responseData);
//     console.log('Placeholder: Mengirim subscription ke API Dicoding (perlu endpoint sebenarnya)...', subscription.toJSON());
//   } catch (error) {
//     console.error('Error mengirim subscription ke API Dicoding:', error);
//   }
// }

export { requestNotificationPermission, subscribeToPushService };
