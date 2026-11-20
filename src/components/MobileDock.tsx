"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Ellipsis, House, Menu, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface DockApp {
  name: string;
  icon: React.ReactNode;
  href: string;
  onClickFunction?: () => void | Promise<void>;
}

const PINNED_HREFS = ["/myinsta", "/pace", "/people", "/flashcards"];

function isHomePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  );
}

function splitMenu(apps: DockApp[]) {
  const byHref = new Map(apps.map((app) => [app.href, app]));
  const pinned = PINNED_HREFS.flatMap((href) => {
    const app = byHref.get(href);
    return app ? [app] : [];
  });
  const pinnedSet = new Set<string>(PINNED_HREFS);
  const rest = apps.filter((app) => !pinnedSet.has(app.href));
  return { pinned, rest };
}

interface MobileDockProps {
  apps: DockApp[];
  onApp: (app: DockApp) => void;
}

function MenuTile({
  name,
  icon,
  onClick,
  expanded,
}: {
  name?: string;
  icon: React.ReactNode;
  onClick: () => void;
  expanded?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-16 w-full min-w-0 flex-col gap-1 rounded-lg px-1"
      aria-label={name ?? "More"}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <span className="flex size-5 items-center justify-center">{icon}</span>
      <span className="h-4 w-full truncate text-center text-[11px] leading-4 font-normal text-muted-foreground">
        {name ?? ""}
      </span>
    </Button>
  );
}

export function MobileDock({ apps, onApp }: MobileDockProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const onHome = isHomePath(pathname);
  const { pinned, rest } = splitMenu(apps);

  useEffect(() => {
    document.body.classList.add("pb-24");
    return () => document.body.classList.remove("pb-24");
  }, []);

  const openCreate = (kind: "post" | "card" | "pace", href: string) => {
    setQuickOpen(false);
    queueQuickCreate(kind);
    router.push(href);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setExpanded(false);
  };

  const openApp = (app: DockApp) => {
    closeMenu();
    void onApp(app);
  };

  return (
    <TooltipProvider>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto grid h-14 w-full max-w-sm grid-cols-3 items-center rounded-full border border-border/70 bg-background/55 shadow-lg backdrop-blur-2xl">
          <div className="flex h-full items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={onHome ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "rounded-full",
                    onHome
                      ? "size-10"
                      : "size-10 bg-transparent hover:bg-transparent",
                  )}
                  aria-label="Home"
                  aria-current={onHome ? "page" : undefined}
                  onClick={() => router.push("/dashboard")}
                >
                  <House className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Home</TooltipContent>
            </Tooltip>
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

      <Drawer
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (!open) setExpanded(false);
        }}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerTitle className="sr-only">Apps</DrawerTitle>
          <nav className="grid grid-cols-3 gap-1 px-3 pt-2 pb-6">
            {pinned.map((app) => (
              <MenuTile
                key={app.href}
                name={app.name}
                icon={app.icon}
                onClick={() => openApp(app)}
              />
            ))}
            <MenuTile
              icon={<Ellipsis className="size-5" />}
              expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            />
            {expanded
              ? rest.map((app, index) => (
                  <motion.div
                    key={app.href}
                    className="min-w-0"
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reduceMotion ? 0 : index * 0.03,
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                    }}
                  >
                    <MenuTile
                      name={app.name}
                      icon={app.icon}
                      onClick={() => openApp(app)}
                    />
                  </motion.div>
                ))
              : null}
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
              onClick={() => openCreate("pace", "/pace")}
            >
              Pace
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
