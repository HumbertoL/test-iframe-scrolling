export interface Environment {
  id: string;
  label: string;
  origin: string;
  tier: 'prod' | 'staging' | 'dev' | 'local';
  note?: string;
}

/**
 * Hosts the TEA web app (cea-desktop) is served from. The SSO workflow picks
 * `{staging-|dev-|beta-}app.call-em-all.com` (cea-framework SingleSignOnWorkflow),
 * and Firebird points at the text-em-all.com equivalents.
 */
export const ENVIRONMENTS: Environment[] = [
  {
    id: 'staging-cea',
    label: 'Staging · call-em-all',
    origin: 'https://staging-app.call-em-all.com',
    tier: 'staging',
    note: 'The host SSO URLs use on staging.',
  },
  {
    id: 'staging-tea',
    label: 'Staging · text-em-all',
    origin: 'https://staging-app.text-em-all.com',
    tier: 'staging',
  },
  {
    id: 'dev-cea',
    label: 'Dev · call-em-all',
    origin: 'https://dev-app.call-em-all.com',
    tier: 'dev',
  },
  {
    id: 'beta-cea',
    label: 'Beta · call-em-all',
    origin: 'https://beta-app.call-em-all.com',
    tier: 'dev',
  },
  {
    id: 'prod-tea',
    label: 'Production · text-em-all',
    origin: 'https://app.text-em-all.com',
    tier: 'prod',
  },
  {
    id: 'prod-cea',
    label: 'Production · call-em-all',
    origin: 'https://app.call-em-all.com',
    tier: 'prod',
    note: 'The host SSO URLs use in production.',
  },
  {
    id: 'local',
    label: 'Local cea-desktop',
    origin: 'http://localhost:3000',
    tier: 'local',
    note: 'Same site as this harness (ports do not count), so dev cookies (SameSite=Strict) still work.',
  },
];

export const CUSTOM_ENV_ID = 'custom';
