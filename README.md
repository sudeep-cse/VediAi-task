# VedaAI — AI Assessment Creator

A full-stack application where a teacher can **create an assignment**, **generate a question paper using AI**, and **view the structured output** as a real exam paper. Built to match the provided Figma design, with a scalable backend (queues + workers + real-time updates).

---

## ✨ Features

- **Assignment creation form** — file upload (optional), due date, multiple question types with per-type count & marks, additional instructions. Fully validated (no empty/negative values) with **Zustand** state management.
- **AI question generation** — form input is converted into a **structured prompt**; the model returns **strict JSON** which is validated/parsed with Zod into sections, questions, difficulty (`easy`/`moderate`/`hard`), and marks. **Raw AI text is never rendered.**
- **Scalable backend** — Express API → **BullMQ** job queue → **Worker** processes generation → result stored in **MongoDB** + cached in **Redis** → frontend notified via **Socket.io** (worker → Redis pub/sub → API → WebSocket).
- **Exam-style output page** — school/subject/class header, student info lines, sections (A, B, C…) with instructions, numbered questions, **color-coded difficulty badges**, marks, and an answer key.
- **Bonus** — **PDF download** (properly formatted via PDFKit, not HTML print), **Regenerate**, live **progress bar over WebSocket**, **Redis caching**, mobile-responsive UI.

---

## 🏗 Architecture

```
                          ┌──────────────────────────────────────────┐
                          │                FRONTEND                    │
                          │  Next.js (App Router) · Zustand · Tailwind │
                          │                                            │
   Create Assignment ─────┼──► POST /api/assignments                   │
                          │            │                               │
                          │            ▼                               │
                          │   subscribe(paperId) over Socket.io ◄──────┼─────┐
                          └────────────┼──────────────────────────────┘     │
                                       │                                     │
        ┌──────────────────────────────▼─────────────────────────────┐      │
        │                          BACKEND (API)                       │     │
        │  Express · Mongoose · Socket.io                              │     │
        │                                                              │     │
        │  1. validate (Zod)                                           │     │
        │  2. save Assignment + GeneratedPaper(status=queued) [Mongo]  │     │
        │  3. enqueue job ─────────────► BullMQ (Redis)                │     │
        │  6. Redis pub/sub ──► emit paper:progress/completed (WS) ────┼─────┘
        └──────────────────────────────┬───────────────────────────────┘
                                       │ job
                          ┌─────────────▼──────────────────────────────┐
                          │                 WORKER                       │
                          │  BullMQ Worker (separate process)            │
                          │  4. build prompt → call AI → parse JSON       │
                          │  5. save structured paper [Mongo] + cache     │
                          │     [Redis] + publish events [Redis pub/sub]  │
                          └──────────────────────────────────────────────┘
```

Because the worker is a **separate process**, it can't emit Socket.io events directly. It publishes progress to a Redis pub/sub channel; the API process subscribes and re-emits to the correct Socket.io room. This keeps the system horizontally scalable (multiple API instances + multiple workers).

---

## 🧰 Tech Stack

| Layer      | Tech                                                                 |
|------------|----------------------------------------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript, Zustand, Tailwind CSS, socket.io-client |
| Backend    | Node.js, Express, TypeScript                                         |
| Database   | MongoDB (Mongoose)                                                   |
| Cache/Queue| Redis (ioredis), BullMQ                                              |
| Real-time  | Socket.io (+ Redis pub/sub bridge)                                   |
| AI         | Anthropic Claude **or** OpenAI — with a built-in **mock** provider   |
| PDF        | PDFKit                                                               |

---

## 📁 Project Structure

