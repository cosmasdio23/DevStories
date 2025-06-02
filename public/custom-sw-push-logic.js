// public/custom-sw-push-logic.js
console.log('[Custom SW Push Logic] File dimuat dan siap menangani push.');

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Diterima.');
  let notificationTitle = 'DevStory Notifikasi!';
  let notificationOptions = {
    body: 'Ada cerita baru atau update untuk Anda.',
    icon: '/assets/icons/icon-192x192.png', // Pastikan path ikon ini benar
    badge: '/assets/icons/icon-96x96.png',  // Pastikan path ikon ini benar
    data: {
      url: '/', // URL default yang akan dibuka jika notifikasi diklik
    },
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      console.log('[Service Worker] Data Push (JSON): ', dataJson);
      notificationTitle = dataJson.title || notificationTitle;
      notificationOptions.body = dataJson.body || notificationOptions.body;
      notificationOptions.icon = dataJson.icon || notificationOptions.icon;
      notificationOptions.badge = dataJson.badge || notificationOptions.badge;
      if (dataJson.data && dataJson.data.url) {
        notificationOptions.data.url = dataJson.data.url;
      }
      // Anda bisa menambahkan actions jika server mengirimnya
      // if (dataJson.actions) { notificationOptions.actions = dataJson.actions; }
    } catch (e) {
      console.log('[Service Worker] Data Push (Text): ', event.data.text());
      notificationOptions.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notifikasi di-klik.');
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientPath = new URL(client.url).pathname;
        const targetPath = new URL(urlToOpen, self.location.origin).pathname;
        if (clientPath === targetPath && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(new URL(urlToOpen, self.location.origin).href);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notifikasi ditutup (bukan diklik).', event.notification);
});
