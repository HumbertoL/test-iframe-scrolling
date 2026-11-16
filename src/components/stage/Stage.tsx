import { useEffect, useRef, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ViewDayRoundedIcon from '@mui/icons-material/ViewDayRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import WebAssetRoundedIcon from '@mui/icons-material/WebAssetRounded';
import VerticalSplitRoundedIcon from '@mui/icons-material/VerticalSplitRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import PictureInPictureAltRoundedIcon from '@mui/icons-material/PictureInPictureAltRounded';
import TabRoundedIcon from '@mui/icons-material/TabRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HeightRoundedIcon from '@mui/icons-material/HeightRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import { useLab } from '../../state/store';
import type { ContainerMode } from '../../state/types';
import { useBuiltUrl } from '../../lib/useBuiltUrl';
import { armGrowAfterLoad } from '../../lib/frames';
import { breakpointsFor } from '../../data/behaviors';
import { isJoinRoute } from '../../data/routes';
import { MONO } from '../../theme';
import EmbedFrame from './EmbedFrame';
import { HostList, HostRecord, HostSite } from './HostShell';

/** The page behind or around the frame: an ATS for app views, a customer site for the join form. */
function Backstage({ compact }: { compact?: boolean }) {
  const join = useLab((s) => isJoinRoute(s.url.routeId));
  return join ? <HostSite /> : <HostList compact={compact} />;
}

export const MODES: { id: ContainerMode; label: string; icon: ReactNode; hint: string }[] = [
  { id: 'inline', label: 'Inline', icon: <ViewDayRoundedIcon fontSize="small" />, hint: 'Fixed-size frame in the page. The page scrolls, as with Bullhorn’s 4000px tab' },
  { id: 'drawer', label: 'Drawer', icon: <ViewSidebarRoundedIcon fontSize="small" />, hint: 'Slide-over panel above the partner app' },
  { id: 'modal', label: 'Modal', icon: <WebAssetRoundedIcon fontSize="small" />, hint: 'Centered dialog over the partner app' },
  { id: 'split', label: 'Split', icon: <VerticalSplitRoundedIcon fontSize="small" />, hint: 'Docked side panel next to the partner app' },
  { id: 'compare', label: 'Compare', icon: <ViewColumnRoundedIcon fontSize="small" />, hint: 'The same URL at several widths' },
  { id: 'popup', label: 'Popup', icon: <PictureInPictureAltRoundedIcon fontSize="small" />, hint: 'window.open with a size (not framed)' },
  { id: 'tab', label: 'New tab', icon: <TabRoundedIcon fontSize="small" />, hint: 'Plain new tab (not framed)' },
];

const ZOOMS = [1, 0.75, 0.5, 0.33, 0.25];

export default function Stage() {
  const c = useLab((s) => s.container);
  const open = useLab((s) => s.open);
  const setOpen = useLab((s) => s.setOpen);
  const setContainer = useLab((s) => s.setContainer);
  const reload = useLab((s) => s.reload);
  const addLog = useLab((s) => s.addLog);
  const overlay = c.mode === 'drawer' || c.mode === 'modal';

  const growTest = () => {
    armGrowAfterLoad(4000);
    setContainer({ height: 800, mode: c.mode === 'compare' || c.mode === 'popup' || c.mode === 'tab' ? 'inline' : c.mode });
    setOpen(true);
    reload();
    addLog('resize', 'Experiment: load at 800px, then grow to 4000px');
  };

  return (
    <Stack sx={{ height: '100%', minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={c.mode}
          onChange={(_, m) => m && (setContainer({ mode: m }), setOpen(true))}
        >
          {MODES.map((m) => (
            <Tooltip key={m.id} title={m.hint}>
              <ToggleButton value={m.id} sx={{ px: 1.25, py: 0.5 }}>
                {m.icon}
                <Box component="span" sx={{ display: m.id === c.mode ? 'inline' : 'none' }}>
                  {m.label}
                </Box>
              </ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>
        <Chip
          size="small"
          variant="outlined"
          label={`${c.width} × ${c.height}`}
          sx={{ fontFamily: MONO, fontWeight: 600 }}
        />
        <Box sx={{ flex: 1 }} />
        {overlay && (
          <Button size="small" variant={open ? 'outlined' : 'contained'} onClick={() => setOpen(!open)}>
            {open ? 'Close' : 'Open'} {c.mode}
          </Button>
        )}
        <Tooltip title="Known bug check: load at 800px, then grow to 4000px. The 940px cap should NOT appear, because TEA only checks once at load.">
          <Button size="small" startIcon={<HeightRoundedIcon />} onClick={growTest}>
            Resize after load
          </Button>
        </Tooltip>
        <Select
          value={c.zoom}
          onChange={(e) => setContainer({ zoom: Number(e.target.value) })}
          sx={{ fontFamily: MONO, fontSize: 12, '& .MuiSelect-select': { py: 0.6 } }}
        >
          {ZOOMS.map((z) => (
            <MenuItem key={z} value={z} sx={{ fontFamily: MONO, fontSize: 12 }}>
              {Math.round(z * 100)}%
            </MenuItem>
          ))}
        </Select>
        <Tooltip title="Reload frame (R)">
          <IconButton size="small" onClick={reload}>
            <RefreshRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box
        sx={(t) => ({
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: overlay || c.mode === 'split' ? 'hidden' : 'auto',
          backgroundColor: 'background.default',
          backgroundImage: `radial-gradient(${t.alpha(t.vars!.palette.text.primary, 0.09)} 1px, transparent 1px)`,
          backgroundSize: '18px 18px',
        })}
      >
        <Canvas />
      </Box>
    </Stack>
  );
}

function Canvas() {
  const c = useLab((s) => s.container);
  switch (c.mode) {
    case 'inline':
      return <InlineView />;
    case 'drawer':
      return <DrawerView />;
    case 'modal':
      return <ModalView />;
    case 'split':
      return <SplitView />;
    case 'compare':
      return <CompareView />;
    default:
      return <LaunchView />;
  }
}

function InlineView() {
  const host = useLab((s) => s.container.hostShell);
  const join = useLab((s) => isJoinRoute(s.url.routeId));
  return (
    <Box sx={{ p: 4, width: 'max-content', minWidth: '100%' }}>
      {host && join ? (
        <HostSite>
          <EmbedFrame />
        </HostSite>
      ) : host ? (
        <HostRecord>
          <EmbedFrame />
        </HostRecord>
      ) : (
        <Stack sx={{ alignItems: 'center' }}>
          <EmbedFrame />
        </Stack>
      )}
    </Box>
  );
}

function PanelHeader({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        px: 2,
        height: 48,
        flexShrink: 0,
        color: '#fff',
        background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)',
      }}
    >
      <Typography sx={{ fontWeight: 700, flex: 1 }}>{title}</Typography>
      {onClose && (
        <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );
}

function Backdrop({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: 'rgba(2,6,23,.45)',
        backdropFilter: 'blur(1.5px)',
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity .25s',
        zIndex: 1,
      }}
    />
  );
}

function DrawerView() {
  const c = useLab((s) => s.container);
  const open = useLab((s) => s.open);
  const setOpen = useLab((s) => s.setOpen);
  const right = c.drawerAnchor === 'right';
  return (
    <Box sx={{ position: 'absolute', inset: 0 }}>
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'auto', p: 4 }}>
        <Backstage />
      </Box>
      <Backdrop show={open} onClick={() => setOpen(false)} />
      <Stack
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [right ? 'right' : 'left']: 0,
          // Grow past panelPct when needed so the frame keeps its real width.
          width: `min(100%, max(${c.panelPct}%, ${Math.round(c.width * c.zoom) + 50}px))`,
          minWidth: 320,
          bgcolor: 'background.paper',
          zIndex: 2,
          boxShadow: '0 0 60px rgba(0,0,0,.35)',
          transform: open ? 'none' : `translateX(${right ? '' : '-'}105%)`,
          transition: 'transform .32s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <PanelHeader title="Text-Em-All Integration" onClose={() => setOpen(false)} />
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>{open && <EmbedFrame />}</Box>
      </Stack>
    </Box>
  );
}

function ModalView() {
  const open = useLab((s) => s.open);
  const setOpen = useLab((s) => s.setOpen);
  return (
    <Box sx={{ position: 'absolute', inset: 0 }}>
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'auto', p: 4 }}>
        <Backstage />
      </Box>
      <Backdrop show={open} onClick={() => setOpen(false)} />
      {open && (
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'auto', zIndex: 2, p: 4, pointerEvents: 'none' }}>
          <Stack
            sx={{
              mx: 'auto',
              width: 'max-content',
              maxWidth: 'none',
              bgcolor: 'background.paper',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 40px 100px -20px rgba(0,0,0,.6)',
              pointerEvents: 'auto',
              animation: 'pop .25s cubic-bezier(.2,.8,.2,1)',
              '@keyframes pop': { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'none' } },
            }}
          >
            <PanelHeader title="Text-Em-All" onClose={() => setOpen(false)} />
            <Box sx={{ p: 2 }}>
              <EmbedFrame />
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

