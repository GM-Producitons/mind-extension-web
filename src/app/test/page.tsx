"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FormBuilder } from "@/features/shared/template/form-builder";
import {
  useFormState,
  useValidation,
} from "@/features/shared/template/form-builder/hooks";
import type { FormSchema } from "@/features/shared/template/form-builder";
import {
  createMissionAction,
  getMissionsAction,
  deleteTasksByMissionIdAction,
} from "@/features/schedule";
import type { Mission, GeneratedDaySchedule } from "@/features/schedule";
import { generateScheduleAction } from "@/features/schedule/apis/generate.actions";
import DayTimeline from "@/features/schedule/components/DayTimeline";
import {
  createRecurringTaskAction,
  getRecurringTasksAction,
  deleteRecurringTaskAction,
} from "@/features/recurring-tasks";
import type { RecurringTask, WeekDay } from "@/features/recurring-tasks";

// ─── Mission form schema ──────────────────────────────────────────────────────

const missionSchema: FormSchema<Record<string, unknown>> = {
  fields: [
    {
      id: "name",
      type: "text",
      name: "name",
      label: "Mission name",
      placeholder: "e.g. Finish thesis chapter 3",
      required: true,
    },
    {
      id: "priority",
      type: "select",
      name: "priority",
      label: "Priority",
      required: true,
      options: [
        { label: "1 – Lowest", value: "1" },
        { label: "2", value: "2" },
        { label: "3 – Medium", value: "3" },
        { label: "4", value: "4" },
        { label: "5 – Highest", value: "5" },
      ],
    },
    {
      id: "deadline",
      type: "date",
      name: "deadline",
      label: "Deadline",
      required: true,
    },
  ],
};

const defaultMissionValues: Record<string, unknown> = {
  name: "",
  priority: "3",
  deadline: "",
};

// ─── Recurring task form schema ───────────────────────────────────────────────

const recurringTaskSchema: FormSchema<Record<string, unknown>> = {
  fields: [
    {
      id: "title",
      type: "text",
      name: "title",
      label: "Task title",
      placeholder: "e.g. Morning gym",
      required: true,
    },
    {
      id: "fromTime",
      type: "timePicker",
      name: "fromTime",
      label: "From",
      required: true,
    },
    {
      id: "untilTime",
      type: "timePicker",
      name: "untilTime",
      label: "Until",
      required: true,
    },
    {
      id: "category",
      type: "select",
      name: "category",
      label: "Category",
      required: true,
      options: [
        { label: "Study", value: "study" },
        { label: "Work", value: "work" },
        { label: "Gym", value: "gym" },
        { label: "Personal", value: "personal" },
        { label: "Meshwar", value: "meshwar" },
        { label: "Event", value: "event" },
      ],
    },
    {
      id: "days",
      type: "checkboxOptions",
      name: "days",
      label: "Repeats on",
      required: true,
      options: [
        { label: "Sun", value: "0" },
        { label: "Mon", value: "1" },
        { label: "Tue", value: "2" },
        { label: "Wed", value: "3" },
        { label: "Thu", value: "4" },
        { label: "Fri", value: "5" },
        { label: "Sat", value: "6" },
      ],
    },
  ],
};

