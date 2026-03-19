"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getFCMToken } from "./getToken";
import {
  saveDesktopTokenAction,
  savePhoneTokenAction,
} from "@/features/user_management/apis/notificationsActions";
import { useUserStore } from "@/features/user_management/store/userStore";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [deviceType, setDeviceType] = useState<"desktop" | "phone">("desktop");
  const { user, refetchUser } = useUserStore();

  async function saveDesktopToken(token: string) {
    console.log("Saving desktop token...");
    await saveDesktopTokenAction(token);
    if (user) {
      await refetchUser(user._id);
    }
  }

  async function savePhoneToken(token: string) {
    console.log("Saving phone token...");
    await savePhoneTokenAction(token);
    if (user) {
      await refetchUser(user._id);
    }
  }

  async function handleUpdateToken() {
    try {
      const token = await getFCMToken();
      if (!token) {
        console.error("Failed to get FCM token.");
        return;
      }

      if (deviceType === "phone") {
        await savePhoneToken(token);
      } else {
        await saveDesktopToken(token);
      }
    } catch (error) {
      console.error("Error updating token:", error);
    }
  }

  async function handleAskPermission() {
    try {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Notifications
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-8 py-4">
          {/* Part 1: Device Toggle */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Monitor
                strokeWidth={deviceType === "desktop" ? 2.5 : 1.5}
                className={`w-6 h-6 transition-colors ${
                  deviceType === "desktop"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-xs font-medium text-muted-foreground">
                Desktop
              </span>
            </div>
            <Switch
              checked={deviceType === "phone"}
              onCheckedChange={(checked) =>
                setDeviceType(checked ? "phone" : "desktop")
              }
            />
            <div className="flex flex-col items-center gap-2">
              <Smartphone
                strokeWidth={deviceType === "phone" ? 2.5 : 1.5}
                className={`w-6 h-6 transition-colors ${
                  deviceType === "phone"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-xs font-medium text-muted-foreground">
                Phone
              </span>
            </div>
          </div>

          {/* Part 2: Update/Add Browser Token */}
          <Button
            onClick={handleUpdateToken}
            className="w-full font-semibold"
            variant="default"
          >
            Update/Add Browser Token
          </Button>

          {/* Part 3: Ask Permissions */}
          <Button
            onClick={handleAskPermission}
            variant="secondary"
            className="w-full"
          >
            Ask for Notification Permissions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
