import Link from "next/link";
import { Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          Mind Extension
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Your personal productivity hub
        </p>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* HTBASAS Card */}
        <Link href="/htbasas">
          <div className="h-full p-4 sm:p-6 bg-card rounded-lg border border-border hover:bg-accent hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              HTBASAS
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your todos and things to review in one place
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
