// backend/controllers/appointmentController.js
import pool from "../config/db.js"; // Importer la connexion à la base de données
import moment from "moment"; // Importer moment pour la gestion des dates

// Helper pour vérifier si un ID appartient bien à l'utilisateur connecté
async function checkAppointmentOwnership(appointmentId, userId) {
  const [appointment] = await pool.query(
    "SELECT user_id FROM appointments WHERE id = ?",
    [appointmentId]
  );
  if (!appointment.length || appointment[0].user_id !== userId) {
    return false;
  }
  return true;
}

export const getAllAppointments = async (req, res) => {
  try {
    // Sélectionner et trier par date de début (plus récent en premier)
    const [appointments] = await pool.query(
      "SELECT * FROM appointments WHERE user_id = ? ORDER BY start_time DESC", // Ajout du tri
      [req.user.id]
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Erreur getAllAppointments:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des rendez-vous.",
    });
  }
};

export const getAppointmentsByDate = async (req, res) => {
  try {
    const date = req.params.date; // Format attendu: 'YYYY-MM-DD'
    // Vérifier le format de la date (simple vérification)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({ message: "Format de date invalide (YYYY-MM-DD attendu)." });
    }
    // Utiliser DATE() pour comparer juste la partie date
    const [appointments] = await pool.query(
      "SELECT * FROM appointments WHERE DATE(start_time) = ? AND user_id = ? ORDER BY start_time ASC", // Tri par heure
      [date, req.user.id]
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Erreur getAppointmentsByDate:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération par date." });
  }
};

export const getAppointmentsById = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const [appointment] = await pool.query(
      "SELECT * FROM appointments WHERE id = ? AND user_id = ?",
      [appointmentId, req.user.id]
    );
    if (!appointment.length) {
      return res
        .status(404)
        .json({ message: "Rendez-vous non trouvé ou accès refusé." });
    }
    res.status(200).json(appointment[0]);
  } catch (error) {
    console.error("Erreur getAppointmentsById:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération du rendez-vous.",
    });
  }
};

