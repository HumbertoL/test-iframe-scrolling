import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useLab, type LogKind } from '../../state/store';
import { liveFrames } from '../../lib/frames';
import { MONO } from '../../theme';
import { Hint, Section } from './ui';

const KIND_COLOR: Record<LogKind, string> = {
  load: '#22c55e',
  src: '#6366f1',
  focus: '#06b6d4',
  message: '#a855f7',
  popup: '#f97316',
  resize: '#f43f5e',
  info: '#64748b',
  warn: '#f59e0b',
};

export default function LogPanel() {
  const log = useLab((s) => s.log);
  const clear = useLab((s) => s.clearLog);
  const addLog = useLab((s) => s.addLog);
  const [filter, setFilter] = useState<LogKind | null>(null);
  const [payload, setPayload] = useState('{"type":"partner:ping"}');
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const send = () => {
    let data: unknown = payload;
    try {
      data = JSON.parse(payload);
    } catch {
      /* send as string */
    }
    const frames = liveFrames();
    frames.forEach(([, el]) => el.contentWindow?.postMessage(data, '*'));
    addLog('message', `→ Sent to ${frames.length} frame(s): ${payload}`);
  };

  const shown = filter ? log.filter((l) => l.kind === filter) : log;
  const kinds = [...new Set(log.map((l) => l.kind))];

  return (
    <>
      <Section
        title={`Events · ${log.length}`}
        action={
          log.length > 0 && (
            <Button size="small" onClick={clear}>
              Clear
            </Button>
          )
        }
      >
        {kinds.length > 1 && (
          <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
            {kinds.map((k) => (
              <Chip
                key={k}
                size="small"
                label={k}
                onClick={() => setFilter(filter === k ? null : k)}
                variant={filter === k ? 'filled' : 'outlined'}
                sx={{ height: 22, fontSize: 11, borderColor: KIND_COLOR[k], color: filter === k ? '#fff' : KIND_COLOR[k], bgcolor: filter === k ? KIND_COLOR[k] : undefined }}
              />
            ))}
          </Stack>
        )}
        {shown.length === 0 ? (
          <Hint>
            Frame loads, navigations inside the frame, focus moving into it, popups and any postMessage from TEA show up
            here. TEA does not post messages to its parent today, so anything you see there is new.
          </Hint>
        ) : (
          <Stack sx={{ gap: 0 }}>
            {shown.map((l) => (
              <Box
                key={l.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '54px 62px 1fr',
                  gap: 1,
                  py: 0.6,
                  borderTop: 1,
                  borderColor: 'divider',
                  fontSize: 11.5,
                  alignItems: 'baseline',
                  animation: 'fadeIn .3s',
                  '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(-3px)' } },
                }}
              >
                <Typography sx={{ fontFamily: MONO, fontSize: 10.5, color: 'text.secondary' }}>{ago(l.at)}</Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: KIND_COLOR[l.kind] }}>
                  {l.kind}
                </Typography>
                <Box sx={{ wordBreak: 'break-all', fontFamily: l.kind === 'src' ? MONO : undefined, fontSize: l.kind === 'src' ? 10.5 : 11.5 }}>
                  {l.frame && l.frame !== 'main' && (
                    <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                      [{l.frame}]
                    </Box>
                  )}
                  {l.text}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Section>
      <Section title="postMessage to the frame">
        <TextField
          multiline
          minRows={2}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          slotProps={{ htmlInput: { style: { fontFamily: MONO, fontSize: 12 } } }}
        />
        <Button variant="outlined" startIcon={<SendRoundedIcon />} onClick={send}>
          Send to every live frame
        </Button>
        <Hint>
          TEA does not listen for messages today. Use this to try out a future partner contract, for example a resize
          handshake.
        </Hint>
      </Section>
    </>
  );
}

function ago(at: number) {
  const s = Math.round((Date.now() - at) / 1000);
  if (s < 5) return 'now';
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}
