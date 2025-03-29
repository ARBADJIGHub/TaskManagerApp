import pool from '../config/db.js'; // Importer la connexion à la base de données


export const getAllAppointments = async (req, res) => { // Fonction pour récupérer tous les rendez-vous
    try {
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE user_id = ?', [req.user.id]); // Requête SQL pour récupérer tous les rendez-vous de l'utilisateur connecté
        res.status(200).json(appointments); // Retourner les rendez-vous avec statut 200 (OK)
    } catch (error) { // Gérer les erreurs
        console.error(error); // Afficher l'erreur dans la console
        res.status(500).json({ message: 'Erreur serveur' }); // Retourner une erreur 500 (serveur)
    }
};

export const getAppointmentsByDate = async (req, res) => { // Fonction pour récupérer les rendez-vous par date 
    try {
        const date = req.params.date; // Récupérer la date du rendez-vous depuis les paramètres de la requête
        const [appointments] = await pool.query('SELECT * FROM appointments WHERE start_time LIKE ? AND user_id = ?', [`%${date}%`, req.user.id]); // Requête SQL pour récupérer les rendez-vous pas date
        res.status(200).json(appointments); // Retourner les rendez-vous avec statut 200 (OK)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' }); // Retourner une erreur 500 (serveur)

    }
};

export const getAppointmentsById = async (req, res) => { // Fonction pour récupérer un rendez-vous par son ID
    try {
        const appointmentId = req.params.id; // Récupérer l'ID du rendez-vous depuis les paramètres de la requête
        const [appointment] = await pool.query('SELECT * FROM appointments WHERE id = ? AND user_id = ?', [appointmentId, req.user.id]); // Requête SQL pour récupérer un rendez-vous par son ID
        if (!appointment.length) { // Si le rendez-vous n'existe pas
            return res.status(404).json({ message: 'Rendez-vous non trouvé' }); // Retourner une erreur 404 (not found)
            }
            res.status(200).json(appointment[0]); // Retourner le rendez-vous avec statut 200 (OK)
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur serveur' }); // Retourner une erreur 500 (serveur)
        }
    };

export const createAppointment = async (res, req) => { // Fonction pour créer un nouveau rendez-vous
    try {
        const { title, description, start_time, end_time } = req.body;
        const userId = req.user.id;
            
        const [result] = await pool.query('INSERT INTO appointments (title, description, start_time, end_time, user_id) VALUES(?, ?, ?, ?)', 
            [title, description, start_time, end_time, userId]);
            res.status(201).json({ message: 'Rendez-vous créé avec succès', id:result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const updateAppointment = async (req, res) => { // Fontion pour mettre à jour un rendez-vous
    try {
        const appointmentId = req.params.id;
        const { title, description, start_time, end_time } = req.body;

        await pool.query('UPDATE appointments SET title = ?', [title, description, start_time, end_time, appointmentId, req.user.id]);

        res.staus(200).json({ message: 'Rendez-vous mis à jour avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ messag: 'Erreur serveur' });
    }

};

export const deleteAppointment = async (res, req) => { // Fonction pour supprimer un rendez-vous
    try {
        const appointmentId = res.params.id;

        await pool.quety('DELETE FROM appointments WHERE id = ? AND user_id = ?', [appointmentId, req.user.id]);

        res.status(200).json({ message: 'Rendez-vous suppriùé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }

};

export const shareAppointment = async (req, res) => { // Fonction pour partager un rendez-vous
    try {
        const appointmentId = req.params.id;
        const sharedWith = req.body.sharedWith;

        await pool.query('INSERT INTO shared_items (item_type, item_id, shared_by, shared_with) VALUES (?, ?, ?, ?)', [appointment, appointmentId, req.user.id, sharedWith]);

        res.status(200).json({ message: 'Rendez-vous partagé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const getShareWithMe = async (req, res) => { // Fonction pour récupérer les rendez-vous partagés avec l'utilisateur
    try {
        const [appointment] = await pool.query('SELECT a.* FROM appointments a si.item_type = "appointment"', [req.user.id]);

        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const getSharedByMe = async (req, res) => { // Fonction pour récupérer les rendez-vous partagés par l'utilisateur
    try {
        const [appointment] = await pool.query('SELECT a.* FROM appointments a JOIN shared_items si ON a.od = si.item_id WHERE si.shared_by = ? AND si.item_type = "appointment"', [req.user.id]);

        res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        res.staus(500).json({ message: 'Erreur serveur' });
    }
};

export const confirmAttendance = async (req, res) => { // Fonction pour confirmer la participation à un rendez-vous patagé avec un autre utilisateur
    try {
        const appointmentId = req.params.id; // Récupérer l'ID du rendez-vous depuis les paramètres de la requête
        await pool.query('UPDATE shared_items SET confirmed = TRUE WHERE item_id = ? AND item_type = "appointment"', [appointmentId]);
        res.status(200).json({ message: 'Participation confirmée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
        
    }
};

export const declineAttendance = async (req, res) => { // Fonction pour décliner la participation à un rendez-vous
    try {
        const appointmentId = req.params.id; // Récupérer l'ID du rendez-vous depuis les paramètres de la requête
        await pool.query('UPDATE shared_items SET declined = TRUE WHERE item_id = ? AND item_type = "appointment"', [appointmentId]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
