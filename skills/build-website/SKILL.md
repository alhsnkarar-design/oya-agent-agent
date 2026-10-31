---
name: build-website
display_name: "AI Website Builder"
description: "Build a complete, responsive multi-page website (HTML/CSS/JS) from a text description and return it as a downloadable ZIP plus a live preview file"
category: development
icon: globe
skill_type: sandbox
catalog_type: addon
tool_schema:
  name: build_website
  description: "Generate a full responsive website from a natural-language description (Arabic or any language). Returns a ZIP of the project and a single-file HTML preview. Can also revise a previous build or package files you wrote yourself."
  parameters:
    type: object
    properties:
      description:
        type: "string"
        description: "Detailed description of the website: purpose, audience, sections, content, features"
      project_name:
        type: "string"
        description: "Short project name used for the folder/ZIP name"
      site_type:
        type: "string"
        description: "e.g. landing page, portfolio, restaurant, e-commerce, blog, company, event"
      language:
        type: "string"
        description: "Content language, e.g. 'ar' or 'en' (Arabic produces an RTL site)"
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
        description: "Pages or sections required, e.g. ['home','menu','about','contact']"
      feedback:
        type: "string"
        description: "Revision instructions to apply to a previous build (use with previous_zip or previous_files)"
      previous_zip:
        type: "string"
        description: "Path of a ZIP returned by an earlier build_website call, to revise it"
      previous_files:
        type: "object"
        description: "Map of path -> content of an earlier build, to revise it"
      files:
        type: "object"
        description: "Package mode: map of path -> content you already wrote; skips AI generation (no API key needed)"
      preview:
        type: "boolean"
        description: "Also produce a single self-contained preview HTML (default true)"
    required: []
---
# AI Website Builder — منشئ المواقع بالذكاء الاصطناعي

Turns a plain-language description into a complete static website: `index.html`,
`css/style.css`, `js/main.js` and any extra pages, with responsive layout, mobile
menu, SEO/Open Graph tags, accessible markup, working forms and RTL support for Arabic.

## Modes
1. **Generate** — pass `description` (+ optional `language`, `style`, `colors`, `pages`).
   Requires one of: `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, or
   `LLM_API_KEY` + `LLM_BASE_URL` (any OpenAI-compatible endpoint). `LLM_MODEL` and
   `LLM_MAX_TOKENS` are optional overrides.
2. **Revise** — pass `feedback` with `previous_zip` (path from the last result) or `previous_files`.
3. **Package** — pass `files` (`{"index.html": "...", "css/style.css": "..."}`) that you
   wrote yourself. No key needed. If generation returns `no_llm_key`, use this mode.

## Output
- ZIP of the project (emitted as a file to the user) and a single-file preview HTML.
- JSON with the file list, notes and validation warnings (missing files, truncation, viewport).
- Deploy by uploading the unzipped folder to Netlify Drop, Vercel, GitHub Pages or Cloudflare Pages.
