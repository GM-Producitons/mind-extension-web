"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { addTTR, getTTRs } from "../apis/actions";
import { Textarea } from "@/components/ui/textarea";

interface TTRItem {
  _id: string;
  title: string;
  date: string;
  createdAt: string;
}

interface TTRSectionProps {
  selectedDate: Date;
  onTTRsLoaded: (ttrs: TTRItem[]) => void;
}

const TTRSection = ({ selectedDate, onTTRsLoaded }: TTRSectionProps) => {
  const today = new Date();
  const [ttrs, setTtrs] = useState<TTRItem[]>([]);
  const [filteredTtrs, setFilteredTtrs] = useState<TTRItem[]>([]);
  const [ttrTitle, setTtrTitle] = useState("");
  const [ttrDate, setTtrDate] = useState(today.toISOString().split("T")[0]);
  const [ttrOpen, setTtrOpen] = useState(false);
  const [ttrLoading, setTtrLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch TTRs on mount
  useEffect(() => {
    const fetchTTRs = async () => {
      const result = await getTTRs();
      if (result.success) {
        setTtrs(result.ttrs);
        filterTTRsByDate(result.ttrs, selectedDate);
      }
      setIsInitializing(false);
    };
    fetchTTRs();
  }, []);

  // Re-filter when selectedDate changes
  useEffect(() => {
    filterTTRsByDate(ttrs, selectedDate);
  }, [selectedDate, ttrs]);

  const filterTTRsByDate = (ttrsList: TTRItem[], dateToFilter: Date) => {
    const dateStart = new Date(
      dateToFilter.getFullYear(),
      dateToFilter.getMonth(),
      dateToFilter.getDate(),
    );
    const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

    const filtered = ttrsList.filter((ttr) => {
      const ttrDate = new Date(ttr.date);
      return ttrDate >= dateStart && ttrDate < dateEnd;
    });

    setFilteredTtrs(filtered);
    onTTRsLoaded(filtered);
  };

  const handleAddTTR = async () => {
    if (!ttrTitle.trim()) return;

    setTtrLoading(true);
    const result = await addTTR(ttrTitle, new Date(ttrDate));

    if (result.success) {
      const newTTR: TTRItem = {
        _id: result.ttr._id,
        title: ttrTitle,
        date: ttrDate,
        createdAt: new Date().toISOString(),
      };
      const updatedTtrs = [...ttrs, newTTR];
      setTtrs(updatedTtrs);
      filterTTRsByDate(updatedTtrs, selectedDate);
      setTtrTitle("");
      setTtrDate(today.toISOString().split("T")[0]);
      setTtrOpen(false);
    }
    setTtrLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          TTR
        </h2>
        <Popover open={ttrOpen} onOpenChange={setTtrOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add TTR</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Add a new TTR</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Title
                </label>
                <Textarea
                  placeholder="Enter TTR title"
                  value={ttrTitle}
                  onChange={(e) => setTtrTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTTR();
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <Input
                  type="date"
                  value={ttrDate}
                  onChange={(e) => setTtrDate(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddTTR}
                disabled={!ttrTitle.trim() || ttrLoading}
                className="w-full"
              >
                {ttrLoading ? "Adding..." : "Add TTR"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {isInitializing ? (
          <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
            Loading...
          </p>
        ) : filteredTtrs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
            No TTRs for this day
          </p>
        ) : (
          filteredTtrs.map((ttr) => (
            <div
              key={ttr._id}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-4 bg-muted rounded-lg hover:bg-accent transition"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base text-foreground break-words">
                  {ttr.title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {formatDate(ttr.date)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TTRSection;
