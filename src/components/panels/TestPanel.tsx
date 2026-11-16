import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import { partnerById, presetById } from '../../data/presets';
import { KNOWN_ISSUES } from '../../data/behaviors';
import { useLab } from '../../state/store';
import { MONO } from '../../theme';
import { CONFIDENCE } from '../catalog/Catalog';
import { Hint, Section } from './ui';

export default function TestPanel() {
  const presetId = useLab((s) => s.presetId);
  const checks = useLab((s) => s.checks);
  const toggle = useLab((s) => s.toggleCheck);
  const reset = useLab((s) => s.resetChecks);
  const preset = presetById(presetId);

  return (
    <>
      {preset ? (
        (() => {
          const partner = partnerById(preset.partnerId);
          const state = checks[preset.id] ?? [];
          const done = preset.checks.filter((_, i) => state[i]).length;
          const conf = CONFIDENCE[preset.confidence];
          return (
            <>
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  background: `linear-gradient(135deg, ${partner.color}22, transparent 70%)`,
                }}
              >
                <Typography variant="overline" sx={{ color: partner.color }}>
                  {partner.name}
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.25 }}>
                  {preset.title}
                </Typography>
                <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>{preset.summary}</Typography>
                <Stack sx={{ mt: 1.5, gap: 0.5 }}>
                  <Fact k="Surface" v={preset.surface} />
                  <Fact
                    k="Confidence"
                    v={
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                        {conf.icon}
                        {conf.label}: {conf.tip.toLowerCase()}
                      </Stack>
                    }
                  />
                </Stack>
                {preset.status && (
                  <Alert severity="warning" sx={{ mt: 1.5, py: 0 }}>
                    {preset.status}
                  </Alert>
                )}
              </Box>
              <Section
                title={`Checklist · ${done}/${preset.checks.length}`}
                action={
                  done > 0 && (
                    <Button size="small" onClick={() => reset(preset.id)}>
                      Reset
                    </Button>
                  )
                }
              >
                <LinearProgress
                  variant="determinate"
                  value={(done / preset.checks.length) * 100}
                  sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: partner.color } }}
                />
                <Stack sx={{ gap: 0.25 }}>
                  {preset.checks.map((text, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      component="label"
                      sx={{
                        alignItems: 'flex-start',
                        gap: 0.5,
                        cursor: 'pointer',
                        borderRadius: 1,
                        mx: -1,
                        px: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={!!state[i]}
                        onChange={() => toggle(preset.id, i)}
                        sx={{ p: 0.5, color: partner.color, '&.Mui-checked': { color: partner.color } }}
                      />
                      <Typography
                        sx={{
                          py: 0.6,
                          fontSize: 12.5,
                          textDecoration: state[i] ? 'line-through' : 'none',
                          color: state[i] ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {text}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Section>
              <Section title="Evidence">
                <Stack sx={{ gap: 0.5 }}>
                  {preset.sources.map((s) => (
                    <Typography key={s} sx={{ fontFamily: MONO, fontSize: 11, color: 'text.secondary', wordBreak: 'break-all' }}>
                      {s}
                    </Typography>
                  ))}
                </Stack>
                <Hint>{partner.blurb}</Hint>
              </Section>
            </>
          );
        })()
      ) : (
        <Section title="No preset">
          <Hint>Pick a partner scenario on the left to get its checklist. Your own settings stay as they are.</Hint>
        </Section>
      )}

      <Section title={`Known quirks · ${KNOWN_ISSUES.length}`}>
        <Box>
          {KNOWN_ISSUES.map((k) => (
            <Accordion
              key={k.id}
              disableGutters
              elevation={0}
              sx={{ bgcolor: 'transparent', '&::before': { display: 'none' }, borderTop: 1, borderColor: 'divider' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 0, minHeight: 40 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <BugReportRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography sx={{ fontWeight: 600, fontSize: 12.5 }}>{k.title}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
                <Stack sx={{ gap: 1 }}>
                  <Typography sx={{ fontSize: 12.5 }}>{k.detail}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'primary.main' }}>Try it: {k.howToTest}</Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: 10.5, color: 'text.secondary' }}>{k.source}</Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Section>
    </>
  );
}

function Fact({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '84px 1fr', fontSize: 12 }}>
      <Box sx={{ color: 'text.secondary' }}>{k}</Box>
      <Box>{v}</Box>
    </Box>
  );
}
