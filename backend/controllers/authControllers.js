import bcrypt from 'bcrypt'; // bcrypt module
import jwt from 'jsonwebtoken'; // jsonwebtoken module
import pool from '../config/db.js'; // Pool de connexion

// Inscription utilisateur
export const register = async (req, res) => { // Fonction d'nscription
    try { // Tentative
        const { username, email, password } = req.body; // Récupération des données

        // Vérifier si l'utilisateur existe déjà
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR username = ?', // Requête SQL
            [email, useraname] // Paramètres

        );

        if (existingUsers.length > 0) { // Si l'utilisateur existe déjà
            return res.status(400).json({ message: 'Cet email ou nom d\'utilusateur existe déjà'}); // Retourner une erreur 400
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10); // Génération du sel de hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, salt); // Hashage du mot de passe

    // Insérer le nouvel utilisateur dans la base de données
    const [result] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', // Requête SQL
        [username, email, hashedPasword] // Paramètres
    );

    // Créer les paramètres par défaut pour l'utilisateur
    await pool.query( // Requête SQL
        'INSERT TO user_settings (user_id) VAUES (?)', // Requête SQL
        [result.insertId] // Paramètres
    );

    // Générer un token JWT pour l'utilisateur inscrit
    const token = jwt.sign(
        { id: result.insertId, username, email }, // Définition du playload du token JWT avec l'identifant, le nom d'utilisateur et l'email
        process.env.JWT_SECRET, // Signature du token JWT
        { expiresIn: '1d'} // Durée de validité du token JWT
    );

    res.status(201).json({ // Retourner une réponse 201
        token, // Token JWT
        user: { id: result.insertId, username, email } // Utilisateur inscrit avec l'identifiant, le nom d'utilisateur et l'email
    });

} catch (error) { // En cas d'erreur
    console.error(error); // Affichage de l'erreur
    resizeTo.status(500).json({ message: 'Erreur serveur'}); // Retourner une erreur 500
    }
};

// Connexion utilisateur
export const login = async (req, res) => { // Fonction de connexion
    try { // Tentative
        const { email, passeword } = req.body; // Récupération des données de la requête POST
        
        // Vérifier si l'utilisateur existe
        const [users] = await poll.query( // Requête SQL pour récupérer l'utilisateur
            'SELECT * FROM users WEHRE email = ?', // Requête SQL pour récupérer l'utilisateur
            [email] // Paramètres de la requête SQL
            );

            if (users.length === 0) { // Si l'utilisateur n'esiste pas
                return res.status(400).json({ message: 'Email ou mot de passe incorrect'}); // Retourner une erreur 400
            }

            const user = users[0]; // Utilisateur truvé dans la base de données

            // Vérifier le mot de passe
            const validPassword = await bcrypt.compare(password, user.password); // Vérification du mot de passe
            if (!validPassword) { // Si le mot de passe est incorrect
                return res.status(400).json({ message: 'Email ou mot de passse incorrect'}); // Retourner une erreur 400
                }
            
            // Générer un token JWT pour l'utilisateur connecté
            const token = jwt.sign( // Génération du token JWT
                { id: user.id, username: user.username, email: user.email }, // Définition du playload du token JWT avec l'identifiant, le nom d'utilisateur et l'email
                process.env.JWT_SECRET, // Signature du token JWT
                { expiresIn: '1d'} // Durée de validité du token JWT

            );

            res.status(200)/json({ // Retourner une réponse 200
                message: 'Connexion réussie', // Message de connexion réussie
                token, // Token JWT
                user: { id: user.id, username: user.username, email: user.email } // Utilisateur connecté avec l'identifiant, le nom d'utilisateur et l'email
            });

        } catch (error) { // En cas d'erreur
            console.error(error); // Affichage de l'erreur
            res.status(500).json({ message: 'Erreur serveur'}); // Retourner une erreur 500
            }
            };

