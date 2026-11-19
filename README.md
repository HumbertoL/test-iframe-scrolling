# Embed Lab

A test bench for how the Text-Em-All web app (cea-desktop) behaves when partners embed it in iframes, drawers, modals and popups.

Live: a new Netlify site is being set up (the old `tea-iframe-integration.netlify.app` is retired).

## Run it

```bash
yarn
yarn start        # https://localhost:5180, opens the browser
```

The first time, the browser warns about the self-signed certificate. Click through it once.

HTTPS is required. Staging sends `Content-Security-Policy: frame-ancestors https:`, so an http page cannot frame it. Use `yarn start:http` (http://localhost:5180) only to frame a **local** cea-desktop on http://localhost:3000. The harness moved off port 3000 so both can run at once.

```bash
yarn verify       # typecheck + tests
yarn build        # → build/ (what Netlify publishes)
yarn deploy       # build + deploy to Netlify production with your Netlify login
```

## What's in it

- **Partner presets.** Each one is the URL, container and size a partner really uses, with a checklist and the code it came from.
  - **Bullhorn:** a 912 × 4000 custom-action tab.
  - **Avionté:** Embedded Views, conversation and inbox.
  - **Akken:** `/inbox/X/messages?phonenumber=…`.
  - **TempWorks / Ultra-Staff EDGE:** `TemporaryKey` SSO.
  - **Join page:** the public opt-in form (`www.text-em-all.com/join/{keyword}/{type}`, or `/staging-join/…`), embedded on a pretend customer site, in a modal, at phone width, plus the group-keyword, charity and unknown-keyword cases. HubSpot sends no `frame-ancestors`, so even `yarn start:http` can frame it.
  - **First-party:** the pop-out, login in a frame, and a phone-sized frame.
- **URL builder.** Every environment and every route an integration can land on, plus the flags: `HideHeader` (including the casing and duplicate variants the parser handles), `include`, `phonenumber`, `textnumberid`, inbox filters and SSO tokens.
  - Tokens are never saved or put in share links.
- **Containers.** Inline (the page scrolls), slide-over drawer, modal, docked split, multi-width compare, sized popup and new tab.
  - A pretend partner app ("Recruit-Em-All") sits behind them. Its **Text** buttons feed a candidate's phone number into the URL.
- **Frame controls.**
  - Width and height, with live maps of where the frame sits against TEA's breakpoints and its 875px / 940px frame caps.
  - Guides drawn over the frame.
  - `scrolling`, `sandbox` tokens, `allow`, `referrerpolicy` and zoom.
- **Health.** Explains in advance why a frame will be blank or broken: CSP `frame-ancestors`, mixed content, third-party cookies vs `SameSite`, the tall-frame cap for *your* screen, and sandbox tokens TEA can't do without.
- **Log.** Frame loads and navigations inside the frame, focus moving into the frame, popups, and any `postMessage`. There is also a sender for trying out a future partner message contract.
- **Known quirks.** Bugs found while researching, each with a way to reproduce it. For example, **Resize after load** shows that TEA only checks for a tall frame once.
- **Share.** Copies a link that rebuilds the exact scenario. Press `?` for keyboard shortcuts.

## How TEA behaves in a frame (short version)

- `HideHeader=true` (case-insensitive) hides the top nav and banners. It is read once at boot and kept in redux.
- When framed, TEA:
  - caps dialogs at 875px;
  - caps `#root` at 940px if the frame is taller than 1.5 × the screen height, checked once at load;
  - never uses the narrow landing layout, and skips Help Scout.
- No `postMessage` contract exists. Partners get data back through webhooks.
- The session cookie is `SameSite=None; Secure`, so a cross-site frame depends on the browser allowing third-party cookies.
