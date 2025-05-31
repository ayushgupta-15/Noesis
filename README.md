# 🧠 Noēsis – Deep Research AI Agent

Noēsis is an intelligent and modular **Deep Research AI Agent** built with cutting-edge technologies like **Next.js**, **Vercel AI SDK**, and powerful **LLMs (GPT-4o, Gemini, Deepseek)**. It autonomously asks clarifying questions, generates optimal search queries, retrieves the most relevant results via **Exa Search**, and compiles them into comprehensive reports.

---

## 🚀 Key Features

- 🔧 **Fully Customizable Research Flow**  
  Modular pipeline that allows flexible iteration and configuration of research stages.

- 🔍 **Adaptive Search Query Generation**  
  Automatically refines and evolves search queries based on previous findings and analysis.

- ⚙️ **Seamless LLM Integration**  
  Plug-and-play integration with top LLMs: GPT-4o, Gemini, Deepseek (via OpenRouter).

- ♻️ **Iterative Research Loop**  
  Loop-based engine that performs multiple research iterations until content is sufficient for reporting.

- 💼 **Modular Components**  
  Cleanly separated concerns for planning, querying, analysis, extraction, and reporting.

- 🌐 **Built with Next.js & Vercel AI SDK**  
  Uses the latest **App Router** architecture for clean routing and performance.

---

## 🛠️ Tech Stack

| Category        | Technology                            |
|----------------|----------------------------------------|
| **Framework**   | Next.js 15 (App Router)                |
| **Styling**     | Tailwind CSS, Shadcn UI                |
| **LLMs**        | GPT-4o, Gemini, Deepseek (via OpenRouter) |
| **AI SDK**      | Vercel AI SDK                          |
| **Web Search**  | Exa Search API                         |
| **Language**    | TypeScript                             |
| **UI Library**  | Shadcn Components                      |

---

## 🧩 Architecture Overview

```mermaid
graph TD
  A[User Input: Topic] --> B[Clarification Questions]
  B --> C[LLM: Generate Clarifications]
  C --> D[Planner: Generate Search Queries]
  D --> E[Search via Exa API]
  E --> F[Analyzer: Assess Info Sufficiency]
  F -->|Sufficient| G[Extractor: Create Structured Summary]
  F -->|Not Sufficient| D
  G --> H[Reporter: Final Markdown Report]
