import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { authRoutes } from './routes/auth.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { partnerRoutes } from './routes/partners.js';
import { opportunityRoutes } from './routes/opportunities.js';
import { alertRoutes } from './routes/alerts.js';
import { pipelineRoutes } from './routes/pipeline.js';
import userRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { insertSampleData } from './utils/sampleData.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/users', userRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join_dashboard', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined dashboard room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to other modules
export { io };

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Dashboard API available at http://localhost:${PORT}/api/dashboard`);

  // Insert sample data on startup
  try {
    await insertSampleData();
  } catch (error) {
    logger.error('Failed to insert sample data:', error);
  }
});