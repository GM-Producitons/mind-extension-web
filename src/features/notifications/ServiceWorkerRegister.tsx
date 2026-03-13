"use client";
import { useEffect } from "react";
import { saveSubscription } from "./actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const permission = Notification.permission;
    if (permission === "denied") return;

    navigator.serviceWorker.register("/sw.js").then(async () => {
      const registration = await navigator.serviceWorker.ready;

      // Unsubscribe from any existing subscription first.
      // An existing sub with a different VAPID key causes an AbortError.
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      // Must call .toJSON() to get a plain serializable object.
      // PushSubscription has ArrayBuffer keys that don't survive server action serialization.
      await saveSubscription(subscription.toJSON());
    });
  }, []);

  return null;
}
