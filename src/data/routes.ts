import { joinHostById } from './join';

/** Which inputs a route reads. Drives what the URL builder shows. */
export type RouteField =
  | 'conversationId'
  | 'phoneNumber'
  | 'textNumberId'
  | 'include'
  | 'inboxFilters'
  | 'sso'
  | 'join'
  | 'customPath';

export interface RouteDef {
  id: string;
  label: string;
  group: 'Conversations' | 'Broadcasts' | 'Auth' | 'Public pages' | 'Other';
  description: string;
  fields: RouteField[];
  /** Builds the path (no query) from the current params. */
  path: (p: { conversationId: string; customPath: string; joinKeyword: string; joinType: string; joinHostId: string }) => string;
}

export const ROUTES: RouteDef[] = [
  {
    id: 'conversation',
    label: 'Conversation thread',
    group: 'Conversations',
    description:
      'Single-conversation view. Embedded Views and Avionte land here after sso.aspx?token=…',
    fields: ['conversationId', 'include', 'textNumberId'],
    path: ({ conversationId }) => `/inbox/${conversationId || ':conversationId'}/messages`,
  },
  {
    id: 'conversation-new',
    label: 'New conversation by phone',
    group: 'Conversations',
    description:
      'The literal id "X" means "start a new conversation". Needs phonenumber and textnumberid (Akken flow).',
    fields: ['phoneNumber', 'textNumberId', 'include'],
    path: () => '/inbox/X/messages',
  },
  {
    id: 'conversation-legacy',
    label: 'Conversation (legacy path)',
    group: 'Conversations',
    description:
      '/conversations/:id/messages. Bullhorn and the in-app pop-out use it; the app redirects to /inbox/… and keeps the query.',
    fields: ['conversationId', 'include'],
    path: ({ conversationId }) =>
      `/conversations/${conversationId || ':conversationId'}/messages`,
  },
  {
    id: 'inbox',
    label: 'Inbox',
    group: 'Conversations',
    description: 'Full inbox. The Embedded Views "Inbox" view lands on /inbox?HideHeader=true.',
    fields: ['inboxFilters'],
    path: () => '/inbox',
  },
  {
    id: 'broadcast-create',
    label: 'Create broadcast',
    group: 'Broadcasts',
    description:
      'Where TemporaryKey SSO lands (TempWorks, Ultra-Staff EDGE, Bullhorn create-broadcast action).',
    fields: [],
    path: () => '/broadcasts/create',
  },
  {
    id: 'broadcasts-all',
    label: 'Broadcasts (home)',
    group: 'Broadcasts',
    description: 'Where destination=home, LoginToken SSO and the Bullhorn home action land.',
    fields: [],
    path: () => '/broadcasts/all',
  },
  {
    id: 'home',
    label: 'Home dashboard',
    group: 'Other',
    description: 'The /home dashboard.',
    fields: [],
    path: () => '/home',
  },
  {
    id: 'login',
    label: 'Login',
    group: 'Auth',
    description:
      'Login page. Inside a frame, the "Try it free" link is hidden, and the login button is disabled if third-party cookies are blocked.',
    fields: [],
    path: () => '/login',
  },
  {
    id: 'sso',
    label: 'SSO entry (sso.aspx)',
    group: 'Auth',
    description:
      'What partners actually load. Tokens are single-use and short-lived: paste a fresh one from the API every time.',
    fields: ['sso'],
    path: () => '/sso.aspx',
  },
  {
    id: 'join',
    label: 'Join page (opt-in form)',
    group: 'Public pages',
    description:
      'The public keyword opt-in form customers share and embed on their sites. Served by HubSpot on www.text-em-all.com; it reads only the path.',
    fields: ['join'],
    path: ({ joinKeyword, joinType, joinHostId }) =>
      `/${joinHostById(joinHostId).prefix}/${joinKeyword || ':keyword'}${joinType ? `/${joinType}` : ''}`,
  },
  {
    id: 'custom',
    label: 'Custom path',
    group: 'Other',
    description: 'Any path in the app, e.g. /contacts/group/everyone or /settings/integrations.',
    fields: ['customPath'],
    path: ({ customPath }) => (customPath.startsWith('/') ? customPath : `/${customPath}`),
  },
];

/** Join page: different host, no TEA app behaviour (no login, no HideHeader, no frame caps). */
export const isJoinRoute = (id: string) => id === 'join';

export const routeById = (id: string): RouteDef =>
  ROUTES.find((r) => r.id === id) ?? ROUTES[0];

/** Values of the `include` query param (state/ui/conversations/constants.ts). */
export const INCLUDE_ACTIONS = [
  { id: 'edit', label: 'Edit contact' },
  { id: 'optout', label: 'Opt-out toggle' },
  { id: 'done', label: 'Mark as done' },
  { id: 'unread', label: 'Mark unread' },
] as const;
export type IncludeAction = (typeof INCLUDE_ACTIONS)[number]['id'];

/** Ways to spell the HideHeader flag, to test the parser. */
export const HIDE_HEADER_VARIANTS = [
  { id: 'off', label: 'Not set', query: '', expectHidden: false },
  { id: 'canonical', label: 'HideHeader=true', query: 'HideHeader=true', expectHidden: true },
  { id: 'lower', label: 'hideheader=true', query: 'hideheader=true', expectHidden: true },
  { id: 'shout', label: 'HIDEHEADER=TRUE', query: 'HIDEHEADER=TRUE', expectHidden: true },
  { id: 'false', label: 'HideHeader=false', query: 'HideHeader=false', expectHidden: false },
  {
    id: 'dupe',
    label: 'HideHeader=true&HideHeader=false',
    query: 'HideHeader=true&HideHeader=false',
    expectHidden: false,
  },
  { id: 'one', label: 'HideHeader=1', query: 'HideHeader=1', expectHidden: false },
] as const;
export type HideHeaderVariant = (typeof HIDE_HEADER_VARIANTS)[number]['id'];

export const SSO_KINDS = [
  { id: 'token', label: 'token', description: 'Conversation / Inbox (embeddedviews/conversations)' },
  { id: 'TemporaryKey', label: 'TemporaryKey', description: 'Create broadcast (embeddedviews/broadcasts)' },
  { id: 'LoginToken', label: 'LoginToken', description: 'Plain auto-login (singlesignon/logintokens)' },
] as const;
export type SsoKind = (typeof SSO_KINDS)[number]['id'];
