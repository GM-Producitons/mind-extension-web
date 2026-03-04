/// <reference lib="webworker" />

// Push event — fires when the server sends a push message
self.addEventListener("push", (event) => {
  const fallback = {
    title: "MindExtension",
    body: "You have a new notification",
  };
  let data = fallback;

  try {
    data = event.data ? event.data.json() : fallback;
  } catch {
    data = fallback;
  }

  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/dashboard",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click — open/focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow(urlToOpen);
      }),
  );
});

// Activate — claim all clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
