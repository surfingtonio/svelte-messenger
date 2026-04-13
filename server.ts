import _ from 'lodash';
import bcrypt from 'bcryptjs';
import express, { type Request, type Response } from 'express';
import { createServer } from 'http';
import { Server, type Socket } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Account {
  id: number;
  first: string;
  last: string;
  username: string;
  passwordHash: string;
}

interface User {
  id: number;
  first: string;
  last: string;
  username: string;
  online: boolean;
  socketId?: string;
}

interface MessageData {
  receiver: User;
  [key: string]: unknown;
}

interface KeyboardData {
  socketId: string;
  user: User;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5000', 'http://localhost:4000'],
    methods: ['GET', 'POST'],
  },
});

const nsp = io.of('/chatrooms');
const port = 4000;

const accounts: Record<string, Account> = {};
const users: Record<string, User> = {};

app.use(express.json());

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/css/fontawesome',
  express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free'))
);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post('/api/register', async (req: Request, res: Response) => {
  const { first, last, username, password } = req.body as {
    first?: string;
    last?: string;
    username?: string;
    password?: string;
  };
  if (!first || !last || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (accounts[username]) {
    return res.status(409).json({ error: 'Username is already taken.' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const id = Date.now();
  accounts[username] = { id, first, last, username, passwordHash };
  return res.json({ id, first, last, username, online: false });
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const account = accounts[username];
  if (!account) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const valid = await bcrypt.compare(password, account.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const { passwordHash: _hash, ...user } = account;
  return res.json({ ...user, online: false });
});

const usersCount = (): number => _.filter(users, { online: true }).length;

nsp.on('connection', (socket: Socket) => {
  socket.on('disconnect', () => {
    const user = _.find(users, (u) => u.socketId === socket.id);
    if (!user) return;
    users[String(user.id)] = { ...users[String(user.id)], online: false };
    nsp.emit('userleave', { user: users[String(user.id)], users });
    console.log(`${user.first} ${user.last} left.`);
    console.log(`There are ${usersCount()} user(s) in the room.`);
  });

  socket.on('userregister', (user: User) => {
    users[String(user.id)] = { ...user, socketId: socket.id, online: true };
    socket.emit('userregister', users[String(user.id)]);
    nsp.emit('afteruserregister', { userId: user.id, users });
    console.log(`${user.first} ${user.last} joined.`);
    console.log(`There are ${usersCount()} user(s) in the room.`);
  });

  socket.on('messagesend', (data: MessageData) => {
    if (data.receiver?.socketId) {
      socket.to(data.receiver.socketId).emit('messagereceive', data);
    }
  });

  socket.on('keyboardactivity', (data: KeyboardData) => {
    socket.to(data.socketId).emit('keyboardactivity', data.user);
  });

  socket.on('keyboardactivitystop', (data: KeyboardData) => {
    socket.to(data.socketId).emit('keyboardactivitystop', data.user);
  });
});

httpServer.listen(Number(process.env.PORT) || port, () => {
  console.log(`Server listening on *:${process.env.PORT || port}`);
});
