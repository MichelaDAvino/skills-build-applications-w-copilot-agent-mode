import { Router } from 'express';
import { LeaderboardModel } from '../models/leaderboard.js';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', async (_request, response) => {
  const entries = await LeaderboardModel.find()
    .populate('user', 'username displayName')
    .populate('team', 'name')
    .sort({ rank: 1 });
  response.json(entries);
});

leaderboardRouter.get('/:id', async (request, response) => {
  const entry = await LeaderboardModel.findById(request.params.id)
    .populate('user', 'username displayName')
    .populate('team', 'name');
  if (!entry) {
    response.status(404).json({ error: 'Leaderboard entry not found' });
    return;
  }
  response.json(entry);
});
