import Link from "next/link";
import { listResearchSessions } from "@/lib/session-store";
import { getExistingVisitorId } from "@/lib/session-owner";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Cloud,
  Database,
  FileText,
  History,
  Search,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const navItems = [
  ["Research Plan", ClipboardList],
  ["Search Activity", Search],
  ["Extraction", Database],
  ["Confidence Gate", ShieldCheck],
  ["Source Ledger", BookOpen],
  ["Report", FileText],
] as const;

export default async function HistoryPage() {
  const visitorId = await getExistingVisitorId();
  const sessions = visitorId ? await listResearchSessions(visitorId) : [];

  return (
    <main className="workbench-shell flex min-h-screen flex-col overflow-hidden text-[#e2e2e8]">
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#3b494c]/30 bg-[#111317]/80 px-6 backdrop-blur-3xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-2xl font-bold text-[#c3f5ff]">
            Noēsis
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <span className="text-sm text-[#bac9cc]">Models</span>
            <span className="text-sm text-[#c3f5ff]">History</span>
            <span className="text-sm text-[#bac9cc]">Settings</span>
          </nav>
        </div>
        <Link
          href="/workspace"
          className="rounded bg-[#c3f5ff] px-4 py-2 font-mono text-xs font-bold uppercase text-[#00363d] hover:brightness-110"
        >
          New Research
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#3b494c]/20 bg-[#1a1c20]/80 px-4 py-8 backdrop-blur-2xl md:flex">
          <div className="mb-8 px-2">
            <div className="mb-1 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#00daf3]" />
              <span className="font-serif text-lg font-bold text-[#e2e2e8]">Audit Trail</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bac9cc]/70">
              Precision Ledger
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            <Link
              href="/history"
              className="flex items-center gap-3 rounded bg-[#c3f5ff]/10 px-3 py-2.5 text-[#c3f5ff]"
            >
              <History className="h-4 w-4" />
              <span className="font-mono text-xs font-semibold uppercase">History</span>
            </Link>
            {navItems.map(([label, Icon]) => (
              <Link
                key={label}
                href="/workspace"
                className="flex items-center gap-3 rounded px-3 py-2.5 text-[#bac9cc] transition hover:bg-white/5 hover:text-[#e2e2e8]"
              >
                <Icon className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold uppercase">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-[#3b494c]/20 pt-6">
            <div className="mb-5 rounded border border-[#3b494c]/30 bg-[#282a2e] px-3 py-2 text-center font-mono text-xs uppercase text-[#c3f5ff]">
              Export Data
            </div>
            <div className="flex justify-between px-2 text-[#bac9cc]">
              <div className="flex flex-col items-center gap-1">
                <Terminal className="h-4 w-4" />
                <span className="font-mono text-[9px] uppercase">Local</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Cloud className="h-4 w-4" />
                <span className="font-mono text-[9px] uppercase">Idle</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="grid-bg custom-scrollbar min-w-0 flex-1 overflow-y-auto p-4 pb-24 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 border-b border-[#3b494c]/30 pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Link href="/workspace" className="mb-4 inline-flex items-center gap-2 text-sm text-[#bac9cc] hover:text-[#c3f5ff]">
                  <ArrowLeft className="h-4 w-4" />
                  Workspace
                </Link>
                <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase text-[#00daf3]">
                  <History className="h-4 w-4" />
                  Session Archive
                </p>
                <h1 className="font-serif text-4xl font-bold text-[#e2e2e8] md:text-5xl">
                  Research History
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#bac9cc]">
                  Saved research sessions with report artifacts and source ledgers.
                </p>
              </div>
              <div className="rounded bg-[#333539] px-3 py-1.5 font-mono text-xs text-[#c3f5ff]">
                {sessions.length} SESSIONS
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="glass-panel rounded-lg p-8 text-sm text-[#bac9cc]">
                No saved research sessions yet.
              </div>
            ) : (
              <div className="glass-panel divide-y divide-[#3b494c]/40 rounded-lg">
                {sessions.map((session, index) => (
                  <Link
                    key={session.id}
                    href={`/report/${session.id}`}
                    className="grid gap-4 p-5 transition hover:bg-white/[0.04] md:grid-cols-[80px_minmax(0,1fr)_220px]"
                  >
                    <div className="font-mono text-xs text-[#00daf3]">
                      REF-{String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-xl font-semibold text-[#e2e2e8]">
                        {session.topic}
                      </h2>
                      <p className="mt-1 text-sm text-[#bac9cc]">
                        {session.sources.length} sources captured in ledger
                      </p>
                    </div>
                    <time className="font-mono text-xs text-[#bac9cc] md:text-right">
                      {new Date(session.createdAt).toLocaleString()}
                    </time>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <nav className="mobile-workbench-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 px-2 py-2 md:hidden">
        <Link href="/workspace" className="flex flex-col items-center gap-1 rounded px-2 py-1.5 text-[#bac9cc] hover:bg-white/5 hover:text-[#c3f5ff]">
          <ClipboardList className="h-4 w-4" />
          <span className="font-mono text-[10px] uppercase">New</span>
        </Link>
        <Link href="/history" className="flex flex-col items-center gap-1 rounded bg-[#c3f5ff]/10 px-2 py-1.5 text-[#c3f5ff]">
          <History className="h-4 w-4" />
          <span className="font-mono text-[10px] uppercase">History</span>
        </Link>
        <Link href="/workspace" className="flex flex-col items-center gap-1 rounded px-2 py-1.5 text-[#bac9cc] hover:bg-white/5 hover:text-[#c3f5ff]">
          <ShieldCheck className="h-4 w-4" />
          <span className="font-mono text-[10px] uppercase">Audit</span>
        </Link>
      </nav>
    </main>
  );
}
