# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Commands

- `bun install` — dependencies (never npm/npx).
- `bun run dev` — Vite dev server on port 3000.
- `bun run lint` — `tsc --noEmit`. The only static check; there is no test suite.
- `bun run build` — production bundle into `dist/`. Deploy config is `vercel.json`.

## Architecture notes

- **Bake runtime** (`src/hooks/useBakeRuntime.ts`): the open step and the interval timer of the bake in progress live in one hook in `App.tsx`, persisted under the `ferment_bake_runtime` localStorage key and derived from a stored deadline (`timerEndsAt`), never from a decrementing counter. `NowScreen` and `ActiveTrackerTab` both read that one controller, so the phone surface and the wizard can never disagree about the step or the time left. `ferment_active_session` stays a pure bake record: it is what the log exporter ships, so runtime state must not be added to it.
- **Mobile surface** (`src/components/NowScreen.tsx`, tab id `now`): the primary mobile view for a bake in progress. Cold-launching below the `md` breakpoint (767px, `MOBILE_VIEWPORT_QUERY`) with an in-progress bake lands there. Every other section is reached through the single secondary entry point — the More sheet in `App.tsx` (`SECONDARY_ENTRIES`). Desktop landing and the desktop nav are unchanged.
- **No keyboard on mobile bake surfaces**: `index.html` sets `user-scalable=no`, so any focused input below 16px font size triggers iOS auto-zoom at the counter. `NowScreen` therefore uses only buttons and range inputs; keep it that way.

## Sharp edges

- `public/sw.js` serves the JS/CSS bundle cache-first under `CACHE_NAME`. Bump that name whenever the app shell changes, or an installed home-screen app keeps serving the previous shell.
- `main.tsx` registers the service worker only in `import.meta.env.PROD`; offline behaviour must be verified against `bun run build` + `vite preview`, not the dev server.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
