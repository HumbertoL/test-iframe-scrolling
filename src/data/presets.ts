import type { ContainerConfig, UrlParams } from '../state/types';

export type Confidence = 'confirmed' | 'code' | 'assumed';

export interface Partner {
  id: string;
  name: string;
  kind: string;
  color: string;
  blurb: string;
}

export interface Preset {
  id: string;
  partnerId: string;
  title: string;
  summary: string;
  /** How the partner surfaces the app. */
  surface: string;
  /** How sure we are about the container/size. */
  confidence: Confidence;
  status?: string;
  url: Partial<UrlParams>;
  container: Partial<ContainerConfig>;
  checks: string[];
  notes?: string[];
  sources: string[];
}

export const PARTNERS: Partner[] = [
  {
    id: 'bullhorn',
    name: 'Bullhorn',
    kind: 'Staffing ATS · custom actions',
    color: '#f97316',
    blurb:
      'Custom actions on Candidate and ClientContact records open TEA. The rest-in BullhornController trades a Bullhorn auth code for a redirect URL. This is the partner that needed the 4000px-tall iframe.',
  },
  {
    id: 'avionte',
    name: 'Avionté',
    kind: 'Staffing ATS · Embedded Views API',
    color: '#8b5cf6',
    blurb:
      'The main Embedded Views partner (IntegrationID 127). Calls embeddedviews/setup and embeddedviews/conversations, then frames the sso.aspx?token=… URL it gets back.',
  },
  {
    id: 'akken',
    name: 'Akken',
    kind: 'Staffing ATS · single conversation',
    color: '#06b6d4',
    blurb:
      'The only partner with special-case front-end code: the /inbox/X/messages?phonenumber=… route that starts a new conversation from a phone number.',
  },
  {
    id: 'tempworks',
    name: 'TempWorks · Ultra-Staff EDGE',
    kind: 'Staffing ATS · SSO broadcasts',
    color: '#22c55e',
    blurb:
      'Named as SSO integration partners. They send a TemporaryKey that lands on Create Broadcast with a draft already filled in, or on Home with destination=home.',
  },
  {
    id: 'tea',
    name: 'Text-Em-All itself',
    kind: 'First-party surfaces',
    color: '#3b82f6',
    blurb:
      'Places TEA frames or pops itself out: the single-conversation pop-out, the login test page, the mobile webview and this harness’s original drawer.',
  },
];

export const partnerById = (id: string) => PARTNERS.find((p) => p.id === id)!;

const TALL: Partial<ContainerConfig> = {
  mode: 'inline',
  width: 912,
  height: 4000,
  scrolling: 'no',
  hostShell: true,
};

