import express from 'express'; // Importer le module express
import { authenticateToken } from '../middleware/authMiddleware.js'; // Importer le middleware authenticateToken
import { getAllAppointments, getAppointmentsByDate, getAppointmentsById, createAppointment, updateAppointment, deleteAppointment, shareAppointment, getShareWithMe, getSharedByMe, confirmAttendance, declineAttendance } from '../controllers/appointmentController.js'; // Importer le controller appointmentController

const router = express.Router(); // Créer un router avec la méthode .Router()

// Récupérer tous les rendez-vous de l'utilisateur connecté
router.get('/', authenticateToken, getAllAppointments); // Utiliser la méthode .get() pour récupérer tous les rendez


// Récupérer les rendez-vous par date
router.get('/:date', authenticateToken, getAppointmentsByDate); // Utiliser la méthode .get() pour récuérer les rendez-vous pas date

// Récupérer un rendez-vous spécifique
router.get('/:id', authenticateToken, getAppointmentsById); // Utiliser la méthode .get() pour récupérer un rendez-vous spécifique

// Créer un nouveau rendez-vous
router.post('/', authenticateToken, createAppointment); // Utiliser la méthode .post() pour créer un nouveau rendez-vous

// Mettre à jour un rendez-vous existant
router.put('/:id', authenticateToken, updateAppointment); // Utiliser la méthode .put() pour mettre à jour un rendez-vous existant

// Supprimer un rendez-vous
router.delete('/:id', authenticateToken, deleteAppointment); // Utiliser la méthode .delete pour supprimer un rendez-vous

// Partager un rendez-vous avec un autre utilisateur
router.post('/:id/share', authenticateToken, shareAppointment); // Utiliser la méthode .post() pour partager un rendez-vous

// Récupérer les rendez-vous partagés avec l'utilisateur
router.get('/share/with-me', authenticateToken, getShareWithMe); // Utiliser la méthode .get() pour récupérer les rendez-vous partagés avec l'utilisateur

// Récupérer les rendez-vous que l'utilisateur à partagé
router.get('/shared/by-me', authenticateToken, getSharedByMe); // Utiliser la méthode .get() pour récupérer les rendez-vous que l'utilisateur avait partagé avec d'autres utilisateurs

// Confirmer la participation à un rzndez-vous partagé
router.patch('/shared/:id/confirm', authenticateToken, confirmAttendance); // Utiliser la méthode .patch() pour confirmer la participation à un rendez-vous partagé avec un autre utilisateur

// Décliner la participation à un rendez-vous partagé
router.patch('/shared/:id/decline', authenticateToken, declineAttendance); // Utiliser la méthode .patch() pour décliner la participation à un rendez-vous partgé avec un autre utilisateur

export default router; // Exporter le routeur pour pouvoir l'utiliser dans d'autres fichiers





