# Notes for Claude

- The owner prefers replies in Arabic.
- Registry of installed skills, tools and refused items: `.claude/INSTALLED.md`.
  Read it when asked "what skills/tools are installed", and update it (then
  commit and push) whenever something is installed, removed or refused.
- `skills/` at the repo root belongs to the Oya "Islamic assistant" agent,
  not to Claude Code.
- After any change to the registry, rebuild `.claude/my-skills.zip` (the
  account-level `my-skills` skill) and give it to the owner to re-upload.
