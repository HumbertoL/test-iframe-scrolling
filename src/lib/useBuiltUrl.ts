import { useMemo } from 'react';
import { useLab } from '../state/store';
import { buildUrl } from './url';
import { diagnose, readEnv } from './diagnostics';

export function useBuiltUrl() {
  const url = useLab((s) => s.url);
  return useMemo(() => buildUrl(url), [url]);
}

export function useFindings() {
  const url = useLab((s) => s.url);
  const container = useLab((s) => s.container);
  const built = useBuiltUrl();
  return useMemo(() => diagnose(built, url, container, readEnv()), [built, url, container]);
}
