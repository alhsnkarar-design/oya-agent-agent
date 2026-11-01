# بنّاء (Bannaa) — AI mobile-app builder

Describe an app in Arabic or English; an AI agent writes a React Native / Expo
project, you see it running in a phone-frame preview, and you keep changing it
by chat. Written from scratch; all code belongs to the project owner.

`بنّاء` is a placeholder name until `/replica-brand` runs.

## Run it

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY, or leave empty for demo mode
npm run dev                  # http://localhost:3000
```

Without `ANTHROPIC_API_KEY` the app runs in **demo mode**: every prompt gets
the same sample to-do app, clearly labelled, so the whole flow can be tried
without AI costs.

## How it works

| part | file |
| --- | --- |
| landing page + prompt box | `app/page.tsx` |
| editor (chat, phone preview, code) | `components/Editor.tsx` |
| coding agent (Claude, `write_file` / `delete_file` tools, streaming) | `lib/agent.ts` |
| demo mode | `lib/demo.ts` |
| in-browser preview (Babel + react-native-web, no CDN) | `lib/preview.ts`, `scripts/build-runtime.mjs` |
| project storage (JSON files in `.data/`, to be replaced by a database) | `lib/store.ts` |
| API | `app/api/projects/**`, `app/preview/[id]` |

Screenshots: `docs/home.png`, `docs/editor.png`.

## Next (phase 2)

- Accounts and database (Supabase), projects per user
- Subscriptions and credits with **Lemon Squeezy** (checkout, customer portal, webhooks)
- Version history and restore, download as zip
- Pricing, privacy and terms pages; deploy on your own domain
