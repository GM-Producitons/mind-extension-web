"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Settings,
  LayoutDashboard,
  Bus,
  CheckSquare,
  Eye,
  Layers,
  Instagram,
  Moon,
  Sun,
  Bell,
  LogOut,
  CalendarDays,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SettingsModal } from "@/features/settings/SettingsModal";
import { logoutUser } from "@/features/login/apis/userActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface App {
  name: string;
  icon: React.ReactNode;
  href: string;
  onClickFunction?: () => void | Promise<void>;
}

const DRAG_THRESHOLD_PX = 6;

export default function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const dragNodeRef = useRef<HTMLDivElement>(null);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const apps: App[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      name: "Schedule",
      icon: <CalendarDays className="h-5 w-5" />,
      href: "/schedule",
    },
    {
      name: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "#notifications",
    },
    {
      name: "Tasks",
      icon: <CheckSquare className="h-5 w-5" />,
      href: "/htbasas",
    },
    {
      name: "Average Bus",
      icon: <Bus className="h-5 w-5" />,
      href: "/avgbus",
    },
    {
      name: "Vision",
      icon: <Eye className="h-5 w-5" />,
      href: "/vision",
    },
    {
      name: "Flashcards",
      icon: <Layers className="h-5 w-5" />,
      href: "/flashcards",
    },
    {
      name: "MyInsta",
      icon: <Instagram className="h-5 w-5" />,
      href: "/myinsta",
    },
    {
      name: mounted && theme === "dark" ? "Light Mode" : "Dark Mode",
      icon:
        mounted && theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        ),
      href: "#theme",
    },
    {
      name: "Logout",
      icon: <LogOut className="h-5 w-5" />,
      href: "/login",
      onClickFunction: async () => {
        await logoutUser();
        router.replace("/login");
        router.refresh();
      },
    },
  ];

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const handleFabClick = () => {
    if (dragMovedRef.current) return;
    toggleOpen();
  };

  const onDragStart = (_e: unknown, data: { x: number; y: number }) => {
    dragStartRef.current = { x: data.x, y: data.y };
    dragMovedRef.current = false;
  };

  const onDrag = (_e: unknown, data: { x: number; y: number }) => {
    const dx = Math.abs(data.x - dragStartRef.current.x);
    const dy = Math.abs(data.y - dragStartRef.current.y);
    if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
      dragMovedRef.current = true;
      closeMenu();
    }
  };

  const runAppAction = async (app: App) => {
    closeMenu();
    if (app.href === "#notifications") {
      setNotificationModalOpen(true);
      return;
    }
    if (app.href === "#theme") {
      if (mounted && theme) {
        setTheme(theme === "dark" ? "light" : "dark");
      }
      return;
    }
    if (app.onClickFunction) {
      await app.onClickFunction();
      return;
    }
    router.push(app.href);
  };

  const fabButton = (
    <Button
      type="button"
      size="icon"
      onClick={handleFabClick}
      className={cn(
        "settings-fab-handle h-12 w-12 shrink-0 rounded-full shadow-lg touch-none",
        !isMobile && "cursor-grab active:cursor-grabbing",
      )}
      aria-label="Settings menu"
    >
      <motion.div
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Settings className="h-6 w-6" />
      </motion.div>
    </Button>
  );

  const desktopQuickBar = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 24, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="flex items-center gap-1 rounded-l-lg border border-border bg-background px-2 py-2"
        >
          {apps.map((app, index) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 400 }}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-primary"
                aria-label={app.name}
                onClick={() => void runAppAction(app)}
              >
                {app.icon}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const mobileDrawer = (
    <Drawer open={open && isMobile} onOpenChange={setOpen} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        <nav className="grid gap-1 px-4 pb-6">
          {apps.map((app) => (
            <Button
              key={app.name}
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start gap-3"
              onClick={() => void runAppAction(app)}
            >
              {app.icon}
              <span>{app.name}</span>
            </Button>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );

  const shell = (
    <div
      ref={dragNodeRef}
      className="fixed z-50 flex items-center gap-0"
      style={{ bottom: "1.5rem", right: "1.5rem" }}
    >
      {!isMobile && desktopQuickBar}
      {fabButton}
      {mobileDrawer}
    </div>
  );

  return (
    <>
      {isMobile ? (
        shell
      ) : (
        <Draggable
          nodeRef={dragNodeRef}
          handle=".settings-fab-handle"
          onStart={onDragStart}
          onDrag={onDrag}
        >
          {shell}
        </Draggable>
      )}
      <SettingsModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />
    </>
  );
}
