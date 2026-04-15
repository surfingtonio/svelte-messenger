import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
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

const isProduction = process.env.NODE_ENV === 'production';
if (!process.env.JWT_SECRET && isProduction) {
  console.error('[FATAL] JWT_SECRET must be set in production. Exiting.');
  process.exit(1);
}
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

// --- Rate limiting ---

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
  skip: () => process.env.TEST_MODE === '1',
});

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/css/fontawesome',
  express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free'))
);

// --- Socket.IO auth middleware ---

const socketPayloads = new Map<string, JwtPayload>();

nsp.use((socket, next) => {
  const token = (socket.handshake.auth as { token?: string })?.token;
  if (!token) {
    next(new Error('Unauthorized: no token provided'));
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    socketPayloads.set(socket.id, payload);
    next();
  } catch {
    next(new Error('Unauthorized: invalid or expired token'));
  }
});

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

app.post('/api/register', authLimiter, async (req: Request, res: Response) => {
  const { first, last, username, password } = req.body as {
    first?: string;
    last?: string;
    username?: string;
    password?: string;
  };
  if (!first || !last || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (first.length > 50 || last.length > 50) {
    return res.status(400).json({ error: 'Name must be 50 characters or fewer.' });
  }
  if (username.length > 30) {
    return res.status(400).json({ error: 'Username must be 30 characters or fewer.' });
  }
  if (password.length < 6 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be between 6 and 72 characters.' });
  }
  try {
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
  } catch {
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/login', authLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length > 72) {
    return res.status(400).json({ error: 'Invalid username or password.' });
  }
  try {
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
  } catch {
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// --- Admin endpoints ---

app.get('/api/admin/users', requireAdmin, async (_req: Request, res: Response) => {
  try {
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
  } catch {
    return res.status(500).json({ error: 'Failed to load users.' });
  }
});

app.patch('/api/admin/users/:id/roles', requireAdmin, async (req: AdminRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id.' });
  const { roles } = req.body as { roles?: string[] };
  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: 'roles must be an array.' });
  }
  // Validate against allowlist — reject unknown role strings
  const ALLOWED_ROLES = new Set(['user', 'admin']);
  const invalid = roles.filter((r) => !ALLOWED_ROLES.has(r));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid role(s): ${invalid.join(', ')}.` });
  }
  // Always preserve the 'user' role
  const sanitized = Array.from(new Set(['user', ...roles]));
  try {
    const [updated] = await db
      .update(usersTable)
      .set({ roles: JSON.stringify(sanitized) })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    return res.json({ ...updated, roles: JSON.parse(updated.roles) as string[] });
  } catch {
    return res.status(500).json({ error: 'Failed to update roles.' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req: AdminRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id.' });
  const requesterId = req.adminPayload!.id;
  if (id === requesterId) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }
  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));
    return res.status(204).end();
  } catch {
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// --- Test-only helpers (only mounted when TEST_MODE=1) ---

if (process.env.TEST_MODE === '1') {
  // POST /api/test/make-admin — elevates a user to admin role by username.
  // Intentionally not protected, only available when explicitly running in test mode.
  app.post('/api/test/make-admin', async (req: Request, res: Response) => {
    const { username } = req.body as { username?: string };
    if (!username) return res.status(400).json({ error: 'username required' });
    try {
      const [row] = await db
        .update(usersTable)
        .set({ roles: JSON.stringify(['user', 'admin']) })
        .where(eq(usersTable.username, username))
        .returning();
      if (!row) return res.status(404).json({ error: 'User not found' });
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Failed to elevate user' });
    }
  });
}

// --- Socket.IO ---

const onlineCount = (): number => Object.values(onlineUsers).filter(u => u.online).length;

nsp.on('connection', (socket: Socket) => {
  socket.on('disconnect', () => {
    try {
      socketPayloads.delete(socket.id);
      const user = Object.values(onlineUsers).find((u) => u.socketId === socket.id);
      if (!user) return;
      onlineUsers[String(user.id)] = { ...onlineUsers[String(user.id)], online: false };
      nsp.emit('userleave', { user: onlineUsers[String(user.id)], users: onlineUsers });
      console.log(`${user.first} ${user.last} left.`);
      console.log(`There are ${onlineCount()} user(s) in the room.`);
    } catch (err) {
      console.error('Error handling disconnect:', err);
    }
  });

  socket.on('userregister', async () => {
    try {
      const payload = socketPayloads.get(socket.id);
      if (!payload) { socket.disconnect(); return; }
      // Fetch authoritative user data from DB — never trust client-supplied display names
      const [row] = await db
        .select({
          id: usersTable.id,
          first: usersTable.first,
          last: usersTable.last,
          username: usersTable.username,
          roles: usersTable.roles,
        })
        .from(usersTable)
        .where(eq(usersTable.id, payload.id))
        .limit(1);
      if (!row) { socket.disconnect(); return; }
      const verified: User = {
        id: row.id,
        first: row.first,
        last: row.last,
        username: row.username,
        roles: JSON.parse(row.roles) as string[],
        socketId: socket.id,
        online: true,
      };
      onlineUsers[String(payload.id)] = verified;
      socket.emit('userregister', onlineUsers[String(payload.id)]);
      nsp.emit('afteruserregister', { userId: payload.id, users: onlineUsers });
      console.log(`${verified.first} ${verified.last} joined.`);
      console.log(`There are ${onlineCount()} user(s) in the room.`);
    } catch (err) {
      console.error('Error handling userregister:', err);
    }
  });

  socket.on('messagesend', (data: MessageData) => {
    try {
      const payload = socketPayloads.get(socket.id);
      if (!payload) return;
      const sender = onlineUsers[String(payload.id)];
      if (!sender) return;
      // Validate message content
      const content = (data as { message?: { content?: unknown } }).message?.content;
      if (typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) return;
      // Enforce server-verified sender identity — client must not be able to impersonate others
      const verified = { ...data, sender };
      if (verified.receiver?.socketId) {
        socket.to(verified.receiver.socketId).emit('messagereceive', verified);
      }
    } catch (err) {
      console.error('Error handling messagesend:', err);
    }
  });

  socket.on('keyboardactivity', (data: KeyboardData) => {
    try {
      const payload = socketPayloads.get(socket.id);
      if (!payload) return;
      const sender = onlineUsers[String(payload.id)];
      if (!sender) return;
      // Use server-verified sender identity, not client-supplied user object
      socket.to(data.socketId).emit('keyboardactivity', sender);
    } catch (err) {
      console.error('Error handling keyboardactivity:', err);
    }
  });

  socket.on('keyboardactivitystop', (data: KeyboardData) => {
    try {
      const payload = socketPayloads.get(socket.id);
      if (!payload) return;
      const sender = onlineUsers[String(payload.id)];
      if (!sender) return;
      // Use server-verified sender identity, not client-supplied user object
      socket.to(data.socketId).emit('keyboardactivitystop', sender);
    } catch (err) {
      console.error('Error handling keyboardactivitystop:', err);
    }
  });
});

// Start listening only when this file is executed directly (not imported for tests)
if (!process.env.VITEST) {
  httpServer.listen(Number(process.env.PORT) || port, () => {
    console.log(`Server listening on *:${process.env.PORT || port}`);
  });
}

export { app, httpServer };
