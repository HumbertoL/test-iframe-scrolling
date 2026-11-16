import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFindings } from '../../lib/useBuiltUrl';
import { readEnv } from '../../lib/diagnostics';
import { LEVEL_COLORS, MONO } from '../../theme';
import { LEVEL_ICON, Section } from './ui';

const ORDER = { error: 0, warn: 1, info: 2, ok: 3 } as const;

export default function HealthPanel() {
  const findings = [...useFindings()].sort((a, b) => ORDER[a.level] - ORDER[b.level]);
  const facts = useFacts();

  return (
    <>
      <Section title="Pre-flight">
        <Stack sx={{ gap: 1 }}>
          {findings.map((f) => (
            <Stack
              key={f.id}
              direction="row"
              sx={{
                gap: 1.25,
                p: 1.25,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                borderLeft: `3px solid ${LEVEL_COLORS[f.level]}`,
              }}
            >
              <Box sx={{ pt: 0.1 }}>{LEVEL_ICON[f.level]}</Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 650, fontSize: 12.5 }}>{f.title}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25, lineHeight: 1.45 }}>
                  {f.detail}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Section>
      <Section title="This browser">
        <Stack sx={{ gap: 0.5 }}>
          {facts.map(([k, v]) => (
            <Box key={k} sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', fontSize: 12, gap: 1 }}>
              <Box sx={{ color: 'text.secondary' }}>{k}</Box>
              <Box sx={{ fontFamily: MONO, fontSize: 11.5, wordBreak: 'break-all' }}>{v}</Box>
            </Box>
          ))}
        </Stack>
      </Section>
    </>
  );
}

function useFacts(): [string, string][] {
  const [vp, setVp] = useState({ w: innerWidth, h: innerHeight });
  useEffect(() => {
    const on = () => setVp({ w: innerWidth, h: innerHeight });
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);
  const env = readEnv();
  const uaData = (navigator as Navigator & { userAgentData?: { brands: { brand: string; version: string }[] } })
    .userAgentData;
  const browser =
    uaData?.brands.filter((b) => !/not.?a.?brand/i.test(b.brand)).map((b) => `${b.brand} ${b.version}`).join(', ') ||
    navigator.userAgent;
  return [
    ['Harness origin', env.harnessOrigin],
    ['Secure context', String(isSecureContext)],
    ['Screen', `${screen.width} × ${screen.height} @${devicePixelRatio}x`],
    ['Window', `${vp.w} × ${vp.h}`],
    ['Tall-cap threshold', `${Math.round(env.screenHeight * 1.5)}px`],
    ['Cookies enabled', String(env.cookiesEnabled)],
    ['Storage Access API', env.hasStorageAccessApi ? 'available (TEA does not use it)' : 'not available'],
    ['Browser', browser],
  ];
}
