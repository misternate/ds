# Design System (`ds`)

Design tokens are authored in Figma, synced to this repo, and built into CSS variables that **Claude Design** reads to generate on-brand designs. Later, the same tokens and components feed **Storybook** for engineering handoff. The repo is the single source of truth both read from.

## How it works

```
Figma (Tokens Studio)  →  tokens.json  →  Style Dictionary  →  build/css/tokens.css  →  Claude Design
```

- Tokens are authored as Figma variables and synced here via Tokens Studio's GitHub integration (`tokens.json`).
- `build.mjs` flattens the Tokens Studio sets and builds them into CSS custom properties using Style Dictionary + `@tokens-studio/sd-transforms` (which resolves the math expressions and composite tokens).
- `build/css/tokens.css` is the artifact Claude Design reads.

## Structure

```
ds/
├── tokens.json            # synced from Tokens Studio (source of truth)
├── build.mjs              # flatten + Style Dictionary build
├── package.json
└── build/css/tokens.css   # generated CSS variables (read by Claude Design)
```

## Build

```bash
npm install
npm run build          # → build/css/tokens.css
```

Re-run after any token change. Note: Tokens Studio syncs to GitHub, not your local clone, so `git pull` first to get the latest `tokens.json`.

## Current state

- [x] Pipeline validated end to end (tokens → CSS → Claude Design), using Tokens Studio's sample tokens
- [x] Figma variables exported (`core` + `light` collections, single mode) for the design team
- [ ] Swap sample tokens for real brand values, then rebuild

## Notes

- The single-file Tokens Studio export keeps each set under a top-level key, but references drop the set name — `build.mjs` merges `core + light + theme` at the root so references resolve.
- `@tokens-studio/sd-transforms` is required; plain Style Dictionary can't evaluate the math or composite tokens.
- Claude Design reads the **codebase** (the CSS variables), not Figma directly — which is why `tokens.css`, not the Figma file, is what feeds it.

## Next

- Replace sample tokens with real brand values.
- **Step 2:** build code components (Radix + tokens, or translated from Figma via Claude Code) and document them in Storybook for engineering handoff.
