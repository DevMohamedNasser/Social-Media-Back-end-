import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getMessaging,
  getToken,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZryP0dBzNpgk_6Brpj7WGV8fS9VsM-nY",
  authDomain: "social-media-5e51d.firebaseapp.com",
  projectId: "social-media-5e51d",
  storageBucket: "social-media-5e51d.firebasestorage.app",
  messagingSenderId: "202516795236",
  appId: "1:202516795236:web:73d52fae112e90a58a3471",
  measurementId: "G-9Q5EZBQNES",
};

const VAPID_KEY =
  "BLOAgKFeEwIz77jPNsMgDba5anVg3qyV-_PDBggQBiDx7qKiBczmhc_n_-fiu2YaZ8UIvrTthIra6jUTJqBoduU";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function getFCMToken() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error(`Notification permission: ${permission}`);
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      throw new Error("FCM token was not returned");
    }

    return token;
  } catch (error) {
    console.error("FCM Token Error:", error);
    throw error;
  }
}
