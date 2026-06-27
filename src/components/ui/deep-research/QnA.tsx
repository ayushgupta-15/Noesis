"use client";
import { useDeepResearchStore } from "@/store/deepResearch";
import React from "react";
import QuestionForm from "./QuestionForm";
import ResearchActivities from "./ResearchActivities";
import ResearchTimer from "./ResearchTimer";
import CompletedQuestions from "./CompletedQuestions";

const QnA = () => {
  const {
    questions,
  } = useDeepResearchStore();

  if (questions.length === 0) return null;

  return (
    <div className="space-y-6">
      <QuestionForm />
      <CompletedQuestions />
      <ResearchTimer />
      <ResearchActivities />
    </div>
  );
};

export default QnA;
