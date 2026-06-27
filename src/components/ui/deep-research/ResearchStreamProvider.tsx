/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useChat } from "@ai-sdk/react";
import { ReactNode, useEffect, useRef } from "react";
import { useDeepResearchStore } from "@/store/deepResearch";

export default function ResearchStreamProvider({
  children,
}: {
  children: ReactNode;
}) {
  const submittedPayloadRef = useRef<string>("");
  const {
    questions,
    isCompleted,
    topic,
    answers,
    setIsLoading,
    setActivities,
    setSources,
    setReport,
    setSessionId,
  } = useDeepResearchStore();

  const { append, data, isLoading } = useChat({
    api: "/api/deep-research",
  });

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  useEffect(() => {
    if (!isCompleted || questions.length === 0) {
      submittedPayloadRef.current = "";
    }
  }, [isCompleted, questions.length]);

  useEffect(() => {
    if (!data) return;

    const messages = data as unknown[];
    const activities = messages
      .filter(
        (msg) => typeof msg === "object" && (msg as any).type === "activity"
      )
      .map((msg) => (msg as any).content);

    setActivities(activities);

    const sources = activities
      .filter(
        (activity) =>
          activity.type === "extract" && activity.status === "complete"
      )
      .map((activity) => {
        const url = activity.message.split("from ")[1];
        return {
          url,
          title: url?.split("/")[2] || url,
        };
      });
    setSources(sources);

    const reportData = messages.find(
      (msg) => typeof msg === "object" && (msg as any).type === "report"
    );
    const report =
      typeof (reportData as any)?.content === "string"
        ? (reportData as any).content
        : "";
    setReport(report);

    const sessionData = messages.find(
      (msg) => typeof msg === "object" && (msg as any).type === "session"
    );
    const sessionId =
      typeof (sessionData as any)?.content?.id === "string"
        ? (sessionData as any).content.id
        : "";
    setSessionId(sessionId);
  }, [data, setActivities, setSources, setReport, setSessionId]);

  useEffect(() => {
    if (!isCompleted || questions.length === 0) return;

    const clarifications = questions.map((question, index) => ({
      question: question.prompt,
      answer: answers[index],
    }));

    const payload = JSON.stringify({
      topic,
      clarifications,
    });

    if (submittedPayloadRef.current === payload) return;
    submittedPayloadRef.current = payload;

    append({
      role: "user",
      content: payload,
    });
  }, [isCompleted, questions, answers, topic, append]);

  return children;
}
