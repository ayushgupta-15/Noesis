import SourceLedgerView from "@/components/ui/deep-research/SourceLedgerView";
import WorkbenchStatus from "@/components/ui/deep-research/WorkbenchStatus";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Cloud,
  CloudCog,
  Database,
  FileText,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const navItems = [
  ["Research Plan", ClipboardList, "/workspace"],
  ["Search Activity", Search, "/workspace/search-activity"],
  ["Extraction", Database, "/workspace/extraction"],
  ["Confidence Gate", ShieldCheck, "/workspace/confidence-gate"],
  ["Source Ledger", BookOpen, "/workspace/source-ledger"],
  ["Report", FileText, "/workspace/report"],
] as const;

const mobileNavItems = [
  ["Plan", ClipboardList, "/workspace"],
  ["Gate", ShieldCheck, "/workspace/confidence-gate"],
  ["Ledger", BookOpen, "/workspace/source-ledger"],
  ["Report", FileText, "/workspace/report"],
] as const;

export default function SourceLedgerPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#111317] text-[#e2e2e8]">
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#3b494c]/30 bg-[#111317]/80 px-6 backdrop-blur-3xl">
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
            <CloudCog className="h-5 w-5 text-[#bac9cc] hover:text-[#c3f5ff]" />
            <Settings className="h-5 w-5 text-[#bac9cc] hover:text-[#c3f5ff]" />
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#3b494c] bg-[#282a2e] text-[#c3f5ff]">
              <Network className="h-4 w-4" />
            </span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="fixed bottom-0 left-0 top-16 hidden w-[280px] shrink-0 flex-col border-r border-[#3b494c]/20 bg-[#1a1c20]/80 px-4 py-8 backdrop-blur-2xl md:flex">
          <div className="mb-10 px-2">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c3f5ff]/40 bg-[#c3f5ff]/20">
                <ShieldCheck className="h-5 w-5 text-[#c3f5ff]" />
              </span>
              <div>
                <h2 className="font-serif text-lg font-bold leading-none text-[#e2e2e8]">Audit Trail</h2>
                <p className="mt-1 font-mono text-[10px] uppercase text-[#bac9cc]/70">
                  Precision Ledger
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map(([label, Icon, href]) => {
              const active = label === "Source Ledger";
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 rounded px-3 py-2.5 transition ${
                    active
                      ? "bg-[#c3f5ff]/10 font-bold text-[#c3f5ff]"
                      : "text-[#bac9cc] hover:bg-white/5 hover:text-[#e2e2e8]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-mono text-xs font-semibold uppercase">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#3b494c]/20 pt-6">
            <button className="mb-6 w-full rounded border border-[#c3f5ff] py-2 font-mono text-xs uppercase text-[#c3f5ff] transition-all hover:bg-[#c3f5ff]/5">
              Export Ledger
            </button>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 text-[#bac9cc]">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono text-[10px] uppercase">Local Status</span>
                </div>
                <span className="h-1.5 w-1.5 rounded-full bg-[#5be9ad] shadow-[0_0_5px_rgba(78,222,163,0.5)]" />
              </div>
              <div className="flex items-center justify-between px-2 text-[#bac9cc]">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  <span className="font-mono text-[10px] uppercase">Cloud Sync</span>
                </div>
                <span className="font-mono text-[10px] uppercase opacity-60">Idle</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="grid-bg min-w-0 flex-1 px-4 py-6 pb-24 md:ml-[280px] md:px-8">
          <div className="mx-auto max-w-[1400px]">
            <SourceLedgerView />
          </div>
        </section>
      </div>

      <nav className="mobile-workbench-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 px-2 py-2 md:hidden">
        {mobileNavItems.map(([label, Icon, href]) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 rounded px-2 py-1.5 ${
              label === "Ledger" ? "text-[#c3f5ff]" : "text-[#bac9cc] hover:bg-white/5 hover:text-[#c3f5ff]"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
