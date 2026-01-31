import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};
