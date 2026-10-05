import { Router } from 'express';
import { ActivityModel } from '../models/activity.js';

export const activitiesRouter = Router();

activitiesRouter.get('/', async (_request, response) => {
  const activities = await ActivityModel.find()
    .populate('user', 'username displayName')
    .populate('team', 'name')
    .sort({ performedAt: -1 });
  response.json(activities);
});

activitiesRouter.get('/:id', async (request, response) => {
  const activity = await ActivityModel.findById(request.params.id)
    .populate('user', 'username displayName')
    .populate('team', 'name');
  if (!activity) {
    response.status(404).json({ error: 'Activity not found' });
    return;
  }
  response.json(activity);
});
