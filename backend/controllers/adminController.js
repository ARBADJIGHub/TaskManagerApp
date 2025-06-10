import pool from '../config/database.js';

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at, last_login FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Erreur dans getAllUsers:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'utilisateur
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur dans deleteUser:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'utilisateur' });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, role } = req.body;

    // Vérifier si l'utilisateur existe
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour l'utilisateur
    await pool.query(
      'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
      [username, email, role, userId]
    );

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur dans updateUser:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
};

// Récupérer les statistiques
export const getStats = async (req, res) => {
  try {
    // Récupérer le nombre total d'utilisateurs
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Récupérer le nombre d'utilisateurs actifs (connectés dans les dernières 24h)
    const [activeUsers] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
    );

    // Récupérer le nombre total de tâches
    const [totalTasks] = await pool.query('SELECT COUNT(*) as count FROM tasks');
    
    // Récupérer le nombre de tâches complétées
    const [completedTasks] = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE status = "completed"'
    );

    res.json({
      totalUsers: totalUsers[0].count,
      activeUsers: activeUsers[0].count,
      totalTasks: totalTasks[0].count,
      completedTasks: completedTasks[0].count
    });
  } catch (error) {
    console.error('Erreur dans getStats:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des statistiques' });
  }
}; 