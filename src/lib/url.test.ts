import { describe, expect, it } from 'vitest';
import { buildUrl, siteOf } from './url';
import { diagnose } from './diagnostics';
import { decodeScenario } from './share';
import { DEFAULT_CONTAINER, DEFAULT_URL } from '../state/defaults';
import { PRESETS } from '../data/presets';
import type { UrlParams } from '../state/types';

const url = (p: Partial<UrlParams>) => buildUrl({ ...DEFAULT_URL, ...p });

describe('buildUrl', () => {
  it('builds the Embedded Views conversation URL', () => {
    expect(url({ routeId: 'conversation', conversationId: '123' }).url).toBe(
      'https://staging-app.call-em-all.com/inbox/123/messages?include=edit,optout&HideHeader=true',
    );
  });

  it('builds the Akken new-conversation URL with digits only', () => {
    const b = url({
      routeId: 'conversation-new',
      phoneNumber: '(214) 555-0101',
      textNumberId: '42',
      include: ['optout'],
    });
    expect(b.url).toBe(
      'https://staging-app.call-em-all.com/inbox/X/messages?phonenumber=2145550101&textnumberid=42&include=optout&HideHeader=true',
    );
    expect(b.problems).toEqual([]);
  });

  it('flags missing inputs', () => {
    expect(url({ routeId: 'conversation-new', phoneNumber: '123' }).problems).toEqual([
      'phonenumber should be 10 digits',
      'Needs a textnumberid',
    ]);
  });

  it('keeps raw HideHeader variants so the parser can be tested', () => {
    expect(url({ routeId: 'inbox', hideHeader: 'dupe' }).url).toBe(
      'https://staging-app.call-em-all.com/inbox?HideHeader=true&HideHeader=false',
    );
  });

  it('builds the SSO entry URL', () => {
    expect(
      url({ routeId: 'sso', ssoKind: 'TemporaryKey', ssoValue: 'abc', ssoDestinationHome: true, hideHeader: 'off' }).url,
    ).toBe('https://staging-app.call-em-all.com/sso.aspx?TemporaryKey=abc&destination=home&hideheader=true');
  });

  it('builds a URL for every preset without throwing', () => {
    for (const p of PRESETS) expect(url(p.url).url).toMatch(/^https:\/\//);
  });
});

describe('siteOf', () => {
  it('ignores subdomains and ports but not the scheme', () => {
    expect(siteOf('https://staging-app.call-em-all.com')).toBe('https://call-em-all.com');
    expect(siteOf('http://localhost:3000')).toBe(siteOf('http://localhost:5180'));
    expect(siteOf('http://localhost:3000')).not.toBe(siteOf('https://localhost:5180'));
  });
});

describe('diagnose', () => {
  const env = { harnessOrigin: 'http://localhost:5180', screenHeight: 1080, hasStorageAccessApi: true, cookiesEnabled: true };

  it('explains frame-ancestors when served over http', () => {
    const f = diagnose(url({}), DEFAULT_URL, DEFAULT_CONTAINER, env);
    expect(f.find((x) => x.id === 'frame-ancestors')?.level).toBe('error');
  });

  it('predicts the 940px cap for the Bullhorn tall frame', () => {
    const c = { ...DEFAULT_CONTAINER, height: 4000 };
    const f = diagnose(url({}), DEFAULT_URL, c, { ...env, harnessOrigin: 'https://localhost:5180' });
    expect(f.find((x) => x.id === 'tall')?.title).toMatch(/940/);
  });

  it('flags a sandbox that would break TEA', () => {
    const c = { ...DEFAULT_CONTAINER, sandbox: true, sandboxTokens: ['allow-scripts'] };
    const f = diagnose(url({}), DEFAULT_URL, c, env);
    expect(f.some((x) => x.id === 'sandbox-fatal')).toBe(true);
  });
});

describe('share links', () => {
  it('ignores garbage', () => {
    expect(decodeScenario('#s=not-base64!!')).toBeNull();
    expect(decodeScenario('#other')).toBeNull();
  });
});
