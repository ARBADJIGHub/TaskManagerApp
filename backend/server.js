import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


// Importer les routes
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Configuration
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);

// Définir une route pour la page d'accueil
app.get('/', (req, res) => {
  res.send('API fonctionnelle');
});

// Définir le port d'écoute du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
