import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedDatabase } from './services/seedService.js';
import authRoutes from './routes/authRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import environmentRoutes from './routes/environmentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for secure cookies, https protocol resolution on Render/reverse proxies
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = [
  'https://previa-xr.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, server-to-server, curl)
    if (!origin) return callback(null, true);
    
    try {
      const hostname = new URL(origin).hostname;
      if (
        allowedOrigins.includes(origin) ||
        hostname.endsWith('.vercel.app') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, origin);
      }
    } catch {
      // In case URL parsing fails, check direct array
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
    }
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-environment-id', 'Accept', 'X-Requested-With'],
}));

// Request logger for observability without exposing sensitive request bodies or secrets
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/uploads') && req.url !== '/api/health') {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'PREVIA XR Engine Backend',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/environments', environmentRoutes);

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
    console.log(` REST APIs: /api/auth, /api/scenarios, /api/simulations, /api/environments`);
    console.log(` Static Uploads: http://localhost:${PORT}/uploads`);
    console.log(`===============================================`);
  });
}

startServer().catch(err => {
  console.error('[Server Fatal Error]', err);
  process.exit(1);
});
