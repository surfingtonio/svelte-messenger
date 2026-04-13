/**
 * Integration tests for the Express REST API.
 *
 * The tests import the Express `app` from server.ts and use supertest to
 * exercise the HTTP layer with a real (but temporary) SQLite database.
 *
 * DATABASE_URL is set to a per-run temp file before importing the server module.
 * The schema is created inline since Drizzle does not auto-migrate.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import os from 'os';
import path from 'path';
import Database from 'better-sqlite3';

// ── 1. Set env vars BEFORE importing anything from the server module ─────────
const dbFile = path.join(os.tmpdir(), `messenger-test-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_URL = dbFile;
process.env.TEST_MODE = '1';
process.env.VITEST = '1';
process.env.JWT_SECRET = 'test-secret-key';

// ── 2. Create the DB schema (Drizzle does not auto-migrate) ──────────────────
const sqlite = new Database(dbFile);
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first TEXT NOT NULL,
    last TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    roles TEXT NOT NULL DEFAULT '["user"]',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);
sqlite.close();

// ── 3. NOW import the server (its db module reads DATABASE_URL on load) ──────
const { app } = await import('../../server.ts');

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
describe('GET /api/health', () => {
  it('returns 200 with { ok: true }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });
});

// ---------------------------------------------------------------------------
// POST /api/register
// ---------------------------------------------------------------------------
describe('POST /api/register', () => {
  it('creates a new user and returns id, token and user fields', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ first: 'Jane', last: 'Doe', username: `jane_${Date.now()}`, password: 'securepass' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('first', 'Jane');
    expect(res.body).toHaveProperty('last', 'Doe');
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ first: 'Only' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when username is already taken', async () => {
    const username = `dup_${Date.now()}`;
    await request(app)
      .post('/api/register')
      .send({ first: 'A', last: 'B', username, password: 'pass1234' });

    const res = await request(app)
      .post('/api/register')
      .send({ first: 'C', last: 'D', username, password: 'pass5678' });
    expect(res.status).toBe(409);
  });

  it('default role is ["user"]', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ first: 'Role', last: 'Test', username: `role_${Date.now()}`, password: 'pass1234' });
    expect(res.body.roles).toEqual(['user']);
  });
});

// ---------------------------------------------------------------------------
// POST /api/login
// ---------------------------------------------------------------------------
describe('POST /api/login', () => {
  it('returns 200 and a JWT for valid credentials', async () => {
    const username = `login_${Date.now()}`;
    await request(app)
      .post('/api/register')
      .send({ first: 'L', last: 'T', username, password: 'mypassword' });

    const res = await request(app)
      .post('/api/login')
      .send({ username, password: 'mypassword' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('returns 401 for wrong password', async () => {
    const username = `wrong_${Date.now()}`;
    await request(app)
      .post('/api/register')
      .send({ first: 'W', last: 'P', username, password: 'correctpass' });

    const res = await request(app)
      .post('/api/login')
      .send({ username, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'no_such_user_xyz_abc', password: 'anything' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'onlyusername' });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Admin endpoints — auth & role guards
// ---------------------------------------------------------------------------
describe('GET /api/admin/users', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('returns 403 for a regular user token', async () => {
    const username = `reg_${Date.now()}`;
    const reg = await request(app)
      .post('/api/register')
      .send({ first: 'Reg', last: 'User', username, password: 'pass1234' });
    const { token } = reg.body;

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 200 and array of users for an admin token', async () => {
    const username = `adm_${Date.now()}`;
    await request(app)
      .post('/api/register')
      .send({ first: 'Adm', last: 'Test', username, password: 'adminpass' });

    // Elevate via test endpoint
    await request(app).post('/api/test/make-admin').send({ username });

    const login = await request(app).post('/api/login').send({ username, password: 'adminpass' });
    const { token } = login.body;

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PATCH /api/admin/users/:id/roles', () => {
  async function createAdminSession() {
    const username = `admins_${Date.now()}`;
    await request(app)
      .post('/api/register')
      .send({ first: 'A', last: 'S', username, password: 'adminpass' });
    await request(app).post('/api/test/make-admin').send({ username });
    const login = await request(app).post('/api/login').send({ username, password: 'adminpass' });
    return login.body as { id: number; token: string };
  }

  it('grants admin role to another user', async () => {
    const admin = await createAdminSession();
    const reg = await request(app)
      .post('/api/register')
      .send({ first: 'T', last: 'U', username: `target_${Date.now()}`, password: 'pass1234' });
    const { id: targetId } = reg.body;

    const res = await request(app)
      .patch(`/api/admin/users/${targetId}/roles`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ roles: ['user', 'admin'] });
    expect(res.status).toBe(200);
    expect(res.body.roles).toContain('admin');
  });

  it('returns 400 for an invalid role name', async () => {
    const admin = await createAdminSession();
    const reg = await request(app)
      .post('/api/register')
      .send({ first: 'I', last: 'R', username: `inv_${Date.now()}`, password: 'pass1234' });
    const { id: targetId } = reg.body;

    const res = await request(app)
      .patch(`/api/admin/users/${targetId}/roles`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ roles: ['user', 'superpower'] });
    expect(res.status).toBe(400);
  });

  it('always preserves the base "user" role even when not in payload', async () => {
    const admin = await createAdminSession();
    const reg = await request(app)
      .post('/api/register')
      .send({ first: 'P', last: 'R', username: `pres_${Date.now()}`, password: 'pass1234' });
    const { id: targetId } = reg.body;

    const res = await request(app)
      .patch(`/api/admin/users/${targetId}/roles`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ roles: ['admin'] });
    expect(res.status).toBe(200);
    expect(res.body.roles).toContain('user');
    expect(res.body.roles).toContain('admin');
  });
});

describe('DELETE /api/admin/users/:id', () => {
  async function createAdminSession() {
    const username = `admdel_${Date.now()}`;
    await request(app)
      .post('/api/register')
      .send({ first: 'D', last: 'A', username, password: 'adminpass' });
    await request(app).post('/api/test/make-admin').send({ username });
    const login = await request(app).post('/api/login').send({ username, password: 'adminpass' });
    return login.body as { id: number; token: string };
  }

  it('deletes another user and returns 204', async () => {
    const admin = await createAdminSession();
    const reg = await request(app)
      .post('/api/register')
      .send({ first: 'Del', last: 'Me', username: `delme_${Date.now()}`, password: 'pass1234' });
    const { id: targetId } = reg.body;

    const res = await request(app)
      .delete(`/api/admin/users/${targetId}`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(204);
  });

  it('returns 400 when admin tries to delete their own account', async () => {
    const admin = await createAdminSession();
    const res = await request(app)
      .delete(`/api/admin/users/${admin.id}`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(400);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/admin/users/1');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Test-only endpoint
// ---------------------------------------------------------------------------
describe('POST /api/test/make-admin', () => {
  it('elevates an existing user to admin', async () => {
    const username = `elevate_${Date.now()}`;
    await request(app)
      .post('/api/register')
      .send({ first: 'E', last: 'U', username, password: 'pass1234' });

    const res = await request(app).post('/api/test/make-admin').send({ username });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });

    // The new JWT should contain admin role
    const login = await request(app).post('/api/login').send({ username, password: 'pass1234' });
    expect(login.body.roles).toContain('admin');
  });

  it('returns 404 for a non-existent username', async () => {
    const res = await request(app)
      .post('/api/test/make-admin')
      .send({ username: 'does_not_exist_xyz' });
    expect(res.status).toBe(404);
  });
});
