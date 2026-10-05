import express, { type ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import db, { connectDatabase } from './config/database.js';
import { activitiesRouter } from './routes/activities.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { teamsRouter } from './routes/teams.js';
import { usersRouter } from './routes/users.js';
import { workoutsRouter } from './routes/workouts.js';

const app = express();
const port = 8000;

app.use(express.json());

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
    error instanceof mongoose.Error.CastError ||
    error instanceof mongoose.Error.ValidationError
  ) {
    response.status(400).json({ error: 'Invalid request', details: error.message });
    return;
  }

  console.error('API request failed:', error);
  response.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);

async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`OctoFit API listening on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start OctoFit API:', error);
  process.exit(1);
});
