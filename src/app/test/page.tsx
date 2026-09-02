import type { Document } from "mongodb";
import { getDB } from "@/lib/db";

type LogRecord = Document & {
  timestamp?: Date | string;
  username?: string;
  email?: string;
  event?: string;
  path?: string;
  isMe?: boolean;
  isMaram?: boolean;
  request?: {
    userAgent?: string | null;
    forwardedFor?: string | null;
  };
};

function formatLogDate(timestamp: LogRecord["timestamp"]) {
  if (!timestamp) return "Unknown time";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function formatLogJson(log: LogRecord) {
  return JSON.stringify(
    log,
    (_key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    },
    2,
  );
}

function LogCard({ log, index }: { log: LogRecord; index: number }) {
  return (
    <article className="group relative overflow-hidden rounded-4xl border border-white/10 bg-[#17191f]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
            Entry {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">
            {log.username || "Unknown user"}
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/55">
          {log.event || "log"}
        </span>
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-white/7 pb-3">
          <dt className="text-white/40">Opened</dt>
          <dd className="text-right text-white/80">
            {formatLogDate(log.timestamp)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/7 pb-3">
          <dt className="text-white/40">Email</dt>
          <dd className="max-w-[65%] truncate text-right text-white/80">
            {log.email || "Not recorded"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/40">Location</dt>
          <dd className="text-right text-white/80">
            {log.path || "Not recorded"}
          </dd>
        </div>
      </dl>
      <details className="mt-5 border-t border-white/7 pt-4">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white/75">
          Inspect event data
        </summary>
        <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-black/25 p-3 text-[10px] leading-relaxed text-white/55">
          {formatLogJson(log)}
        </pre>
      </details>
    </article>
  );
}

function LogColumn({
  title,
  eyebrow,
  logs,
  accent,
}: {
  title: string;
  eyebrow: string;
  logs: LogRecord[];
  accent: "coral" | "cyan";
}) {
  const latestLog = logs[0];

  return (
    <section className="min-w-0">
      <header
        className={`mb-5 border-t-2 pt-5 ${accent === "coral" ? "border-[#ff8066]" : "border-[#68d4d0]"}`}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              {title}
            </h2>
          </div>
          <p className="text-right font-mono text-xs text-white/50">
            <span className="block text-2xl font-semibold text-white">
              {logs.length}
            </span>
            total logs
          </p>
        </div>
        <p className="mt-4 text-xs text-white/45">
          Latest activity:{" "}
          <span className="text-white/75">
            {formatLogDate(latestLog?.timestamp)}
          </span>
        </p>
      </header>
      <div className="space-y-4">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <LogCard key={String(log._id)} log={log} index={index} />
          ))
        ) : (
          <div className="rounded-4xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            No matching logs yet.
          </div>
        )}
      </div>
    </section>
  );
}

export default async function TestPage() {
  const db = await getDB();
  const rawLogs = await db
    .collection<LogRecord>("logs")
    .find({ $or: [{ isMe: true }, { isMaram: true }] })
    .sort({ timestamp: -1 })
    .toArray();

  const logs = rawLogs.map((log) => ({
    ...log,
    _id: String(log._id),
    timestamp:
      log.timestamp instanceof Date
        ? log.timestamp.toISOString()
        : log.timestamp,
  }));

  return (
    <main className="min-h-screen bg-[#0d0f13] px-5 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#68d4d0]">
            Activity / access ledger
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-7xl">
            Chat visits,
            <span className="block text-white/35">in plain sight.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/50">
            A live record of visits from the two tracked user groups, ordered
            from newest to oldest.
          </p>
        </header>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <LogColumn
            title="isMaram"
            eyebrow="Tracked group 01"
            logs={logs.filter((log) => log.isMaram === true)}
            accent="cyan"
          />
          <LogColumn
            title="isMe"
            eyebrow="Tracked group 02"
            logs={logs.filter((log) => log.isMe === true)}
            accent="coral"
          />
        </div>
      </div>
    </main>
  );
}
