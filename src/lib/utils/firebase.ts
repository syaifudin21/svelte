import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { env } from "$env/dynamic/public";

function getFirebaseApp() {
  const firebaseConfig = {
    apiKey: env.PUBLIC_FIREBASE_API_KEY,
    authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.PUBLIC_FIREBASE_APP_ID,
  };

  console.log("Initializing Firebase with config:", {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? "***" : undefined,
  });

  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

export async function getFcmToken() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator))
    return null;

  try {
    console.log("Starting FCM token retrieval...");

    const app = getFirebaseApp();
    const messaging = getMessaging(app);

    // Request permission
    const permission = await Notification.requestPermission();
    console.log("Notification permission status:", permission);

    if (permission !== "granted") {
      console.error("Notification permission denied");
      return null;
    }

    // Check for existing registration or register new one
    console.log("Checking for service worker registration...");
    let registration = await navigator.serviceWorker.getRegistration("/");

    if (!registration) {
      console.log(
        "No registration found, registering /firebase-messaging-sw.js",
      );
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
    } else {
      console.log(
        "Existing service worker found at scope:",
        registration.scope,
      );
    }

    // Wait for ready
    console.log("Waiting for service worker to be ready...");
    const readyReg = await navigator.serviceWorker.ready;
    console.log("Service worker is ready.");

    // Diagnostic: Try manual push subscription just to see if it works
    try {
      console.log("Diagnostic: Testing PushManager...");
      const sub = await readyReg.pushManager.getSubscription();
      if (!sub) console.log("No existing push subscription (normal).");
    } catch (e) {
      console.warn("PushManager diagnostic test result:", e);
    }

    console.log(
      "Calling getToken with VAPID Key:",
      env.PUBLIC_FIREBASE_VAPID_KEY,
    );
    const token = await getToken(messaging, {
      vapidKey: env.PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: readyReg,
    });

    if (token) {
      localStorage.setItem("fcm_token", token);
      console.log("FCM Token obtained successfully:", token);
      return token;
    }
  } catch (error: any) {
    console.error("Detailed FCM Error:", error);
    if (error.toString().includes("push service error")) {
      console.error(
        "This is likely a browser/OS level issue or blocked connection to Google's Push servers.",
      );
    }
    return null;
  }
  return null;
}

export function listenForMessages() {
  if (typeof window === "undefined") return;

  try {
    const app = getFirebaseApp();
    const messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      console.log("FCM Message received in foreground:", payload);
    });
  } catch (error) {
    console.error("Error setting up FCM message listener:", error);
  }
}
