import { useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useLab } from '../../state/store';
import { SANDBOX_TOKENS } from '../../state/defaults';
import { BREAKPOINTS, HEIGHT_MARKERS, TALL_FRAME_FACTOR } from '../../data/behaviors';
import { readEnv } from '../../lib/diagnostics';
import { MONO } from '../../theme';
import { Hint, Section } from './ui';

const SIZE_PRESETS = [
  { label: 'Bullhorn tall', w: 912, h: 4000 },
  { label: 'Original drawer', w: 912, h: 800 },
  { label: 'cea-desktop test page', w: 900, h: 900 },
  { label: 'Inbox', w: 1100, h: 800 },
  { label: 'Laptop', w: 1280, h: 720 },
  { label: 'Phone', w: 390, h: 844 },
  { label: 'Connect dialog', w: 540, h: 450 },
];

const REFERRER_POLICIES: ReferrerPolicy[] = [
  'strict-origin-when-cross-origin',
  'no-referrer',
  'origin',
  'same-origin',
  'unsafe-url',
];

export default function FramePanel() {
  const c = useLab((s) => s.container);
  const set = useLab((s) => s.setContainer);
  const [newWidth, setNewWidth] = useState('');
  const panelMode = c.mode === 'drawer' || c.mode === 'split';

  return (
    <>
      <Section title="Size">
        <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
          {SIZE_PRESETS.map((s) => {
            const active = s.w === c.width && s.h === c.height;
            return (
              <Chip
                key={s.label}
                size="small"
                label={
                  <span>
                    {s.label}{' '}
                    <Box component="span" sx={{ fontFamily: MONO, opacity: 0.7 }}>
                      {s.w}×{s.h}
                    </Box>
                  </span>
                }
                color={active ? 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                onClick={() => set({ width: s.w, height: s.h })}
              />
            );
          })}
        </Stack>
        <Dimension label="Width" value={c.width} min={320} max={1700} onChange={(width) => set({ width })} />
        <Dimension label="Height" value={c.height} min={300} max={5000} onChange={(height) => set({ height })} />
        <WidthMap width={c.width} />
        <HeightMap height={c.height} />
      </Section>

      {panelMode && (
        <Section title={c.mode === 'drawer' ? 'Drawer' : 'Side panel'}>
          <Dimension
            label="Panel width"
            unit="%"
            value={c.panelPct}
            min={25}
            max={100}
            onChange={(panelPct) => set({ panelPct })}
          />
          <ToggleButtonGroup
            size="small"
            exclusive
            value={c.drawerAnchor}
            onChange={(_, v) => v && set({ drawerAnchor: v })}
          >
            <ToggleButton value="left">Left</ToggleButton>
            <ToggleButton value="right">Right</ToggleButton>
          </ToggleButtonGroup>
        </Section>
      )}

      {c.mode === 'compare' && (
        <Section title="Compare widths">
          <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
            {c.compareWidths.map((w) => (
              <Chip
                key={w}
                label={`${w}px`}
                sx={{ fontFamily: MONO }}
                onDelete={
                  c.compareWidths.length > 1
                    ? () => set({ compareWidths: c.compareWidths.filter((x) => x !== w) })
                    : undefined
                }
              />
            ))}
          </Stack>
          <TextField
            label="Add width (px)"
            value={newWidth}
            onChange={(e) => setNewWidth(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => {
              const w = Number(newWidth);
              if (e.key === 'Enter' && w >= 200 && !c.compareWidths.includes(w)) {
                set({ compareWidths: [...c.compareWidths, w].sort((a, b) => a - b) });
                setNewWidth('');
              }
            }}
          />
          <Hint>Every frame is a separate load. Sign in as different users in two browser profiles to test concurrent embedded inboxes.</Hint>
        </Section>
      )}

      <Section title="Behavior">
        <ToggleButtonGroup
          size="small"
          exclusive
          value={c.scrolling}
          onChange={(_, v) => v && set({ scrolling: v })}
        >
          <ToggleButton value="no">scrolling="no"</ToggleButton>
          <ToggleButton value="auto">scrolling="auto"</ToggleButton>
        </ToggleButtonGroup>
        <Stack>
          <FormControlLabel
            control={<Switch checked={c.hostShell} onChange={(e) => set({ hostShell: e.target.checked })} />}
            label="Show the pretend partner app (Recruit-Em-All)"
          />
          <FormControlLabel
            control={<Switch checked={c.showRulers} onChange={(e) => set({ showRulers: e.target.checked })} />}
            label="Draw the 875 / 940px guides over the frame"
          />
        </Stack>
      </Section>

      <Section
        title="Sandbox"
        action={<Switch size="small" checked={c.sandbox} onChange={(e) => set({ sandbox: e.target.checked })} />}
      >
        {c.sandbox ? (
          <Stack>
            {SANDBOX_TOKENS.map((t) => (
              <FormControlLabel
                key={t}
                label={<Typography sx={{ fontFamily: MONO, fontSize: 12 }}>{t}</Typography>}
                control={
                  <Checkbox
                    size="small"
                    checked={c.sandboxTokens.includes(t)}
                    onChange={(e) =>
                      set({
                        sandboxTokens: e.target.checked
                          ? [...c.sandboxTokens, t]
                          : c.sandboxTokens.filter((x) => x !== t),
                      })
                    }
                  />
                }
              />
            ))}
          </Stack>
        ) : (
          <Hint>Off: like most partners. Turn it on to see which sandbox tokens TEA can’t do without.</Hint>
        )}
      </Section>

      <Section title="Attributes">
        <TextField
          label="allow"
          value={c.allow}
          onChange={(e) => set({ allow: e.target.value })}
          slotProps={{ htmlInput: { style: { fontFamily: MONO, fontSize: 12 } } }}
          helperText="Microphone matters for recording audio messages inside the frame"
        />
        <TextField
          select
          label="referrerpolicy"
          value={c.referrerPolicy}
          onChange={(e) => set({ referrerPolicy: e.target.value as ReferrerPolicy })}
        >
          {REFERRER_POLICIES.map((r) => (
            <MenuItem key={r} value={r} sx={{ fontFamily: MONO, fontSize: 12 }}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </Section>
    </>
  );
}

function Dimension({
  label,
  value,
  min,
  max,
  unit = 'px',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
      <Typography sx={{ width: 80, fontSize: 12.5, fontWeight: 600 }}>{label}</Typography>
      <Slider size="small" value={value} min={min} max={max} onChange={(_, v) => onChange(v as number)} />
      <TextField
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, ''));
          if (!Number.isNaN(n)) onChange(n);
        }}
        sx={{ width: 96, flexShrink: 0 }}
        slotProps={{
          htmlInput: { style: { fontFamily: MONO, textAlign: 'right' } },
          input: { endAdornment: <Typography sx={{ fontSize: 11, color: 'text.secondary', ml: 0.5 }}>{unit}</Typography> },
        }}
      />
    </Stack>
  );
}

/** Where the frame width sits among cea-desktop’s breakpoints. */
function WidthMap({ width }: { width: number }) {
  const MAX = 1700;
  const pct = (px: number) => `${Math.min(100, (px / MAX) * 100)}%`;
  return (
    <Box sx={{ mt: 1 }}>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 3.5 }}>Width vs. TEA breakpoints</Typography>
      <Box sx={{ position: 'relative', height: 10, borderRadius: 5, bgcolor: (t) => t.alpha(t.vars!.palette.text.primary, 0.08) }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: pct(width),
            borderRadius: 5,
            background: 'linear-gradient(90deg, #6366f1, #0ea5e9)',
            transition: 'width .2s',
          }}
        />
        {BREAKPOINTS.map((b, i) => {
          const crossed = b.side === 'below' ? width < b.px : width > b.px;
          return (
            <Tooltip key={b.px} title={`${b.px}px · ${b.label} (${b.side}) ${crossed ? '· active' : ''}`}>
              <Box sx={{ position: 'absolute', left: pct(b.px), top: -4, bottom: -4, width: 2, ml: '-1px', bgcolor: crossed ? '#f59e0b' : 'text.secondary', borderRadius: 1, cursor: 'help' }}>
                <Typography
                  sx={{
                    position: 'absolute',
                    [i % 2 ? 'top' : 'bottom']: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 9.5,
                    fontFamily: MONO,
                    whiteSpace: 'nowrap',
                    color: crossed ? '#f59e0b' : 'text.secondary',
                    fontWeight: crossed ? 700 : 500,
                  }}
                >
                  {b.px}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', mt: 4 }}>
        {BREAKPOINTS.filter((b) => (b.side === 'below' ? width < b.px : width > b.px)).map((b) => (
          <Chip key={b.px} size="small" label={b.label} sx={{ height: 20, fontSize: 10.5, bgcolor: 'rgba(245,158,11,.15)', color: '#d97706' }} />
        ))}
      </Stack>
    </Box>
  );
}

function HeightMap({ height }: { height: number }) {
  const screenH = readEnv().screenHeight;
  const threshold = Math.round(screenH * TALL_FRAME_FACTOR);
  const MAX = Math.max(4200, height + 200);
  const pct = (px: number) => `${Math.min(100, (px / MAX) * 100)}%`;
  const marks = [
    ...HEIGHT_MARKERS.map((m) => ({ px: m.px, label: m.label, color: '#f59e0b' })),
    { px: threshold, label: `1.5 × screen (${screenH}px)`, color: '#a855f7' },
  ];
  return (
    <Box sx={{ mt: 1 }}>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>Height vs. TEA’s frame caps</Typography>
      <Box sx={{ position: 'relative', height: 10, borderRadius: 5, bgcolor: (t) => t.alpha(t.vars!.palette.text.primary, 0.08) }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            right: 'auto',
            width: pct(height),
            borderRadius: 5,
            background: height > threshold ? 'linear-gradient(90deg, #a855f7, #f43f5e)' : 'linear-gradient(90deg, #6366f1, #0ea5e9)',
            transition: 'width .2s',
          }}
        />
        {marks.map((m) => (
          <Tooltip key={m.label} title={`${m.px}px · ${m.label}`}>
            <Box sx={{ position: 'absolute', left: pct(m.px), top: -4, bottom: -4, width: 2, bgcolor: m.color, cursor: 'help' }} />
          </Tooltip>
        ))}
      </Box>
      <Typography sx={{ fontSize: 11, mt: 1, color: height > threshold ? '#f43f5e' : 'text.secondary' }}>
        {height > threshold
          ? `${height}px is taller than ${threshold}px, so #root is capped at 940px`
          : `The cap starts above ${threshold}px on this screen`}
      </Typography>
    </Box>
  );
}
