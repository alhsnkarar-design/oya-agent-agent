---
name: build-app
display_name: "AI App Builder"
description: "Build a complete, runnable application (frontend + backend + database, PWA, or mobile app) from a text description and return it as a downloadable ZIP"
category: development
icon: code
skill_type: sandbox
catalog_type: addon
tool_schema:
  name: build_app
  description: "Generate a full runnable application from a natural-language description in a chosen stack. Returns a ZIP containing source, configs, .env.example and a README with run/deploy steps. Can revise a previous build or package files you wrote yourself."
  parameters:
    type: object
    properties:
      description:
        type: "string"
        description: "What the app does: users, main screens, features, business rules"
      stack:
        type: "string"
        enum: ["fullstack-node", "react", "nextjs", "flask", "fastapi", "pwa", "mobile-expo", "flutter"]
        description: "Technology stack (default fullstack-node: React+Vite client, Express+SQLite API, JWT auth)"
      project_name:
        type: "string"
        description: "Short project name used for the folder/ZIP name"
      features:
        type: "array"
        items:
          type: "string"
        description: "Required features, e.g. ['login','booking calendar','admin dashboard','search']"
      entities:
        type: "array"
        items:
          type: "string"
        description: "Main data entities, e.g. ['User','Appointment','Doctor']"
      auth:
        type: "string"
        description: "Authentication needs, e.g. 'email+password with admin role' or 'none'"
      language:
        type: "string"
        description: "UI language, e.g. 'ar' or 'en' (Arabic produces RTL UI)"
      style:
        type: "string"
        description: "Visual style of the UI"
      feedback:
        type: "string"
        description: "Revision instructions to apply to a previous build (use with previous_zip or previous_files)"
      previous_zip:
        type: "string"
        description: "Path of a ZIP returned by an earlier build_app call, to revise it"
      previous_files:
        type: "object"
        description: "Map of path -> content of an earlier build, to revise it"
      files:
        type: "object"
        description: "Package mode: map of path -> content you already wrote; skips AI generation (no API key needed)"
    required: []
---
# AI App Builder — منشئ التطبيقات بالذكاء الاصطناعي

Turns a plain-language description into a complete, runnable project.

| stack | What you get |
|---|---|
| `fullstack-node` | React + Vite + Tailwind client, Express REST API, SQLite, JWT auth |
| `react` | React + Vite + TypeScript + Tailwind single-page app |
| `nextjs` | Next.js 14 App Router, Prisma + SQLite, NextAuth |
| `flask` | Flask + SQLAlchemy + Jinja templates, Flask-Login |
| `fastapi` | FastAPI + SQLModel backend, React frontend |
| `pwa` | Installable offline PWA (no build step) + preview file |
| `mobile-expo` | React Native (Expo) mobile app |
| `flutter` | Flutter (Material 3) mobile app |

## Modes
1. **Generate** — `description` + `stack` (+ `features`, `entities`, `auth`, `language`).
   Requires `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, or `LLM_API_KEY` +
   `LLM_BASE_URL`. Optional: `LLM_MODEL`, `LLM_MAX_TOKENS`.
2. **Revise** — `feedback` + `previous_zip` (or `previous_files`).
3. **Package** — `files` you wrote yourself; no key needed (fallback when `no_llm_key` is returned).

## Validation
Checks JSON manifests parse, Python files compile, README / manifest presence, and
flags leftover TODO/placeholder code. Warnings are returned so issues can be fixed
with a revision call.
