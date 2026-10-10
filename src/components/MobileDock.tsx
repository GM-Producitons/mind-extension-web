"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CreatePersonDrawer } from "@/features/people/components/CreatePersonDrawer";
import { PersonEntryDrawer } from "@/features/people/components/PersonEntryDrawer";
import { useQuickCreate } from "@/features/shared/store/quick-create.store";

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
    useQuickCreate.getState().request(kind);
    router.push(href);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto flex h-14 w-full max-w-sm overflow-hidden rounded-full border border-border/70 bg-background/55 shadow-lg backdrop-blur-2xl">
          <div className="flex flex-1 items-center justify-center px-3 text-sm font-medium">
            <span className="truncate">{pageLabel(pathname)}</span>
          </div>
          <div className="my-3 w-px bg-border/80" />
          <button
            type="button"
            className="flex flex-1 items-center justify-center text-foreground"
            aria-label="Create"
            onClick={() => setQuickOpen(true)}
          >
            <Plus className="size-6" />
          </button>
          <div className="my-3 w-px bg-border/80" />
          <button
            type="button"
            className="flex flex-1 items-center justify-center text-foreground"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
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
    </>
  );
}
