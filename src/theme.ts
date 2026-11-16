import { alpha, createTheme } from '@mui/material/styles';

export const MONO = '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace';

const brand = {
  main: '#6366f1',
  light: '#818cf8',
  dark: '#4f46e5',
};

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: {
      palette: {
        primary: brand,
        secondary: { main: '#0ea5e9' },
        background: { default: '#f4f5fb', paper: '#ffffff' },
        divider: 'rgba(15, 23, 42, 0.09)',
        text: { primary: '#0f172a', secondary: '#55607a' },
      },
    },
    dark: {
      palette: {
        primary: { main: brand.light, light: '#a5b4fc', dark: brand.main },
        secondary: { main: '#38bdf8' },
        background: { default: '#0a0d17', paper: '#111522' },
        divider: 'rgba(148, 163, 184, 0.12)',
        text: { primary: '#e6e9f2', secondary: '#8b93a9' },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: 13,
    h6: { fontWeight: 650, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 600 },
    overline: { fontWeight: 650, letterSpacing: '0.09em', fontSize: 10.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTooltip: { defaultProps: { arrow: true, enterDelay: 300 } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiToggleButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, gap: 6 } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
    MuiTabs: { styleOverrides: { root: { minHeight: 44 } } },
    MuiCssBaseline: {
      styleOverrides: (t) => ({
        'html, body, #root': { height: '100%' },
        body: { overflow: 'hidden' },
        '::selection': { background: alpha(brand.main, 0.3) },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          background: t.vars ? `rgba(${t.vars.palette.text.primaryChannel} / 0.18)` : '#8884',
          borderRadius: 10,
          border: '3px solid transparent',
          backgroundClip: 'content-box',
        },
      }),
    },
  },
});

export const LEVEL_COLORS = {
  ok: '#22c55e',
  info: '#38bdf8',
  warn: '#f59e0b',
  error: '#ef4444',
} as const;
