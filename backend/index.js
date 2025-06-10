import adminRoutes from './routes/adminRoutes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes); 