"use client";

import Link from "next/link";
import { Brain, Zap, Eye } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import PrayerTime from "@/features/prayerTime/components/PrayerTime";
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

export default function Dashboard() {
  return (
    <div className="p-20 pt-16 w-full min-h-screen bg-background">
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

      {/* Apps Grid */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Applications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {subAppsData.map((app) => renderAppCard(app))}
        </div>
      </div>
    </div>
  );
}
