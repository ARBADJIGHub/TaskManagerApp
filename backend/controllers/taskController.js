import pool from '../config/db.js'; // Importer la connexion à la base de données

// Fonction pour récupérer toutes les tâches de l'utilosateur connecté
export const getAllTasks = async (req, res) => {
    try {
        const [tasks] = await pool.query('SELECT * FROM tasks WHERE user_id = ?', [req.user.id]); // Requête SQL pour récupérer toutes les tâches de l'utilisateur connecté
        res.status(200).json(tasks); // Retourner les tâches avec statut 200 (OK)
    } catch (error) { // Gérer les erreurs
        console.error(error) // Afficher l'erreur dans la console
        res.status(500).json({ message: 'Erreur serveur' }); // Retourner une erreur 500 (serveur)
    }
    };

// Fonction pour créer une nouvelle têche
export const createTask = async (req, res) => {
    try {
        const { title, description, due_date } = req.body; // Récupérer les données de la requête POST
        const [result] = await pool.query( // Requête SQL pour insérer une nouvelle tâche
            'INSERT INTO tasks (title, description, due_date, user_id) VALUES (?, ?, ?, ?)', // Requête SQL pour insérer une nouvelle tâche
            [title, description, due_date, req.user.id] // Paramètres de la requête SQL
        );
        res.status(201).json({ message: 'Tâche créée avec succès', taskId: result.insertId }); // Retourner une tâche créé avec statut 201 (Création)
    } catch (error) { // Gérer les erreurs
        console.error(error) // Afficher l'erreur dans la console
        res.status(500).json({ message: 'Erreur serveur' }); // Retourner une erreur 500 (serveur)
    }
    };

// Fonction pour récupérer une tâche pas son ID
export const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id; // Récupérer l'ID de la tâche depuis les paramètres de la requête 
        const [task] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.id]); // Requête SQL pour récupérer une tâche par son ID
        if (!task.length) { // Si la têche n'existe pas
            return res.status(404).json({ message: 'Tâche non trouvée' }); // Retourner une erreur 404 (not found)
        }
        res.status(200).json(task[0]); // Retouner la tâche avec statut 200 (OK)
        } catch (error) { // Gérer les erreurs
        console.error(error); // Afficher l'erreur dans la console
        res.status(500).json({ messsage: 'Erreur serveur' }); // Retourner une erreur 500 (serveur)
    }
};

// Fonction pour mette à jour une tâche existante
export const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id; // Récupérer l'ID de la tâche depuis les paramètres de la requête
        const { title, description, due_date } = req.body; // Récupérer les données de la reqête POST
            await pool.query( 
                'UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ? AND user_id = ?',
                [title, description, due_date, taskId, req.user.id] // Paramètres de la requête SQL
            );

            res.status(200).json({ message: 'Tâche mise à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.satatus(500).json({ message: 'Erreur serveur' });
        }
    };

// Fonction pour supprimer une tâche
export const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.id]);
        res.status(200).json({ message: 'Tâche supprimée avec succès'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur'});
    }
};

// Fonction pour marquer une tâche comme terminée
export const completeTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        await pool.query('UPDATE tasks SET status = "completed" WERE id = ? AND user_id = ?', [taskId, req.uer.id]);
        res.status(200).json({ message: 'Tâche marquée comme terminée'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur'});
    }
};

// Fonction pour partager une tâche avec un autre utilisateur
export const shareTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const sharedWith = req.body.sharedWith;
        await pool.query(
            'INSERT INTO shared_items (item_type, item_id, shared_by, shared_with) VALUE (?, ?, ?, ?)',
            ['task', taskId, req.user.id, sharedWith]
        );
        res.status(200).json({ message: 'Tâche partagée avec succès'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur'});
        }
};

// Fonction pour récupérer les tâches partagées avec l'utilisateur
export const getSharedWithMe = async (req, res) => {
    try {
        const [sharedTasks] = await pool.query(
            'SELECT  t.* FROM tasks t JOIN shared_items si ON t.id = si.item_id WHERE si.shared_with = ? AND si.item_type = "task"',
            [req.user.id]
        );
        res.status(200).json(sharedTasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur'});
    }
};

// Fonction pour récupérer les tâches que l'utilisateur a partgées
export const getSharedByMe = async (req, res) => {
    try {
        const [sharedTasks] = await pool.query(
            'SELECT t.* FROM tasks t JOIN shared_items si ON t.id = si.item_id WHERE si.shared_by = ? AND si.item_type = "task"',
            [req.user.id]
        );
        res.status(200).json(sharedTasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur'});
    }
};