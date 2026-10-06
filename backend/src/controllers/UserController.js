import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { z } from '../middleware/validate.js';

export const userSchema = z.object({ fullName: z.string().min(2).max(120), email: z.string().email(), password: z.string().min(8), role: z.enum(['admin', 'staff']) });
export const updateUserSchema = userSchema.omit({ password: true }).extend({ password: z.string().min(8).optional() });
export const getUsers = async (req, res) => {
  const { rows } = await db.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
  res.json(rows);
};
export const createUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await db.query('INSERT INTO users(full_name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,full_name,email,role,created_at', [fullName, email.toLowerCase(), passwordHash, role]);
  res.status(201).json(rows[0]);
};
export const updateUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const passwordHash = password ? await bcrypt.hash(password, 12) : null;
  const { rows } = await db.query('UPDATE users SET full_name=$1,email=$2,role=$3,password_hash=COALESCE($4,password_hash) WHERE id=$5 RETURNING id,full_name,email,role,created_at', [fullName, email.toLowerCase(), role, passwordHash, req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable.' });
  res.json(rows[0]);
};