export const createAppointment = async (req, res) => {
  // Signature correcte
  try {
    // Ajouter location ici si le frontend l'envoie et si la table l'a
    const { title, description, start_time, end_time, location } = req.body;
    const userId = req.user.id;

    // Validation simple (peut être améliorée)
    if (!title || !start_time || !end_time) {
      return res.status(400).json({
        message: "Titre, heure de début et heure de fin sont requis.",
      });
    }
    if (moment(end_time).isBefore(moment(start_time))) {
      return res.status(400).json({
        message: "L'heure de fin ne peut être avant l'heure de début.",
      });
    }

    // Correction SQL: 5 placeholders pour 5 valeurs + ajout de location
    const query = `
            INSERT INTO appointments (title, description, start_time, end_time, location, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    const values = [title, description, start_time, end_time, location, userId]; // Ordre correct

    const [result] = await pool.query(query, values);

    res
      .status(201)
      .json({ message: "Rendez-vous créé avec succès", id: result.insertId });
  } catch (error) {
    console.error("Erreur createAppointment:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création du rendez-vous." });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    // Ajouter location si nécessaire
    const { title, description, start_time, end_time, location } = req.body;

    // Vérifier si l'utilisateur est propriétaire du RDV (sécurité)
    const isOwner = await checkAppointmentOwnership(appointmentId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        message:
          "Accès refusé : vous n'êtes pas propriétaire de ce rendez-vous.",
      });
    }

    // Correction SQL: Mettre à jour tous les champs fournis
    const query = `
            UPDATE appointments
            SET title = ?, description = ?, start_time = ?, end_time = ?, location = ?
            WHERE id = ? AND user_id = ?
        `;
    const values = [
      title,
      description,
      start_time,
      end_time,
      location,
      appointmentId,
      req.user.id,
    ];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Rendez-vous non trouvé ou non modifié." });
    }

    // Correction typo: staus -> status
    res.status(200).json({ message: "Rendez-vous mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur updateAppointment:", error);
    // Correction typo: messag -> message
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
};

// Correction: Signature (req, res) et typo query/message
export const deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Vérifier si l'utilisateur est propriétaire
    const isOwner = await checkAppointmentOwnership(appointmentId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    // Correction typo: quety -> query
    const [result] = await pool.query(
      "DELETE FROM appointments WHERE id = ? AND user_id = ?",
      [appointmentId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé." });
    }

    // Correction typo: suppriùé -> supprimé
    res.status(200).json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    console.error("Erreur deleteAppointment:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression." });
  }
};

export const shareAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { sharedWith } = req.body; // Assurez-vous que sharedWith est l'ID de l'utilisateur

    if (!sharedWith) {
      return res.status(400).json({
        message:
          "L'ID de l'utilisateur destinataire est requis ('sharedWith').",
      });
    }

    // Vérifier si l'utilisateur est propriétaire du RDV qu'il veut partager
    const isOwner = await checkAppointmentOwnership(appointmentId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        message: "Vous ne pouvez partager que vos propres rendez-vous.",
      });
    }

    // Vérifier si le partage existe déjà (optionnel mais recommandé)
    // const [existingShare] = await pool.query('SELECT id FROM shared_items WHERE item_type = ? AND item_id = ? AND shared_with = ?', ['appointment', appointmentId, sharedWith]);
    // if (existingShare.length > 0) { return res.status(409).json({ message: "Déjà partagé avec cet utilisateur." }); }

    // Correction SQL: Utiliser la chaîne 'appointment' et s'assurer que sharedWith est un ID
    const query = `
            INSERT INTO shared_items (item_type, item_id, shared_by, shared_with)
            VALUES (?, ?, ?, ?)
        `;
    const values = ["appointment", appointmentId, req.user.id, sharedWith];

    await pool.query(query, values);

    res.status(200).json({ message: "Rendez-vous partagé avec succès" });
  } catch (error) {
    console.error("Erreur shareAppointment:", error);
    // Gérer les erreurs spécifiques (ex: utilisateur destinataire non trouvé)
    res.status(500).json({ message: "Erreur serveur lors du partage." });
  }
};

// Correction: Syntaxe SQL JOIN et nom variable
export const getShareWithMe = async (req, res) => {
  try {
    // Correction SQL: Ajout JOIN et WHERE clause
    const query = `
            SELECT a.*, u_sharer.username as shared_by_username
            FROM appointments a
            JOIN shared_items si ON a.id = si.item_id
            JOIN users u_sharer ON si.shared_by = u_sharer.id
            WHERE si.shared_with = ? AND si.item_type = 'appointment'
            ORDER BY a.start_time DESC
        `;
    const [sharedAppointments] = await pool.query(query, [req.user.id]);

    // Correction variable: appointments -> sharedAppointments
    res.status(200).json(sharedAppointments);
  } catch (error) {
    console.error("Erreur getShareWithMe:", error);
    res.status(500).json({ message: "Erreur serveur récupération partages." });
  }
};

// Correction: Syntaxe SQL JOIN (a.od -> a.id) et typo status
export const getSharedByMe = async (req, res) => {
  try {
    // Correction SQL: a.od -> a.id
    const query = `
            SELECT a.*, u_receiver.username as shared_with_username
            FROM appointments a
            JOIN shared_items si ON a.id = si.item_id
            JOIN users u_receiver ON si.shared_with = u_receiver.id
            WHERE si.shared_by = ? AND si.item_type = 'appointment'
            ORDER BY a.start_time DESC
        `;
    const [sharedAppointments] = await pool.query(query, [req.user.id]);

    res.status(200).json(sharedAppointments);
  } catch (error) {
    console.error("Erreur getSharedByMe:", error);
    // Correction typo: staus -> status
    res.status(500).json({ message: "Erreur serveur récupération partages." });
  }
};

export const confirmAttendance = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    // On doit mettre à jour l'entrée où l'utilisateur connecté est celui qui a reçu le partage
    const [result] = await pool.query(
      'UPDATE shared_items SET confirmed = TRUE, declined = FALSE WHERE item_id = ? AND item_type = "appointment" AND shared_with = ?',
      [appointmentId, req.user.id] // Ajouter req.user.id pour la sécurité
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Partage non trouvé ou non modifiable." });
    }
    res.status(200).json({ message: "Participation confirmée" });
  } catch (error) {
    console.error("Erreur confirmAttendance:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la confirmation." });
  }
};

// Correction: Ajout réponse succès
export const declineAttendance = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const [result] = await pool.query(
      'UPDATE shared_items SET declined = TRUE, confirmed = FALSE WHERE item_id = ? AND item_type = "appointment" AND shared_with = ?',
      [appointmentId, req.user.id] // Ajouter req.user.id
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Partage non trouvé ou non modifiable." });
    }
    // Correction: Ajout réponse
    res.status(200).json({ message: "Participation déclinée" });
  } catch (error) {
    console.error("Erreur declineAttendance:", error);
    res.status(500).json({ message: "Erreur serveur lors du refus." });
  }
};