const defaultRecurringTaskValues: Record<string, unknown> = {
  title: "",
  fromTime: "08:00",
  untilTime: "09:00",
  category: "personal",
  days: [],
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  // Missions
  const [missions, setMissions] = useState<Mission[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mission form
  const { values, setValues, reset } = useFormState<Record<string, unknown>>({
    defaultValues: defaultMissionValues,
  });
  const { errors, validateAll, clearErrors } = useValidation<
    Record<string, unknown>
  >({ fields: missionSchema.fields!, values });
  const [submitting, setSubmitting] = useState(false);

  // Recurring tasks
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [deletingRtId, setDeletingRtId] = useState<string | null>(null);
  const {
    values: rtValues,
    setValues: setRtValues,
    reset: resetRt,
  } = useFormState<Record<string, unknown>>({
    defaultValues: defaultRecurringTaskValues,
  });
  const {
    errors: rtErrors,
    validateAll: validateAllRt,
    clearErrors: clearRtErrors,
  } = useValidation<Record<string, unknown>>({
    fields: recurringTaskSchema.fields!,
    values: rtValues,
  });
  const [submittingRt, setSubmittingRt] = useState(false);

  // Schedule generator
  const [generating, setGenerating] = useState(false);
  const [scheduleJson, setScheduleJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<GeneratedDaySchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    getMissionsAction().then((res) => {
      if (res.success) setMissions(res.missions);
    });
    getRecurringTasksAction().then((res) => {
      if (res.success && res.data) setRecurringTasks(res.data);
    });
  }, []);

  async function handleMissionSubmit() {
    if (!validateAll()) return;
    setSubmitting(true);
    const result = await createMissionAction({
      name: values.name as string,
      priority: Number(values.priority),
      deadline: new Date(values.deadline as string),
    });
    if (result.success && result.mission) {
      setMissions((prev) => [...prev, result.mission!]);
      reset();
      clearErrors();
    }
    setSubmitting(false);
  }

  async function handleDeleteTasks(missionId: string) {
    setDeletingId(missionId);
    await deleteTasksByMissionIdAction(missionId);
    setDeletingId(null);
  }

  async function handleRecurringTaskSubmit() {
    if (!validateAllRt()) return;
    setSubmittingRt(true);
    const daysRaw = (rtValues.days as string[]) ?? [];
    const result = await createRecurringTaskAction({
      title: rtValues.title as string,
      fromTime: rtValues.fromTime as string,
      untilTime: rtValues.untilTime as string,
      category: rtValues.category as RecurringTask["category"],
      days: daysRaw.map(Number) as WeekDay[],
    });
    if (result.success && result.data) {
      setRecurringTasks((prev) => [result.data!, ...prev]);
      resetRt();
      clearRtErrors();
    }
    setSubmittingRt(false);
  }

  async function handleDeleteRecurringTask(id: string) {
    setDeletingRtId(id);
    await deleteRecurringTaskAction(id);
    setRecurringTasks((prev) => prev.filter((t) => t._id !== id));
    setDeletingRtId(null);
  }

  async function handleGenerate() {
    setGenerating(true);
    setJsonError(null);
    const result = await generateScheduleAction(selectedDate);
    if (result.success) {
      setScheduleJson(result.json);
    } else {
      setJsonError(result.error ?? "Unknown error");
    }
    setGenerating(false);
  }

  function handleApply() {
    setJsonError(null);
    try {
      const parsed = JSON.parse(scheduleJson) as GeneratedDaySchedule;
      if (!Array.isArray(parsed.blocks))
        throw new Error("Missing 'blocks' array");
      setSchedule(parsed);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  return (
    <div className="w-full flex flex-col gap-8 p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Test Page</h1>

      {/* ── Mission form ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Create Mission</h2>
        <Card className="p-4">
          <FormBuilder
            schema={missionSchema}
            values={values}
            onChange={setValues}
            layout="grid"
            columns={3}
            errors={errors}
          />
          <Button
            className="mt-4"
            onClick={handleMissionSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create mission"}
          </Button>
        </Card>
      </section>

      {/* ── Missions list ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Missions</h2>
        {missions.length === 0 && (
          <p className="text-sm text-muted-foreground">No missions yet.</p>
        )}
        <div className="flex flex-col gap-2">
          {missions.map((m) => (
            <Card
              key={m._id}
              className="p-4 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{m.name}</span>
                <span className="text-xs text-muted-foreground">
                  Priority {m.priority} · Deadline{" "}
                  {new Date(m.deadline).toLocaleDateString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {m.taskIds.length} task(s)
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingId === m._id}
                onClick={() => handleDeleteTasks(m._id)}
              >
                {deletingId === m._id ? "Deleting…" : "Delete tasks"}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Recurring Tasks ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Recurring Tasks</h2>
        <Card className="p-4">
          <FormBuilder
            schema={recurringTaskSchema}
            values={rtValues}
            onChange={setRtValues}
            layout="grid"
            columns={2}
            errors={rtErrors}
          />
          <Button
            className="mt-4"
            onClick={handleRecurringTaskSubmit}
            disabled={submittingRt}
          >
            {submittingRt ? "Saving…" : "Add recurring task"}
          </Button>
        </Card>

        <div className="flex flex-col gap-2">
          {recurringTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recurring tasks yet.
            </p>
          )}
          {recurringTasks.map((t) => (
            <Card
              key={t._id}
              className="p-4 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-muted-foreground">
                  {t.fromTime} – {t.untilTime} · {t.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t.days.map((d) => DAY_LABELS[d]).join(", ")}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingRtId === t._id}
                onClick={() => handleDeleteRecurringTask(t._id)}
              >
                {deletingRtId === t._id ? "Deleting…" : "Delete"}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Schedule Generator ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">AI Schedule Generator</h2>
          <div className="flex items-center gap-3">
            <input
              type="date"
              className="border rounded-md px-3 py-1.5 text-sm bg-background"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>

        <Card className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              JSON output (editable)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setScheduleJson("");
                  setSchedule(null);
                  setJsonError(null);
                }}
                disabled={!scheduleJson}
              >
                Clear
              </Button>
              <Button size="sm" onClick={handleApply} disabled={!scheduleJson}>
                Apply to schedule
              </Button>
            </div>
          </div>

          <Textarea
            className="font-mono text-xs min-h-48 resize-y"
            placeholder="AI schedule JSON will appear here after generation…"
            value={scheduleJson}
            onChange={(e) => setScheduleJson(e.target.value)}
          />

          {jsonError && <p className="text-sm text-destructive">{jsonError}</p>}
        </Card>

        {schedule && (
          <Card className="p-4">
            <DayTimeline schedule={schedule} isGenerating={generating} />
          </Card>
        )}
      </section>
    </div>
  );
}
