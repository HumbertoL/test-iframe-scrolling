import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

it('renders the drawer with the iframe', () => {
  render(<App />);
  expect(screen.getByTitle('CEA SSO test')).toBeTruthy();
});