function SplitView() {
  const c = useLab((s) => s.container);
  return (
    <Stack direction={c.drawerAnchor === 'right' ? 'row' : 'row-reverse'} sx={{ position: 'absolute', inset: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', p: 3 }}>
        <Backstage compact />
      </Box>
      <Stack
        sx={{
          width: `min(85%, max(${c.panelPct}%, ${Math.round(c.width * c.zoom) + 34}px))`,
          minWidth: 320,
          borderLeft: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <PanelHeader title="Text-Em-All" />
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <EmbedFrame />
        </Box>
      </Stack>
    </Stack>
  );
}

function CompareView() {
  const c = useLab((s) => s.container);
  const join = useLab((s) => isJoinRoute(s.url.routeId));
  return (
    <Stack direction="row" sx={{ gap: 4, p: 4, width: 'max-content', alignItems: 'flex-start' }}>
      {c.compareWidths.map((w) => {
        const crossed = breakpointsFor(join).filter((b) => (b.side === 'below' ? w < b.px : w > b.px));
        return (
          <Stack key={w} sx={{ gap: 1 }}>
            <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap', maxWidth: w * c.zoom }}>
              <Chip size="small" color="primary" label={`${w}px`} sx={{ fontFamily: MONO }} />
              {crossed.map((b) => (
                <Chip key={b.px} size="small" variant="outlined" label={b.label} />
              ))}
            </Stack>
            <EmbedFrame label={`${w}px`} width={w} />
          </Stack>
        );
      })}
    </Stack>
  );
}

function LaunchView() {
  const c = useLab((s) => s.container);
  const addLog = useLab((s) => s.addLog);
  const { url } = useBuiltUrl();
  const popup = useRef<Window | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const isPopup = c.mode === 'popup';

  useEffect(() => {
    if (!popupOpen) return;
    const id = setInterval(() => {
      if (popup.current?.closed) {
        setPopupOpen(false);
        addLog('popup', 'Popup closed');
      }
    }, 500);
    return () => clearInterval(id);
  }, [popupOpen, addLog]);

  const launch = () => {
    if (isPopup) {
      const left = Math.max(0, (screen.width - c.width) / 2);
      const top = Math.max(0, (screen.height - c.height) / 2);
      popup.current = window.open(url, 'tea-embed-lab-popup', `popup,width=${c.width},height=${c.height},left=${left},top=${top}`);
      if (popup.current) {
        setPopupOpen(true);
        addLog('popup', `Opened popup ${c.width} × ${c.height}`);
      } else addLog('warn', 'Popup was blocked');
    } else {
      window.open(url, '_blank', 'noopener');
      addLog('popup', 'Opened in a new tab');
    }
  };

  return (
    <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center', p: 4 }}>
      <Stack
        sx={{
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
          p: 5,
          maxWidth: 520,
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
          }}
        >
          {isPopup ? <PictureInPictureAltRoundedIcon /> : <TabRoundedIcon />}
        </Box>
        <Typography variant="h6">{isPopup ? `Popup window · ${c.width} × ${c.height}` : 'New browser tab'}</Typography>
        <Typography color="text.secondary">
          TEA runs as the top window here, so none of the iframe behaviour applies: no 940px cap, no dialog cap, and
          first-party cookies.
        </Typography>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button variant="contained" size="large" startIcon={<LaunchRoundedIcon />} onClick={launch}>
            {isPopup ? (popupOpen ? 'Reload popup' : 'Open popup') : 'Open tab'}
          </Button>
          {popupOpen && (
            <Button size="large" onClick={() => popup.current?.close()}>
              Close it
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
