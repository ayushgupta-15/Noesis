import QnA from "@/components/ui/deep-research/QnA";
import UserInput from "@/components/ui/deep-research/UserInput";
import WorkbenchStatus from "@/components/ui/deep-research/WorkbenchStatus";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Cloud,
  Database,
  Download,
  FileText,
  FlaskConical,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const navItems = [
  ["Research Plan", ClipboardList, "#research-plan"],
  ["Search Activity", Search, "/workspace/search-activity"],
  ["Extraction", Database, "/workspace/extraction"],
  ["Confidence Gate", ShieldCheck, "/workspace/confidence-gate"],
  ["Source Ledger", BookOpen, "/workspace/source-ledger"],
  ["Report", FileText, "/workspace/report"],
] as const;

const mobileNavItems = [
  ["Plan", ClipboardList, "#research-plan"],
  ["Gate", ShieldCheck, "/workspace/confidence-gate"],
  ["Ledger", BookOpen, "/workspace/source-ledger"],
  ["Report", FileText, "/workspace/report"],
] as const;

export default function WorkspacePage() {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#111317] text-[#e2e2e8]">
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#3b494c]/30 bg-[#111317]/80 px-6 backdrop-blur-3xl">
        <div className="flex items-center gap-7">
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

        <WorkbenchStatus />

        <div className="flex items-center gap-4">
          <Link
            href="/workspace"
            className="hidden rounded bg-[#c3f5ff] px-5 py-2 font-mono text-[11px] font-bold uppercase text-[#00363d] transition-all hover:brightness-110 active:scale-95 sm:inline-flex"
          >
            New Research
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <Cloud className="h-5 w-5 text-[#bac9cc] hover:text-[#c3f5ff]" />
            <Settings className="h-5 w-5 text-[#bac9cc] hover:text-[#c3f5ff]" />
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#3b494c] bg-[#282a2e] text-[#c3f5ff]">
              <Network className="h-4 w-4" />
            </span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#3b494c]/20 bg-[#1a1c20]/80 px-4 py-8 backdrop-blur-2xl md:flex">
          <div className="mb-8 px-2">
            <div className="mb-1 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-[#c3f5ff]" />
              <span className="font-serif text-lg font-bold text-[#e2e2e8]">Audit Trail</span>
            </div>
            <p className="font-mono text-[10px] uppercase text-[#bac9cc]">
              Precision Ledger
            </p>
          </div>

          <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto">
            {navItems.map(([label, Icon, href], index) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded px-3 py-2.5 transition ${
                  index === 0
                    ? "bg-[#c3f5ff]/10 text-[#c3f5ff]"
                    : "text-[#bac9cc] hover:bg-white/5 hover:text-[#e2e2e8]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-mono text-sm font-semibold uppercase">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-[#3b494c]/20 pt-6">
            <button className="mb-6 flex w-full items-center justify-center gap-2 rounded border border-[#3b494c]/50 bg-[#282a2e] px-3 py-3 font-mono text-sm uppercase text-[#e2e2e8] transition-colors hover:border-[#c3f5ff]/50">
              <Download className="h-4 w-4" />
              Export Data
            </button>
            <div className="flex justify-between px-2 text-[#bac9cc]">
              <div className="flex flex-col items-center gap-1">
                <Terminal className="h-5 w-5" />
                <span className="font-mono text-[9px] uppercase">Local</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Cloud className="h-5 w-5" />
                <span className="font-mono text-[9px] uppercase">Cloud</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 overflow-hidden">
          <section className="custom-scrollbar min-w-0 flex-1 overflow-y-auto p-4 pb-24 md:p-6">
            <div className="mx-auto max-w-4xl space-y-8">
              <div
                id="research-plan"
                className="flex flex-col gap-4 border-b border-[#3b494c]/30 pb-5 lg:flex-row lg:items-end lg:justify-between"
              >
                <div>
                  <h1 className="font-serif text-4xl font-bold text-[#e2e2e8]">
                    Research Plan
                  </h1>
                  <p className="mt-2 max-w-2xl text-lg leading-7 text-[#bac9cc]">
                    Dynamic synthesis path for your active research topic.
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <span className="mb-1 block font-mono text-[10px] font-semibold uppercase text-[#c3f5ff]">
                    Execution Thread
                  </span>
                  <span className="rounded bg-[#333539] px-2 py-1 font-mono text-xs text-[#e2e2e8]">
                    THREAD_ID: LOCAL_SESSION
                  </span>
                </div>
              </div>

              <UserInput />

              <div className="glass-panel relative overflow-hidden rounded-lg border-[#3b494c]/40 p-6">
                <FlaskConical className="absolute right-6 top-6 h-10 w-10 text-[#c3f5ff]/20" />
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#c3f5ff] font-bold text-[#c3f5ff]">
                    1
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <h2 className="font-serif text-xl font-semibold text-[#e2e2e8]">
                        Research Brief Scoping
                      </h2>
                      <span className="rounded border border-[#5be9ad]/30 bg-[#5be9ad]/20 px-2 py-0.5 font-mono text-[10px] uppercase text-[#5be9ad]">
                        Ready
                      </span>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-[#bac9cc]">
                      Choose a topic, lock clarifications, then let Noēsis generate a traceable plan,
                      source ledger, confidence gate, and final report.
                    </p>
                  </div>
                </div>
              </div>

              <QnA />
            </div>
          </section>

        </main>
      </div>

      <nav className="mobile-workbench-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 px-2 py-2 md:hidden">
        {mobileNavItems.map(([label, Icon, href]) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1 rounded px-2 py-1.5 text-[#bac9cc] hover:bg-white/5 hover:text-[#c3f5ff]"
          >
            <Icon className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
