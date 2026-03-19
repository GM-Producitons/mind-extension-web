importScripts(
  "https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAjyCxkZTicyX1R8xmCq0s57qkui2HYp4c",
  authDomain: "mind-extension-ns.firebaseapp.com",
  projectId: "mind-extension-ns",
  messagingSenderId: "845128987070",
  appId: "1:845128987070:web:8a239e4943c07163abc9ef",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});
