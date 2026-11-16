import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { LEVEL_COLORS } from '../../theme';
import type { Level } from '../../lib/diagnostics';

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box sx={{ px: 2, py: 1.75, borderBottom: 1, borderColor: 'divider' }}>
      <Stack direction="row" sx={{ alignItems: 'center', mb: 1.25, minHeight: 24 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', flex: 1, lineHeight: 1 }}>
          {title}
        </Typography>
        {action}
      </Stack>
      <Stack sx={{ gap: 1.5 }}>{children}</Stack>
    </Box>
  );
}

export const LEVEL_ICON: Record<Level, ReactNode> = {
  ok: <CheckCircleRoundedIcon sx={{ fontSize: 18, color: LEVEL_COLORS.ok }} />,
  info: <InfoRoundedIcon sx={{ fontSize: 18, color: LEVEL_COLORS.info }} />,
  warn: <WarningRoundedIcon sx={{ fontSize: 18, color: LEVEL_COLORS.warn }} />,
  error: <ErrorRoundedIcon sx={{ fontSize: 18, color: LEVEL_COLORS.error }} />,
};

export function Hint({ children }: { children: ReactNode }) {
  return (
    <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.45 }}>{children}</Typography>
  );
}
