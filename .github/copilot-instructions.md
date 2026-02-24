# Copilot Instructions for FortuneWheel

## Project Overview
FortuneWheel is an **MVP** "fortune wheel" web app built with **Next.js 16 (App Router) + TypeScript + React 19**.

### Key constraints (see `AGENTS.md` for full rules)
- MVP scope: players can be anonymous, no complex accounts/payments/multi-language
- Prefer server components; use `'use client'` only when necessary
- Minimize dependencies; add libraries only with clear justification
- Small, reviewable changes (one concern per commit)
- Store secrets in `.env.local`, never commit credentials

## Architecture

### Directory Structure
```
app/
  page.tsx                 # Main player wheel interface
  layout.tsx              # Root layout with metadata
  globals.css             # Tailwind utilities & global styles
  admin/                  # (planned) Admin dashboard
lib/                      # (planned) Helper functions, Firebase integration
PROMPTS/                  # Agent work logs & prompt history
```

### Core Patterns

**Server Components (default)**
- All components in `app/` are server components by default
- Use `'use client'` directive only for interactive features (state, events, hooks)
- Example: `app/page.tsx` uses server-only rendering for initial state

**Path Aliases**
- `@/*` resolves to project root (configured in `tsconfig.json`)
- Use `import { util } from '@/lib/utils'` not relative paths
- Simplifies refactoring and import paths in nested routes

**Styling with Tailwind CSS v4**
- All styling via Tailwind classes; no separate CSS files except `globals.css`
- `globals.css` contains Tailwind directives and global resets
- Dark mode support via `dark:` utility prefix (see `layout.tsx` for example)

**Routing with App Router**
- File-based routing: `app/[slug]/page.tsx` becomes `/[slug]` route
- Layout nesting: `app/admin/layout.tsx` wraps all `/admin/*` routes
- Metadata defined via `Metadata` export in `layout.tsx` or `page.tsx`

## Development Workflow

### Commands
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm start        # Run production server
npm run lint     # Run ESLint (uses Next.js core-web-vitals + TypeScript config)
```

### Key Tools
- **ESLint**: Uses `eslint-config-next` for core-web-vitals + TypeScript rules
  - Config: `eslint.config.mjs` (flat config format)
  - Ignores `.next/`, `out/`, `build/`, `next-env.d.ts`
- **TypeScript**: Strict mode enabled; target ES2017
- **Fonts**: Geist Sans & Mono loaded via `next/font/google`

## Critical Integration Points

### Environment Variables
- Store in `.env.local` (never commit)
- Access in server components: `process.env.YOUR_VAR`
- Available to compiled output only (not client-side unless explicitly passed)

### Planned Integrations (mentioned in `AGENTS.md`)
- **Firebase**: Will be added to `lib/` for backend services
- **Admin area**: Will live in `app/admin/` with separate routes

## Code Guidelines for Agents

1. **When adding features:**
   - Prefer server components; only extract to client if interactivity needed
   - Use Tailwind for all styling
   - Organize helpers in `lib/` with path aliases
   - Add comments only where logic prevents confusion

2. **When modifying files:**
   - Make single-concern changes per commit
   - Keep `app/layout.tsx` focused on metadata & global structure
   - Style variations go in component files using Tailwind, not new CSS

3. **When debugging:**
   - Run `npm run lint` to catch TypeScript & ESLint errors first
   - Check `.next/` is in `.gitignore` (build artifacts shouldn't be committed)
   - Use `npm run dev` to test locally before submitting changes

4. **Testing locally:**
   - After changes: `npm run dev`, open http://localhost:3000
   - Verify Tailwind classes render correctly (especially dark mode)
   - Run `npm run lint` before considering work complete

## Example Patterns

**Server Component with Tailwind:**
```tsx
// app/wheel/page.tsx
export default function WheelPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <h1 className="text-3xl font-bold">Fortune Wheel</h1>
    </div>
  );
}
```

**Client Component (only when interactive):**
```tsx
'use client';
import { useState } from 'react';

export function InteractiveWheel() {
  const [spinning, setSpinning] = useState(false);
  // ... event handlers here
}
```

**Using Path Aliases:**
```tsx
import { spinWheel } from '@/lib/wheel-logic';
import { InteractiveWheel } from '@/app/components/wheel';
```

## References
- **Tech Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, ESLint 9
- **Docs**: Next.js App Router (https://nextjs.org/docs/app)
- **Project Rules**: See [`AGENTS.md`](../AGENTS.md) for complete development guidelines
