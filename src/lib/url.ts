import { CUSTOM_ENV_ID, ENVIRONMENTS } from '../data/environments';
import { HIDE_HEADER_VARIANTS, routeById } from '../data/routes';
import type { UrlParams } from '../state/types';

export interface QueryPart {
  key: string;
  value: string;
  /** Why it is there, shown in the URL anatomy view. */
  why: string;
}

export interface BuiltUrl {
  url: string;
  origin: string;
  path: string;
  query: QueryPart[];
  problems: string[];
}

export function resolveOrigin(p: Pick<UrlParams, 'envId' | 'customOrigin'>): string {
  if (p.envId === CUSTOM_ENV_ID) return p.customOrigin.replace(/\/+$/, '');
  return (ENVIRONMENTS.find((e) => e.id === p.envId) ?? ENVIRONMENTS[0]).origin;
}

export const digitsOnly = (s: string) => s.replace(/\D/g, '');

function rawPairs(raw: string, why: string): QueryPart[] {
  return raw
    .replace(/^[?&]/, '')
    .split('&')
    .filter(Boolean)
    .map((pair) => {
      const [key, ...rest] = pair.split('=');
      return { key, value: rest.join('='), why };
    });
}

export function buildUrl(p: UrlParams): BuiltUrl {
  const route = routeById(p.routeId);
  const origin = resolveOrigin(p);
  const path = route.path(p);
  const query: QueryPart[] = [];
  const problems: string[] = [];
  const has = (f: string) => route.fields.includes(f as never);

  if (has('sso')) {
    if (!p.ssoValue.trim()) problems.push(`Paste a fresh ${p.ssoKind} from the API`);
    query.push({ key: p.ssoKind, value: p.ssoValue.trim() || '<token>', why: 'Single-use SSO token' });
    if (p.ssoDestinationHome)
      query.push({ key: 'destination', value: 'home', why: 'Land on Home instead of Create Broadcast' });
    if (p.ssoHideHeader)
      query.push({ key: 'hideheader', value: 'true', why: 'Server adds HideHeader=true to the redirect' });
  }

  if (has('conversationId') && !p.conversationId.trim())
    problems.push('Needs a conversation id');

  if (has('phoneNumber')) {
    const digits = digitsOnly(p.phoneNumber);
    if (digits.length !== 10) problems.push('phonenumber should be 10 digits');
    query.push({ key: 'phonenumber', value: digits || '<10 digits>', why: 'Who to text' });
  }

  if (has('textNumberId')) {
    if (p.textNumberId.trim())
      query.push({ key: 'textnumberid', value: p.textNumberId.trim(), why: 'Which TEA number sends' });
    else if (p.routeId === 'conversation-new') problems.push('Needs a textnumberid');
  }

  if (has('include') && p.includeEnabled) {
    query.push({
      key: 'include',
      value: p.include.join(','),
      why: p.include.length ? 'Only these menu actions are shown' : 'Empty list hides every action',
    });
  }

  if (has('inboxFilters')) {
    if (p.inboxTextNumberId.trim())
      query.push({ key: 'textNumberId', value: p.inboxTextNumberId.trim(), why: 'Inbox filter' });
    if (p.inboxBroadcastId.trim())
      query.push({ key: 'broadcastId', value: p.inboxBroadcastId.trim(), why: 'Inbox filter' });
    if (p.inboxIsDone) query.push({ key: 'isDone', value: 'true', why: 'Show done conversations' });
    if (p.inboxAutoOptOut) query.push({ key: 'tag', value: 'auto-opt-out', why: 'Auto opt-out tag' });
  }

  const hh = HIDE_HEADER_VARIANTS.find((v) => v.id === p.hideHeader);
  if (hh?.query)
    query.push(
      ...rawPairs(hh.query, hh.expectHidden ? 'Hides the top nav and banners' : 'Should NOT hide the header'),
    );

  if (p.hideMonetization)
    query.push({ key: 'HideMonetization', value: 'true', why: 'Mobile webview flag (no effect today)' });

  if (p.extraQuery.trim()) query.push(...rawPairs(p.extraQuery.trim(), 'Extra'));

  if (!/^https?:\/\/[^/]+/.test(origin)) problems.push('Origin must start with http:// or https://');

  const qs = query
    .map(({ key, value }) =>
      value === '' ? encodeURIComponent(key) : `${encodeURIComponent(key)}=${encodeURIComponent(value).replace(/%2C/g, ',')}`,
    )
    .join('&');

  return { url: `${origin}${path}${qs ? `?${qs}` : ''}`, origin, path, query, problems };
}

/** Registrable-ish "site" used for SameSite reasoning (ignores port and subdomain). */
export function siteOf(origin: string): string {
  try {
    const { hostname, protocol } = new URL(origin);
    if (hostname === 'localhost' || /^[\d.]+$/.test(hostname) || hostname.startsWith('['))
      return `${protocol}//${hostname}`;
    return `${protocol}//${hostname.split('.').slice(-2).join('.')}`;
  } catch {
    return origin;
  }
}
