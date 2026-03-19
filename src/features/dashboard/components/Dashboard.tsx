"use client";

import Link from "next/link";
import { Brain, Zap, Eye } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import BackgroundProvider from "@/components/BackgroundProvider";

interface SubApp {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

const subAppsData: SubApp[] = [
  {
    id: "htbasas",
    title: "HTBASAS",
    description: "Manage your todos and things to review in one place",
    href: "/htbasas",
    icon: <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />,
  },
  {
    id: "avgbus",
    title: "Average Bus",
    description: "Track and analyze bus average metrics",
    href: "/avgbus",
    icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />,
  },
  {
    id: "vision",
    title: "Vision",
    description: "Your vision and long-term goals",
    href: "/vision",
    icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />,
  },
];

function renderAppCard(app: SubApp): ReactNode {
  return (
    <Link key={app.id} href={app.href}>
      <div className="h-full p-4 sm:p-6 bg-card rounded-lg border border-border hover:bg-secondary hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">{app.icon}</div>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          {app.title}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {app.description}
        </p>
      </div>
    </Link>
  );
}

// Hook to detect if screen is mobile or desktop
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < 600);

    // Handle resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

// Desktop layout - Original design (Row 1: 3-col grid, Row 2: 3-col grid)
function DesktopCardLayout() {
  return (
    <>
      {/* Row 1: Main Dashboard and Right Section */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Main Dashboard - Left, large */}
        <div className="col-span-2">
          <Card className="h-72 flex items-center justify-center">
            <h2 className="text-3xl font-semibold text-muted-foreground">
              Main dashboard
            </h2>
          </Card>
        </div>

        {/* Right Section - 2 cards stacked */}
        <div className="flex flex-col gap-6">
          {/* Gym */}
          <Card className="h-32 flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Gym
            </h2>
          </Card>

          {/* Bottom right - Two cards side by side */}
          <div className="flex gap-6">
            {/* Days Until Shaving */}
            <Card className="flex-1 h-32 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Days Until
                </p>
              </div>
            </Card>

            {/* Beautiful Scene */}
            <Card className="flex-1 h-32 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
                alt="Beautiful mountain scene"
                className="w-full h-full object-cover"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Row 2: Three cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* صله الرحم */}
        <Card className="h-40 flex items-center justify-center">
          <h3 className="text-lg font-semibold text-muted-foreground">
            صله الرحم
          </h3>
        </Card>

        {/* Prayer */}
        {/* <PrayerTime height="h-40" /> */}
        <Card className="h-40 flex items-center justify-center">
          <h3 className="text-lg font-semibold text-muted-foreground">
            {"out of service :("}
          </h3>
        </Card>

        {/* Next event */}
        <Card className="h-40 flex items-center justify-center">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Next manga
          </h3>
        </Card>
      </div>
    </>
  );
}

// Mobile layout - Based on the design image (Stacked layout optimized for small screens)
function MobileCardLayout() {
  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: Next event and Timers - 2 cards side by side */}
      <div className="flex gap-2">
        <Card className="flex-1/2 h-24 flex items-center justify-center p-3">
          <h3 className="text-sm font-semibold text-muted-foreground text-center">
            Next event
          </h3>
        </Card>

        <Card className="flex-1 h-24 flex items-center justify-center p-3">
          <h3 className="text-sm font-semibold text-muted-foreground text-center">
            Timers
          </h3>
        </Card>
      </div>

      <div className="flex flex-col relative gap-2">
        {/* Row 2: Gym and صله الرحم - 2 cards side by side */}
        <div className="flex gap-2 h-62.5 ">
          <Card className="flex-1 max-w-30 flex items-center justify-center p-3">
            <h3 className="text-base font-semibold text-muted-foreground">
              test
            </h3>
          </Card>

          <div className="flex-1/2 flex flex-col gap-2 h-full w-full justify-around">
            <Card className="flex-1 flex items-center justify-center p-3">
              <h3 className="text-sm font-semibold text-muted-foreground text-center">
                صله الرحم
              </h3>
            </Card>

            <Card className="flex-1 overflow-hidden w-[calc(100%-128px)]">
              <h3 className="text-sm font-semibold text-muted-foreground text-center">
                jack of all trades master of none
              </h3>
            </Card>
          </div>
        </div>

        <Card className="h-28 flex items-center justify-center p-3 w-[calc(100%-128px)]">
          <h3 className="text-sm font-semibold text-muted-foreground text-center">
            Prayer
          </h3>
        </Card>

        <Card className="absolute bottom-0 w-30 h-[calc(100%-118px)] right-0">
          <h3 className="text-sm font-semibold text-muted-foreground text-center">
            gym
          </h3>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  return (
    <BackgroundProvider>
      <div className="p-4 sm:p-20 pt-16 w-full min-h-screen bg-background">
        {/* Conditional rendering based on screen size */}
        {isMobile ? (
          <Card className="p-3 border border-border/30">
            <MobileCardLayout />
          </Card>
        ) : (
          <DesktopCardLayout />
        )}

        {/* Apps Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">Applications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subAppsData.map((app) => renderAppCard(app))}
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
}
