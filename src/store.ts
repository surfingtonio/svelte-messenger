import { writable } from 'svelte/store';
import type { AppState } from './types';

const app = writable<AppState>({
  config: {
    namespace: '/chatrooms',
    keyboardActivityTimeOut: 1000,
  },
  user: {},
  users: {},
  chats: {},
});

export default app;
