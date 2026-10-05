import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { ActivityModel } from '../models/activity.js';
import { WorkoutModel } from '../models/workout.js';

export const workoutsRouter = Router();

workoutsRouter.get('/', async (_request, response) => {
  const workouts = await WorkoutModel.find().sort({ title: 1 });
  response.json(workouts);
});

workoutsRouter.get(
  '/recommendations',
  requireAuth,
  async (request, response) => {
    const activityTotals = await ActivityModel.aggregate<{ totalMinutes: number }>([
    { $match: { user: new Types.ObjectId(request.auth!.userId) } },
      { $group: { _id: null, totalMinutes: { $sum: '$durationMinutes' } } },
    ]);
    const totalMinutes = activityTotals[0]?.totalMinutes ?? 0;
    const difficulty =
      totalMinutes < 120
        ? 'beginner'
        : totalMinutes < 600
          ? 'intermediate'
          : 'advanced';
    const recommendations = await WorkoutModel.find({ difficulty }).sort({
      durationMinutes: 1,
    });

    response.json({
      difficulty,
      totalActivityMinutes: totalMinutes,
      recommendations,
    });
  },
);

workoutsRouter.get('/:id', async (request, response) => {
  const workout = await WorkoutModel.findById(request.params.id);
  if (!workout) {
    response.status(404).json({ error: 'Workout not found' });
    return;
  }
  response.json(workout);
});
