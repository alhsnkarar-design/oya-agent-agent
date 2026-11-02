# Installed skills and tools (registry)

Keep this list current: add a row whenever a skill or tool is installed,
removed or refused in a session on this repository.

## Skills installed in this repo (`.claude/skills/`)

| pack | source | skills | installed |
| --- | --- | --- | --- |
| Replica | https://github.com/Jakeschincariol/replica-skill (MIT) | replica-recon, replica-architect, replica-design, replica-build, replica-backend, replica-test, replica-diff, replica-entrepreneur, replica-brand, replica-launch, replica-deploy | 2026-11-01 |
| Instagram | https://github.com/Jakeschincariol/instagram-agent-skill (MIT) | ig-reel, ig-viral, ig-caption, ig-carousel, ig-story, ig-profile, ig-plan, ig-human, ig-comment, ig-reply, ig-dm, ig-repurpose, ig-audit (voice template: `.claude/instagram/voice.template.md`) | 2026-11-02 |
| Impeccable | https://github.com/pbakaus/impeccable v4.8.0 (Apache-2.0) | impeccable (frontend design: shape, audit, critique, polish, animate, typeset, colorize, ... 24 commands) + agents in `.claude/agents/`: impeccable-asset-producer, impeccable-documenter, impeccable-finish-reviewer, impeccable-manual-edit-applier. Plugin hooks NOT installed (they auto-run and download a binary engine after every edit). | 2026-11-02 |

## Account skills (enabled in the owner's Claude account, synced into every session)

Not copied here (Anthropic proprietary licenses); they are already present in
every session. Invoke them with the Skill tool as `anthropic-skills:<name>`.

| skill | what it does |
| --- | --- |
| docx | Word documents: create, read, edit |
| pdf | PDF: read, merge, split, fill forms, OCR |
| pptx | PowerPoint decks |
| xlsx | Excel / CSV spreadsheets |
| docs | Editable, shareable Claude docs |
| google-workspace | Edit Google Docs, Sheets, Slides |
| deep-research | Multi-source research with a written report |
| skill-creator | Create, improve and test skills |
| web-artifacts-builder | Advanced interactive web pages (React, Tailwind) |
| morning | Daily morning brief |
| import-memory | Import memory from another assistant |
| built-in-browser | The browser pane in the Claude app |
| chrome-browser | Claude in Chrome (the person's own Chrome) |
| computer-use | Control apps on the person's computer (needs the desktop app with Computer use on and the computer linked) |

Account plugin: `servicenow-sdk` (skill `servicenow-sdk:now-sdk`).

## Tools installed

| tool | source | what it does | reinstall | installed |
| --- | --- | --- | --- | --- |
| Headroom (`headroom`, Python `headroom-ai` 0.42.0) | https://github.com/headroomlabs-ai/headroom (Apache-2.0) | Compresses what an AI agent reads (tool output, logs, files, history) before it reaches the model; tested here: 6,213 -> 2,372 tokens (62% saved) on a 300-line log, error line kept. Library `from headroom import compress`, CLI, proxy, MCP server. | `python3 -m venv ~/.venvs/headroom && ~/.venvs/headroom/bin/pip install headroom-ai` (add `[proxy]` for the proxy/MCP), then link `~/.venvs/headroom/bin/headroom` into PATH. Do NOT run `headroom wrap claude` or install its plugin hooks without the owner asking: they reroute all Claude traffic and run on every command. | 2026-11-02 |

## Tools tried and removed

| tool | what happened | date |
| --- | --- | --- |
| OmniRoute (`npm i -g omniroute`, MIT) | installed in the cloud session, server started, then uninstalled at the owner's request with its data folder | 2026-11-02 |

## Refused

| item | reason | date |
| --- | --- | --- |
| https://github.com/guillaumemeyer/watermarks-remover | built to strip AI-provenance watermarks and evade detection (includes a watermark-stealing/spoofing module) | 2026-11-02 |

## Projects in this repo

| folder | what |
| --- | --- |
| `builder/` | Bannaa (placeholder name): AI mobile-app builder, phase 1 done. Next: Supabase auth/db, Lemon Squeezy billing (not Stripe). |
| `replica/` | Recon map and feature matrix for the Rork-style builder |

## Account-level copy

`.claude/my-skills.zip` packs this registry plus full copies of every
installed skill as one skill named `my-skills`. Uploaded in claude.ai under
Customize, Skills, it syncs into every session in every repository. Rebuild
and re-upload it whenever this registry changes.
