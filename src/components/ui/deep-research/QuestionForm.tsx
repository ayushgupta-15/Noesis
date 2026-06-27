import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "../textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useDeepResearchStore } from "@/store/deepResearch";
import { ArrowLeft, ArrowRight, Check, PenLine, Play } from "lucide-react";

const CUSTOM_VALUE = "__custom__";

const QuestionForm = () => {
  const {
    questions,
    currentQuestion,
    answers,
    setCurrentQuestion,
    setAnswers,
    setIsCompleted,
    isLoading,
    isCompleted,
  } = useDeepResearchStore();

  const question = questions[currentQuestion];
  const savedAnswer = answers[currentQuestion] || "";
  const optionValues = useMemo(() => question?.options ?? [], [question]);
  const savedIsOption = optionValues.includes(savedAnswer);
  const [selectedValue, setSelectedValue] = useState(
    savedIsOption ? savedAnswer : savedAnswer ? CUSTOM_VALUE : ""
  );
  const [customAnswer, setCustomAnswer] = useState(savedIsOption ? "" : savedAnswer);

  useEffect(() => {
    const nextQuestion = questions[currentQuestion];
    const nextSavedAnswer = answers[currentQuestion] || "";
    const nextOptions = nextQuestion?.options ?? [];
    const nextSavedIsOption = nextOptions.includes(nextSavedAnswer);

    setSelectedValue(
      nextSavedIsOption ? nextSavedAnswer : nextSavedAnswer ? CUSTOM_VALUE : ""
    );
    setCustomAnswer(nextSavedIsOption ? "" : nextSavedAnswer);
  }, [answers, currentQuestion, questions]);

  if (isCompleted) return null;
  if (questions.length === 0 || !question) return null;

  const finalAnswer =
    selectedValue === CUSTOM_VALUE ? customAnswer.trim() : selectedValue;

  function persistAnswer() {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = finalAnswer;
    setAnswers(newAnswers);
  }

  function goNext() {
    if (!finalAnswer) return;
    persistAnswer();

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  }

  return (
    <Card className="glass-panel rounded-lg">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00daf3]">
              Guided scope
            </p>
            <h3 className="font-serif text-lg font-semibold text-[#e2e2e8]">Decision {currentQuestion + 1}</h3>
          </div>
          <span className="rounded bg-[#333539] px-2 py-1 font-mono text-xs text-[#bac9cc]">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>

        <p className="text-sm leading-6 text-[#e2e2e8]">{question.prompt}</p>

        <div className="grid gap-2">
          {question.options.map((option) => {
            const isSelected = selectedValue === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSelectedValue(option);
                  setCustomAnswer("");
                }}
                className={`flex items-start gap-3 rounded-md border p-3 text-left text-sm transition ${
                  isSelected
                    ? "border-[#00daf3] bg-[#00daf3]/10"
                    : "border-[#3b494c]/40 bg-[#1a1c20] text-[#bac9cc] hover:border-[#00daf3]/40"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-[#00daf3] bg-[#00daf3] text-[#00363d]"
                      : "border-[#3b494c] bg-[#282a2e]"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                <span>{option}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedValue(CUSTOM_VALUE)}
            className={`flex items-start gap-3 rounded-md border p-3 text-left text-sm transition ${
              selectedValue === CUSTOM_VALUE
                ? "border-[#00daf3] bg-[#00daf3]/10"
                : "border-[#3b494c]/40 bg-[#1a1c20] text-[#bac9cc] hover:border-[#00daf3]/40"
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                selectedValue === CUSTOM_VALUE
                  ? "border-[#00daf3] bg-[#00daf3] text-[#00363d]"
                  : "border-[#3b494c] bg-[#282a2e]"
              }`}
            >
              <PenLine className="h-3 w-3" />
            </span>
            <span>Write a custom scope</span>
          </button>

          {selectedValue === CUSTOM_VALUE && (
            <Textarea
              value={customAnswer}
              onChange={(event) => setCustomAnswer(event.target.value)}
              placeholder={question.customPlaceholder}
              className="min-h-24 resize-none rounded border-[#3b494c]/40 bg-[#0c0e12] px-3 py-2 text-sm text-[#e2e2e8] shadow-none placeholder:text-[#bac9cc]/50 focus-visible:border-[#00daf3] focus-visible:ring-[#00daf3]/30"
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded border-[#3b494c]/40 bg-transparent text-[#bac9cc] hover:bg-white/5 hover:text-[#e2e2e8]"
            onClick={() => {
              if (currentQuestion > 0) {
                persistAnswer();
                setCurrentQuestion(currentQuestion - 1);
              }
            }}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button
            type="button"
            className="rounded bg-[#c3f5ff] font-mono text-xs font-bold text-[#00363d] hover:brightness-110"
            disabled={isLoading || !finalAnswer}
            onClick={goNext}
          >
            {currentQuestion === questions.length - 1 ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run research
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded bg-[#3b494c]/50">
          <div
            className="h-full rounded bg-[#00daf3] transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionForm;
