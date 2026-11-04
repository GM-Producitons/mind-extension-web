"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CreatePersonDrawer } from "@/features/people/components/CreatePersonDrawer";
import { PersonEntryDrawer } from "@/features/people/components/PersonEntryDrawer";
import { queueQuickCreate } from "@/features/shared/store/quick-create.store";

interface DockApp {
  name: string;
  icon: React.ReactNode;
  href: string;
  onClickFunction?: () => void | Promise<void>;
}

const LABELS: [string, string][] = [
  ["/people", "People"],
  ["/schedule", "Schedule"],
  ["/myinsta", "MyInsta"],
  ["/flashcards", "Cards"],
  ["/dashboard", "Home"],
  ["/htbasas", "Tasks"],
  ["/avgbus", "Bus"],
  ["/documents", "Docs"],
  ["/chat", "Chat"],
];

function pageLabel(pathname: string) {
  const match = LABELS.find(([prefix]) => pathname.startsWith(prefix));
  return match?.[1] ?? "Mind";
}

interface MobileDockProps {
  apps: DockApp[];
  onApp: (app: DockApp) => void;
}

export function MobileDock({ apps, onApp }: MobileDockProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("pb-24");
    return () => document.body.classList.remove("pb-24");
  }, []);

  const openCreate = (kind: "post" | "card", href: string) => {
    setQuickOpen(false);
    queueQuickCreate(kind);
    router.push(href);
  };

  return (
    <TooltipProvider>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto grid h-14 w-full max-w-sm grid-cols-3 items-center rounded-full border border-border/70 bg-background/55 shadow-lg backdrop-blur-2xl">
          <div className="min-w-0 px-3 text-center text-sm font-medium">
            <span className="block truncate">{pageLabel(pathname)}</span>
          </div>
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="relative size-12 rounded-full ring-4 ring-background"
                  style={{
                    boxShadow:
                      "0 8px 22px color-mix(in oklch, var(--primary) 45%, transparent)",
                  }}
                  aria-label="Create"
                  onClick={() => setQuickOpen(true)}
                >
                  {reduceMotion ? null : (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full bg-primary"
                      animate={{ scale: [1, 1.28, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <Plus className="relative size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Create</TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex h-full w-full items-center justify-center text-foreground"
                aria-label="Menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Menu</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} direction="bottom">
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
                onClick={() => {
                  setMenuOpen(false);
                  void onApp(app);
                }}
              >
                {app.icon}
                <span>{app.name}</span>
              </Button>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>

      <Drawer open={quickOpen} onOpenChange={setQuickOpen} direction="bottom">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>New</DrawerTitle>
          </DrawerHeader>
          <nav className="grid gap-1 px-4 pb-6">
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-start"
              onClick={() => openCreate("post", "/myinsta")}
            >
              Post
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-start"
              onClick={() => openCreate("card", "/flashcards")}
            >
              Flashcard
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-start"
              onClick={() => {
                setQuickOpen(false);
                setPersonOpen(true);
              }}
            >
              Person
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-start"
              onClick={() => {
                setQuickOpen(false);
                setEntryOpen(true);
              }}
            >
              Like, hate, or moment
            </Button>
          </nav>
        </DrawerContent>
      </Drawer>

      <CreatePersonDrawer open={personOpen} onOpenChange={setPersonOpen} />
      <PersonEntryDrawer open={entryOpen} onOpenChange={setEntryOpen} />
    </TooltipProvider>
  );
}