export const PRESETS: Preset[] = [
  // ── Bullhorn ────────────────────────────────────────────────────────────
  {
    id: 'bullhorn-conversation',
    partnerId: 'bullhorn',
    title: 'Candidate → Conversation',
    summary: 'Conversation custom action on a Candidate record, in a 4000px-tall frame.',
    surface: 'Custom action tab in Bullhorn, iframe 912 × 4000, the page scrolls instead of the frame',
    confidence: 'confirmed',
    status:
      'cea-desktop dropped its /bullhorn/* proxy routes on 2026-04-08. Check the integration still works end to end.',
    url: {
      routeId: 'conversation-legacy',
      hideHeader: 'canonical',
      includeEnabled: true,
      include: ['optout'],
    },
    container: TALL,
    checks: [
      'Frame is taller than 1.5 × screen height, so TEA adds .iframe-max-height and #root stops at 940px',
      'Nothing below 940px is cut off: message input and send button are reachable',
      'Dialogs (edit contact, media) stay within 875px and are visible without scrolling the host page',
      'The legacy /conversations/… path redirects to /inbox/…/messages and keeps the query',
      'Only the opt-out action is in the conversation menu (include=optout)',
      'Top nav is hidden',
    ],
    sources: [
      'bullhorn: Internal/Models/BullhornConversationResult.cs:29',
      'cea-desktop: client/src/helpers/app-helpers.js:60-75',
      'cea-desktop: client/src/app-global-styles.tsx:51-54',
      'test-iframe-scrolling 9aa4c10 (height 4000px)',
    ],
  },
  {
    id: 'bullhorn-create-broadcast',
    partnerId: 'bullhorn',
    title: 'Create broadcast',
    summary: 'The create-broadcast custom action: a temporary draft with a one-minute SSO token.',
    surface: 'Custom action in Bullhorn, iframe 912 × 4000',
    confidence: 'confirmed',
    status: 'cea-desktop dropped its /bullhorn/* proxy routes on 2026-04-08.',
    url: { routeId: 'broadcast-create', hideHeader: 'canonical', includeEnabled: false },
    container: TALL,
    checks: [
      'Create Broadcast loads with the header hidden',
      'Recipient and schedule dialogs are capped at 875px and visible',
      'The page under the 940px cap can still be scrolled to the Send button',
    ],
    sources: ['bullhorn: Internal/Models/BullhornCreateBroadcastResult.cs:28'],
  },
  {
    id: 'bullhorn-home',
    partnerId: 'bullhorn',
    title: 'Home screen',
    summary: 'The HomeScreen custom action, which shows the full app with its header.',
    surface: 'Custom action in Bullhorn, iframe 912 × 4000',
    confidence: 'confirmed',
    url: { routeId: 'broadcasts-all', hideHeader: 'off', includeEnabled: false },
    container: TALL,
    checks: [
      'Top nav is visible and fits in 912px (below 1050px it collapses to the hamburger drawer)',
      'The landing (mobile) layout is NOT used even though the width is under 1050px',
      'The side nav’s sticky max-height does not stretch to 4000px',
    ],
    sources: ['bullhorn: Internal/Models/BullhornActionResult.cs:91'],
  },

  // ── Avionte ─────────────────────────────────────────────────────────────
  {
    id: 'avionte-conversation',
    partnerId: 'avionte',
    title: 'Conversation thread',
    summary: 'The embeddedviews/conversations result for an existing conversation.',
    surface: 'Iframe in the partner app (no size given in code; drawer assumed)',
    confidence: 'assumed',
    url: {
      routeId: 'conversation',
      hideHeader: 'canonical',
      includeEnabled: true,
      include: ['edit', 'optout'],
    },
    container: { mode: 'drawer', width: 912, height: 800, scrolling: 'no' },
    checks: [
      'Header hidden, and no alert banners other than StatusIo',
      'Edit and opt-out actions shown; mark-as-done hidden (default customization)',
      'The text-number dropdown switches conversations and keeps the query string',
      'Live inbound messages show up without reloading (websocket only, no long-polling in frames)',
      'Help Scout beacon is not injected',
    ],
    sources: [
      'cea-framework: CEA.CallEmAll/SingleSignOn/ConversationsTokenValidator.cs:71',
      'cea-framework: CEA.Workflow/Integration/SingleSignOnWorkflow.cs:87-107',
      'docs: References/Partner Integration Guidelines/Embedded Views.md:103-120',
    ],
  },
  {
    id: 'avionte-new-conversation',
    partnerId: 'avionte',
    title: 'Conversation (no thread yet)',
    summary: 'The embeddedviews/conversations result when no conversation exists for that phone number.',
    surface: 'Iframe in the partner app (drawer assumed)',
    confidence: 'assumed',
    url: {
      routeId: 'conversation-new',
      hideHeader: 'canonical',
      includeEnabled: true,
      include: ['edit', 'optout'],
    },
    container: { mode: 'drawer', width: 912, height: 800, scrolling: 'no' },
    checks: [
      'Empty thread shows with the message input enabled',
      'Sending creates the conversation and the URL becomes /inbox/<id>/messages',
      'The header stays hidden after that client-side navigation (HideHeader lives in redux)',
    ],
    sources: ['cea-framework: CEA.CallEmAll/SingleSignOn/ConversationsTokenValidator.cs:72'],
  },
  {
    id: 'avionte-inbox',
    partnerId: 'avionte',
    title: 'Inbox',
    summary: 'The Embedded Views "Inbox" view (no phone or text number in the request).',
    surface: 'Iframe in the partner app (drawer assumed)',
    confidence: 'assumed',
    url: { routeId: 'inbox', hideHeader: 'canonical', includeEnabled: false },
    container: { mode: 'drawer', width: 1100, height: 800, scrolling: 'auto' },
    checks: [
      'All three columns (side nav, list, thread) fit; below 1140px the side nav shrinks to 15.5rem',
      'Messages sent from here may not reach the partner’s webhook (integration data is lost)',
      'Side nav sticky offset: the 4rem gap from the hidden top nav is still there',
    ],
    sources: [
      'docs: References/Partner Integration Guidelines/Embedded Views.md:124-136',
      'cea-desktop: client/src/shared/layouts/side-nav-layout.tsx:45-57',
    ],
  },
  {
    id: 'avionte-sso',
    partnerId: 'avionte',
    title: 'Real SSO hand-off',
    summary: 'Paste a fresh sso.aspx token from embeddedviews/conversations and frame the actual entry URL.',
    surface: 'Iframe in the partner app',
    confidence: 'code',
    url: { routeId: 'sso', ssoKind: 'token', ssoHideHeader: true, hideHeader: 'off' },
    container: { mode: 'drawer', width: 912, height: 800, scrolling: 'no' },
    checks: [
      'Logs in and redirects inside the frame (event log shows 2+ loads)',
      'Reusing the same token fails with /login?error=ssotokenvalidationerror',
      'With third-party cookies blocked, the session does not stick after the redirect',
    ],
    sources: [
      'cea-desktop: server/controllers/legacy-router.js:54-170',
      'cea-rest-api: rest.call-em-all.com/Controllers/EmbeddedViews.cs:36',
    ],
  },

  // ── Akken ───────────────────────────────────────────────────────────────
  {
    id: 'akken-new',
    partnerId: 'akken',
    title: 'Text a candidate (new)',
    summary: 'Start a conversation with a phone number that has none yet.',
    surface: 'Single-conversation frame (size not recorded; drawer assumed)',
    confidence: 'code',
    url: {
      routeId: 'conversation-new',
      hideHeader: 'canonical',
      includeEnabled: true,
      include: ['edit', 'optout'],
    },
    container: { mode: 'drawer', width: 912, height: 800, scrolling: 'no' },
    checks: [
      'The header title shows the phone number from the query (known bug: it does not)',
      'The first send creates the conversation and keeps the include actions',
      'Edit contact saves through the single-view path',
      'The Broadcast Details link in the text-bubble popover is hidden',
    ],
    sources: [
      'cea-desktop: client/src/features/inbox/conversation.tsx:77-85',
      'cea-desktop: client/src/state/ui/conversations/conversation-dialog/actions.js:1036-1068',
    ],
  },
  {
    id: 'akken-existing',
    partnerId: 'akken',
    title: 'Open an existing thread',
    summary: 'The same view for a conversation that already exists.',
    surface: 'Single-conversation frame (drawer assumed)',
    confidence: 'code',
    url: {
      routeId: 'conversation',
      hideHeader: 'canonical',
      includeEnabled: true,
      include: ['edit', 'optout', 'done'],
    },
    container: { mode: 'drawer', width: 912, height: 800, scrolling: 'no' },
    checks: [
      'Thread loads and scrolls inside #conversation-thread-viewer-container',
      'The include list matches the menu exactly (edit, opt-out, done)',
    ],
    sources: ['cea-desktop: client/src/state/ui/conversations/helpers.ts:8-28'],
  },

  // ── TempWorks / Ultra-Staff ─────────────────────────────────────────────
  {
    id: 'tempworks-create',
    partnerId: 'tempworks',
    title: 'Create broadcast via SSO',
    summary: 'A TemporaryKey from embeddedviews/broadcasts, with the contacts already on the draft.',
    surface: 'Iframe or new tab from the partner software (size not recorded)',
    confidence: 'assumed',
    url: { routeId: 'sso', ssoKind: 'TemporaryKey', ssoHideHeader: true, hideHeader: 'off' },
    container: { mode: 'inline', width: 1100, height: 900, scrolling: 'auto' },
    checks: [
      'Lands on /broadcasts/create?HideHeader=true with the draft’s recipients filled in',
      'Leaving the page loses the integration data, so the partner must reopen the window',
      'Duplicate and repeating broadcasts do not carry integration data',
    ],
    sources: [
      'docs: Technical Designs/SSO Integrations.md:25-42',
      'cea-framework: CEA.Workflow/Broadcast/TempBroadcastWorkflow.cs:990',
    ],
  },
  {
    id: 'tempworks-home',
    partnerId: 'tempworks',
    title: 'Home via SSO',
    summary: 'The same TemporaryKey flow with destination=home and no contacts.',
    surface: 'Iframe or new tab',
    confidence: 'assumed',
    url: {
      routeId: 'sso',
      ssoKind: 'TemporaryKey',
      ssoHideHeader: true,
      ssoDestinationHome: true,
      hideHeader: 'off',
    },
    container: { mode: 'tab', width: 1280, height: 900 },
    checks: ['Lands on /broadcasts/all instead of Create Broadcast'],
    sources: ['docs: References/Partner Integration Guidelines/Embedded Views.md:94-99'],
  },

  // ── First party ─────────────────────────────────────────────────────────
  {
    id: 'tea-popout',
    partnerId: 'tea',
    title: 'Single-conversation pop-out',
    summary: 'The inbox menu item that opens one conversation in its own window.',
    surface: 'New tab or popup, not framed',
    confidence: 'confirmed',
    url: { routeId: 'conversation-legacy', hideHeader: 'canonical', includeEnabled: false },
    container: { mode: 'popup', width: 912, height: 800 },
    checks: [
      'All conversation actions are shown (no include param)',
      'Not framed, so no 940px cap and Help Scout stays off because the path has /messages',
    ],
    sources: [
      'cea-desktop: client/src/features/inbox/conversations-list-action-menu/conversations-list-action-menu-items.tsx:122-128',
    ],
  },
  {
    id: 'tea-login-frame',
    partnerId: 'tea',
    title: 'Login inside a frame',
    summary: 'Mirrors cea-desktop’s own integrations-iframe-test.html (900 × 900).',
    surface: 'Iframe 900 × 900',
    confidence: 'confirmed',
    url: { routeId: 'login', hideHeader: 'off', includeEnabled: false },
    container: { mode: 'inline', width: 900, height: 900, scrolling: 'auto', hostShell: false },
    checks: [
      'With third-party cookies blocked: "Cookies are not enabled" alert and the login button disabled',
      'reCAPTCHA renders and can be solved inside the frame',
      '"Try it free" link is hidden',
      'The login promo iframe appears only when the frame is wider than 960px',
      '2FA (if enabled) completes inside the frame',
    ],
    sources: [
      'cea-desktop: client/public/integrations-iframe-test.html',
      'cea-desktop: client/src/helpers/cookies.ts:1-23',
    ],
  },
  {
    id: 'tea-mobile-webview',
    partnerId: 'tea',
    title: 'Mobile webview',
    summary: 'Phone-sized frame with HideMonetization=true, as the mobile app sends it.',
    surface: 'Webview 390 × 844',
    confidence: 'code',
    url: { routeId: 'broadcasts-all', hideHeader: 'off', hideMonetization: true, includeEnabled: false },
    container: { mode: 'inline', width: 390, height: 844, scrolling: 'auto', hostShell: false },
    checks: [
      'Credits and subscription are hidden (known gap: nothing reads HideMonetization today)',
      'Dialogs go full-screen below 650px',
    ],
    sources: ['cea-desktop: client/src/state/config/selectors.ts:11-15'],
  },
  {
    id: 'tea-original',
    partnerId: 'tea',
    title: 'The original harness',
    summary: 'What this app used to be: staging in a 60% drawer, 912 × 800.',
    surface: 'Drawer 60%, iframe 912 × 800',
    confidence: 'confirmed',
    url: { routeId: 'custom', customPath: '/', hideHeader: 'canonical', includeEnabled: false },
    container: { mode: 'drawer', width: 912, height: 800, scrolling: 'no', panelPct: 60 },
    checks: ['Opens and closes cleanly'],
    sources: ['test-iframe-scrolling 50270e7'],
  },
];

export const presetById = (id: string | null | undefined) =>
  PRESETS.find((p) => p.id === id);
