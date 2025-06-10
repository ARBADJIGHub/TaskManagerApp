import pool from '../config/database.js';

export const isAdmin = async (req, res, next) => {
  try {
    // L'utilisateur est déjà authentifié par authenticateToken
    const userId = req.user.id;

    // Vérifier si l'utilisateur a le rôle admin
    const [users] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Droits d\'administrateur requis.' });
    }

    next();
  } catch (error) {
    console.error('Erreur dans isAdmin middleware:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification des droits' });
  }
}; 