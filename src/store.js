import { writable } from 'svelte/store';

const app = writable({
  config: {
    namespace: '/chatrooms',
    keyboardActivityTimeOut: 1000
  },
  isLoading: true,
  activeReceiver: {},
  user: {},
  users: {},
  chats: {}
});

export default app;
