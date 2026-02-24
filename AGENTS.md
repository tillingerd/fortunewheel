# Agent Rules (FortuneWheel)

## Goal
Build an MVP “fortune wheel” web app in Next.js (App Router) + TypeScript.
Primary focus: fast iteration with AI agents, clean structure, minimal scope.

## Non-goals (for MVP)
- No complex user accounts (players can be anonymous)
- No payments
- No multi-language
- No heavy design system

## Tech constraints
- Next.js App Router
- TypeScript
- Keep it simple: prefer server components unless client is needed
- Avoid adding libraries unless there is a clear need

## Working rules
- Make small, reviewable changes (one concern per commit).
- Prefer editing existing files over adding many new ones.
- Add comments only where it prevents confusion.
- Don’t commit secrets. Use `.env.local` for keys.

## Project structure (target)
- app/
  - page.tsx (player wheel)
  - admin/ (admin area)
- lib/ (helpers, firebase later)
- PROMPTS/ (agent prompts & logs)
- SPEC.md (MVP scope)

## Output expectations for changes
When implementing a feature, include:
- What changed (bullet list)
- Files touched
- How to test locally (exact commands)