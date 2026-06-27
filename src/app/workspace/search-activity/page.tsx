import SearchActivityView from "@/components/ui/deep-research/SearchActivityView";
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

export default function SearchActivityPage() {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#111317] text-[#e2e2e8]">
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#3b494c]/30 bg-[#111317]/80 px-6 backdrop-blur-3xl">
        <div className="flex items-center gap-7">
          <Link href="/" className="font-serif text-2xl font-bold text-[#c3f5ff]">Noēsis</Link>
          <nav className="hidden items-center gap-6 md:flex">
            <span className="text-sm text-[#bac9cc]">Models</span>
            <Link href="/history" className="text-sm text-[#bac9cc] hover:text-[#c3f5ff]">History</Link>
            <span className="text-sm text-[#bac9cc]">Settings</span>
          </nav>
        </div>
        <WorkbenchStatus />
        <div className="hidden items-center gap-3 md:flex">
          <Cloud className="h-5 w-5 text-[#bac9cc] hover:text-[#c3f5ff]" />
          <Settings className="h-5 w-5 text-[#bac9cc] hover:text-[#c3f5ff]" />
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3b494c] bg-[#282a2e] text-[#c3f5ff]">
            <Network className="h-4 w-4" />
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#3b494c]/20 bg-[#1a1c20]/80 px-4 py-8 backdrop-blur-2xl md:flex">
          <div className="mb-8 px-2">
            <div className="mb-1 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-[#c3f5ff]" />
              <span className="font-serif text-lg font-bold text-[#e2e2e8]">Audit Trail</span>
            </div>
            <p className="font-mono text-[10px] uppercase text-[#bac9cc]">Precision Ledger</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map(([label, Icon, href]) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded px-3 py-2.5 transition ${
                  label === "Search Activity"
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
            <button className="mb-6 flex w-full items-center justify-center gap-2 rounded border border-[#3b494c]/50 bg-[#282a2e] px-3 py-3 font-mono text-sm uppercase text-[#e2e2e8]">
              <Download className="h-4 w-4" />
              Export Data
            </button>
            <div className="flex justify-between px-2 text-[#bac9cc]">
              <Terminal className="h-5 w-5" />
              <Cloud className="h-5 w-5" />
            </div>
          </div>
        </aside>
        <section className="min-w-0 flex-1 overflow-hidden">
          <SearchActivityView />
        </section>
      </div>
    </main>
  );
}
