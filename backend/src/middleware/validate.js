import { z } from 'zod';

export { z };
export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Données invalides.', errors: parsed.error.flatten().fieldErrors });
  req.body = parsed.data;
  next();
};
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
