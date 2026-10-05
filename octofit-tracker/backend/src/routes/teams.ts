import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
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

teamsRouter.post('/', requireAuth, async (request, response) => {
  const { name, description } = request.body ?? {};
  if (
    typeof name !== 'string' ||
    name.trim().length === 0 ||
    typeof description !== 'string' ||
    description.trim().length === 0
  ) {
    response.status(400).json({ error: 'Team name and description are required' });
    return;
  }

  const userId = request.auth!.userId;
  const team = await TeamModel.create({
    name: name.trim(),
    description: description.trim(),
    createdBy: userId,
    members: [userId],
  });
  response.status(201).json(team);
});

teamsRouter.post('/:id/members', requireAuth, async (request, response) => {
  const team = await TeamModel.findByIdAndUpdate(
    request.params.id,
    { $addToSet: { members: request.auth!.userId } },
    { new: true, runValidators: true },
  ).populate('members', 'username displayName');
  if (!team) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.json(team);
});
