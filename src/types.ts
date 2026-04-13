export interface User {
  id: number;
  first: string;
  last: string;
  username: string;
  online: boolean;
  socketId?: string;
}

export interface ChatMsg {
  message: { content: string; time: Date | string };
  sender: User;
  receiver: User;
}

export interface AppState {
  config: {
    namespace: string;
    keyboardActivityTimeOut: number;
  };
  user: Partial<User>;
  users: Record<string, User>;
  chats: Record<string, ChatMsg[]>;
}
