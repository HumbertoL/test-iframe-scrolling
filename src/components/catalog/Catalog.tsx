import { useMemo, useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { PARTNERS, PRESETS, type Confidence } from '../../data/presets';
import { DEFAULT_CONTAINER } from '../../state/defaults';
import { useLab } from '../../state/store';
import { MONO } from '../../theme';

export const CONFIDENCE: Record<Confidence, { label: string; icon: React.ReactNode; tip: string }> = {
  confirmed: {
    label: 'Confirmed',
    icon: <VerifiedRoundedIcon sx={{ fontSize: 14 }} />,
    tip: 'URL and container size are confirmed',
  },
  code: {
    label: 'From code',
    icon: <CodeRoundedIcon sx={{ fontSize: 14 }} />,
    tip: 'URL comes from code; the partner’s container size is unknown',
  },
  assumed: {
    label: 'Assumed size',
    icon: <HelpOutlineRoundedIcon sx={{ fontSize: 14 }} />,
    tip: 'URL comes from code or docs; the container is a best guess',
  },
};

export default function Catalog() {
  const presetId = useLab((s) => s.presetId);
  const applyPreset = useLab((s) => s.applyPreset);
  const checks = useLab((s) => s.checks);
  const [q, setQ] = useState('');
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target as HTMLElement).closest('input, textarea, [contenteditable]')) {
        e.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PARTNERS.map((partner) => ({
      partner,
      presets: PRESETS.filter(
        (p) =>
          p.partnerId === partner.id &&
          (!needle || `${partner.name} ${p.title} ${p.summary} ${p.surface}`.toLowerCase().includes(needle)),
      ),
    })).filter((g) => g.presets.length);
  }, [q]);

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Box sx={{ p: 1.5, pb: 1 }}>
        <TextField
          inputRef={search}
          placeholder="Search partners & scenarios  ( / )"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, pb: 2 }}>
        {groups.map(({ partner, presets }) => (
          <Box key={partner.id} sx={{ mt: 1.5 }}>
            <Tooltip title={partner.blurb} placement="right">
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 0.5, mb: 0.75 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '3px',
                    bgcolor: partner.color,
                    boxShadow: `0 0 12px ${partner.color}`,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{partner.name}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 11 }} noWrap>
                    {partner.kind}
                  </Typography>
                </Box>
              </Stack>
            </Tooltip>
            <Stack sx={{ gap: 0.75 }}>
              {presets.map((p) => {
                const selected = p.id === presetId;
                const c = { ...DEFAULT_CONTAINER, ...p.container };
                const done = (checks[p.id] ?? []).filter(Boolean).length;
                const conf = CONFIDENCE[p.confidence];
                return (
                  <ButtonBase
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    sx={(t) => ({
                      display: 'block',
                      textAlign: 'left',
                      borderRadius: 2,
                      p: 1.25,
                      pl: 1.5,
                      border: 1,
                      borderColor: selected ? partner.color : 'divider',
                      bgcolor: selected ? alpha(partner.color, 0.1) : 'background.paper',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all .15s',
                      '&:hover': { borderColor: alpha(partner.color, 0.6), transform: 'translateX(2px)' },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        bgcolor: selected ? partner.color : 'transparent',
                      },
                      ...t.applyStyles('dark', { bgcolor: selected ? alpha(partner.color, 0.14) : 'background.paper' }),
                    })}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                      <Typography sx={{ fontWeight: 650, fontSize: 13, flex: 1 }}>{p.title}</Typography>
                      {p.status && (
                        <Tooltip title={p.status}>
                          <WarningAmberRoundedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography sx={{ color: 'text.secondary', fontSize: 11.5, mt: 0.25, lineHeight: 1.35 }}>
                      {p.summary}
                    </Typography>
                    <Stack direction="row" sx={{ gap: 0.75, mt: 0.9, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Tag>{c.mode}</Tag>
                      {c.mode !== 'tab' && <Tag mono>{`${c.width}×${c.height}`}</Tag>}
                      <Tooltip title={conf.tip}>
                        <Stack
                          direction="row"
                          sx={{
                            alignItems: 'center',
                            gap: 0.4,
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: p.confidence === 'assumed' ? 'text.secondary' : partner.color,
                          }}
                        >
                          {conf.icon}
                          {conf.label}
                        </Stack>
                      </Tooltip>
                      {done > 0 && (
                        <Typography sx={{ ml: 'auto', fontSize: 10.5, fontFamily: MONO, color: 'success.main' }}>
                          {done}/{p.checks.length} ✓
                        </Typography>
                      )}
                    </Stack>
                  </ButtonBase>
                );
              })}
            </Stack>
          </Box>
        ))}
        {!groups.length && (
          <Typography sx={{ color: 'text.secondary', p: 2, textAlign: 'center' }}>Nothing matches “{q}”.</Typography>
        )}
      </Box>
    </Stack>
  );
}

function Tag({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        px: 0.75,
        py: 0.1,
        borderRadius: 1,
        fontSize: 10.5,
        fontWeight: 650,
        fontFamily: mono ? MONO : undefined,
        bgcolor: (t) => t.alpha(t.vars!.palette.text.primary, 0.07),
        color: 'text.secondary',
        textTransform: mono ? 'none' : 'capitalize',
      }}
    >
      {children}
    </Box>
  );
}
