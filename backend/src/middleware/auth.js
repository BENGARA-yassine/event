import jwt from 'jsonwebtoken';

export const authenticate = (roles = ['admin', 'staff']) => (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Token manquant.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Accès refusé.' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};
