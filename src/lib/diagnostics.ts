import { HIDE_HEADER_VARIANTS, isJoinRoute } from '../data/routes';
import { ENVIRONMENTS } from '../data/environments';
import { JOIN_FORM_MIN_HEIGHT, joinHostById } from '../data/join';
import { TALL_FRAME_FACTOR } from '../data/behaviors';
import type { ContainerConfig, UrlParams } from '../state/types';
import { siteOf, type BuiltUrl } from './url';

export type Level = 'ok' | 'info' | 'warn' | 'error';

export interface Finding {
  id: string;
  level: Level;
  title: string;
  detail: string;
}

export interface Env {
  harnessOrigin: string;
  screenHeight: number;
  hasStorageAccessApi: boolean;
  cookiesEnabled: boolean;
}

export function readEnv(): Env {
  return {
    harnessOrigin: location.origin,
    screenHeight: window.screen?.height || 900,
    hasStorageAccessApi: typeof document.hasStorageAccess === 'function',
    cookiesEnabled: navigator.cookieEnabled,
  };
}

const isLocalHost = (origin: string) => {
  try {
    const h = new URL(origin).hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h.endsWith('.localhost');
  } catch {
    return false;
  }
};

export const isFramedMode = (mode: ContainerConfig['mode']) => mode !== 'popup' && mode !== 'tab';

export function tallCapApplies(height: number, screenHeight: number) {
  return height > screenHeight * TALL_FRAME_FACTOR;
}

/** Facts about the target that differ between the TEA app and the join page. */
function target(url: UrlParams) {
  if (isJoinRoute(url.routeId)) {
    const host = joinHostById(url.joinHostId);
    return { join: true, tier: host.tier, httpsOnlyParents: host.frameAncestorsHttpsOnly, hostNote: host };
  }
  const env = ENVIRONMENTS.find((e) => e.id === url.envId);
  // Every deployed cea-desktop (and bifrost) sends frame-ancestors https:.
  return { join: false, tier: env?.tier, httpsOnlyParents: env?.frameAncestorsHttpsOnly ?? true, hostNote: undefined };
}

export function diagnose(built: BuiltUrl, url: UrlParams, c: ContainerConfig, env: Env): Finding[] {
  const out: Finding[] = [];
  const framed = isFramedMode(c.mode);
  const harnessHttps = env.harnessOrigin.startsWith('https:');
  const targetHttps = built.origin.startsWith('https:');
  const sameSite = siteOf(env.harnessOrigin) === siteOf(built.origin);
  const t = target(url);

  built.problems.forEach((p, i) =>
    out.push({ id: `url-${i}`, level: 'warn', title: 'URL incomplete', detail: p }),
  );

  if (t.tier === 'prod')
    out.push(
      t.join
        ? {
            id: 'prod',
            level: 'warn',
            title: 'Production join page',
            detail:
              'Submitting the form sends a real SMS invite from the account’s text number to the phone you enter. Use your own number, or a staging keyword.',
          }
        : {
            id: 'prod',
            level: 'warn',
            title: 'Production',
            detail: 'Real customer data. Messages you send from the frame go to real phones.',
          },
    );

  if (framed) {
    if (!harnessHttps && targetHttps && t.httpsOnlyParents && !isLocalHost(built.origin)) {
      out.push({
        id: 'frame-ancestors',
        level: 'error',
        title: 'This page cannot frame it over http',
        detail: `${built.origin} sends Content-Security-Policy: frame-ancestors https:, which blocks any http parent. Run \`yarn start\` (https) or use the Netlify deploy.`,
      });
    } else if (harnessHttps && !targetHttps) {
      out.push({
        id: 'mixed',
        level: isLocalHost(built.origin) ? 'warn' : 'error',
        title: 'Mixed content',
        detail: isLocalHost(built.origin)
          ? 'An https page framing http://localhost works in Chrome but not Safari. If it stays blank, run `yarn start:http`.'
          : 'Browsers block http frames inside an https page.',
      });
    } else {
      out.push({
        id: 'framing-ok',
        level: 'ok',
        title: 'Framing allowed',
        detail: `${env.harnessOrigin} → ${built.origin}${t.httpsOnlyParents ? '' : ' (no frame-ancestors, any parent may frame it)'}`,
      });
    }

    if (t.join) addJoinFindings(out, url, c);
    else addAppFindings(out, c, env, sameSite, built.origin);

    if (c.sandbox) {
      const tok = new Set(c.sandboxTokens);
      if (!tok.has('allow-scripts') || !tok.has('allow-same-origin'))
        out.push({
          id: 'sandbox-fatal',
          level: 'error',
          title: t.join ? 'Sandbox will break the form' : 'Sandbox will break TEA',
          detail: t.join
            ? 'The form is a script bundle, and without allow-same-origin its origin becomes "null", which the forms proxy’s CORS check rejects.'
            : 'TEA needs allow-scripts and allow-same-origin (cookies, storage, websocket).',
        });
      if (!tok.has('allow-forms') && !t.join)
        out.push({ id: 'sandbox-forms', level: 'warn', title: 'No allow-forms', detail: 'The login form cannot submit.' });
      if (!tok.has('allow-popups'))
        out.push({
          id: 'sandbox-popups',
          level: 'warn',
          title: 'No allow-popups',
          detail: t.join
            ? 'The Terms of Service and Privacy Policy links open in a new tab and will do nothing.'
            : 'Pop-out conversation, help links and integration connect popups are blocked.',
        });
    }
  } else {
    out.push({
      id: 'not-framed',
      level: 'info',
      title: 'Not framed',
      detail: t.join
        ? 'The join page as a visitor sees it from a shared link.'
        : 'In a popup or tab TEA is the top window: no 940px cap, no dialog cap, normal cookies, the landing layout works.',
    });
    if (c.mode === 'popup')
      out.push({
        id: 'popup',
        level: 'info',
        title: 'Popup blockers',
        detail: 'Opened from a click, so it should be allowed. The log reports when it closes.',
      });
  }

  const hh = HIDE_HEADER_VARIANTS.find((v) => v.id === url.hideHeader);
  if (!t.join && hh && hh.id !== 'off' && hh.id !== 'canonical')
    out.push({
      id: 'hh-variant',
      level: 'info',
      title: `HideHeader variant: ${hh.label}`,
      detail: hh.expectHidden
        ? 'Key and value are case-insensitive, so the header should be hidden.'
        : 'This should NOT hide the header (only "true" counts, and duplicates join as "true,false").',
    });

  if (!env.cookiesEnabled && !t.join)
    out.push({ id: 'no-cookies', level: 'error', title: 'Cookies disabled', detail: 'TEA cannot log in.' });

  return out;
}

