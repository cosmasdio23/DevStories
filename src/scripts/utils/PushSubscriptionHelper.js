// src/scripts/utils/PushSubscriptionHelper.js
import UserSession from './user-session';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Fungsi untuk mengirim subscription ke server API Dicoding.
 * @param {PushSubscription} subscription - Objek subscription yang didapat dari Push API.
 */
async function sendSubscriptionToDicodingApi(subscription) {
  const token = UserSession.getUserToken();
  if (!token) {
    console.error('Tidak bisa mengirim subscription, user tidak login.');
    return;
  }

  // Asumsi endpoint sudah benar, jika tidak ganti di sini.
  const SUBSCRIBE_ENDPOINT = 'https://story-api.dicoding.dev/v1/notifications/subscribe';

  try {
    // =======================================================================
    // PERUBAHAN UTAMA DI SINI
    // =======================================================================
    // 1. Ubah objek subscription menjadi JSON biasa.
    const subscriptionJson = subscription.toJSON();

    // 2. Hapus properti 'expirationTime' jika ada.
    delete subscriptionJson.expirationTime;
    // =======================================================================

    const response = await fetch(SUBSCRIBE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // 3. Kirim JSON yang sudah dibersihkan.
      body: JSON.stringify(subscriptionJson),
    });

    const responseData = await response.json();
    if (!response.ok) {
      // Throw error dengan pesan dari server jika ada
      throw new Error(responseData.message || 'Gagal mengirim subscription ke server.');
    }

    console.log('Subscription berhasil dikirim ke API Dicoding:', responseData);
  } catch (error) {
    console.error('Error saat mengirim subscription ke API Dicoding:', error);
    // Mungkin tampilkan notifikasi error ke pengguna menggunakan NotificationHelper Anda
  }
}

// Fungsi requestNotificationPermission tidak perlu diubah
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('Browser ini tidak mendukung Notifikasi sistem.');
    return Promise.reject(new Error('Browser tidak mendukung Notifikasi.'));
  }
  if (!('PushManager' in window)) {
    console.error('Browser ini tidak mendukung Push API.');
    return Promise.reject(new Error('Browser tidak mendukung Push API.'));
  }
  if (!('serviceWorker' in navigator)) {
    console.error('Browser ini tidak mendukung Service Worker.');
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

// Fungsi subscribeToPushService tidak perlu diubah
async function subscribeToPushService() {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.log('Tidak bisa subscribe ke push, izin notifikasi tidak diberikan.');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error('VAPID_PUBLIC_KEY belum dikonfigurasi!');
    return null;
  }

  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      console.log('Pengguna sudah ter-subscribe. Subscription:', subscription);
      await sendSubscriptionToDicodingApi(subscription);
      return subscription;
    }

    console.log('Melakukan subscribe baru ke push notification...');
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log('Berhasil subscribe baru:', subscription);
    await sendSubscriptionToDicodingApi(subscription);

    return subscription;
  } catch (error) {
    console.error('Gagal melakukan subscribe ke push notification:', error);
    if (Notification.permission === 'denied') {
      console.warn('Izin notifikasi sistem telah diblokir oleh pengguna.');
    }
    return null;
  }
}

export { requestNotificationPermission, subscribeToPushService };
