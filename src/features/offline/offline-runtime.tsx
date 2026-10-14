"use client";

import { useEffect } from "react";
import { sync } from "./sync";
import { releaseRootFirebaseWorker } from "./service-worker";

export function OfflineRuntime() {
  useEffect(() => {
    void releaseRootFirebaseWorker().then(() => {
      if (
        process.env.NODE_ENV === "production" &&
        "serviceWorker" in navigator
      ) {
        void navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }
    });

    const run = () => {
      if (navigator.onLine) void sync();
    };
    run();
    window.addEventListener("online", run);
    return () => window.removeEventListener("online", run);
  }, []);

  return null;
}
