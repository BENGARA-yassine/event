import { ZodError } from 'zod';

export const notFound = (req, res) => res.status(404).json({ message: 'Route introuvable.' });
export const errorHandler = (error, req, res, next) => {
  console.error(error);
  if (error instanceof ZodError) return res.status(400).json({ message: 'Données invalides.', errors: error.flatten().fieldErrors });
  if (error.code === '23505') return res.status(409).json({ message: 'Cette ressource existe déjà.' });
  if (error.code === '23503') return res.status(400).json({ message: 'Référence invalide.' });
  res.status(error.status || 500).json({ message: error.message || 'Erreur interne du serveur.' });
};
