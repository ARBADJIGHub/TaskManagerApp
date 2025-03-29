import pool from '../config/db.js'; // Importer la connexion à la base de données

// Fonction pour récupérer les paramètres de l'utilisateur connecté
export const getSettings = async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);

        res.status(200).json(settings[0] || { message: 'Paramètres non trouvés'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Fonction pour mettre à jour la couleur primaire
export const updatePrimaryColor = async (req, res) => {
    try {
        const { color } = req.body;

        // Mettre à jour la couleur primaire dans la base de données
        await pool.query('UPDATE user_settings SET primary_color = ? WHERE user_id = ?', [color, req.user.id]);

        res.status(200).json({ message: 'Couleur primaire mise à jour avec succès' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Fonction pour mettre à jour la couleur secondaire
export const updateSecondaryColor = async (req, res) => {
    try {
        const { color } = req.body;

        // Mettre à jour la couleur secondaire dans la base de données
        await pool.query('UPDATE user_settings SET secondary_color = ? WHERE user_id = ?', [color, req.user.id]);

        res.status(200).json({ message: 'Couleur secondaire mise à jour avec succès' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
};

// Fonction pour mettre à jour les préférences de notification
export const updateNotificationSettings = async (req, res) => {
    try {
        const { notificationsEnabled } = req.body; // Récupérer les données de la requête POST

        // Mettre à jour les préférences de notification dans la base de données
            await pool.query('UPDATE user_settings SET notifications_enabled = ? WHERE user_id = ?', [notificationsEnabled, req.user.id]);

            res.status(200).json({ message: 'Préférences de notification mises à jour avec succès' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (req, res) => {
    try {
        const { username, email } = req.body; // Récupérer les données de la requête POST

        // Mettre à jour le profil utilisateur dans la base de données
        await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.user.id]);

        res.status(200).json({ message: 'Profil mis à jour avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
        }
};

// Fonction pour changer le mot de passe
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body; // Récupérer les données de la requete POST

        // Vérifiier l'ancien mot de passe
        const [user] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]); // Récupérer l'utilisateur connecté depuis la base de données

        if (user[0].password !== oldPassword) { 
            return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
        }

        // Changer le mot de passe dans la base de données
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, req.user.id]);

        res.status(200).json({ message: 'Mot de passe changé avec succès' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Fonction pour exporter les données de l'utilisateur (RGPD)
export const exportUserData = async (req, res) => {
    try {
        // Récupérer toutes les données de l'utilisateur depuis la base de données
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);

        // Exporter les fichiers sous forme de fichier JSON
        res.json(user[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Fonction pour supprimer le compte utilisateur
export const deleteAccount = async (req, res) => {
    try {
        // Supprimer le compte utilisateur de la base de données
        await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);

        res.status(200).json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};