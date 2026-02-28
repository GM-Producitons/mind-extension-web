"use client";

import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import router, { useRouter } from "next/router";
import {
  Settings,
  LayoutDashboard,
  Bus,
  CheckSquare,
  Eye,
  Moon,
  Sun,
} from "lucide-react";

interface App {
  name: string;
  icon: React.ReactNode;
  href: string;
}

export default function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const pressTimeRef = useRef(0);
  const { theme, setTheme } = useTheme();

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
      name: mounted && theme === "dark" ? "Light Mode" : "Dark Mode",
      icon:
        mounted && theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        ),
      href: "#",
    },
  ];

  const handleMouseDown = () => {
    pressTimeRef.current = Date.now();
  };

  const handleClick = (e: React.MouseEvent) => {
    const pressDuration = Date.now() - pressTimeRef.current;
    // Only toggle menu on quick clicks (less than 150ms), not on holds
    if (pressDuration < 150) {
      setOpen((prev) => !prev);
    }
  };

  const handleTouchStart = () => {
    pressTimeRef.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const pressDuration = Date.now() - pressTimeRef.current;
    // Only toggle menu on quick taps (less than 150ms), not on holds
    if (pressDuration < 150) {
      setOpen((prev) => !prev);
    }
  };

  return (
    <Draggable nodeRef={buttonRef}>
      <div
        ref={buttonRef}
        className="fixed z-50"
        style={{ bottom: "1.5rem", right: "1.5rem" }}
      >
        <div className="flex items-center ">
          <motion.div
            initial={false}
            animate={{ opacity: open ? 1 : 0, x: open ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 bg-background border border-border rounded-l-lg px-2 py-2 h-12 z-0"
            style={{ pointerEvents: open ? "auto" : "none" }}
          >
            {apps.map((app, index) => (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
                animate={
                  open
                    ? { opacity: 1, scale: 1, rotate: 360 }
                    : { opacity: 0, scale: 0.3, rotate: 0 }
                }
                transition={{
                  duration: 0.5,
                  delay: open ? index * 0.08 : 0,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {app.href === "#" ? (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (mounted && theme) {
                        setTheme(theme === "dark" ? "light" : "dark");
                      }
                      setOpen(false);
                    }}
                    className="flex items-center justify-center text-primary hover:text-accent transition-colors"
                  >
                    {app.icon}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center text-primary hover:text-accent transition-colors"
                    onClick={() => {
                      setOpen(false);
                      router.push(app.href);
                    }}
                  >
                    {app.icon}
                  </Button>
                )}
              </motion.div>
            ))}
          </motion.div>

          <Button
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg shrink-0 z-2"
          >
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Settings className="h-6 w-6" />
            </motion.div>
          </Button>
        </div>
      </div>
    </Draggable>
  );
}
