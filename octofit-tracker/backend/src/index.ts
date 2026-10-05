import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import db, { connectDatabase } from './config/database.js';
import { getJwtSecret } from './middleware/auth.js';
import { activitiesRouter } from './routes/activities.js';
import { authRouter } from './routes/auth.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { teamsRouter } from './routes/teams.js';
import { usersRouter } from './routes/users.js';
import { workoutsRouter } from './routes/workouts.js';

const app = express();
const port = 8000;
const codespaceName = process.env.CODESPACE_NAME;
const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(codespaceName
    ? [`https://${codespaceName}-5173.app.github.dev`]
    : []),
];
const allowedOrigins = new Set([
  ...defaultOrigins,
  ...(process.env.FRONTEND_ORIGIN?.split(',').map((origin) => origin.trim()) ?? []),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by CORS'));
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/workouts', workoutsRouter);

app.get('/api/health', (_request, response) => {
  const databaseConnected = db.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'error',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (
    error instanceof Error &&
    error.message === 'Origin is not allowed by CORS'
  ) {
    response.status(403).json({ error: 'Origin is not allowed' });
    return;
  }

  if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
    response.status(409).json({ error: 'A record with these details already exists' });
    return;
  }

  if (
    error instanceof mongoose.Error.CastError ||
    error instanceof mongoose.Error.ValidationError
  ) {
    response.status(400).json({ error: 'Invalid request', details: error.message });
    return;
  }

  if (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400
  ) {
    response.status(400).json({ error: 'Invalid JSON request body' });
    return;
  }

  console.error('API request failed:', error);
  response.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);

async function startServer(): Promise<void> {
  getJwtSecret();
  await connectDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`OctoFit API listening on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start OctoFit API:', error);
  process.exit(1);
});
