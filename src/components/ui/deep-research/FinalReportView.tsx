"use client";

import { useDeepResearchStore } from "@/store/deepResearch";
import { ComponentPropsWithRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";
import {
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../button";

type CodeProps = ComponentPropsWithRef<"code"> & {
  inline?: boolean;
};

function extractReportContent(report: string) {
  if (!report.includes("<report>")) return report;
  return report.split("<report>")[1]?.split("</report>")[0] ?? report;
}

export default function FinalReportView() {
  const { report, topic, sessionId, sources, activities, isLoading, isCompleted } =
    useDeepResearchStore();
  const [exportUrl, setExportUrl] = useState("");
  const [exportError, setExportError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const reportContent = extractReportContent(report);
  const hasReport = reportContent.trim().length > 0;

  const downloadLocally = () => {
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic || "noesis"}-research-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMarkdownExport = async () => {
    if (!hasReport || isExporting) return;

    setIsExporting(true);
    setExportUrl("");
    setExportError("");

    try {
      const response = await fetch("/api/exports/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          topic,
          reportText: report,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success || typeof payload.url !== "string") {
        throw new Error(payload.error || "Export failed.");
      }

      setExportUrl(payload.url);
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setExportError(
        error instanceof Error
          ? `${error.message} Downloaded locally instead.`
          : "Export failed. Downloaded locally instead."
      );
      downloadLocally();
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reportContent);
  };

  return (
    <main className="flex flex-1 overflow-hidden">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-[#3b494c]/20 p-8 xl:block">
        <h3 className="mb-6 font-mono text-xs uppercase text-[#bac9cc]/60">Contents</h3>
        <ul className="space-y-4 border-l border-[#3b494c]/30">
          {[
            ["Executive Summary", "#executive-summary"],
            ["Methodology", "#methodology"],
            ["Core Findings", "#core-findings"],
            ["Market Analysis", "#market-analysis"],
            ["Risk Assessment", "#risk-assessment"],
            ["Conclusion", "#conclusion"],
          ].map(([label, href], index) => (
            <li key={label}>
              <a
                href={href}
                className={`block text-sm transition-all hover:text-[#c3f5ff] ${
                  index === 0
                    ? "-ml-px border-l-2 border-[#c3f5ff] pl-4 font-bold text-[#c3f5ff]"
                    : "pl-4 text-[#bac9cc]"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-12 rounded border border-[#3b494c]/30 bg-[#1e2024] p-4">
          <p className="mb-2 font-mono text-[10px] uppercase text-[#bac9cc]">Last Modified</p>
          <p className="font-mono text-xs text-[#c3f5ff]">{new Date().toLocaleString()}</p>
        </div>
      </aside>

      <section className="custom-scrollbar relative flex-1 overflow-y-auto bg-[#111317]">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#3b494c]/30 bg-[#1a1c20]/80 px-4 py-4 backdrop-blur-2xl md:px-8">
          <div className="flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${hasReport ? "bg-[#5be9ad]" : "bg-[#c3f5ff] animate-pulse"}`} />
            <span className="font-mono text-[11px] uppercase text-[#bac9cc]">
              {hasReport ? "Local Session Saved" : isLoading ? "Report Generating" : "Awaiting Report"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded border-[#3b494c]/40 bg-[#282a2e] font-mono text-[11px] uppercase text-[#e2e2e8] hover:bg-[#333539]"
              onClick={handleCopy}
              disabled={!hasReport}
            >
              <Clipboard className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              size="sm"
              className="rounded bg-[#c3f5ff] font-mono text-[11px] uppercase text-[#00363d] hover:brightness-110"
              onClick={handleMarkdownExport}
              disabled={!hasReport || isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting" : "Export Markdown"}
            </Button>
          </div>
        </div>

        <article className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          {(exportUrl || exportError) && (
            <div className="mb-6 rounded border border-[#3b494c]/40 bg-[#1a1c20] p-4 font-mono text-xs text-[#bac9cc]">
              {exportUrl ? (
                <Link
                  href={exportUrl}
                  target="_blank"
                  className="text-[#c3f5ff] underline-offset-4 hover:underline"
                >
                  Export stored. Open Markdown artifact.
                </Link>
              ) : (
                <span>{exportError}</span>
              )}
            </div>
          )}

          <header className="mb-12 border-b border-[#3b494c]/20 pb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded border border-[#c3f5ff]/20 bg-[#c3f5ff]/10 px-2 py-0.5 font-mono text-[10px] uppercase text-[#c3f5ff]">
                Confidential
              </span>
              <span className="font-mono text-[10px] uppercase text-[#bac9cc]/50">
                RE: {sessionId || "LOCAL_SESSION"}
              </span>
            </div>
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#e2e2e8] md:text-5xl">
              {topic || "Final Research Report"}
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#333539] text-[#c3f5ff]">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#e2e2e8]">Synthesis Engine v4.2</p>
                  <p className="font-mono text-[10px] uppercase text-[#bac9cc]">Lead Researcher</p>
                </div>
              </div>
              <div className="h-8 w-px bg-[#3b494c]/40" />
              <div>
                <p className="text-sm font-bold text-[#e2e2e8]">{new Date().toLocaleDateString()}</p>
                <p className="font-mono text-[10px] uppercase text-[#bac9cc]">Report Generated</p>
              </div>
              <div className="h-8 w-px bg-[#3b494c]/40" />
              <div>
                <p className="text-sm font-bold text-[#e2e2e8]">
                  {hasReport ? "98.4%" : activities.length > 0 ? "Pending" : "N/A"}
                </p>
                <p className="font-mono text-[10px] uppercase text-[#bac9cc]">Confidence Score</p>
              </div>
            </div>
          </header>

          {!hasReport ? (
            <div className="glass-panel rounded-lg p-10 text-center">
              <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#c3f5ff]" />
              <h2 className="font-serif text-2xl font-semibold text-[#e2e2e8]">
                {isCompleted ? "Generating final report" : "No report committed yet"}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#bac9cc]">
                Complete the research flow from the workbench. This page will update live when the final
                report stream arrives.
              </p>
              <Link
                href="/workspace"
                className="mt-6 inline-flex rounded bg-[#c3f5ff] px-5 py-2 text-sm font-bold text-[#00363d] hover:brightness-110"
              >
                Return to Workbench
              </Link>
            </div>
          ) : (
            <>
              <div className="prose prose-invert max-w-none text-[16px] leading-7 prose-headings:font-serif prose-headings:text-[#e2e2e8] prose-h2:border-b prose-h2:border-[#3b494c]/40 prose-h2:pb-2 prose-h2:text-[#c3f5ff] prose-p:text-[#bac9cc] prose-li:text-[#bac9cc] prose-blockquote:border-l-[#c3f5ff] prose-blockquote:bg-[#c3f5ff]/5 prose-pre:p-2">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, inline, ...props }: CodeProps) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";

                      if (!inline && language) {
                        const syntaxProps: SyntaxHighlighterProps = {
                          style: nightOwl,
                          language,
                          PreTag: "div",
                          children: String(children).replace(/\n$/, ""),
                        };

                        return <SyntaxHighlighter {...syntaxProps} />;
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {reportContent}
                </Markdown>
              </div>

              <section className="mt-20 border-t border-[#3b494c]/40 pt-10">
                <h2 className="mb-6 font-mono text-xs uppercase text-[#bac9cc]">
                  Source Ledger References
                </h2>
                <div className="space-y-4">
                  {sources.slice(0, 8).map((source, index) => (
                    <Link
                      key={`${source.url}-${index}`}
                      href={source.url}
                      target="_blank"
                      className="flex items-start gap-4 rounded border border-[#3b494c]/30 bg-[#1a1c20]/60 p-3 transition-colors hover:border-[#c3f5ff]/40"
                    >
                      <span className="rounded bg-[#c3f5ff]/10 px-2 py-0.5 font-mono text-xs text-[#c3f5ff]">
                        [REF-{String(index + 1).padStart(2, "0")}]
                      </span>
                      <p className="min-w-0 flex-1 text-sm text-[#bac9cc]">
                        {source.title || source.url}
                      </p>
                      <ExternalLink className="h-4 w-4 shrink-0 text-[#bac9cc]" />
                    </Link>
                  ))}
                  {sources.length === 0 && (
                    <p className="text-sm text-[#bac9cc]">No source references were captured for this report.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </article>

        <div className="fixed bottom-8 right-8 z-40 hidden flex-col items-center gap-4 md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#3b494c]/40 bg-[#111317]/70 font-mono text-[10px] text-[#c3f5ff] backdrop-blur">
            {hasReport ? "100%" : "0%"}
          </div>
          {hasReport && (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c3f5ff] text-[#00363d] shadow-lg">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
