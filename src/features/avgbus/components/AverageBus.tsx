"use client";
import { useState } from "react";
import { BusEntry } from "../models/bus_entry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addBusEntry } from "../apis/actions";

function getTimeFromDate() {
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const currentTime = `${hours > 9 ? "" : "0"}${hours}:${minutes > 9 ? "" : "0"}${minutes}`;
  return currentTime;
}

export default function AverageBus() {
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState<BusEntry>({
    type: "go",
    period: 1,
    time: getTimeFromDate(),
    duringFinals: false,
    pickedUp: "pickup",
    duringRamadan: false,
  });

  const handleChange = (field: keyof BusEntry, value: any) => {
    setEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Handle the entry submission here
    await addBusEntry(entry);
    console.log("Entry submitted:", entry);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="w-fit">Record Bus Entry</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Record Bus Entry</h3>

          <div className="grid grid-cols-1 gap-4">
            {/* Time */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Time of Journey</label>
              <input
                type="time"
                value={entry.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            {/* Period */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">College Period</label>
              <Select
                value={entry.period.toString()}
                onValueChange={(value) =>
                  handleChange("period", parseInt(value) as 1 | 2 | 3 | 4)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Period 1</SelectItem>
                  <SelectItem value="2">Period 2</SelectItem>
                  <SelectItem value="3">Period 3</SelectItem>
                  <SelectItem value="4">Period 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Journey Type</label>
              <Select
                value={entry.type}
                onValueChange={(value) =>
                  handleChange("type", value as "go" | "return")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="go">Going to College</SelectItem>
                  <SelectItem value="return">Returning from College</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Picked Up */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Pickup or Drop-off?</label>
              <Select
                value={entry.pickedUp ? "pickup" : "dropoff"}
                onValueChange={(value) =>
                  handleChange("pickedUp", value === "pickup")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="dropoff">Drop-off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* During Finals */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                During Finals Period?
              </label>
              <Select
                value={entry.duringFinals ? "yes" : "no"}
                onValueChange={(value) =>
                  handleChange("duringFinals", value === "yes")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* During Ramadan */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">During Ramadan?</label>
              <Select
                value={entry.duringRamadan ? "yes" : "no"}
                onValueChange={(value) =>
                  handleChange("duringRamadan", value === "yes")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit Entry
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
