import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../lib/db';

const router = express.Router();

// register: body { username, password }
router.post('/register', async (req: any, res: any) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users (username, password_hash) VALUES ($1,$2) RETURNING id, username, created_at', [username, hashed]);
    const user = result.rows[0];
    return res.json({ ok: true, user });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'username_taken' });
    console.error('register error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// login: body { username, password }
router.post('/login', async (req: any, res: any) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const result = await pool.query('SELECT id, username, password_hash FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const token = jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ ok: true, token });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

export default router;
