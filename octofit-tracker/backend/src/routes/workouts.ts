import { Router } from 'express';
import { WorkoutModel } from '../models/workout.js';

export const workoutsRouter = Router();

workoutsRouter.get('/', async (_request, response) => {
  const workouts = await WorkoutModel.find().sort({ title: 1 });
  response.json(workouts);
});

workoutsRouter.get('/:id', async (request, response) => {
  const workout = await WorkoutModel.findById(request.params.id);
  if (!workout) {
    response.status(404).json({ error: 'Workout not found' });
    return;
  }
  response.json(workout);
});
