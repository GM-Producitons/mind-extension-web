"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export default function TestPage() {
  const [log, setLog] = useState<string[]>([]);

  function addLog(msg: string) {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  // Step 1: Check DB state
  async function checkDB() {
    addLog("Fetching DB debug info...");
    const res = await fetch("/api/debug-notifications");
    const data = await res.json();
    addLog("DB State: " + JSON.stringify(data, null, 2));
  }

  // Step 2: Register SW + subscribe + save to DB via API route
  async function registerAndSave() {
    addLog("Starting service worker registration...");

    if (!("serviceWorker" in navigator)) {
      addLog("ERROR: Service workers not supported in this browser");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      addLog("SW registered: " + reg.scope);

      const registration = await navigator.serviceWorker.ready;
      addLog("SW ready");

      // Check existing subscription first
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        addLog("Found existing push subscription");
        addLog(
          "Existing endpoint: " + existing.endpoint.substring(0, 60) + "...",
        );
        const json = existing.toJSON();
        addLog("toJSON() keys: " + JSON.stringify(Object.keys(json)));
        addLog("Has keys.p256dh: " + !!json.keys?.p256dh);
        addLog("Has keys.auth: " + !!json.keys?.auth);
      }

      // Unsubscribe existing to avoid VAPID key mismatch
      const existing2 = await registration.pushManager.getSubscription();
      if (existing2) {
        await existing2.unsubscribe();
        addLog("Unsubscribed old subscription");
      }

      // Debug: check if the VAPID key is available
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      addLog("VAPID key defined: " + !!vapidKey);
      addLog("VAPID key length: " + (vapidKey?.length ?? "N/A"));
      addLog(
        "VAPID key first 10 chars: " +
          (vapidKey?.substring(0, 10) ?? "UNDEFINED"),
      );

      if (!vapidKey) {
        addLog(
          "ERROR: NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set! Check your .env file and restart the dev server.",
        );
        return;
      }

      const appServerKey = urlBase64ToUint8Array(vapidKey);
      addLog(
        "Converted key byte length: " + appServerKey.length + " (should be 65)",
      );

      // Check notification permission
      const perm = Notification.permission;
      addLog("Notification permission: " + perm);
      if (perm === "default") {
        addLog("Requesting notification permission...");
        const result = await Notification.requestPermission();
        addLog("Permission result: " + result);
        if (result !== "granted") {
          addLog(
            "ERROR: Notification permission denied. Cannot subscribe to push.",
          );
          return;
        }
      } else if (perm === "denied") {
        addLog(
          "ERROR: Notifications are blocked. Go to browser settings to allow them for this site.",
        );
        return;
      }

      // Subscribe fresh
      addLog("Calling pushManager.subscribe()...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      addLog("Push subscription obtained");
      addLog("Endpoint: " + subscription.endpoint.substring(0, 60) + "...");

      // Convert to JSON - THIS IS THE KEY STEP
      const subJSON = subscription.toJSON();
      addLog("subscription.toJSON(): " + JSON.stringify(subJSON));
      addLog("Has endpoint: " + !!subJSON.endpoint);
      addLog("Has keys: " + !!subJSON.keys);
      addLog("Has keys.p256dh: " + !!subJSON.keys?.p256dh);
      addLog("Has keys.auth: " + !!subJSON.keys?.auth);

      // Save via API route (not server action) for reliability
      addLog("Saving subscription via /api/save-subscription...");
      const saveRes = await fetch("/api/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subJSON),
      });
      const saveData = await saveRes.json();
      addLog("Save result: " + JSON.stringify(saveData));

      addLog("Done! Now click 'Check DB' to verify it was saved.");
    } catch (err: any) {
      addLog("ERROR: " + err.message);
    }
  }

  // Step 3: Test sending notification
  async function testSend() {
    addLog("Sending test notification...");
    const res = await fetch("/api/debug-notifications", { method: "POST" });
    const data = await res.json();
    addLog("Send result: " + JSON.stringify(data, null, 2));
  }

  // Step 4: Test what the server action receives
  async function testServerAction() {
    addLog("Testing what the server action receives...");

    if (!("serviceWorker" in navigator)) {
      addLog("ERROR: No service worker support");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      addLog("ERROR: No push subscription. Click 'Register & Save' first.");
      return;
    }

    // Show what the raw PushSubscription object looks like when serialized
    addLog("Raw subscription type: " + typeof subscription);
    addLog("Raw subscription constructor: " + subscription.constructor?.name);

    // Try JSON.stringify on the raw object (this is what server action serialization might do)
    try {
      const rawStringified = JSON.stringify(subscription);
      addLog("JSON.stringify(subscription): " + rawStringified);
    } catch {
      addLog("JSON.stringify(subscription) FAILED");
    }

    // vs toJSON()
    const jsonVersion = subscription.toJSON();
    addLog("subscription.toJSON(): " + JSON.stringify(jsonVersion));

    addLog(
      "DIAGNOSIS: If JSON.stringify shows endpoint+keys, server actions should work. " +
        "If it shows {} or missing keys, that's the bug.",
    );
  }

  // Step 5: Purge bad subscriptions
  async function purgeBadSubs() {
    addLog("Purging invalid subscriptions...");
    const res = await fetch("/api/debug-notifications/purge", {
      method: "POST",
    });
    const data = await res.json();
    addLog("Purge result: " + JSON.stringify(data));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Push Notification Debug</h1>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={checkDB}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          1. Check DB
        </button>
        <button
          onClick={registerAndSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          2. Register &amp; Save Subscription
        </button>
        <button
          onClick={testSend}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          3. Test Send Notification
        </button>
        <button
          onClick={testServerAction}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          4. Diagnose Serialization
        </button>
        <button
          onClick={purgeBadSubs}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          5. Purge Bad Subs
        </button>
        <button
          onClick={() => setLog([])}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Log
        </button>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-[60vh] overflow-y-auto whitespace-pre-wrap">
        {log.length === 0 && (
          <span className="text-gray-500">
            Click a button to start debugging...
          </span>
        )}
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      <div className="bg-gray-800 text-gray-300 p-4 rounded text-sm space-y-2">
        <p className="font-bold text-white">Debug steps:</p>
        <p>
          <strong>1. Check DB</strong> — See what&apos;s in the
          pushSubscriptions collection. If empty, that&apos;s the problem.
        </p>
        <p>
          <strong>2. Register &amp; Save</strong> — Register SW, subscribe to
          push, save via API route (using .toJSON()). This should fix the save.
        </p>
        <p>
          <strong>3. Test Send</strong> — Send a test notification to all saved
          subscriptions.
        </p>
        <p>
          <strong>4. Diagnose Serialization</strong> — See what happens when
          PushSubscription is serialized (likely the root cause).
        </p>
        <p>
          <strong>5. Purge Bad Subs</strong> — Remove subscriptions that have no
          endpoint/keys (broken saves).
        </p>
      </div>
    </div>
  );
}