```
ai-assessment-creator/
├── docker-compose.yml          # MongoDB + Redis for local dev
├── README.md
├── backend/
│   ├── .env.example
│   └── src/
│       ├── index.ts            # API server entry (HTTP + Socket.io + Redis bridge)
│       ├── app.ts              # Express app
│       ├── config/             # env, db (mongoose), redis (ioredis)
│       ├── models/             # Assignment, GeneratedPaper (Mongoose)
│       ├── controllers/        # assignment + paper controllers
│       ├── routes/             # REST routes
│       ├── queues/             # BullMQ queue definition
│       ├── workers/            # BullMQ worker (AI generation)
│       ├── services/           # ai, prompt.builder, parser, pdf, cache, events
│       ├── websocket/          # Socket.io server + emit helpers
│       ├── middleware/         # zod validation + error handler
│       ├── types/              # shared domain types
│       └── utils/              # logger
└── frontend/
    ├── .env.example
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx            # → /assignments
        │   ├── assignments/        # list + empty state
        │   ├── create/             # create form
        │   └── papers/[id]/        # generation progress + output paper
        ├── components/
        │   ├── layout/             # Sidebar, Topbar, AppShell, Logo
        │   ├── assignments/        # AssignmentCard, EmptyState
        │   ├── create/             # FileUpload, QuestionTypeRow, Stepper
        │   ├── paper/              # QuestionPaper, SectionBlock, QuestionItem, DifficultyBadge, GenerationProgress
        │   └── ui/                 # Button, Input, Select, NumberStepper
        ├── store/                  # Zustand: assignmentStore, paperStore
        ├── services/               # api (REST), socket (Socket.io client)
        ├── hooks/                  # useGenerationStatus
        ├── types/                  # shared types
        └── lib/                    # utils (cn, date helpers)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker (recommended, for MongoDB + Redis) — or local Mongo/Redis installs

### 1. Start MongoDB & Redis
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # works out-of-the-box with AI_PROVIDER=mock
npm install
npm run dev                   # runs the API and the worker together
```
The API starts on `http://localhost:4000`.

> `npm run dev` runs **both** the API (`dev:api`) and the **worker** (`dev:worker`) via `concurrently`.
> In production run them separately: `npm run build && npm start` and `npm run start:worker`.

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:3000`.

### 4. Use it
1. Click **Create Assignment**.
2. Fill in the form and hit **Next** → you're taken to the output page.
3. Watch the **live progress bar** (WebSocket) → the structured paper renders.
4. **Download as PDF** or **Regenerate**.

---

## 🔑 Using a real AI provider

The app ships with `AI_PROVIDER=mock` so the entire pipeline runs **without any API key**. To use a real model, edit `backend/.env`:

**Claude (Anthropic):**
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

**OpenAI:**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

No code changes are required — the provider is selected at runtime in `services/ai.service.ts`.

---

## 🔌 API Reference

| Method | Endpoint                      | Description                                   |
|--------|-------------------------------|-----------------------------------------------|
| POST   | `/api/assignments`            | Create assignment + enqueue generation        |
| GET    | `/api/assignments`            | List assignments                              |
| GET    | `/api/assignments/:id`        | Get one assignment                            |
| DELETE | `/api/assignments/:id`        | Delete assignment + its papers                |
| GET    | `/api/papers/:id`             | Get structured paper (Redis cache → Mongo)    |
| GET    | `/api/papers/:id/status`      | Live job status (`queued`/`processing`/…)     |
| POST   | `/api/papers/:id/regenerate`  | Re-run generation for the same assignment     |
| GET    | `/api/papers/:id/pdf`         | Download formatted PDF                         |

**WebSocket events** (Socket.io): client emits `subscribe`/`unsubscribe` with a `paperId`; server emits `paper:progress`, `paper:completed`, `paper:failed`.

---

## 🧠 AI prompt & parsing

- `services/prompt.builder.ts` turns the form into a deterministic prompt that **forces a strict JSON schema** (sections → questions → `difficulty`, `marks`, `answer`).
- `services/parser.ts` extracts the first balanced JSON object (robust to stray prose/code fences), validates it with **Zod**, normalizes difficulty values, and computes question numbers + totals.
- The result is a typed `StructuredPaper`. The frontend renders **only** these structured fields — never raw model text.

---

## ✅ Validation rules
- All context fields (title, subject, class, school) required.
- Due date required, must be `DD-MM-YYYY`.
- At least one question type; each needs a type and **positive** count & marks (no zero/negative).
- Backend re-validates everything with Zod (defense in depth).

---

## 📝 Notes
- Fonts (Plus Jakarta Sans + Lora) load via a runtime `<link>`; the build needs no network access.
- Redis caches completed papers (`CACHE_TTL_SECONDS`, default 24h) so re-opening a paper is instant.
- The frontend has a polling fallback in `useGenerationStatus` in case a socket event is missed.
