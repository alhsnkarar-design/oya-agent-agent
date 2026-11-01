# Recon map: Rork (web app, builds iOS/Android apps)

Scope: the core loop of an AI mobile-app builder: describe an app, the AI
writes a React Native / Expo project, preview it live and on a phone, iterate
by chat, sync to GitHub, sell it as a subscription with monthly credits.
For: a general product sold on subscription, competing with Rork.
Date: 2026-11-01
Status: **DRAFT from secondary sources.** rork.com, docs.rork.com and the
review sites are blocked by this environment's network policy (403 / DNS).
Everything below comes from web-search summaries of public pages. Every row
marked `medium` or `guess` must be checked against rork.com once it is
reachable, or against the user's own Rork account.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | official FAQ | https://rork.com/en/faq | blocked here; seen only as a search hit |
| 2 | official docs (Expo) | https://docs.rork.com/rork-expo.md | blocked; snippet confirms Expo Go + QR preview |
| 3 | review | https://www.banani.co/blog/rork-ai-review | via search summary: prompt -> RN/Expo app, chat refinement, Rork Max (Swift) |
| 4 | tutorial | https://aiindigo.com/tutorials/getting-started-with-rork-build-a-react-native-app-in-minutes | Preview button top-right -> QR -> Expo Go; link GitHub after sign-up |
| 5 | generated project README | https://github.com/wtmaxim/Taskly | Rork commits to GitHub automatically; two-way sync; EAS build/submit; web export |
| 6 | generated project | https://github.com/dtjohnson83/Repverse | same README pattern |
| 7 | published sample app | https://learn-anything-in-5minutes.rork.app/ | apps get a `*.rork.app` web URL |
| 8 | pricing | https://vp0.com/blogs/rork-pricing-plans-2026/ | Free + Junior $25/100 msgs, Middle $50/250, Senior $100/500, Scale 1K $200/1000, up to $1,800 |
| 9 | pricing | https://bilt.me/blog/rork-pricing | conflicting: Pro $20/100 credits, Max $200/1000 |
| 10 | pricing | https://marcandrews.com/rork-pricing-uk-2026-ai-app-builder-cost-breakdown/ | UK prices, conflicting |
| 11 | reviews | https://ca.trustpilot.com/review/rork.com | TrustScore ~2.1/5; complaints listed below |
| 12 | review | https://www.superappp.com/blog/rork-review-2026-pricing-real-reviews-and-is-it-worth-it | "improving, depends on which build you catch" |

To add when reachable: rork.com home, /pricing, changelog, docs index, terms
of service (check for any clause against using an account to build a
competitor), public YouTube walkthroughs.

## Core loop

Type what app you want -> the AI builds a working Expo app you can tap on
your phone in minutes -> keep chatting to change it. Users pay for AI
messages (credits).

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen | confidence |
| --- | --- | --- | --- | --- | --- | --- |
| S01 | landing + prompt box | `/` | pitch, start a project from a prompt | hero, big prompt textarea, example prompts, model picker (Pro / Max), sign-in | empty, typing, not signed in | medium |
| S02 | sign up / sign in | modal or `/login` | account | email, Google / Apple / GitHub OAuth | error | guess |
| S03 | project list | dashboard | open or create projects | project cards, new project, search | empty, filled | guess |
| S04 | editor: chat | `/p/:id` left panel | talk to the AI, see its steps | message list, streaming status, file-change summaries, input, attach image, credits left | generating, error, out of credits | medium |
| S05 | editor: preview | `/p/:id` right panel | see the app run | phone frame (web preview), device switch, reload, console errors, "Fix with AI" | building, running, crashed | medium |
| S06 | preview on device | Preview button top-right | run on a real phone | QR code modal, Expo Go instructions | building (minutes), ready | high (2, 4) |
| S07 | editor: code | tab in editor | read / edit files | file tree, code editor | read-only?, dirty | guess |
| S08 | GitHub connect | settings or editor | backup and two-way sync | connect button, repo picker | connected, error | high (4, 5) |
| S09 | publish | editor menu | web URL, App Store / Play | `*.rork.app` link, store submit steps | in progress, failed | medium (5, 7); store submit reported broken (11) |
| S10 | pricing / billing | `/pricing`, account | buy plan, see credits | plan cards, monthly/annual, credits meter, Stripe checkout/portal | free, paid, out of credits | medium (8, 9) |
| S11 | settings / account | account menu | profile, plan, connections, delete | forms | | guess |
| S12 | version history | editor | go back to an earlier state | list of checkpoints, restore | | guess |

