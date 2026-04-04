"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Plus } from "lucide-react";
import {
  addTTRWithTags,
  createUserTTRTag,
  getTTRs,
  getUserTTRTags,
} from "../apis/actions";
import { Textarea } from "@/components/ui/textarea";
import { getLocalDateString } from "./todo/utils";

interface TTRItem {
  _id: string;
  title: string;
  date: string;
  createdAt: string;
  tags?: string[];
}

interface TTRSectionProps {
  selectedDate: Date;
  onTTRsLoaded: (ttrs: TTRItem[]) => void;
}

const TTRSection = ({ selectedDate, onTTRsLoaded }: TTRSectionProps) => {
  const today = new Date();
  const todayDateString = getLocalDateString(today);
  const [ttrs, setTtrs] = useState<TTRItem[]>([]);
  const [filteredTtrs, setFilteredTtrs] = useState<TTRItem[]>([]);
  const [ttrTitle, setTtrTitle] = useState("");
  const [ttrDate, setTtrDate] = useState(todayDateString);
  const [ttrOpen, setTtrOpen] = useState(false);
  const [ttrLoading, setTtrLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [tagLoading, setTagLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch TTRs on mount
  useEffect(() => {
    const fetchTTRs = async () => {
      const [ttrsResult, tagsResult] = await Promise.all([
        getTTRs(),
        getUserTTRTags(),
      ]);

      if (ttrsResult.success) {
        setTtrs(ttrsResult.ttrs);
        filterTTRsByDate(ttrsResult.ttrs, selectedDate);
      }

      if (tagsResult.success) {
        setAvailableTags(tagsResult.tags ?? []);
      }

      setIsInitializing(false);
    };
    fetchTTRs();
  }, []);

  // Re-filter when selectedDate changes
  useEffect(() => {
    filterTTRsByDate(ttrs, selectedDate);
  }, [selectedDate, ttrs]);

  useEffect(() => {
    setTtrDate(getLocalDateString(selectedDate));
  }, [selectedDate]);

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
    const result = await addTTRWithTags(
      ttrTitle,
      new Date(ttrDate),
      selectedTags,
    );

    if (result.success) {
      const newTTR: TTRItem = {
        _id: result.ttr._id,
        title: result.ttr.title,
        date: ttrDate,
        createdAt: new Date().toISOString(),
        tags: result.ttr.tags ?? [],
      };
      const updatedTtrs = [...ttrs, newTTR];
      setTtrs(updatedTtrs);
      filterTTRsByDate(updatedTtrs, selectedDate);
      setTtrTitle("");
      setTtrDate(todayDateString);
      setSelectedTags([]);
      setTtrOpen(false);
    }
    setTtrLoading(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setTagLoading(true);
    const result = await createUserTTRTag(newTagName);

    if (result.success) {
      const nextTags: string[] = Array.isArray(result.tags) ? result.tags : [];
      const requestedTag = newTagName.trim();
      const canonicalTag =
        nextTags.find(
          (tag) => tag.toLowerCase() === requestedTag.toLowerCase(),
        ) ?? requestedTag;

      setAvailableTags(nextTags);
      setSelectedTags((currentTags) => {
        if (
          currentTags.some(
            (tag) => tag.toLowerCase() === canonicalTag.toLowerCase(),
          )
        ) {
          return currentTags;
        }
        return [...currentTags, canonicalTag];
      });
      setNewTagName("");
    }

    setTagLoading(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((currentTags) => {
      const hasTag = currentTags.some(
        (currentTag) => currentTag.toLowerCase() === tag.toLowerCase(),
      );

      if (hasTag) {
        return currentTags.filter(
          (currentTag) => currentTag.toLowerCase() !== tag.toLowerCase(),
        );
      }

      return [...currentTags, tag];
    });
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
        <Dialog open={ttrOpen} onOpenChange={setTtrOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add TTR</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Add a new TTR</DialogTitle>
              </DialogHeader>
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Tags
                </label>
                <p className="text-xs text-muted-foreground">
                  {selectedTags.length > 0
                    ? `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`
                    : "No tags selected"}
                </p>
                {availableTags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No saved tags yet. Create one below.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTags.some(
                        (selectedTag) =>
                          selectedTag.toLowerCase() === tag.toLowerCase(),
                      );

                      return (
                        <Button
                          key={tag}
                          type="button"
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => toggleTag(tag)}
                          className="h-8 gap-1"
                          aria-pressed={isSelected}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          {tag}
                        </Button>
                      );
                    })}
                  </div>
                )}
                {selectedTags.length > 0 && (
                  <div className="rounded-md border border-border/60 bg-muted/40 p-2">
                    <p className="mb-1 text-[11px] text-muted-foreground">
                      Selected tags
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tag) => (
                        <span
                          key={`selected-${tag}`}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Create a new tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || tagLoading}
                  >
                    {tagLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleAddTTR}
                disabled={!ttrTitle.trim() || ttrLoading}
                className="w-full"
              >
                {ttrLoading ? "Adding..." : "Add TTR"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <p className="font-medium text-sm sm:text-base text-foreground wrap-break-word">
                  {ttr.title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {formatDate(ttr.date)}
                </p>
                {!!ttr.tags?.length && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ttr.tags.map((tag) => (
                      <span
                        key={`${ttr._id}-${tag}`}
                        className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TTRSection;
