"use client";

import { Button } from "@/components/ui/button";
import { getFCMToken } from "../getToken";

export default function TestFCMButton() {
  async function handleClick() {
    const token = await getFCMToken();
    console.log("FCM TOKEN:", token);
  }

  return (
    <div className="flex w-full items-center justify-center">
      <Button onClick={handleClick}>Get Notification Token</Button>
    </div>
  );
}
