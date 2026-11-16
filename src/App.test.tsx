import { afterEach, beforeAll, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import { theme } from './theme';
import { useLab } from './state/store';

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: q.includes('min-width'),
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

afterEach(cleanup);

const renderApp = () =>
  render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>,
  );

it('renders the Bullhorn tall frame by default', () => {
  renderApp();
  const frame = screen.getByTitle('Text-Em-All (main)') as HTMLIFrameElement;
  expect(frame.src).toContain('/conversations/');
  expect(useLab.getState().container.height).toBe(4000);
});

it('switches presets from the catalog', () => {
  renderApp();
  fireEvent.click(screen.getByText('Text a candidate (new)'));
  expect(useLab.getState().url.routeId).toBe('conversation-new');
  expect(useLab.getState().container.mode).toBe('drawer');
});
