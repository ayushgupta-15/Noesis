import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getResearchSession } from "@/lib/session-store";
import { getExistingVisitorId } from "@/lib/session-owner";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Cloud,
  Database,
  ExternalLink,
  FileText,
  Search,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export const runtime = "nodejs";

const navItems = [
  ["Research Plan", ClipboardList],
  ["Search Activity", Search],
  ["Extraction", Database],
  ["Confidence Gate", ShieldCheck],
  ["Source Ledger", BookOpen],
  ["Report", FileText],
] as const;

function extractReportContent(report: string) {
  if (!report.includes("<report>")) {
    return report;
  }

  return report.split("<report>")[1]?.split("</report>")[0] ?? report;
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const visitorId = await getExistingVisitorId();
  const session = visitorId ? await getResearchSession(id, visitorId) : null;

  if (!session) {
    notFound();
  }

  const reportContent = extractReportContent(session.reportText);

  return (
    <main className="workbench-shell flex min-h-screen flex-col overflow-hidden text-[#e2e2e8]">
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#3b494c]/30 bg-[#111317]/80 px-6 backdrop-blur-3xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-2xl font-bold text-[#c3f5ff]">
            Noēsis
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <span className="text-sm text-[#bac9cc]">Models</span>
            <Link href="/history" className="text-sm text-[#bac9cc] hover:text-[#c3f5ff]">
              History
            </Link>
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
            {navItems.map(([label, Icon]) => (
              <Link
                key={label}
                href={label === "Report" ? "#report" : label === "Source Ledger" ? "#source-ledger" : "/workspace"}
                className={`flex items-center gap-3 rounded px-3 py-2.5 transition ${
                  label === "Report"
                    ? "bg-[#c3f5ff]/10 text-[#c3f5ff]"
                    : "text-[#bac9cc] hover:bg-white/5 hover:text-[#e2e2e8]"
                }`}
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
          <article className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
            <aside className="glass-panel hidden h-fit rounded-lg p-5 xl:block">
              <h3 className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#bac9cc]">
                Contents
              </h3>
              <nav className="space-y-3 border-l border-[#3b494c]/40">
                {["Executive Summary", "Key Findings", "Practical Takeaways", "Sources"].map((item, index) => (
                  <a
                    key={item}
                    href="#report"
                    className={`block pl-4 text-sm ${index === 0 ? "border-l-2 border-[#00daf3] -ml-px text-[#c3f5ff]" : "text-[#bac9cc] hover:text-[#c3f5ff]"}`}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 space-y-6">
              <div className="glass-panel rounded-lg p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <Link
                    href="/history"
                    className="inline-flex items-center gap-2 rounded border border-[#3b494c]/40 px-3 py-2 font-mono text-xs text-[#bac9cc] hover:border-[#00daf3]/50 hover:text-[#c3f5ff]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    History
                  </Link>
                  <span className="rounded-full bg-[#5be9ad] px-3 py-1 font-mono text-[10px] uppercase text-[#003824]">
                    Completed
                  </span>
                </div>
                <p className="mb-2 font-mono text-xs uppercase text-[#00daf3]">
                  Final Research Report
                </p>
                <h1 className="font-serif text-4xl font-bold text-[#e2e2e8]">
                  {session.topic}
                </h1>
                <p className="mt-2 text-sm text-[#bac9cc]">
                  Saved {new Date(session.createdAt).toLocaleString()} · {session.sources.length} sources
                </p>
              </div>

              <div id="report" className="glass-panel prose prose-invert max-w-none scroll-mt-20 rounded-lg p-6 text-[16px] leading-7 prose-headings:font-serif prose-headings:text-[#e2e2e8] prose-h2:border-b prose-h2:border-[#3b494c]/40 prose-h2:pb-2 prose-h2:text-[#c3f5ff] prose-p:text-[#bac9cc] prose-li:text-[#bac9cc]">
                <Markdown remarkPlugins={[remarkGfm]}>{reportContent}</Markdown>
              </div>
            </div>

            <aside id="source-ledger" className="glass-panel h-fit scroll-mt-20 rounded-lg p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#00daf3]" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#e2e2e8]">
                  Source Ledger
                </h2>
              </div>
              {session.sources.length > 0 ? (
                <ul className="custom-scrollbar max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                  {session.sources.map((source, index) => (
                    <li key={source.url}>
                      <Link
                        href={source.url}
                        target="_blank"
                        className="source-chip block p-3"
                      >
                        <span className="mb-2 block font-mono text-[10px] text-[#00daf3]">
                          [REF-{String(index + 1).padStart(2, "0")}]
                        </span>
                        <span className="flex items-center gap-2 text-sm text-[#c3f5ff]">
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{source.title}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#bac9cc]">No sources saved.</p>
              )}
            </aside>
          </article>
        </section>
      </div>

      <nav className="mobile-workbench-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 px-2 py-2 md:hidden">
        <Link href="/workspace" className="flex flex-col items-center gap-1 rounded px-2 py-1.5 text-[#bac9cc] hover:bg-white/5 hover:text-[#c3f5ff]">
          <ClipboardList className="h-4 w-4" />
          <span className="font-mono text-[10px] uppercase">New</span>
        </Link>
        <Link href="/history" className="flex flex-col items-center gap-1 rounded px-2 py-1.5 text-[#bac9cc] hover:bg-white/5 hover:text-[#c3f5ff]">
          <Search className="h-4 w-4" />
          <span className="font-mono text-[10px] uppercase">History</span>
        </Link>
        <a href="#source-ledger" className="flex flex-col items-center gap-1 rounded px-2 py-1.5 text-[#bac9cc] hover:bg-white/5 hover:text-[#c3f5ff]">
          <BookOpen className="h-4 w-4" />
          <span className="font-mono text-[10px] uppercase">Sources</span>
        </a>
        <a href="#report" className="flex flex-col items-center gap-1 rounded bg-[#c3f5ff]/10 px-2 py-1.5 text-[#c3f5ff]">
          <FileText className="h-4 w-4" />
          <span className="font-mono text-[10px] uppercase">Report</span>
        </a>
      </nav>
    </main>
  );
}
