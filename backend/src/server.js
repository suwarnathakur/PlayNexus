import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 1. CORS Configuration
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? '*' : [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Request Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. System Status / Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OPTIMAL',
    system: 'PLAYNEXUS NEURAL COMBAT ENGINE',
    version: process.env.AI_ENGINE_VERSION || 'v2.4-RULE-BASED',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'PLAYNEXUS COMBAT API // ONLINE',
    docs: {
      analyzeBehavior: 'POST /api/analyze-behavior',
      generateStrategy: 'POST /api/generate-strategy',
      playerDNA: 'GET /api/player/:playerId/dna',
      matchComplete: 'POST /api/match/complete',
      lockInTrigger: 'POST /api/lock-in/trigger',
      leaderboard: 'GET /api/leaderboard',
    },
  });
});

// 4. API Routes
app.use('/api', apiRoutes);

// 5. Central Error Handler
app.use(errorHandler);

// 6. Connect to DB and Start Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚡ PLAYNEXUS NEURAL BACKEND ACTIVATED`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🌐 CORS ALLOWED: ${CORS_ORIGIN}`);
    console.log(`⚔️  API ENDPOINTS READY`);
    console.log(`====================================================`);
  });
};

startServer();

export default app;
