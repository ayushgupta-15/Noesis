"use client";
import { useDeepResearchStore } from "@/store/deepResearch";
import React, { ComponentPropsWithRef, useEffect, useRef } from "react";
import { Card } from "../card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "../button";
import Link from "next/link";

type CodeProps = ComponentPropsWithRef<"code"> & {
  inline?: boolean;
};

const ResearchReport = () => {
  const { report, isCompleted, isLoading, topic, sessionId } = useDeepResearchStore();
  const reportRef = useRef<HTMLDivElement | null>(null);
  const reportContent = report.includes("<report>")
    ? report.split("<report>")[1]?.split("</report>")[0] ?? report
    : report;

  const handleMarkdownDownload = () => {
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic}-research-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!report) return;

    reportRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [report]);

  if (!isCompleted) return null;

  if (report.length <= 0 && isLoading) {
    return (
      <Card className="glass-panel rounded-lg p-4">
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00daf3]"></div>
          <p className="text-sm text-[#bac9cc]">
            Researching your topic...
          </p>
        </div>
      </Card>
    );
  }

  if (report.length <= 0) return null;

  return (
    <Card
      id="research-report"
      ref={reportRef}
      className="glass-panel overflow-hidden rounded-lg"
    >
      <div className="flex flex-col gap-4 border-b border-[#3b494c]/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded bg-[#c3f5ff] text-[#00363d]">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#e2e2e8]">Research report</h2>
            <p className="text-sm text-[#bac9cc]">{topic}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {sessionId && (
            <Button asChild size="sm" variant="outline" className="rounded-md">
              <Link href={`/report/${sessionId}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open saved
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            className="rounded bg-[#c3f5ff] font-mono text-xs font-bold text-[#00363d] hover:brightness-110"
            onClick={handleMarkdownDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Markdown
          </Button>
        </div>
      </div>

      <div className="prose prose-invert max-w-none overflow-x-auto p-6 text-[16px] leading-7 prose-headings:font-serif prose-headings:text-[#e2e2e8] prose-h2:border-b prose-h2:border-[#3b494c]/40 prose-h2:pb-2 prose-h2:text-[#c3f5ff] prose-p:text-[#bac9cc] prose-li:text-[#bac9cc] prose-pre:p-2">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, inline, ...props }: CodeProps) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";

              if (!inline && language) {
                const SyntaxHighlighterProps: SyntaxHighlighterProps = {
                  style: nightOwl,
                  language,
                  PreTag: "div",
                  children: String(children).replace(/\n$/, ""),
                };

                return <SyntaxHighlighter {...SyntaxHighlighterProps} />;
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
    </Card>
  );
};

export default ResearchReport;
