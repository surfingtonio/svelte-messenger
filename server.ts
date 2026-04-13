import 'dotenv/config';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer } from 'http';
import { Server, type Socket } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';
import { db } from './src/db/index.js';
import { users as usersTable } from './src/db/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
if (!process.env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET is not set — using insecure default. Set it before deploying.');
}

interface JwtPayload {
  id: number;
  roles: string[];
}

interface User {
  id: number;
  first: string;
  last: string;
  username: string;
  roles: string[];
  online: boolean;
  socketId?: string;
}

interface AdminRequest extends Request {
  adminPayload?: JwtPayload;
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
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5000,http://localhost:4000').split(',').map(s => s.trim()),
    methods: ['GET', 'POST'],
  },
});

const nsp = io.of('/chatrooms');
const port = 4000;

// In-memory map for tracking ephemeral session state (online status, socketId)
const onlineUsers: Record<string, User> = {};

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

// --- Middleware ---

async function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as JwtPayload;
    if (!payload.roles.includes('admin')) {
      res.status(403).json({ error: 'Forbidden.' });
      return;
    }
    req.adminPayload = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// --- Auth endpoints ---

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
  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);
  if (existing.length) {
    return res.status(409).json({ error: 'Username is already taken.' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [inserted] = await db
    .insert(usersTable)
    .values({ first, last, username, passwordHash })
    .returning();
  const roles: string[] = JSON.parse(inserted.roles);
  const token = jwt.sign({ id: inserted.id, roles } satisfies JwtPayload, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ id: inserted.id, first: inserted.first, last: inserted.last, username: inserted.username, roles, online: false, token });
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const [account] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);
  if (!account) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const valid = await bcrypt.compare(password, account.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const roles: string[] = JSON.parse(account.roles);
  const token = jwt.sign({ id: account.id, roles } satisfies JwtPayload, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ id: account.id, first: account.first, last: account.last, username: account.username, roles, online: false, token });
});

// --- Admin endpoints ---

app.get('/api/admin/users', requireAdmin, async (_req: Request, res: Response) => {
  const rows = await db
    .select({
      id: usersTable.id,
      first: usersTable.first,
      last: usersTable.last,
      username: usersTable.username,
      roles: usersTable.roles,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt);
  return res.json(rows.map((u) => ({ ...u, roles: JSON.parse(u.roles) as string[] })));
});

app.patch('/api/admin/users/:id/roles', requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { roles } = req.body as { roles?: string[] };
  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: 'roles must be an array.' });
  }
  // Always preserve the 'user' role
  const sanitized = Array.from(new Set(['user', ...roles]));
  const [updated] = await db
    .update(usersTable)
    .set({ roles: JSON.stringify(sanitized) })
    .where(eq(usersTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  return res.json({ ...updated, roles: JSON.parse(updated.roles) as string[] });
});

app.delete('/api/admin/users/:id', requireAdmin, async (req: AdminRequest, res: Response) => {
  const id = Number(req.params.id);
  const requesterId = req.adminPayload!.id;
  if (id === requesterId) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  return res.status(204).end();
});

// --- Socket.IO ---

const onlineCount = (): number => _.filter(onlineUsers, { online: true }).length;

nsp.on('connection', (socket: Socket) => {
  socket.on('disconnect', () => {
    const user = _.find(onlineUsers, (u) => u.socketId === socket.id);
    if (!user) return;
    onlineUsers[String(user.id)] = { ...onlineUsers[String(user.id)], online: false };
    nsp.emit('userleave', { user: onlineUsers[String(user.id)], users: onlineUsers });
    console.log(`${user.first} ${user.last} left.`);
    console.log(`There are ${onlineCount()} user(s) in the room.`);
  });

  socket.on('userregister', (user: User) => {
    onlineUsers[String(user.id)] = { ...user, socketId: socket.id, online: true };
    socket.emit('userregister', onlineUsers[String(user.id)]);
    nsp.emit('afteruserregister', { userId: user.id, users: onlineUsers });
    console.log(`${user.first} ${user.last} joined.`);
    console.log(`There are ${onlineCount()} user(s) in the room.`);
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
