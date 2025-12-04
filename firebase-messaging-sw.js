// firebase-messaging-sw.js
// Place this file at the root (or public/) so it's available at /firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Replace firebaseConfig values with your project's config if you want;
// these are not secret (client can have config)
const firebaseConfig = {
  apiKey: "AIzaSyCCesn9w_LRC2d9xFlu5kxPrX9Qi9y3gvs",
  authDomain: "aj-esports-ae4bd.firebaseapp.com",
  projectId: "aj-esports-ae4bd",
  databaseURL: "https://aj-esports-ae4bd-default-rtdb.firebaseio.com",
  messagingSenderId: "1001531360017",
  appId: "1:1001531360017:web:3ae308430eb02b0"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notification = payload.notification || {};
  const title = notification.title || payload.data?.title || 'New Notification';
  const options = {
    body: notification.body || payload.data?.message || '',
    icon: payload.data?.icon || '/favicon.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = (event.notification?.data?.click_action) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