function addAppFindings(out: Finding[], c: ContainerConfig, env: Env, sameSite: boolean, origin: string) {
  if (sameSite) {
    out.push({
      id: 'cookies',
      level: 'ok',
      title: 'Same-site frame',
      detail: 'TEA’s session cookie counts as first-party here, so login works even with third-party cookies blocked.',
    });
  } else {
    out.push({
      id: 'cookies',
      level: 'info',
      title: 'Third-party frame',
      detail:
        'TEA sets cea_sid with SameSite=None; Secure. The session only sticks if this browser allows third-party cookies (Safari and Firefox block them by default). TEA does not call the Storage Access API.' +
        (isLocalHost(origin)
          ? ' Local cea-desktop uses SameSite=Strict, so frame it from http://localhost (`yarn start:http`).'
          : ''),
    });
  }

  const threshold = Math.round(env.screenHeight * TALL_FRAME_FACTOR);
  out.push(
    tallCapApplies(c.height, env.screenHeight)
      ? {
          id: 'tall',
          level: 'info',
          title: '#root will be capped at 940px',
          detail: `Frame ${c.height}px > ${threshold}px (1.5 × your ${env.screenHeight}px screen), so TEA adds .iframe-max-height at load. Content past 940px is cut off unless TEA scrolls inside.`,
        }
      : {
          id: 'tall',
          level: 'ok',
          title: 'No tall-frame cap',
          detail: `Frame ${c.height}px ≤ ${threshold}px (1.5 × your ${env.screenHeight}px screen). The cap needs a taller frame or a shorter screen.`,
        },
  );

  if (c.height < 875)
    out.push({
      id: 'dialog-cap',
      level: 'info',
      title: 'Shorter than the dialog cap',
      detail: 'TEA caps dialogs at 875px in frames; here the frame is the limit instead.',
    });

  if (c.scrolling === 'no' && c.height < 940 && !tallCapApplies(c.height, env.screenHeight))
    out.push({
      id: 'scrolling-no',
      level: 'warn',
      title: 'scrolling="no" on a short frame',
      detail:
        'TEA scrolls the document, not an inner box (except the message thread and lists). Anything below the fold may be unreachable.',
    });

  if (c.width < 1050)
    out.push({
      id: 'narrow',
      level: 'info',
      title: `Narrow frame (${c.width}px)`,
      detail: 'Top nav collapses to the hamburger drawer below 1050px, but the single-column layout stays off in frames.',
    });
}

function addJoinFindings(out: Finding[], url: UrlParams, c: ContainerConfig) {
  const host = joinHostById(url.joinHostId);
  out.push({
    id: 'join-cookies',
    level: 'ok',
    title: 'No login, no third-party cookie trouble',
    detail:
      'The form is anonymous. The only cookies are Cloudflare’s, which are already SameSite=None and Partitioned. HubSpot’s tracking script may still show a cookie banner inside the frame.',
  });
  if (host.hubspot)
    out.push({
      id: 'join-in-iframe',
      level: 'info',
      title: 'HubSpot changes the page when framed',
      detail:
        'An inline script adds body.in-iframe, and the page CSS then sets .c-col-inner { height: 0 !important } around the form. Check the form is not clipped.',
    });
  if (url.joinType && !host.hubspot)
    out.push({
      id: 'join-type-dropped',
      level: 'warn',
      title: `/${url.joinType} is ignored here`,
      detail: 'The staging-forms loader keeps only the keyword, so the consent text reads "informational". Use the HubSpot staging page to test types.',
    });
  if (c.height < JOIN_FORM_MIN_HEIGHT + 250)
    out.push({
      id: 'join-short',
      level: 'warn',
      title: 'Frame may be too short',
      detail: `The form needs about ${JOIN_FORM_MIN_HEIGHT}px for #root, plus the page header and consent text. The frame is ${c.height}px.`,
    });
  if (c.scrolling === 'no')
    out.push({
      id: 'join-scrolling',
      level: 'info',
      title: 'scrolling="no"',
      detail: 'The page has a HubSpot header and footer around the form, so check the Sign Up button and the success message are still visible.',
    });
  if (c.width < 768)
    out.push({
      id: 'join-narrow',
      level: 'info',
      title: `Narrow frame (${c.width}px)`,
      detail: 'Below 768px the form drops its 700px width and goes full width.',
    });
}
