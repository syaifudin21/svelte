importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// Note: Service workers cannot access env variables easily, so you might need to hardcode these
// or use a build step to inject them.
firebase.initializeApp({
  apiKey: "AIzaSyD6jLqwTfiagUc7lk7cEyybfiWLrs2cEes",
  authDomain: "ride-hailing-60125.firebaseapp.com",
  projectId: "ride-hailing-60125",
  storageBucket: "ride-hailing-60125.firebasestorage.app",
  messagingSenderId: "836338280720",
  appId: "1:836338280720:web:962dc660a134d4a1dedd95",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
