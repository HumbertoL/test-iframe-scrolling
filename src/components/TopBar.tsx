import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useBuiltUrl, useFindings } from '../lib/useBuiltUrl';
import { encodeScenario } from '../lib/share';
import { useLab } from '../state/store';
import { LEVEL_COLORS, MONO } from '../theme';

export function useCopy() {
  const [msg, setMsg] = useState<string | null>(null);
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(`${what} copied`);
    } catch {
      setMsg('Clipboard blocked: select the text and copy it');
    }
  };
  const snackbar = (
    <Snackbar
      open={!!msg}
      autoHideDuration={1800}
      onClose={() => setMsg(null)}
      message={msg}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
  );
  return { copy, snackbar };
}

export default function TopBar({
  onShortcuts,
  onToggleCatalog,
  onToggleInspector,
}: {
  onShortcuts: () => void;
  onToggleCatalog: () => void;
  onToggleInspector: () => void;
}) {
  const built = useBuiltUrl();
  const findings = useFindings();
  const resetAll = useLab((s) => s.resetAll);
  const { mode, systemMode, setMode } = useColorScheme();
  const dark = (mode === 'system' ? systemMode : mode) === 'dark';
  const { copy, snackbar } = useCopy();
  const worst = findings.some((f) => f.level === 'error') ? 'error' : findings.some((f) => f.level === 'warn') ? 'warn' : 'ok';

  const share = () => {
    const s = useLab.getState();
    copy(encodeScenario({ presetId: s.presetId, url: s.url, container: s.container }), 'Scenario link');
  };

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        height: 56,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <IconButton size="small" onClick={onToggleCatalog} sx={{ display: { lg: 'none' } }}>
        <MenuRoundedIcon />
      </IconButton>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
        <Logo />
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, fontSize: 15 }}>
            Embed Lab
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.2 }}>
            Text-Em-All integration harness
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        sx={{
          flex: 1,
          minWidth: 0,
          alignItems: 'center',
          gap: 1,
          height: 38,
          pl: 1.5,
          pr: 0.5,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Tooltip title={`Health: ${worst}`}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              flexShrink: 0,
              bgcolor: LEVEL_COLORS[worst],
              boxShadow: `0 0 10px ${LEVEL_COLORS[worst]}`,
            }}
          />
        </Tooltip>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            fontFamily: MONO,
            fontSize: 12.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            userSelect: 'all',
          }}
          title={built.url}
        >
          <Box component="span" sx={{ color: 'text.secondary' }}>
            {built.origin}
          </Box>
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {built.path}
          </Box>
          {built.query.map((q, i) => (
            <span key={i}>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {i ? '&' : '?'}
              </Box>
              <Box component="span" sx={{ color: 'primary.main' }}>
                {q.key}
              </Box>
              {q.value !== '' && (
                <>
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    =
                  </Box>
                  <Box component="span" sx={{ color: 'secondary.main' }}>
                    {q.key.toLowerCase() === 'token' || q.key === 'TemporaryKey' || q.key === 'LoginToken'
                      ? q.value.replace(/.(?=.{4})/g, '•')
                      : q.value}
                  </Box>
                </>
              )}
            </span>
          ))}
        </Box>
        <Tooltip title="Copy URL (C)">
          <IconButton size="small" onClick={() => copy(built.url, 'URL')}>
            <ContentCopyRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Open unframed in a new tab">
          <IconButton size="small" component="a" href={built.url} target="_blank" rel="noopener noreferrer">
            <OpenInNewRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" sx={{ gap: 0.25, flexShrink: 0 }}>
        <Tooltip title="Copy a link to this exact scenario (SSO tokens are left out)">
          <IconButton onClick={share}>
            <ShareRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={dark ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={() => setMode(dark ? 'light' : 'dark')}>
            {dark ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Keyboard shortcuts (?)">
          <IconButton onClick={onShortcuts} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            <KeyboardRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset everything">
          <IconButton onClick={resetAll}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton onClick={onToggleInspector} sx={{ display: { lg: 'none' } }}>
          <TuneRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
      {snackbar}
    </Stack>
  );
}

function Logo() {
  return (
    <Box
      component="img"
      src="/favicon.svg"
      alt=""
      sx={{ width: 32, height: 32, flexShrink: 0, filter: 'drop-shadow(0 6px 12px rgba(99,102,241,.45))' }}
    />
  );
}
