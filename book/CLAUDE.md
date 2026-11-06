# Book project: The Online Income & AI Skills Blueprint

## Governing policy (highest priority)

The editorial policy in `EDITORIAL_POLICY_AR.md` (Arabic: "Mandatory appendix: credibility, research and fact-checking controls") governs this whole project. When it conflicts with any other instruction, accuracy, honesty and documentation win over length, persuasion or marketing tone.

Summary of the binding rules:

1. Never invent facts, numbers, prices, fees, platform rules, tool names, success stories, testimonials, quotes, or sources.
2. Changeable facts (prices, fees, eligibility rules, features) must come from an official source opened at production time, with the date it was checked. If that cannot be done, the fact is omitted and the reader is directed to the official page.
3. A search-engine summary or snippet is not verification. Facts that rely only on search summaries are logged as `partially verified` and are not stated as hard numbers in the book unless clearly labelled.
4. Every hypothetical example is labelled "Hypothetical example — not a documented success story".
5. Conceptual diagrams are labelled "Conceptual illustration — not statistical data".
6. No guaranteed-income language, no timelines for earnings, no "passive income" promises.
7. Keep `SOURCES.md`, `FACT_CHECK_LOG.md`, `ASSUMPTIONS_AND_LIMITATIONS.md` and `CHANGELOG.md` consistent with the manuscript.
8. Do not declare the book final until the acceptance criteria in section 14 of the policy are met; report honestly what remains unverified.

## Layout

- `manuscript/` — Markdown chapters (pandoc fenced divs for callouts)
- `figures/` — original SVG diagrams
- `assets/cover.png` — supplied cover (do not redesign)
- `styles/` — print and EPUB CSS
- `build.sh` — builds `build/*.pdf`, `build/*.epub`, `build/*.html`
