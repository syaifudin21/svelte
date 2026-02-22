importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

console.log("[firebase-messaging-sw.js] Service worker script loaded.");

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// Note: Service workers cannot access env variables easily, so you might need to hardcode these
// or use a build step to inject them.
console.log("[firebase-messaging-sw.js] Initializing Firebase...");
firebase.initializeApp({
  apiKey: "AIzaSyD6jLqwTfiagUc7lk7cEyybfiWLrs2cEes",
  authDomain: "ride-hailing-60125.firebaseapp.com",
  projectId: "ride-hailing-60125",
  storageBucket: "ride-hailing-60125.firebasestorage.app",
  messagingSenderId: "836338280720",
  appId: "1:836338280720:web:962dc660a134d4a1dedd95",
});

const messaging = firebase.messaging();
console.log("[firebase-messaging-sw.js] Firebase Messaging initialized.");

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message: ",
    JSON.stringify(payload, null, 2),
  );

  if (payload.notification) {
    const notificationTitle =
      payload.notification.title || "Background Notification";
    const notificationOptions = {
      body: payload.notification.body,
      icon: "/favicon.svg",
      data: payload.data, // Preserve data for click handling
    };

    console.log(
      "[firebase-messaging-sw.js] Displaying notification:",
      notificationTitle,
      notificationOptions,
    );
    self.registration.showNotification(notificationTitle, notificationOptions);
  } else {
    console.log(
      "[firebase-messaging-sw.js] Message has no notification payload, payload.data:",
      payload.data,
    );
  }
});

// Add notification click listener
self.addEventListener("notificationclick", (event) => {
  console.log(
    "[firebase-messaging-sw.js] Notification click Received.",
    event.notification.data,
  );
  event.notification.close();
  // Example: open app or specific page
  event.waitUntil(clients.openWindow("/"));
});
