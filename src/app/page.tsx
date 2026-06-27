import Link from "next/link";
import {
  ArrowRight,
  Bolt,
  CheckCircle2,
  CloudOff,
  Database,
  GitBranch,
  Github,
  ListChecks,
  Lock,
  Network,
  Quote,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Verified,
} from "lucide-react";

const features = [
  {
    title: "Dynamic Planning",
    description:
      "Execution threads that adapt in real time. Visualize the logic tree behind every automated research step.",
    status: "[EXEC-01] Running...",
    icon: GitBranch,
    tone: "cyan",
  },
  {
    title: "Neural Extraction",
    description:
      "Powered by Exa search protocols. Noēsis does not just find links; it extracts semantic signals with precision.",
    status: "exa_v1_active",
    icon: SearchCheck,
    tone: "cyan",
  },
  {
    title: "Confidence Gate",
    description:
      "Multi-stage verification protocols. Every synthesis must pass automated cross-reference checks before commitment.",
    status: "STATUS: VERIFIED",
    icon: ShieldCheck,
    tone: "emerald",
  },
  {
    title: "Source Ledger",
    description:
      "Forensic traceability for citations. Inspect the source trail behind the research instead of trusting a black box.",
    status: ".ledger_v2",
    icon: ListChecks,
    tone: "cyan",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0f1115] text-[#e2e2e8] selection:bg-[#00daf3]/30 selection:text-[#c3f5ff]">
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#111317]/80 shadow-sm backdrop-blur-xl">
        <nav className="flex h-12 w-full items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-7">
            <Link href="/" className="font-serif text-base font-bold text-[#e2e2e8] md:text-lg">
              Noēsis
            </Link>
            <div className="hidden items-center gap-5 md:flex">
              <a className="text-xs text-[#bac9cc] transition-colors hover:text-[#c3f5ff]" href="#platform">
                Platform
              </a>
              <a className="text-xs text-[#bac9cc] transition-colors hover:text-[#c3f5ff]" href="#security">
                Security
              </a>
              <a className="text-xs text-[#bac9cc] transition-colors hover:text-[#c3f5ff]" href="#changelog">
                Changelog
              </a>
              <a className="text-xs text-[#bac9cc] transition-colors hover:text-[#c3f5ff]" href="#docs">
                Documentation
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/history"
              className="hidden font-mono text-[10px] uppercase text-[#bac9cc] transition-colors hover:text-[#c3f5ff] sm:inline"
            >
              Sign In
            </Link>
            <Link
              href="/workspace"
              className="rounded bg-[#c3f5ff] px-4 py-1.5 font-mono text-[10px] font-semibold uppercase text-[#00363d] shadow-lg shadow-[#00daf3]/10 transition-all hover:brightness-110 active:scale-95"
            >
              Start Research
            </Link>
          </div>
        </nav>
      </header>

      <section className="landing-grid relative flex min-h-[730px] flex-col items-center justify-start px-4 pt-28 md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1115]/50 to-[#0f1115]" />
        <div className="relative z-10 max-w-5xl space-y-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c3f5ff]/20 bg-[#c3f5ff]/5 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c3f5ff]" />
            <span className="font-mono text-[10px] font-semibold uppercase text-[#c3f5ff]">
              LOCAL-FIRST SYNTHESIS V1.0
            </span>
          </div>
          <h1 className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-tight text-[#e2e2e8] md:text-[64px] md:leading-[1.05]">
            Traceable AI Research.
            <br />
            <span className="bg-gradient-to-r from-[#c3f5ff] to-[#a8ffd2] bg-clip-text text-transparent">
              Built for Precision Audit.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-[#e2e2e8] md:text-[15px]">
            Stop guessing. Start auditing. Noēsis is a research workspace that provides a complete,
            neural-extracted audit trail for every claim.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 md:flex-row">
            <Link
              href="/workspace"
              className="group flex w-full items-center justify-center gap-3 rounded bg-[#c3f5ff] px-9 py-3.5 text-sm font-medium text-[#00363d] transition-all hover:shadow-[0_0_30px_rgba(0,218,243,0.3)] hover:brightness-110 md:w-auto"
            >
              Start Research
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#docs"
              className="w-full rounded border border-[#3b494c] px-9 py-3.5 text-sm font-semibold text-[#e2e2e8] transition-colors hover:bg-white/5 md:w-auto"
            >
              View Documentation
            </a>
          </div>
        </div>

        <div className="glass-panel relative mt-20 flex h-[300px] w-full max-w-[1280px] items-center justify-center overflow-hidden rounded-lg">
          <div className="absolute inset-0 opacity-30">
            <div className="h-full w-full bg-[linear-gradient(rgba(195,245,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(195,245,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>
          <div className="relative flex h-full w-full items-center justify-around px-6 md:px-10">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-[#c3f5ff]/30 bg-[#0f1115]">
                <Database className="h-5 w-5 text-[#c3f5ff]" />
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase text-[#bac9cc]">RAW DATA</span>
            </div>
            <div className="relative h-px flex-1 bg-gradient-to-r from-[#c3f5ff]/30 via-[#c3f5ff] to-[#c3f5ff]/30">
              <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 animate-ping rounded-full bg-[#c3f5ff]" />
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-[#c3f5ff] bg-[#c3f5ff]/10 shadow-[0_0_15px_2px_rgba(0,218,243,0.1)]">
                <Sparkles className="h-5 w-5 fill-[#c3f5ff]/20 text-[#c3f5ff]" />
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase text-[#c3f5ff]">NEURAL SYNTHESIS</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-[#c3f5ff]/30 via-[#a8ffd2] to-[#a8ffd2]/30" />
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-[#a8ffd2] bg-[#a8ffd2]/10">
                <Verified className="h-5 w-5 text-[#a8ffd2]" />
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase text-[#a8ffd2]">VERIFIED CLAIM</span>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-[1360px] px-4 py-20 md:px-8">
        <div className="mb-16 space-y-3 text-center">
          <h2 className="font-serif text-4xl font-bold text-[#e2e2e8] md:text-5xl">The Research Lifecycle, Unlocked</h2>
          <p className="text-sm text-[#bac9cc] md:text-base">Most AI tools are black boxes. Noēsis is a glass box.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isEmerald = feature.tone === "emerald";
            return (
              <article
                key={feature.title}
                className={`glass-panel group flex min-h-[360px] flex-col rounded-lg p-8 transition-colors ${
                  isEmerald ? "hover:border-[#a8ffd2]/40" : "hover:border-[#c3f5ff]/40"
                }`}
              >
                <div
                  className={`mb-10 flex h-8 w-8 items-center justify-center rounded border transition-transform group-hover:scale-110 ${
                    isEmerald
                      ? "border-[#a8ffd2]/20 bg-[#a8ffd2]/10 text-[#a8ffd2]"
                      : "border-[#c3f5ff]/20 bg-[#c3f5ff]/10 text-[#c3f5ff]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mb-3 font-serif text-xl font-semibold text-[#e2e2e8]">{feature.title}</h3>
                <p className="flex-grow text-xs leading-5 text-[#e2e2e8]">{feature.description}</p>
                <div className="mt-6 border-t border-white/5 pt-6">
                  <span className={`font-mono text-[10px] ${isEmerald ? "text-[#a8ffd2]/70" : "text-[#c3f5ff]/70"}`}>
                    {feature.status}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="security" className="landing-grid relative overflow-hidden bg-[#1a1c20]/30 py-28">
        <div className="relative z-10 mx-auto flex max-w-[1360px] flex-col items-center gap-16 px-4 md:px-8 lg:flex-row">
          <div className="flex-1 space-y-7">
            <div className="inline-block rounded border border-[#3b494c] px-3 py-1 font-mono text-[10px] font-semibold uppercase text-[#bac9cc]">
              ARCHITECTURE
            </div>
            <h2 className="font-serif text-4xl font-bold leading-tight text-[#e2e2e8] md:text-5xl">
              Your Research,
              <br />
              Your Machine
            </h2>
            <p className="max-w-xl text-base leading-7 text-[#e2e2e8]">
              Noēsis stores sessions locally in{" "}
              <code className="rounded border border-white/10 bg-[#111317] px-2 py-1 font-mono text-sm text-[#c3f5ff]">
                .noesis/sessions.json
              </code>
              . Privacy by design is not a feature; it is the foundation.
            </p>
            <ul className="space-y-3">
              {[
                "Zero cloud persistence for private research sessions.",
                "OpenRouter fallbacks for provider flexibility.",
                "Instant local search with vector-db quantization.",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#e2e2e8]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#c3f5ff]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative w-full flex-1">
            <div className="glass-panel relative ml-auto flex aspect-[16/9] max-w-[640px] flex-col rounded-lg border border-[#c3f5ff]/20 p-6">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] text-[#bac9cc]">SESSION_LEDGER.JSON</span>
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffb4ab]/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3131c0]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#c3f5ff]/40" />
                </div>
              </div>
              <pre className="overflow-hidden whitespace-pre-wrap font-mono text-[11px] leading-5 text-[#c3f5ff]/80">
{`{
  "session_id": "8f3e2a",
  "timestamp": 1724592000,
  "audit_trail": [
    {"action": "neural_extract", "target": "dataset_A"},
    {"action": "verify_claim", "status": "passed"}
  ],
  "local_storage": "encrypted_aes256"
}`}
              </pre>
              <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-2 rounded border border-[#c3f5ff]/40 bg-[#111317]/80 px-4 py-2 backdrop-blur-xl md:flex lg:-right-8">
                <Network className="h-3.5 w-3.5 text-[#c3f5ff]" />
                <span className="font-mono text-[10px] uppercase text-[#e2e2e8]">OPENROUTER SYNC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="changelog" className="px-4 py-28 md:px-8">
        <div className="glass-panel relative mx-auto max-w-[1000px] rounded-lg border-[#c3f5ff]/10 p-8 text-center md:p-12">
          <Quote className="absolute -top-7 left-1/2 h-14 w-14 -translate-x-1/2 bg-[#0f1115] px-4 text-[#c3f5ff]" />
          <blockquote className="mb-8 font-serif text-2xl font-bold italic leading-tight text-[#e2e2e8] md:text-[42px]">
            In an era where AI hallucination is the default, Noēsis provides the precision workbench
            required for high-stakes research. The forensic traceability of the source ledger is a
            game-changer for our auditing team.
          </blockquote>
          <cite className="flex flex-col items-center gap-2 not-italic">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-[#c3f5ff] bg-[#c3f5ff]/10 font-mono text-xs text-[#c3f5ff]">
              EV
            </div>
            <div className="font-serif text-base font-semibold text-[#e2e2e8]">Dr. Elena Vance</div>
            <div className="font-mono text-[10px] font-semibold uppercase text-[#bac9cc]">
              Director of Neural Ethics, Synthesis Labs
            </div>
          </cite>
        </div>
      </section>

      <section id="docs" className="relative overflow-hidden px-4 py-32 text-center md:px-8">
        <div className="relative z-10 mx-auto max-w-3xl space-y-10">
          <h2 className="font-serif text-4xl font-medium leading-tight text-[#e2e2e8] md:text-[56px]">
            Ready to build a better ledger?
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-[#e2e2e8]">
            Start your first session today and regain control over your data lineage.
          </p>
          <Link
            href="/workspace"
            className="inline-flex rounded bg-[#c3f5ff] px-12 py-4 text-sm font-medium text-[#00363d] shadow-[0_0_40px_rgba(0,218,243,0.2)] transition-transform hover:scale-105"
          >
            Start Your First Session
          </Link>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 text-[#bac9cc] sm:flex-row sm:gap-8">
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-[#c3f5ff]" />
              <span className="font-mono text-[10px] font-semibold uppercase">LOCAL STORAGE</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudOff className="h-3 w-3 text-[#c3f5ff]" />
              <span className="font-mono text-[10px] font-semibold uppercase">NO TRACKING</span>
            </div>
            <div className="flex items-center gap-2">
              <Bolt className="h-3 w-3 text-[#c3f5ff]" />
              <span className="font-mono text-[10px] font-semibold uppercase">SUB-MS LATENCY</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-[#3b494c] bg-[#0c0e12] py-10">
        <div className="flex flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-8">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <span className="font-serif text-base font-bold text-[#e2e2e8]">Noēsis Research</span>
            <p className="text-center font-mono text-[10px] font-semibold uppercase text-[#bac9cc] md:text-left">
              © 2026 Noēsis Research. Built for local-first synthesis.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="font-mono text-[10px] font-semibold uppercase text-[#bac9cc] transition-colors hover:text-[#6ffbbe]" href="#security">
              Privacy Policy
            </a>
            <a className="font-mono text-[10px] font-semibold uppercase text-[#bac9cc] transition-colors hover:text-[#6ffbbe]" href="#docs">
              Terms of Service
            </a>
            <a className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase text-[#bac9cc] transition-colors hover:text-[#6ffbbe]" href="#platform">
              <Github className="h-3 w-3" />
              Github
            </a>
            <a className="font-mono text-[10px] font-semibold uppercase text-[#bac9cc] transition-colors hover:text-[#6ffbbe]" href="#platform">
              System Status
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
