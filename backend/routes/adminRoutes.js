import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import {
  getAllUsers,
  deleteUser,
  updateUser,
  getStats
} from '../controllers/adminController.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification et les droits d'admin
router.use(authenticateToken);
router.use(isAdmin);

// Routes pour la gestion des utilisateurs
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

// Route pour les statistiques
router.get('/stats', getStats);

export default router; 