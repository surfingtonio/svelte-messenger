import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'messenger-theme';
let _current: Theme = 'system';

function applyTheme(t: Theme): void {
  if (typeof window === 'undefined') return;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = t === 'dark' || (t === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}

const saved =
  typeof localStorage !== 'undefined'
    ? (localStorage.getItem(STORAGE_KEY) as Theme | null)
    : null;

_current = saved ?? 'system';

const { subscribe, set: _set } = writable<Theme>(_current);

if (typeof window !== 'undefined') {
  applyTheme(_current);
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (_current === 'system') applyTheme('system');
    });
}

export const theme = {
  subscribe,
  set(t: Theme): void {
    _current = t;
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
    _set(t);
  },
};
