import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './services/seedService.js';
import authRoutes from './routes/authRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend dev server
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'PREVIA XR Engine Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/simulations', simulationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: `Route not found: ${req.method} ${req.url}` });
});

// Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` PREVIA XR Backend Server Running on Port ${PORT}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(` REST APIs: /api/auth, /api/scenarios, /api/simulations`);
    console.log(`===============================================`);
  });
}

startServer().catch(err => {
  console.error('[Server Fatal Error]', err);
  process.exit(1);
});
