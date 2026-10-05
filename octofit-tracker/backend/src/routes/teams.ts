import { Router } from 'express';
import { TeamModel } from '../models/team.js';

export const teamsRouter = Router();

teamsRouter.get('/', async (_request, response) => {
  const teams = await TeamModel.find()
    .populate('members', 'username displayName')
    .sort({ name: 1 });
  response.json(teams);
});

teamsRouter.get('/:id', async (request, response) => {
  const team = await TeamModel.findById(request.params.id).populate(
    'members',
    'username displayName',
  );
  if (!team) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.json(team);
});
