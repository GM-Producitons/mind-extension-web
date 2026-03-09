"use client";
import { useEffect } from "react";
import { saveSubscription } from "./actions";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        navigator.serviceWorker.ready.then(async (registration) => {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: new Uint8Array(
              atob(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                .split("")
                .map((c) => c.charCodeAt(0)),
            ),
          });
          await saveSubscription(subscription); // server action
        });
      });
    }
  }, []);

  return null;
}
