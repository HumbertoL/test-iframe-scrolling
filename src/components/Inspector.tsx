import { useState } from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useFindings } from '../lib/useBuiltUrl';
import { useLab } from '../state/store';
import { LEVEL_COLORS } from '../theme';
import UrlPanel from './panels/UrlPanel';
import FramePanel from './panels/FramePanel';
import TestPanel from './panels/TestPanel';
import HealthPanel from './panels/HealthPanel';
import LogPanel from './panels/LogPanel';

const TABS = ['URL', 'Frame', 'Test', 'Health', 'Log'] as const;
type TabId = (typeof TABS)[number];

function readTab(): TabId {
  try {
    const t = localStorage.getItem('tea-embed-lab:tab') as TabId | null;
    return t && TABS.includes(t) ? t : 'URL';
  } catch {
    return 'URL';
  }
}

export default function Inspector() {
  const [tab, setTab] = useState<TabId>(readTab);
  const findings = useFindings();
  const logCount = useLab((s) => s.log.length);
  const errors = findings.filter((f) => f.level === 'error').length;
  const warns = findings.filter((f) => f.level === 'warn').length;

  const choose = (t: TabId) => {
    setTab(t);
    try {
      localStorage.setItem('tea-embed-lab:tab', t);
    } catch {
      /* ignore */
    }
  };

  const label = (t: TabId) => {
    if (t === 'Health' && (errors || warns))
      return (
        <Badge
          badgeContent={errors || warns}
          sx={{ '& .MuiBadge-badge': { bgcolor: errors ? LEVEL_COLORS.error : LEVEL_COLORS.warn, color: '#fff', right: -10 } }}
        >
          {t}
        </Badge>
      );
    if (t === 'Log' && logCount)
      return (
        <Badge badgeContent={logCount} max={99} color="primary" sx={{ '& .MuiBadge-badge': { right: -12 } }}>
          {t}
        </Badge>
      );
    return t;
  };

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => choose(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        {TABS.map((t) => (
          <Tab key={t} value={t} label={label(t)} sx={{ minWidth: 0, px: 1 }} />
        ))}
      </Tabs>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tab === 'URL' && <UrlPanel />}
        {tab === 'Frame' && <FramePanel />}
        {tab === 'Test' && <TestPanel />}
        {tab === 'Health' && <HealthPanel />}
        {tab === 'Log' && <LogPanel />}
      </Box>
    </Stack>
  );
}
