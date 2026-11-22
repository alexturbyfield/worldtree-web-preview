<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wildloom prototype agent instructions

We are in visual-prototype mode, not production-hardening mode.

- Make the smallest change that answers the user's current visual question.
- Preserve deterministic structural, appearance, and scene seeds.
- Keep the current renderer as a fallback; do not rewrite unrelated systems.
- Prefer existing Three.js, TypeScript, and project dependencies; do not add dependencies without explaining why.
- Do not conduct broad web research, comprehensive testing, full lint suites, cross-browser audits, or performance optimization unless requested.
- Run only the cheapest relevant check (e.g. targeted TypeScript check or a quick build if necessary). Do not claim unrun tests passed.
- Do not deploy, commit, or push unless explicitly asked in the task.
- Keep changes localized. If the task will touch more than 3 files or needs architectural changes, briefly propose a smaller slice first.
- At the end report: files changed, visual change, preview instructions, and any obvious caveat, in 5 lines or fewer.
- Use the provided reference images as visual targets. Do not replace reference-driven art direction with generic foliage assumptions.
