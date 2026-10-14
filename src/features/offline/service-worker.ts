export async function releaseRootFirebaseWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  const registrations = await navigator.serviceWorker.getRegistrations();
  const root = `${location.origin}/`;
  await Promise.all(
    registrations.map(async (registration) => {
      const script =
        registration.active?.scriptURL ||
        registration.waiting?.scriptURL ||
        registration.installing?.scriptURL ||
        "";
      if (
        registration.scope === root &&
        script.includes("firebase-messaging-sw.js")
      ) {
        await registration.unregister();
      }
    }),
  );
}

export function waitForWorker(registration: ServiceWorkerRegistration) {
  if (registration.active) return Promise.resolve();
  const worker = registration.installing || registration.waiting;
  if (!worker) return Promise.resolve();
  return new Promise<void>((resolve) => {
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated" || worker.state === "redundant") {
        resolve();
      }
    });
  });
}
