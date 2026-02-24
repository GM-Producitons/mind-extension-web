"use client";
import Link from "next/link";
import { Brain, Zap, Eye } from "lucide-react";
import { ReactNode, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

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
      <div className="h-full p-4 sm:p-6 bg-card rounded-lg border border-border  transition-all cursor-pointer shadow-sm hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">{app.icon}</div>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          manga
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {app.description}
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  // const { theme, setTheme } = useTheme();
  return (
    // <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
    //   {/* Header */}
    //   <div className="flex justify-between items-center">
    //     <div className="mb-8 sm:mb-12">
    //       <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
    //         Mind Extension
    //       </h1>
    //       <p className="text-sm sm:text-base text-muted-foreground mt-2">
    //         Your personal productivity hub
    //       </p>
    //     </div>
    //     <div className="flex items-center gap-2">
    //       <p className="text-sm text-muted-foreground">Enable Dark Mode?</p>
    //       <Switch
    //         checked={theme === "dark"}
    //         onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
    //       />
    //     </div>
    //   </div>

    //   {/* Apps Grid */}
    //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    //     {subAppsData.map((app) => renderAppCard(app))}
    //   </div>
    // </div>
    <p>hello me</p>
  );
}
