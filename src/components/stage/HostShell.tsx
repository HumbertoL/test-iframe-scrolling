import type { ReactNode } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import { useLab } from '../../state/store';
import { routeById } from '../../data/routes';
import { partnerById, presetById } from '../../data/presets';

/** Fictional people; 555-01xx numbers are reserved for fiction. */
export const CANDIDATES = [
  { name: 'Ada Lovelace', role: 'Forklift Operator', phone: '2145550101', status: 'Placed' },
  { name: 'Grace Hopper', role: 'Warehouse Lead', phone: '2145550102', status: 'Interviewing' },
  { name: 'Alan Turing', role: 'Night Shift Picker', phone: '2145550103', status: 'New' },
  { name: 'Katherine Johnson', role: 'Inventory Analyst', phone: '2145550104', status: 'Submitted' },
  { name: 'Hedy Lamarr', role: 'Dispatcher', phone: '2145550105', status: 'New' },
  { name: 'Mary Jackson', role: 'QA Inspector', phone: '2145550106', status: 'Placed' },
];

const fmt = (d: string) => `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;

function useAccent() {
  const preset = presetById(useLab((s) => s.presetId));
  return preset ? partnerById(preset.partnerId).color : '#6366f1';
}

function Chrome({ children }: { children: ReactNode }) {
  const accent = useAccent();
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100%',
        bgcolor: '#f6f7fb',
        color: '#0f172a',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 30px 80px -40px rgba(0,0,0,.5)',
        border: '1px solid rgba(15,23,42,.08)',
      }}
    >
      <Stack
        sx={{ width: 56, flexShrink: 0, bgcolor: '#111827', alignItems: 'center', py: 1.5, gap: 1 }}
      >
        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: accent, mb: 1 }} />
        {[PeopleAltRoundedIcon, WorkOutlineRoundedIcon, ApartmentRoundedIcon, InsightsRoundedIcon].map(
          (Icon, i) => (
            <Box
              key={i}
              sx={{
                p: 0.9,
                borderRadius: 1.5,
                color: i === 0 ? '#fff' : '#6b7280',
                bgcolor: i === 0 ? alpha(accent, 0.35) : 'transparent',
                display: 'flex',
              }}
            >
              <Icon fontSize="small" />
            </Box>
          ),
        )}
      </Stack>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            px: 2.5,
            height: 52,
            bgcolor: '#fff',
            borderBottom: '1px solid #e5e7eb',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#111827' }}>
            Recruit-Em-All
          </Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: 12 }}>· a pretend partner app</Typography>
        </Stack>
        <Box sx={{ flex: 1, p: 2.5, minWidth: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
}

/** Candidate list behind drawers, modals and splits. "Text" opens the container. */
export function HostList({ compact }: { compact?: boolean }) {
  const setUrl = useLab((s) => s.setUrl);
  const setOpen = useLab((s) => s.setOpen);
  const addLog = useLab((s) => s.addLog);
  const routeId = useLab((s) => s.url.routeId);
  const accent = useAccent();
  const usesPhone = routeById(routeId).fields.includes('phoneNumber');

  const textCandidate = (c: (typeof CANDIDATES)[number]) => {
    if (usesPhone) setUrl({ phoneNumber: c.phone });
    setOpen(true);
    addLog('info', `Host app: "Text" clicked for ${c.name}${usesPhone ? ` → phonenumber=${c.phone}` : ''}`);
  };

  return (
    <Chrome>
      <Stack direction="row" sx={{ alignItems: 'baseline', mb: 2, gap: 1 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 750, letterSpacing: '-0.02em' }}>Candidates</Typography>
        <Typography sx={{ color: '#6b7280', fontSize: 12 }}>{CANDIDATES.length} records</Typography>
      </Stack>
      <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {CANDIDATES.map((c, i) => (
          <Stack
            key={c.phone}
            direction="row"
            sx={{
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: compact ? 1 : 1.4,
              borderTop: i ? '1px solid #f1f5f9' : 0,
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: alpha(accent, 0.18), color: accent }}>
              {c.name.split(' ').map((n) => n[0]).join('')}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 650, fontSize: 13 }} noWrap>
                {c.name}
              </Typography>
              <Typography sx={{ color: '#6b7280', fontSize: 11.5 }} noWrap>
                {c.role} · {fmt(c.phone)}
              </Typography>
            </Box>
            {!compact && (
              <Chip size="small" label={c.status} sx={{ bgcolor: '#f1f5f9', color: '#334155', height: 22 }} />
            )}
            <Button
              size="small"
              variant="contained"
              startIcon={<SmsRoundedIcon />}
              onClick={() => textCandidate(c)}
              sx={{ bgcolor: accent, '&:hover': { bgcolor: accent, filter: 'brightness(.92)' } }}
            >
              Text
            </Button>
          </Stack>
        ))}
      </Box>
    </Chrome>
  );
}

/** A single record page with a Text-Em-All tab, as Bullhorn custom actions show it. */
export function HostRecord({ children }: { children: ReactNode }) {
  const accent = useAccent();
  const c = CANDIDATES[0];
  return (
    <Chrome>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: accent, fontWeight: 700 }}>AL</Avatar>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 750, letterSpacing: '-0.02em' }}>{c.name}</Typography>
          <Typography sx={{ color: '#6b7280', fontSize: 12.5 }}>
            Candidate · {c.role} · {fmt(c.phone)}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" sx={{ gap: 0.5, mb: 2, borderBottom: '1px solid #e5e7eb' }}>
        {['Overview', 'Placements', 'Activity', 'Text-Em-All'].map((t) => {
          const active = t === 'Text-Em-All';
          return (
            <Box
              key={t}
              sx={{
                px: 1.75,
                py: 1,
                fontSize: 13,
                fontWeight: 650,
                color: active ? accent : '#6b7280',
                borderBottom: `2px solid ${active ? accent : 'transparent'}`,
                mb: '-1px',
              }}
            >
              {t}
            </Box>
          );
        })}
      </Stack>
      {children}
    </Chrome>
  );
}

/**
 * A customer's own website, where the join form gets embedded. With children it
 * shows the form inline; without, a "Get text updates" button opens the container.
 */
export function HostSite({ children }: { children?: ReactNode }) {
  const accent = useAccent();
  const setOpen = useLab((s) => s.setOpen);
  const addLog = useLab((s) => s.addLog);
  return (
    <Box
      sx={{
        minHeight: '100%',
        bgcolor: '#fffaf3',
        color: '#2b2118',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(43,33,24,.1)',
        boxShadow: '0 30px 80px -40px rgba(0,0,0,.5)',
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 3, px: 4, height: 64, borderBottom: '1px solid rgba(43,33,24,.08)' }}
      >
        <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, flex: 1 }}>
          Northwind Coffee Co.
        </Typography>
        {['Menu', 'Locations', 'Catering', 'Text club'].map((t) => (
          <Typography key={t} sx={{ fontSize: 13, fontWeight: 600, color: t === 'Text club' ? accent : '#7a6a5a' }}>
            {t}
          </Typography>
        ))}
      </Stack>
      <Box sx={{ px: 4, py: 5, background: 'linear-gradient(180deg, #f3e6d3, #fffaf3)' }}>
        <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: 34, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Join the Text Club ☕
        </Typography>
        <Typography sx={{ color: '#7a6a5a', mt: 1, maxWidth: 520 }}>
          Weekly specials and a free drink on your birthday. Sign up below, reply to confirm, and you’re in.
        </Typography>
        {!children && (
          <Button
            variant="contained"
            size="large"
            startIcon={<SmsRoundedIcon />}
            onClick={() => {
              setOpen(true);
              addLog('info', 'Host site: "Get text updates" clicked');
            }}
            sx={{ mt: 3, bgcolor: accent, borderRadius: 99, px: 3, '&:hover': { bgcolor: accent, filter: 'brightness(.92)' } }}
          >
            Get text updates
          </Button>
        )}
      </Box>
      {children && <Box sx={{ px: 4, pb: 4 }}>{children}</Box>}
      <Box sx={{ px: 4, py: 3, borderTop: '1px solid rgba(43,33,24,.08)', color: '#a3927f', fontSize: 12 }}>
        © Northwind Coffee Co. · a pretend customer site
      </Box>
    </Box>
  );
}
