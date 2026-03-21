"use client";

import { useState } from "react";
import { Monitor, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle as CardTitleComponent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getFCMToken } from "@/features/notifications/getToken";
import {
  saveDesktopTokenAction,
  savePhoneTokenAction,
  updateUserTimezoneOffsetAction,
} from "@/features/user_management/apis/notificationsActions";
import { useUserStore } from "@/features/user_management/store/userStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [deviceType, setDeviceType] = useState<"desktop" | "phone">("desktop");
  const { user, refetchUser } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleTimezoneChange(offset: number) {
    try {
      setIsSaving(true);
      const result = await updateUserTimezoneOffsetAction(offset);
      if (result.success && user) {
        await refetchUser(user._id);
      }
    } catch (error) {
      console.error("Error updating timezone:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const currentOffset = user?.utcOffset ?? 2;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Notification Settings Card */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitleComponent className="text-base">
                Notifications
              </CardTitleComponent>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Device Type Toggle */}
              <div className="flex items-center justify-center gap-6 p-3 bg-secondary/30 rounded-lg">
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

              {/* Update Token Button */}
              <Button
                onClick={handleUpdateToken}
                className="w-full font-semibold"
                variant="default"
              >
                Update/Add Browser Token
              </Button>

              {/* Ask Permissions Button */}
              <Button
                onClick={handleAskPermission}
                variant="secondary"
                className="w-full"
              >
                Ask for Notification Permissions
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Timezone Settings Card */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitleComponent className="flex items-center gap-2 text-base">
                <Globe className="w-4 h-4" />
                Timezone
              </CardTitleComponent>
              <CardDescription>Adjust for daylight saving time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Current offset: UTC +{currentOffset}
              </p>

              <div className="flex gap-2">
                <Button
                  variant={currentOffset === 2 ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleTimezoneChange(2)}
                  disabled={isSaving}
                >
                  UTC +2
                </Button>
                <Button
                  variant={currentOffset === 3 ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleTimezoneChange(3)}
                  disabled={isSaving}
                >
                  UTC +3
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                This affects when notifications are sent for your tasks.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
