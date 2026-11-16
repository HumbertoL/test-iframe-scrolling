/**
 * The public join (opt-in) page. It is a HubSpot CMS page on www.text-em-all.com
 * that loads the www-forms `packages/opt-in` bundle into #root. The bundle reads
 * only the pathname (`*join/:keyword*`), so there are no query params to test.
 */
export interface JoinHost {
  id: string;
  label: string;
  origin: string;
  /** Path prefix before the keyword. */
  prefix: string;
  tier: 'prod' | 'staging' | 'local';
  /** Sends CSP `frame-ancestors https:` (the Heroku forms server does; HubSpot does not). */
  frameAncestorsHttpsOnly: boolean;
  /** HubSpot page with the `.in-iframe` CSS hack. */
  hubspot: boolean;
  note: string;
}

export const JOIN_HOSTS: JoinHost[] = [
  {
    id: 'staging-join',
    label: 'Staging · HubSpot page',
    origin: 'https://www.text-em-all.com',
    prefix: 'staging-join',
    tier: 'staging',
    frameAncestorsHttpsOnly: false,
    hubspot: true,
    note: 'Same HubSpot chrome as production, wired to the staging bundle, proxy and APIs. The link cea-desktop shows outside production.',
  },
  {
    id: 'prod-join',
    label: 'Production · HubSpot page',
    origin: 'https://www.text-em-all.com',
    prefix: 'join',
    tier: 'prod',
    frameAncestorsHttpsOnly: false,
    hubspot: true,
    note: 'The real thing. Submitting sends a real SMS invite to the number you enter.',
  },
  {
    id: 'staging-forms',
    label: 'Staging · forms server (no HubSpot)',
    origin: 'https://staging-forms.text-em-all.com',
    prefix: 'join',
    tier: 'staging',
    frameAncestorsHttpsOnly: true,
    hubspot: false,
    note: 'Plain test loader on Heroku. It drops the type segment, so /promotional and /charity read as informational.',
  },
  {
    id: 'local-forms',
    label: 'Local www-forms',
    origin: 'http://localhost:3003',
    prefix: 'join',
    tier: 'local',
    frameAncestorsHttpsOnly: false,
    hubspot: false,
    note: '`yarn start` in www-forms (needs its .env). Proxy on :3100.',
  },
];

export const joinHostById = (id: string) => JOIN_HOSTS.find((h) => h.id === id) ?? JOIN_HOSTS[0];

/** The second path segment only changes the consent wording. */
export const JOIN_TYPES = [
  { id: '', label: 'Informational', wording: 'informational texts' },
  { id: 'promotional', label: 'Promotional', wording: 'updates & promotional texts' },
  { id: 'charity', label: 'Charity', wording: 'donation texts' },
] as const;
export type JoinType = (typeof JOIN_TYPES)[number]['id'];

/** Staging keywords the www-forms Cypress suite uses (cypress/e2e/opt-in.spec.js). */
export const JOIN_TEST_KEYWORDS = [
  { keyword: '60160', note: 'pay-as-you-go test account' },
  { keyword: '60167', note: 'monthly test account' },
  { keyword: 'stagingmike', note: 'word keyword (older texting setup)' },
  { keyword: '60160.CYPRESS', note: 'group join keyword' },
];

/** Keywords the proxy accepts: letters, digits, underscore (plus one `.group`). */
export const JOIN_KEYWORD_PATTERN = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)?$/;

export const JOIN_BREAKPOINTS = [
  { px: 768, label: 'Form goes full width', side: 'below' },
] as const;

/** #root on the HubSpot page has min-height: 330px; the form is 700px wide on desktop. */
export const JOIN_FORM_MIN_HEIGHT = 330;
export const JOIN_FORM_WIDTH = 700;
