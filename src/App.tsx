import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import TopBar from './components/TopBar';
import Catalog from './components/catalog/Catalog';
import Inspector from './components/Inspector';
import Stage, { MODES } from './components/stage/Stage';
import { PRESETS } from './data/presets';
import { buildUrl } from './lib/url';
import { useLab } from './state/store';
import { MONO } from './theme';

const SHORTCUTS: [string, string][] = [
  ['R', 'Reload the frame'],
  ['O', 'Open or close the drawer/modal'],
  ['C', 'Copy the URL'],
  ['1 – 7', 'Container: ' + MODES.map((m) => m.label).join(', ')],
  ['J / K', 'Next / previous preset'],
  ['/', 'Search presets'],
  ['?', 'This help'],
];

function useGlobalWiring(openHelp: () => void) {
  // Anything TEA (or anything else) posts to this window.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      let text: string;
      try {
        text = typeof e.data === 'string' ? e.data : JSON.stringify(e.data);
      } catch {
        text = String(e.data);
      }
      useLab.getState().addLog('message', `← ${e.origin}: ${text.slice(0, 500)}`);
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable], [role="listbox"]')) return;
      const s = useLab.getState();
      const k = e.key.toLowerCase();
      if (k === 'r') s.reload();
      else if (k === 'o') s.setOpen(!s.open);
      else if (k === 'c') navigator.clipboard?.writeText(buildUrl(s.url).url).catch(() => {});
      else if (k === '?') openHelp();
      else if (k === 'j' || k === 'k') {
        const i = PRESETS.findIndex((p) => p.id === s.presetId);
        const next = PRESETS[(i + (k === 'j' ? 1 : -1) + PRESETS.length) % PRESETS.length];
        s.applyPreset(next.id);
      } else if (/^[1-7]$/.test(k)) {
        s.setContainer({ mode: MODES[Number(k) - 1].id });
        s.setOpen(true);
      } else return;
      e.preventDefault();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [openHelp]);
}

export default function App() {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('lg'));
  const [help, setHelp] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  useGlobalWiring(() => setHelp(true));

  const side = { bgcolor: 'background.paper', minHeight: 0 } as const;

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'grid',
        gridTemplateRows: '56px 1fr',
        gridTemplateColumns: { xs: '1fr', lg: '300px 1fr 400px' },
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ gridColumn: '1 / -1' }}>
        <TopBar
          onShortcuts={() => setHelp(true)}
          onToggleCatalog={() => setCatalogOpen(true)}
          onToggleInspector={() => setInspectorOpen(true)}
        />
      </Box>
      {wide ? (
        <Box component="aside" sx={{ ...side, borderRight: 1, borderColor: 'divider' }}>
          <Catalog />
        </Box>
      ) : (
        <Drawer open={catalogOpen} onClose={() => setCatalogOpen(false)} slotProps={{ paper: { sx: { width: 'min(320px, 90vw)' } } }}>
          <Catalog />
        </Drawer>
      )}
      <Box component="main" sx={{ minWidth: 0, minHeight: 0 }}>
        <Stage />
      </Box>
      {wide ? (
        <Box component="aside" sx={{ ...side, borderLeft: 1, borderColor: 'divider' }}>
          <Inspector />
        </Box>
      ) : (
        <Drawer
          anchor="right"
          open={inspectorOpen}
          onClose={() => setInspectorOpen(false)}
          slotProps={{ paper: { sx: { width: 'min(420px, 92vw)' } } }}
        >
          <Inspector />
        </Drawer>
      )}

      <Dialog open={help} onClose={() => setHelp(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 1 }}>
            {SHORTCUTS.map(([k, v]) => (
              <Stack key={k} direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                <Box
                  component="kbd"
                  sx={{
                    minWidth: 54,
                    textAlign: 'center',
                    fontFamily: MONO,
                    fontSize: 12,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    borderBottomWidth: 2,
                  }}
                >
                  {k}
                </Box>
                <Typography sx={{ fontSize: 13 }}>{v}</Typography>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
