import { HIDE_HEADER_VARIANTS } from '../data/routes';
import { ENVIRONMENTS } from '../data/environments';
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

export function diagnose(
  built: BuiltUrl,
  url: UrlParams,
  c: ContainerConfig,
  env: Env,
): Finding[] {
  const out: Finding[] = [];
  const framed = isFramedMode(c.mode);
  const harnessHttps = env.harnessOrigin.startsWith('https:');
  const targetHttps = built.origin.startsWith('https:');
  const sameSite = siteOf(env.harnessOrigin) === siteOf(built.origin);
  const tier = ENVIRONMENTS.find((e) => e.id === url.envId)?.tier;

  built.problems.forEach((p, i) =>
    out.push({ id: `url-${i}`, level: 'warn', title: 'URL incomplete', detail: p }),
  );

  if (tier === 'prod')
    out.push({
      id: 'prod',
      level: 'warn',
      title: 'Production',
      detail: 'Real customer data. Messages you send from the frame go to real phones.',
    });

  if (framed) {
    if (!harnessHttps && targetHttps && !isLocalHost(built.origin)) {
      out.push({
        id: 'frame-ancestors',
        level: 'error',
        title: 'This page cannot frame TEA over http',
        detail:
          'Staging sends Content-Security-Policy: frame-ancestors https:, which blocks any http parent. Run `yarn start` (https) or use the Netlify deploy.',
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
        detail: `${env.harnessOrigin} → ${built.origin}`,
      });
    }

    if (sameSite) {
      out.push({
        id: 'cookies',
        level: 'ok',
        title: 'Same-site frame',
        detail:
          'TEA’s session cookie counts as first-party here, so login works even with third-party cookies blocked.',
      });
    } else {
      out.push({
        id: 'cookies',
        level: 'info',
        title: 'Third-party frame',
        detail:
          'TEA sets cea_sid with SameSite=None; Secure. The session only sticks if this browser allows third-party cookies (Safari and Firefox block them by default). TEA does not call the Storage Access API.' +
          (isLocalHost(built.origin)
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
        detail:
          'Top nav collapses to the hamburger drawer below 1050px, but the single-column layout stays off in frames.',
      });

    if (c.sandbox) {
      const t = new Set(c.sandboxTokens);
      if (!t.has('allow-scripts') || !t.has('allow-same-origin'))
        out.push({
          id: 'sandbox-fatal',
          level: 'error',
          title: 'Sandbox will break TEA',
          detail: 'TEA needs allow-scripts and allow-same-origin (cookies, storage, websocket).',
        });
      if (!t.has('allow-forms'))
        out.push({ id: 'sandbox-forms', level: 'warn', title: 'No allow-forms', detail: 'The login form cannot submit.' });
      if (!t.has('allow-popups'))
        out.push({
          id: 'sandbox-popups',
          level: 'warn',
          title: 'No allow-popups',
          detail: 'Pop-out conversation, help links and integration connect popups are blocked.',
        });
    }
  } else {
    out.push({
      id: 'not-framed',
      level: 'info',
      title: 'Not framed',
      detail:
        'In a popup or tab TEA is the top window: no 940px cap, no dialog cap, normal cookies, the landing layout works.',
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
  if (hh && hh.id !== 'off' && hh.id !== 'canonical')
    out.push({
      id: 'hh-variant',
      level: 'info',
      title: `HideHeader variant: ${hh.label}`,
      detail: hh.expectHidden
        ? 'Key and value are case-insensitive, so the header should be hidden.'
        : 'This should NOT hide the header (only "true" counts, and duplicates join as "true,false").',
    });

  if (!env.cookiesEnabled)
    out.push({ id: 'no-cookies', level: 'error', title: 'Cookies disabled', detail: 'TEA cannot log in.' });

  return out;
}
