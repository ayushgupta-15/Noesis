"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDeepResearchStore } from "@/store/deepResearch";
import { ArrowUp, Loader2, Search, Square } from "lucide-react";

const formSchema = z.object({
  input: z.string().min(2).max(200),
});

const UserInput = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { reset, setQuestions, setTopic, topic, questions, activities, report } = useDeepResearchStore();
  const hasStarted = questions.length > 0 || activities.length > 0 || Boolean(report);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      reset();
      
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: values.input }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      setTopic(values.input);
      setQuestions(data.questions ?? []);
      form.reset();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="glass-panel rounded-lg p-4">
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase text-[#bac9cc]">
        Topic Intake
      </p>
      <Form {...form}>
        {hasStarted ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="recessed-input flex min-h-12 flex-1 items-center gap-3 rounded border border-[#3b494c]/40 px-3">
              <Search className="h-4 w-4 shrink-0 text-[#00daf3]" />
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase text-[#bac9cc]">Active brief</p>
                <p className="truncate text-sm text-[#e2e2e8]">{topic}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded border-[#3b494c]/40 bg-[#282a2e] font-mono text-xs text-[#bac9cc] hover:bg-[#333539] hover:text-[#e2e2e8]"
              onClick={() => {
                reset();
                form.reset();
              }}
            >
              <Square className="mr-2 h-3.5 w-3.5" />
              Stop / reset
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 md:flex-row">
            <FormField
              control={form.control}
              name="input"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="recessed-input relative rounded border border-[#3b494c]/40">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Ask Noēsis to research..."
                        {...field}
                        className="h-12 rounded border-0 bg-transparent pl-9 pr-12 text-[#e2e2e8] shadow-none placeholder:text-[#bac9cc]/50 focus-visible:ring-0"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-12 w-12 rounded bg-[#c3f5ff] p-0 text-[#00363d] hover:brightness-110"
              disabled={isLoading}
              aria-label="Start brief"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
      </Form>
    </section>
  );
};

export default UserInput;
