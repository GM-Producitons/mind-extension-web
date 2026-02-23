"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TodoSection from "./TodoSection";
import TTRSection from "./TTRSection";
import { Button } from "@/components/ui/button";

const TodayDisplay = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handlePreviousDay = () => {
    setSelectedDate(
      (prev) =>
        new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1),
    );
  };

  const handleNextDay = () => {
    setSelectedDate(
      (prev) =>
        new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1),
    );
  };

  const handleTodosLoaded = (todos: any) => {
    console.log("Todos loaded:", todos);
  };

  const handleTTRsLoaded = (ttrs: any) => {
    console.log("TTRs loaded:", ttrs);
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <Button
          variant={"outline"}
          onClick={handlePreviousDay}
          className="p-1 sm:p-2 hover:bg-accent rounded-lg transition"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </Button>
        <span className="text-base sm:text-xl font-semibold text-foreground">
          {formattedDate}
        </span>
        <Button
          variant={"outline"}
          onClick={handleNextDay}
          className="p-1 sm:p-2 hover:bg-accent rounded-lg transition"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="mb-6 sm:mb-8 flex justify-end">
        <Link href="/htbasas/ttrs">
          <Button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium text-xs sm:text-sm">
            View TTR Bank
          </Button>
        </Link>
      </div>

      {/* To-do's Section */}
      <TodoSection
        selectedDate={selectedDate}
        onTodosLoaded={handleTodosLoaded}
      />

      {/* TTR Section */}
      <TTRSection selectedDate={selectedDate} onTTRsLoaded={handleTTRsLoaded} />
    </div>
  );
};

export default TodayDisplay;
