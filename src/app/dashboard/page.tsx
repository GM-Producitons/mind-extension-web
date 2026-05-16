"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/features/dashboard/components/Dashboard";
import AddTimelineEventDialog from "@/features/timeline/components/AddTimelineEventDialog";
import EditTimelineEventDialog from "@/features/timeline/components/EditTimelineEventDialog";
import { getTimelineEvents } from "@/features/timeline/apis/actions";
import type { TimelineEvent } from "@/features/timeline/models/timeline_event";

export default function DashboardPage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    const load = async () => {
      const result = await getTimelineEvents();
      if (result.success && result.events) {
        setTimelineEvents(
          result.events.map((event: TimelineEvent & { start: string }) => ({
            ...event,
            start: new Date(event.start),
          })),
        );
      }
      setIsLoadingTimeline(false);
    };
    void load();
  }, []);

  const handleEventClick = (event: TimelineEvent) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
  };

  return (
    <>
      <Dashboard
        timelineEvents={timelineEvents}
        isLoadingTimeline={isLoadingTimeline}
        onAddClick={() => setAddDialogOpen(true)}
        onEventClick={handleEventClick}
      />
      <AddTimelineEventDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={(event) => setTimelineEvents((curr) => [...curr, event])}
      />
      <EditTimelineEventDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        event={editingEvent}
        onSaved={(updated) =>
          setTimelineEvents((curr) =>
            curr.map((e) => (e._id === updated._id ? updated : e)),
          )
        }
        onDeleted={(id) =>
          setTimelineEvents((curr) => curr.filter((e) => e._id !== id))
        }
      />
    </>
  );
}
