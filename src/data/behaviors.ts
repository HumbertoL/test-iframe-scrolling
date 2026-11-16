import { JOIN_BREAKPOINTS } from './join';

/** Width thresholds in cea-desktop (shared/media-queries.ts) that change the layout. */
export const BREAKPOINTS = [
  { px: 650, label: 'Dialogs full-screen', side: 'below' },
  { px: 820, label: 'Landing nav (unframed only)', side: 'below' },
  { px: 960, label: 'Login promo shown', side: 'above' },
  { px: 1050, label: 'Top nav → drawer', side: 'below' },
  { px: 1140, label: 'Side nav 20 → 15.5rem', side: 'below' },
  { px: 1310, label: 'Wide tables', side: 'above' },
  { px: 1600, label: 'Max app width', side: 'above' },
] as const;

/** Breakpoints that matter for what is being framed. */
export const breakpointsFor = (join: boolean): readonly { px: number; label: string; side: string }[] =>
  join ? JOIN_BREAKPOINTS : BREAKPOINTS;

/** Heights TEA enforces when it detects it is framed. */
export const HEIGHT_MARKERS = [
  { px: 875, label: 'Dialog max-height (framed)' },
  { px: 940, label: '#root max-height (tall frame)' },
] as const;

/** TEA adds .iframe-max-height when clientHeight > screen.height × this. */
export const TALL_FRAME_FACTOR = 1.5;

export interface KnownIssue {
  id: string;
  title: string;
  detail: string;
  howToTest: string;
  source: string;
}

export const KNOWN_ISSUES: KnownIssue[] = [
  {
    id: 'resize-once',
    title: 'Frame checks run only once',
    detail:
      'isAppInIframe and the tall-frame cap are worked out once at load. Resizing the frame afterwards does not add or remove the 940px cap.',
    howToTest: 'Use "Resize after load" on the stage toolbar: load at 800px, then grow to 4000px.',
    source: 'cea-desktop: client/src/helpers/app-helpers.js:49-75',
  },
  {
    id: 'sticky-offset',
    title: 'HideHeader leaves a 4rem gap',
    detail:
      'Side-nav pages still offset their sticky nav by the top nav’s height (4rem) when the top nav is hidden.',
    howToTest: 'Inbox or a /settings page with HideHeader=true. Look for empty space above the side nav.',
    source: 'cea-desktop: client/src/shared/layouts/side-nav-layout.tsx:45-57',
  },
  {
    id: 'phone-title',
    title: 'New-conversation title missing',
    detail:
      'The page passes `phonenumber` but the header reads `phoneNumber`, so the formatted number never shows as the title.',
    howToTest: 'Akken → Text a candidate (new).',
    source: 'cea-desktop: client/src/features/inbox/text-messages/index.tsx:154',
  },
  {
    id: 'new-convo-send',
    title: 'First send on /inbox/X/messages',
    detail:
      'saveNewConversation calls useParams() inside a redux thunk and reads `include` as a route param, so the redirect after the first send can lose the include list.',
    howToTest: 'Send the first message in a new conversation, then check the menu actions.',
    source: 'cea-desktop: client/src/state/ui/conversations/conversation-dialog/actions.js:1050-1061',
  },
  {
    id: 'lost-binding',
    title: 'Leaving the view drops integration data',
    detail:
      'Once a user navigates away from the embedded view, messages are not reported back to the partner reliably until the window is reopened.',
    howToTest: 'Open the embedded conversation, go to the Inbox from inside the frame, send a message, and check the partner webhook.',
    source: 'docs: Technical Designs/SSO Integrations.md:39',
  },
  {
    id: 'concurrent-users',
    title: 'Two users, one third-party id',
    detail:
      'When two users of the same account open embedded inboxes, the second overwrites the third-party id, so replies can go to the wrong user.',
    howToTest: 'Compare mode with two frames, signed in as different users in separate browser profiles.',
    source: 'docs: How-Tos/Troubleshoot Webhook Notifications.md:143-145',
  },
  {
    id: 'join-type-dropped',
    title: 'Forms loader drops the join type',
    detail:
      'staging-forms.text-em-all.com/join/{keyword}/promotional redirects to the test loader, which keeps only the keyword, so the consent text says "informational".',
    howToTest: 'Join page → Forms server loader preset.',
    source: 'www-forms: hubspot/index.html:76-81',
  },
  {
    id: 'join-iframe-css',
    title: 'HubSpot iframe CSS targets old classes',
    detail:
      'When framed, HubSpot adds body.in-iframe. Its .in-iframe .jss4 rule targets MUI v4 class names the form no longer uses, and .c-col-inner { height: 0 !important } collapses the wrapper. The rules live in HubSpot, not in a repo.',
    howToTest: 'Any embedded join preset: inspect body.in-iframe and check the form is not clipped.',
    source: 'HubSpot page 13745746577 (join) inline CSS',
  },
  {
    id: 'no-landing-in-frame',
    title: 'Narrow frames keep the desktop layout',
    detail:
      'useIsLandingNavigation is always false when framed, so a narrow frame never gets the single-column layout. The top nav still collapses below 1050px.',
    howToTest: 'Compare mode at 640px: columns squeeze instead of stacking.',
    source: 'cea-desktop: client/src/helpers/useIsLandingNavigation.js:9-10',
  },
];
