import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useLab } from '../../state/store';
import { useBuiltUrl } from '../../lib/useBuiltUrl';
import { readEnv, tallCapApplies } from '../../lib/diagnostics';
import { registerFrame, takeGrowAfterLoad } from '../../lib/frames';
import { HEIGHT_MARKERS } from '../../data/behaviors';
import { MONO } from '../../theme';

interface Props {
  label?: string;
  width?: number;
  height?: number;
  /** Fill the parent's width instead of a fixed pixel width. */
  fluid?: boolean;
}

export default function EmbedFrame({ label = 'main', width, height, fluid }: Props) {
  const c = useLab((s) => s.container);
  const reloadKey = useLab((s) => s.reloadKey);
  const addLog = useLab((s) => s.addLog);
  const setContainer = useLab((s) => s.setContainer);
  const { url } = useBuiltUrl();
  const w = width ?? c.width;
  const h = height ?? c.height;

  const startedAt = useRef(performance.now());
  const loads = useRef(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startedAt.current = performance.now();
    loads.current = 0;
    setLoading(true);
    addLog('src', url, label);
  }, [url, reloadKey, label, addLog]);

  const onLoad = () => {
    loads.current += 1;
    setLoading(false);
    const ms = Math.round(performance.now() - startedAt.current);
    if (loads.current === 1) addLog('load', `Loaded in ${ms} ms`, label);
    else addLog('load', `Navigated inside the frame (load #${loads.current}, +${ms} ms)`, label);

    if (label === 'main') {
      const grow = takeGrowAfterLoad();
      if (grow) {
        setTimeout(() => {
          setContainer({ height: grow });
          addLog('resize', `Grew frame to ${grow}px after load. TEA should NOT add the 940px cap now`, label);
        }, 1200);
      }
    }
  };

  const frameRef = useRef<HTMLIFrameElement | null>(null);
  useEffect(() => {
    registerFrame(label, frameRef.current);
    return () => registerFrame(label, null);
  }, [label, reloadKey]);

  // Clicking into a cross-origin frame blurs this window: the only signal we get.
  useEffect(() => {
    const onBlur = () => {
      if (document.activeElement === frameRef.current) addLog('focus', 'Focus moved into the frame', label);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [label, addLog]);

  const screenH = readEnv().screenHeight;
  const capped = tallCapApplies(h, screenH);
  const scale = c.zoom;

  return (
    <Box
      sx={{
        position: 'relative',
        width: fluid ? '100%' : w * scale,
        height: h * scale,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: fluid ? `${100 / scale}%` : w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: '#fff',
          boxShadow: (t) =>
            `0 0 0 1px ${t.alpha(t.vars!.palette.primary.main, 0.35)}, 0 20px 50px -20px ${alpha('#000', 0.45)}`,
        }}
      >
        <iframe
          key={reloadKey}
          ref={frameRef}
          title={`Text-Em-All (${label})`}
          src={url}
          width="100%"
          height="100%"
          onLoad={onLoad}
          scrolling={c.scrolling}
          allow={c.allow || undefined}
          referrerPolicy={c.referrerPolicy}
          sandbox={c.sandbox ? c.sandboxTokens.join(' ') : undefined}
          style={{ border: 0, display: 'block' }}
        />
        {loading && <LoadingSheen />}
        {c.showRulers && (
          <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {HEIGHT_MARKERS.filter((m) => m.px < h).map((m) => (
              <Marker
                key={m.px}
                y={m.px}
                color={m.px === 940 ? (capped ? '#f43f5e' : '#94a3b8') : '#f59e0b'}
                text={`${m.px}px · ${m.label}${m.px === 940 ? (capped ? ' · ACTIVE' : ' · inactive') : ''}`}
              />
            ))}
            {Math.round(screenH * 1.5) < h && (
              <Marker
                y={Math.round(screenH * 1.5)}
                color="#a855f7"
                text={`${Math.round(screenH * 1.5)}px · 1.5 × screen: frames taller than this get the cap`}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Marker({ y, color, text }: { y: number; color: string; text: string }) {
  return (
    <Box sx={{ position: 'absolute', left: 0, right: 0, top: y, borderTop: `2px dashed ${color}` }}>
      <Typography
        component="span"
        sx={{
          position: 'absolute',
          right: 6,
          top: 4,
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          bgcolor: color,
          color: '#fff',
          fontFamily: MONO,
          fontSize: 10.5,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          opacity: 0.92,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function LoadingSheen() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'linear-gradient(100deg, transparent 30%, rgba(99,102,241,0.10) 50%, transparent 70%)',
        backgroundSize: '200% 100%',
        animation: 'sheen 1.2s linear infinite',
        '@keyframes sheen': { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      }}
    />
  );
}
