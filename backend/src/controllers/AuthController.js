import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { z } from '../middleware/validate.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const login = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Identifiants incorrects.' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    }
  });
};

export const me = async (req, res) => {
  const { rows } = await db.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable.' });
  res.json(rows[0]);
};