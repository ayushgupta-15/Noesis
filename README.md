<div align="center">
  <img src="./public/noesis_banner.png" alt="Noēsis Banner" width="100%" />

  <h1>Noēsis</h1>

  <p><strong>AI-powered Deep Research Workspace that plans, searches, verifies, and generates citation-backed reports with a transparent research pipeline.</strong></p>

  <p>
    <a href="https://noesis-pearl.vercel.app">🌐 Live Demo</a> •
    <a href="#product-screenshots">📸 Screenshots</a> •
    <a href="#architecture">🏗 Architecture</a> •
    <a href="#local-setup">📖 Documentation</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-100%25-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel" alt="Vercel" />
    <img src="https://img.shields.io/github/last-commit/ayushgupta-15/Noesis" alt="Last Commit" />
  </p>

  <br/>
  
  <p align="center">
    <img src="./public/demo.gif" width="900" alt="Noēsis Demo" />
  </p>
</div>

<br/>

## Why Noēsis?

Traditional LLMs produce answers but hide their reasoning.

Noēsis makes AI research transparent by exposing every stage:
- **Query Planning**
- **Source Discovery**
- **Coverage Analysis**
- **Confidence Evaluation**
- **Report Generation**

Every research session is fully auditable.

---

## ✨ Features

- **✅ Multi-stage AI research pipeline**
- **✅ Streaming progress updates**
- **✅ Citation-backed reports**
- **✅ Persistent research history**
- **✅ Local-first architecture**
- **✅ Anonymous session management**

---

## 🛠 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react&logoColor=white)
![Neon Postgres](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Exa AI](https://img.shields.io/badge/Exa_Search-FF4B4B?style=for-the-badge&logo=ai&logoColor=white)

---

<h2 id="product-screenshots">📸 Product Screenshots</h2>

| Landing | Workspace |
|---------|-----------|
| <img src="./public/landing.png" width="400"/> | <img src="./public/workspace.png" width="400"/> |

| Pipeline | Report |
|----------|--------|
| <img src="./public/pipeline.png" width="400"/> | <img src="./public/report.png" width="400"/> |

| History | Architecture |
|---------|--------------|
| <img src="./public/history.png" width="400"/> | <img src="./public/architecture.png" width="400"/> |

---

<h2 id="architecture">🏗 Architecture</h2>

### 📁 Repository Structure

```text
src/
 ├── app/
 ├── components/
 ├── lib/
 ├── store/
 ├── types/
 └── utils/
```

### 🔄 Research Pipeline

```text
       User Query
           │
           ▼
  Clarifying Questions
           │
           ▼
    Research Planner
           │
           ▼
       Web Search
           │
           ▼
     Deduplication
           │
           ▼
   Coverage Analysis
           │
           ▼
    Confidence Gate
           │
           ▼
      Final Report
           │
           ▼
    Markdown Export
```

### 🌐 API Architecture

```text
       Client
          │
          ▼
       Next.js
          │
          ▼
    Research API
          │
          ▼
     OpenRouter
          │
          ▼
     Exa Search
          │
          ▼
      Postgres
```

---

## ⚡ Performance

- **✓ Streaming responses**
- **✓ Incremental rendering**
- **✓ Route-safe state persistence**
- **✓ Cached session loading**
- **✓ Local-first fallback**
- **✓ Lazy loading**
- **✓ Optimistic UI**

---

## 🧗 Engineering Challenges

- **Streaming AI responses without UI freezing:** Implemented careful chunking and React state batching.
- **Session persistence:** Built a resilient store falling back to local storage when Postgres is unavailable.
- **Route-safe streaming:** Ensured the AI stream isn't interrupted or lost during Next.js client-side navigation.
- **Duplicate source removal:** Robust hashing and URL normalization for Exa search results.
- **Confidence scoring:** Used a specialized evaluator LLM pass to gate the report generation.
- **Anonymous multi-session users:** Implemented HTTP-only visitor cookies to securely link multiple sessions without forced signups.
- **Local-first storage:** Allows developers to run the entire app without a database using `.noesis/sessions.json`.
- **Production database fallback:** Seamlessly switches to Neon Postgres in production environments.

---

## 🚀 Production Ready

- **✓ Rate limiting**
- **✓ Error boundaries**
- **✓ Retry logic**
- **✓ Health endpoint** (`/api/health/db`)
- **✓ Environment validation**
- **✓ Persistent storage**
- **✓ Export service**
- **✓ Anonymous authentication**
- **✓ Responsive UI**

---

## 🧠 Key Learnings

- Building streaming AI interfaces
- Managing long-running workflows
- Architecting local-first persistence
- Designing transparent AI systems
- Production deployment with Vercel + Neon

---

## 📊 Statistics

- **100% TypeScript**
- **Local-first architecture**
- **Streaming AI pipeline**
- **Anonymous session persistence**
- **Markdown report export**
- **PostgreSQL support**

---

<h2 id="local-setup">💻 Quick Start & Setup</h2>

**1. Clone the repository**
```bash
git clone https://github.com/ayushgupta-15/Noesis.git
cd Noesis
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.local.example .env.local
```
Add your keys for `OPENROUTER_API_KEY` and `EXA_SEARCH_API_KEY`. `DATABASE_URL` is optional locally.

**4. Run the development server**
```bash
npm run dev
```

---

## 🔮 Roadmap

- Multi-agent research
- PDF export
- Team workspaces
- Citation verification
- Graph knowledge extraction
- Voice research
- Research sharing

---

## ⚖️ License

MIT License

---

## 🙏 Acknowledgements

- Vercel AI SDK
- OpenRouter
- Exa
- Next.js

---

## ⭐️ Social Proof

If you found this project useful or interesting, please **⭐ Star the repository**! It helps a lot.
