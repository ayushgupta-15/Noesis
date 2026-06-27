'use client'
import { useDeepResearchStore } from '@/store/deepResearch'
import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { CheckCircle2 } from 'lucide-react';

const CompletedQuestions = () => {
    const {questions, answers, isCompleted} = useDeepResearchStore();

    // Safety check: ensure questions is an array
    if(!isCompleted || !Array.isArray(questions) || questions.length === 0) return null;
    return (
        <Accordion type="single" collapsible className="glass-panel rounded-lg px-4">
          <AccordionItem value="item-0" className="border-0">
            <AccordionTrigger className="text-sm hover:no-underline">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#5be9ad]" />
                Research brief locked
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mx-auto pb-4 pt-2">
                <Accordion type="single" collapsible className="w-full">
                  {Array.isArray(questions) && questions.map((question, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-[#3b494c]/40">
                      <AccordionTrigger className="text-left text-sm hover:no-underline">
                        <span className="text-[#e2e2e8]">
                          {question.prompt}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="rounded bg-[#1a1c20] p-3">
                        <p className="text-sm text-[#bac9cc]">{Array.isArray(answers) ? answers[index] : ''}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    } 

export default CompletedQuestions
