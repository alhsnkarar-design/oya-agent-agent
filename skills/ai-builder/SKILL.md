---
name: ai-builder
display_name: "AI Builder — Websites & Apps"
description: "One tool that builds complete websites and full-stack/mobile apps from a text description and returns them as a downloadable ZIP (plus a live preview for websites)"
category: development
icon: code
skill_type: sandbox
catalog_type: addon
tool_schema:
  name: build_project
  description: "Build a complete website or application from a natural-language description (Arabic or any language). Choose the stack: 'website' for a static site, or an app stack. Returns a ZIP of the project (and a single-file preview for website/pwa). Can revise a previous build or package files you wrote yourself."
  parameters:
    type: object
    properties:
      description:
        type: "string"
        description: "What to build: purpose, audience, pages/screens, features, content, business rules"
      stack:
        type: "string"
        enum: ["website", "fullstack-node", "react", "nextjs", "flask", "fastapi", "pwa", "mobile-expo", "flutter"]
        description: "website (default, static HTML/CSS/JS) | fullstack-node (React+Express+SQLite+auth) | react | nextjs | flask | fastapi | pwa | mobile-expo | flutter"
      project_name:
        type: "string"
        description: "Short project name used for the folder/ZIP name"
      language:
        type: "string"
        description: "Content/UI language, e.g. 'ar' or 'en' (Arabic produces RTL)"
      style:
        type: "string"
        description: "Visual style, e.g. modern minimal, luxury dark, playful, corporate"
      colors:
        type: "string"
        description: "Brand colors, e.g. '#0F766E and gold'"
      pages:
        type: "array"
        items:
          type: "string"
        description: "Pages or sections, e.g. ['home','menu','about','contact']"
      features:
        type: "array"
        items:
          type: "string"
        description: "Required app features, e.g. ['login','booking calendar','admin dashboard']"
      entities:
        type: "array"
        items:
          type: "string"
        description: "Main data entities, e.g. ['User','Appointment']"
      auth:
        type: "string"
        description: "Authentication needs, e.g. 'email+password with admin role' or 'none'"
      feedback:
        type: "string"
        description: "Revision instructions for a previous build (use with previous_zip or previous_files)"
      previous_zip:
        type: "string"
        description: "Path of the ZIP returned by an earlier build_project call, to revise it"
      previous_files:
        type: "object"
        description: "Map of path -> content of an earlier build, to revise it"
      files:
        type: "object"
        description: "Package mode: map of path -> content you already wrote; skips AI generation (no API key needed)"
      preview:
        type: "boolean"
        description: "For website/pwa: also produce a single self-contained preview HTML (default true)"
    required: []
---
# AI Builder — منشئ المواقع والتطبيقات بالذكاء الاصطناعي

أداة واحدة: صف ما تريد، واختر `stack`، فتحصل على مشروع كامل جاهز.

| stack | الناتج |
|---|---|
| `website` (الافتراضي) | موقع متجاوب متعدد الصفحات HTML/CSS/JS + ملف معاينة، يدعم RTL |
| `fullstack-node` | React + Vite + Tailwind، خادم Express، SQLite، تسجيل دخول JWT |
| `react` | تطبيق React + TypeScript + Tailwind |
| `nextjs` | Next.js 14 + Prisma + SQLite + NextAuth |
| `flask` | Flask + SQLAlchemy + قوالب Jinja + Flask-Login |
| `fastapi` | FastAPI + SQLModel + واجهة React |
| `pwa` | تطبيق ويب قابل للتثبيت ويعمل دون اتصال + معاينة |
| `mobile-expo` | تطبيق جوال React Native (Expo) |
| `flutter` | تطبيق جوال Flutter |

## Modes
1. **Generate** — `description` + `stack`. Requires `GEMINI_API_KEY`, `OPENROUTER_API_KEY`,
   `OPENAI_API_KEY`, or `LLM_API_KEY` + `LLM_BASE_URL` (any OpenAI-compatible API).
   Optional: `LLM_MODEL`, `LLM_MAX_TOKENS`.
2. **Revise** — `feedback` + `previous_zip` (or `previous_files`).
3. **Package** — `files` you wrote yourself; no key needed (fallback when `no_llm_key` is returned).

## Validation
Checks the HTML entry point and linked files, viewport/truncation for sites; JSON manifests,
Python syntax, README/manifest presence and leftover TODOs for apps. Paths are sanitized.
