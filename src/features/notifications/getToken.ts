import { getToken, deleteToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase/FirebaseClient";

export async function getFCMToken() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    await navigator.serviceWorker.ready;

    try {
      await deleteToken(messaging);
    } catch (e) {
      // Ignore
    }

    const existingSub = await registration.pushManager.getSubscription();
    try {
      if (existingSub) {
        await existingSub.unsubscribe();
      }
    } catch (e) {
      console.error("Failed to unsubscribe old token.", e);
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (err) {
    console.error("Error during getToken flow:", err);
    throw err;
  }
}
