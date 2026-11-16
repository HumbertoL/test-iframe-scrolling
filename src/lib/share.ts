import type { ContainerConfig, UrlParams } from '../state/types';

export interface SharedScenario {
  presetId: string | null;
  url: Partial<UrlParams>;
  container: Partial<ContainerConfig>;
}

const PREFIX = '#s=';

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string) {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** SSO tokens are single-use secrets, so they never go into a share link. */
export function encodeScenario(s: SharedScenario): string {
  const url = { ...s.url, ssoValue: '' };
  return `${location.origin}${location.pathname}${PREFIX}${toBase64Url(JSON.stringify({ ...s, url }))}`;
}

export function decodeScenario(hash: string): SharedScenario | null {
  if (!hash.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(hash.slice(PREFIX.length)));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