## Flows

```
F01 Create an app from a prompt
    S01 type prompt -> S02 sign up (first time) -> S04/S05 AI generates, preview appears
    happy path clicks: ~3 + sign up
    edge: prompt too vague, generation fails mid-way, out of credits, very long prompt, image attached

F02 Iterate by chat
    S04 send change -> AI edits files -> S05 preview reloads
    edge: AI breaks the build, "Fix with AI" loops (complaint 11), credits charged for fixes (11)

F03 Try it on my phone
    S05 Preview button -> S06 QR -> scan in Expo Go
    happy path clicks: 1 + scan
    edge: native modules not in Expo Go (Face ID, IAP, widgets need a dev build), build takes minutes

F04 Back up / own the code
    S08 connect GitHub -> every AI change committed; local pushes sync back (5)
    edge: merge conflicts between local edits and AI edits

F05 Publish
    S09 web link (*.rork.app) / EAS build + submit for stores (5)
    edge: user has no Apple/Google developer account; review rejection; reported failures (11)

F06 Pay
    S10 pick plan -> checkout -> credits added monthly
    edge: credits reset monthly and do not roll over (11), currency not converted (11), cancel
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Prompt box | hero, chat input | empty, typing, sending, disabled (no credits) | S01, S04 |
| Chat message | user, AI, AI-step (file edited, command run), error | streaming, done, failed | S04 |
| Phone frame preview | iOS, Android, web | loading, running, crashed | S05 |
| QR modal | | building, ready, expired | S06 |
| File tree + code editor | | clean, dirty, read-only | S07 |
| Credits meter | header, billing | normal, low, empty | S04, S10 |
| Plan card | free, paid tiers, monthly/annual | current, upgrade | S10 |
| Project card | | default, hover | S03 |
| Button, input, modal, toast, menu, tabs | standard | default, hover, focus, disabled, loading | all |

## Inferred data model

```
User          id, email, name, avatar, auth_provider, created_at
              evidence: S02; confidence: high (any SaaS)
Subscription  user_id, plan, status, period_end, stripe_customer_id, stripe_subscription_id
              evidence: S10, sources 8-11; confidence: high
CreditLedger  user_id, delta, reason (monthly_grant | message | refund | purchase), message_id, created_at
              evidence: monthly reset, per-message charge (8, 11); confidence: medium
Project       id, user_id, name, prompt, model (pro | max), web_slug, github_repo, created_at
              evidence: S03, S07 (*.rork.app), S08; confidence: medium
Message       id, project_id, role, content, attachments, credits_charged, created_at
              evidence: S04; confidence: high
Version       id, project_id, message_id, git_commit_sha, created_at
              evidence: GitHub auto-commit per change (5); confidence: medium
File          (lives in git / object storage per version, not rows)  confidence: guess
Build         id, project_id, version_id, kind (preview | web | ios | android), status, url, logs
              evidence: S06, S09; confidence: medium
```

Relationships: User 1-1 Subscription, User 1-n Project, User 1-n CreditLedger,
Project 1-n Message, Project 1-n Version, Version 1-n Build.

## Feature matrix

See `features.csv`. Must: 17, should: 10, could: 7, skip: 2.

## Out of scope (cannot or should not be cloned)

- Rork's brand, name, logo, copy, the `*.rork.app` domain and its showcase apps.
- Rork Max (native Swift apps built on the web): needs a macOS build farm. Skip for v1.
- Direct App Store / Play submission from the browser: v1 gives EAS commands and a guide instead.
- Their model choices and prompts: we use official LLM APIs (e.g. Claude) with our own keys and write our own agent prompts.

## What users complain about (input for /replica-entrepreneur)

From Trustpilot (11) and reviews (12), all to be re-read and linked properly:
credits charged for "free" AI fixes, fix loops with no memory, unused credits
lost at month end with no warning, store publishing failing, slow or missing
human support, prices not converted to local currency.

## Size

Screens 12, flows 6, entities 7. Hard parts:
1. Running untrusted generated code safely and previewing it fast (sandboxed
   Metro/Expo bundler per project, web preview + Expo Go tunnel).
2. The coding agent's quality: planning, editing many files, reading build
   errors and fixing them without looping.
3. Unit economics: LLM cost per message vs. price per credit.
Also: GitHub two-way sync, streaming UI, Stripe credits.

Size: **L** (a quarter) for a solid v1; the vertical slice (prompt -> code ->
web preview) is a few weeks.
