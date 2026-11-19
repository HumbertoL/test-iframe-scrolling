# AGENTS.md

Embed Lab is a single-page test bench for how the Text-Em-All web app (cea-desktop) and the public join (opt-in) page behave when embedded in iframes, drawers, modals and popups. The user-facing overview is in `README.md`; this file is for working on the code.

## Commands

Yarn 1. Node ≥ 20.19 (`.nvmrc` says 24).

| Command | What it does |
|---|---|
| `yarn start` | Dev server at **https://localhost:5180** with a self-signed cert; opens the browser |
| `yarn start:http` | Same on http. Use it to frame a local cea-desktop (http://localhost:3000), or when a tool can't accept the self-signed cert |
| `yarn verify` | `tsc` + `vitest run`. Run it before committing |
| `yarn build` | Vite build into `build/` (Netlify publishes this folder) |
| `yarn deploy` | Build, then push `build/` to Netlify production with the Netlify CLI (pinned). The first run asks you to log in and pick the site |

- Don't name a script `check`: `yarn check` is a built-in Yarn 1 command and shadows it.
- Dependencies are pinned to exact versions (`.yarnrc` has `save-exact true`). Keep them pinned and never add `^` or `~`.
- Ports: 5180 is the harness. 3000 is left free for local cea-desktop, and 3003 is local www-forms.

## Deploys

- The repo is `callemall/tea-embed-lab` (formerly `HumbertoL/test-iframe-scrolling`). `main` is the default branch.
- **Netlify does not watch this repo.** Its GitHub app needs a `callemall` org owner to grant access, so deploys go through the Netlify CLI instead:
  - `.github/workflows/deploy.yml` runs `yarn verify` and `yarn build` on every push and PR. On pushes to `main` it also deploys to production, but only once the repo secrets `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` exist (adding them needs repo admin). Until then it skips the deploy and leaves a notice.
  - `yarn deploy` does the same from a laptop with your own Netlify login.
  - The site was first published by dragging a zip of `build/` into Netlify Drop. Zips are gitignored.
  - Put the site URL here and in `README.md` once it exists.
- `master` is retired: a blank "Retired" page that keeps the old https://tea-iframe-integration.netlify.app site deploying something. Don't merge it into `main` or push app code to it.
- Actions are pinned to commit SHAs (with the tag in a comment). Keep them pinned when you bump them.
- **The site is public.** Never add secrets, tokens, customer data, or security findings about TEA, such as the login `redirect` param that has no origin check. Partner names and internal file paths are already on it.

## Stack

- React 19, TypeScript (`tsc` 7), Vite 8, Vitest + Testing Library (jsdom).
- MUI 9 styled with Emotion through the `sx` prop. There is no `styled()` and no `makeStyles`.
- **The theme uses CSS variables** (`cssVariables: { colorSchemeSelector: 'data' }`) and has light and dark schemes.
  - For theme colors with transparency, use `t.alpha(t.vars!.palette.x.y, 0.1)`.
  - `alpha(t.palette...)` only gives the light-scheme color.
  - Plain `alpha('#hex', …)` is fine for literal colors.
- State: one zustand store (`src/state/store.ts`) with `persist`.
  - It is stored in localStorage under the key `tea-embed-lab`, wrapped so storage errors never throw.
  - `merge` layers saved state over the defaults, so new fields get their default values.
  - **SSO tokens are never persisted or put in share links.** `partialize` and `lib/share.ts` both blank `ssoValue`. Keep it that way.

## Layout

```
src/
  data/        Research-backed facts, with sources. Most changes start here.
    environments.ts  TEA app hosts (staging/prod/dev/local) + frame-ancestors flag
    routes.ts        Views an integration can land on, which inputs each reads,
                     include actions, HideHeader spellings, SSO kinds
    join.ts          Join page hosts, types, staging test keywords, breakpoints
    presets.ts       Partners + presets (URL + container + checklist + sources)
    behaviors.ts     TEA breakpoints, frame height caps, known quirks
  lib/
    url.ts           buildUrl(params) → url + "anatomy" + problems
    diagnostics.ts   diagnose(): the Health tab's checks (app vs join branches)
    share.ts         #s=<base64 JSON> scenario links
    frames.ts        Live iframe registry + "resize after load" experiment
  state/       Types, defaults, store
  components/
    stage/     Stage toolbar + container modes, EmbedFrame (the iframe), HostShell
               (pretend ATS "Recruit-Em-All" and customer site "Northwind Coffee")
    panels/    Inspector tabs: URL, Frame, Test, Health, Log
    catalog/   Left preset list
```

## Common changes

- **New preset:** add an entry to `PRESETS` in `data/presets.ts` with `url` and `container` overrides, `checks` and `sources`.
  - Set `confidence` honestly: `confirmed` means both the URL and the size are known, `code` means the URL comes from code, and `assumed` means the container size is a guess.
  - The "builds a URL for every preset" test covers new presets automatically.
- **New route:** add it to `ROUTES` in `data/routes.ts`, then handle any new `RouteField` in `lib/url.ts` and `components/panels/UrlPanel.tsx`.
- **New URL param or field:** add it to `state/types.ts` and `state/defaults.ts`. If it changes meaning, bump the persist `version` in `store.ts`.
- **New Health check:** add it to `lib/diagnostics.ts` and add a test in `src/lib/url.test.ts`.
- **The join route is different from app routes:**
  - It has its own hosts (`joinHostId`).
  - It reads no query params, so HideHeader is not applied.
  - It has no TEA frame caps or guides.
  - It has its own breakpoints (`breakpointsFor(join)`).
  - Behind and around the frame it shows the customer site (`HostSite`), not the ATS.
  - Use `isJoinRoute()`.

## Facts to keep straight

Each entry in `data/` cites `repo: path:line`. Keep the citation when you change a fact, and check the source repo before "fixing" one. The sibling repos are under `~/workspace` (cea-desktop, cea-framework, cea-rest-api, bullhorn, www-forms, firebird, docs). Search their remote default branch, since local checkouts are often on other branches.

- **Bullhorn** was the partner with the **912 × 4000** iframe (confirmed by the user).
- **TEA tall-frame cap:** when framed and the frame is taller than 1.5 × screen height, TEA caps `#root` at 940px. This is checked once at load. Dialogs are capped at 875px when framed.
- **Framing headers:** deployed cea-desktop and the www-forms Heroku server send `Content-Security-Policy: frame-ancestors https:`, so an http harness can't frame them. The HubSpot join page (`www.text-em-all.com/join/…`, `/staging-join/…`) has no frame-ancestors, so any parent can frame it.
- **Production join page:** submitting it sends a real SMS invite.

## Checking UI changes

- The Claude desktop browser pane rejects the self-signed certificate. Use `yarn start:http` (port 5180) there.
  - Staging TEA frames stay blank over http. That's expected, and the Health tab says so.
  - The staging join page does render over http, which makes it a good end-to-end check.
- Remove any `.claude/launch.json` you create for previews before committing.
- Commits use conventional-commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`).
