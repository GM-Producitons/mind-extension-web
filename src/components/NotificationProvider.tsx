"use client";

import { useEffect } from "react";
import { registerAndSubscribe } from "@/lib/push-notifications";

export default function NotificationProvider() {
  useEffect(() => {
    // Wait a bit after page load so it doesn't block rendering
    const timer = setTimeout(() => {
      registerAndSubscribe();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
