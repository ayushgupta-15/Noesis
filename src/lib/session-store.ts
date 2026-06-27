import "server-only";

import { neon } from "@neondatabase/serverless";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

export type ResearchSessionStatus = "running" | "completed" | "failed";

export interface ResearchSessionSource {
  url: string;
  title: string;
}

export interface ResearchSessionActivity {
  type: string;
  status: string;
  message: string;
  timestamp?: number;
  completedSteps?: number;
  tokenUsed?: number;
}

export interface ResearchSession {
  id: string;
  ownerId?: string | null;
  topic: string;
  status: ResearchSessionStatus;
  reportText: string;
  sources: ResearchSessionSource[];
  activities: ResearchSessionActivity[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

type SessionRow = {
  id: string;
  owner_id: string | null;
  topic: string;
  status: ResearchSessionStatus;
  created_at: Date | string;
  updated_at: Date | string;
  report_text: string | null;
  sources_json: ResearchSessionSource[] | string | null;
  activities_json: ResearchSessionActivity[] | string | null;
  metadata_json: Record<string, unknown> | string | null;
};

const dataDir = path.join(process.cwd(), ".noesis");
const sessionsFile = path.join(dataDir, "sessions.json");
const sessionsTempFile = path.join(dataDir, "sessions.json.tmp");

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;
let ensureDatabasePromise: Promise<void> | null = null;
let localWriteQueue = Promise.resolve();

async function withLocalWriteLock<T>(operation: () => Promise<T>) {
  const run = localWriteQueue.then(operation, operation);
  localWriteQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function warnDatabaseFallback(error: unknown) {
  ensureDatabasePromise = null;
  const message = error instanceof Error ? error.message : "Unknown database error";
  console.warn(`[noesis] Neon persistence unavailable. Falling back to local session store. ${message}`);
}

function normalizeDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function parseJsonField<T>(value: T | string | null | undefined, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapRow(row: SessionRow): ResearchSession {
  return {
    id: row.id,
    ownerId: row.owner_id,
    topic: row.topic,
    status: row.status,
    reportText: row.report_text ?? "",
    sources: parseJsonField(row.sources_json, []),
    activities: parseJsonField(row.activities_json, []),
    metadata: parseJsonField(row.metadata_json, {}),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at),
  };
}

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
}

async function ensureDatabaseStore() {
  if (!sql) return;

  ensureDatabasePromise ??= sql`
    create table if not exists research_sessions (
      id text primary key,
      topic text not null,
      status text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      report_text text,
      sources_json jsonb not null default '[]'::jsonb,
      activities_json jsonb not null default '[]'::jsonb,
      metadata_json jsonb not null default '{}'::jsonb
    )
  `
    .then(() => sql`alter table research_sessions add column if not exists owner_id text`)
    .then(() => sql`create index if not exists research_sessions_owner_created_idx on research_sessions (owner_id, created_at desc)`)
    .then(() => undefined);

  await ensureDatabasePromise;
}

async function addLocalSession(session: ResearchSession) {
  return withLocalWriteLock(async () => {
    const sessions = await readSessions();
    const existingIndex = sessions.findIndex((item) => item.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }

    await writeSessions(sessions);
  });
}

async function readSessions(): Promise<ResearchSession[]> {
  await ensureStore();

  try {
    const content = await readFile(sessionsFile, "utf8");
    let sessions: Partial<ResearchSession>[];

    try {
      sessions = JSON.parse(content) as Partial<ResearchSession>[];
    } catch (error) {
      console.warn(
        "[noesis] Local session store is not valid JSON. Ignoring local fallback sessions until the next successful write.",
        error
      );
      return [];
    }

    return sessions.map((session) => ({
      id: session.id ?? crypto.randomUUID(),
      ownerId: session.ownerId ?? null,
      topic: session.topic ?? "Untitled research",
      status: session.status ?? "completed",
      reportText: session.reportText ?? "",
      sources: session.sources ?? [],
      activities: session.activities ?? [],
      metadata: session.metadata ?? {},
      createdAt: session.createdAt ?? new Date().toISOString(),
      updatedAt: session.updatedAt ?? session.createdAt ?? new Date().toISOString(),
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeSessions(sessions: ResearchSession[]) {
  await ensureStore();
  await writeFile(sessionsTempFile, JSON.stringify(sessions, null, 2), "utf8");
  await rename(sessionsTempFile, sessionsFile);
}

async function updateLocalSession(
  id: string,
  updater: (session: ResearchSession) => ResearchSession
) {
  return withLocalWriteLock(async () => {
    const sessions = await readSessions();
    const index = sessions.findIndex((session) => session.id === id);

    if (index === -1) return null;

    const updatedSession = updater(sessions[index]);
    sessions[index] = updatedSession;
    await writeSessions(sessions);

    return updatedSession;
  });
}

export async function listResearchSessions(ownerId?: string | null) {
  if (sql) {
    try {
      await ensureDatabaseStore();
      const rows = ownerId
        ? ((await sql`
            select *
            from research_sessions
            where owner_id = ${ownerId}
            order by created_at desc
          `) as SessionRow[])
        : ((await sql`
            select *
            from research_sessions
            order by created_at desc
          `) as SessionRow[]);

      return rows.map(mapRow);
    } catch (error) {
      warnDatabaseFallback(error);
    }
  }

  const sessions = await readSessions();
  return sessions
    .filter((session) => !ownerId || session.ownerId === ownerId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getResearchSession(id: string, ownerId?: string | null) {
  if (sql) {
    try {
      await ensureDatabaseStore();
      const rows = ownerId
        ? ((await sql`
            select *
            from research_sessions
            where id = ${id} and owner_id = ${ownerId}
            limit 1
          `) as SessionRow[])
        : ((await sql`
            select *
            from research_sessions
            where id = ${id}
            limit 1
          `) as SessionRow[]);

      return rows[0] ? mapRow(rows[0]) : null;
    } catch (error) {
      warnDatabaseFallback(error);
    }
  }

  const sessions = await readSessions();
  return (
    sessions.find(
      (session) => session.id === id && (!ownerId || session.ownerId === ownerId)
    ) ?? null
  );
}

export async function createResearchSession(input: {
  topic: string;
  ownerId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const now = new Date().toISOString();
  const session: ResearchSession = {
    id: crypto.randomUUID(),
    ownerId: input.ownerId ?? null,
    topic: input.topic,
    status: "running",
    reportText: "",
    sources: [],
    activities: [],
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  };

  if (sql) {
    try {
      await ensureDatabaseStore();
      await sql`
        insert into research_sessions (
          id,
          owner_id,
          topic,
          status,
          created_at,
          updated_at,
          report_text,
          sources_json,
          activities_json,
          metadata_json
        )
        values (
          ${session.id},
          ${session.ownerId},
          ${session.topic},
          ${session.status},
          ${session.createdAt},
          ${session.updatedAt},
          ${session.reportText},
          ${JSON.stringify(session.sources)}::jsonb,
          ${JSON.stringify(session.activities)}::jsonb,
          ${JSON.stringify(session.metadata)}::jsonb
        )
      `;

      return session;
    } catch (error) {
      warnDatabaseFallback(error);
    }
  }

  await addLocalSession(session);

  return session;
}

export async function appendResearchSessionActivity(
  id: string,
  activity: ResearchSessionActivity
) {
  const now = new Date().toISOString();

  if (sql) {
    try {
      await ensureDatabaseStore();
      await sql`
        update research_sessions
        set activities_json = activities_json || ${JSON.stringify([activity])}::jsonb,
            updated_at = ${now}
        where id = ${id}
      `;
      return;
    } catch (error) {
      warnDatabaseFallback(error);
    }
  }

  await updateLocalSession(id, (session) => ({
    ...session,
    activities: [...session.activities, activity],
    updatedAt: now,
  }));
}

export async function updateResearchSessionSources(
  id: string,
  sources: ResearchSessionSource[]
) {
  const now = new Date().toISOString();

  if (sql) {
    try {
      await ensureDatabaseStore();
      await sql`
        update research_sessions
        set sources_json = ${JSON.stringify(sources)}::jsonb,
            updated_at = ${now}
        where id = ${id}
      `;
      return;
    } catch (error) {
      warnDatabaseFallback(error);
    }
  }

  await updateLocalSession(id, (session) => ({
    ...session,
    sources,
    updatedAt: now,
  }));
}

export async function completeResearchSession(
  id: string,
  input: {
    reportText: string;
    sources: ResearchSessionSource[];
    activities: ResearchSessionActivity[];
  }
) {
  const now = new Date().toISOString();

  if (sql) {
    try {
      await ensureDatabaseStore();
      await sql`
        update research_sessions
        set status = 'completed',
            report_text = ${input.reportText},
            sources_json = ${JSON.stringify(input.sources)}::jsonb,
            activities_json = ${JSON.stringify(input.activities)}::jsonb,
            updated_at = ${now}
        where id = ${id}
      `;

      return getResearchSession(id);
    } catch (error) {
      warnDatabaseFallback(error);
    }
  }

  return updateLocalSession(id, (session) => ({
    ...session,
    status: "completed",
    reportText: input.reportText,
    sources: input.sources,
    activities: input.activities,
    updatedAt: now,
  }));
}

export async function failResearchSession(
  id: string,
  activities: ResearchSessionActivity[]
) {
  const now = new Date().toISOString();

  if (sql) {
    try {
      await ensureDatabaseStore();
      await sql`
        update research_sessions
        set status = 'failed',
            activities_json = ${JSON.stringify(activities)}::jsonb,
            updated_at = ${now}
        where id = ${id}
      `;

      return getResearchSession(id);
    } catch (error) {
      warnDatabaseFallback(error);
    }
  }

  return updateLocalSession(id, (session) => ({
    ...session,
    status: "failed",
    activities,
    updatedAt: now,
  }));
}

export async function saveResearchSession(
  input: Omit<ResearchSession, "id" | "createdAt" | "updatedAt" | "metadata"> & {
    metadata?: Record<string, unknown>;
  }
) {
  const session = await createResearchSession({
    topic: input.topic,
    metadata: input.metadata,
  });

  if (input.status === "failed") {
    return failResearchSession(session.id, input.activities);
  }

  return completeResearchSession(session.id, {
    reportText: input.reportText,
    sources: input.sources,
    activities: input.activities,
  });
}

export async function checkSessionStore() {
  if (!sql) {
    return {
      ok: true,
      mode: "local" as const,
      message: "DATABASE_URL is not configured. Using local session storage.",
    };
  }

  try {
    await ensureDatabaseStore();
    await sql`select 1`;

    return {
      ok: true,
      mode: "database" as const,
      message: "Neon/Postgres session storage is reachable.",
    };
  } catch (error) {
    warnDatabaseFallback(error);

    return {
      ok: false,
      mode: "local-fallback" as const,
      message:
        error instanceof Error
          ? error.message
          : "Neon/Postgres session storage is not reachable.",
    };
  }
}
