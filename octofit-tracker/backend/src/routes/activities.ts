import { Router } from 'express';
import type { Types } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { ActivityModel } from '../models/activity.js';
import { LeaderboardModel } from '../models/leaderboard.js';
import { TeamModel } from '../models/team.js';

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

activitiesRouter.post('/', requireAuth, async (request, response) => {
  const { activityType, durationMinutes, caloriesBurned, team, performedAt } =
    request.body ?? {};
  if (
    typeof activityType !== 'string' ||
    activityType.trim().length === 0 ||
    typeof durationMinutes !== 'number' ||
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0 ||
    typeof caloriesBurned !== 'number' ||
    !Number.isFinite(caloriesBurned) ||
    caloriesBurned < 0
  ) {
    response.status(400).json({
      error: 'Activity type, positive duration, and non-negative calories are required',
    });
    return;
  }

  let teamId: string | undefined;
  if (team !== undefined) {
    if (typeof team !== 'string') {
      response.status(400).json({ error: 'Team must be a team ID' });
      return;
    }

    const memberTeam = await TeamModel.exists({
      _id: team,
      members: request.auth!.userId,
    });
    if (!memberTeam) {
      response.status(400).json({ error: 'You must be a member of the team' });
      return;
    }
    teamId = team;
  }

  if (performedAt !== undefined && typeof performedAt !== 'string') {
    response.status(400).json({ error: 'Activity date must be a valid date string' });
    return;
  }
  const activityDate =
    performedAt === undefined ? new Date() : new Date(performedAt);
  if (Number.isNaN(activityDate.getTime())) {
    response.status(400).json({ error: 'Activity date must be a valid date' });
    return;
  }

  const activity = await ActivityModel.create({
    user: request.auth!.userId,
    team: teamId,
    activityType: activityType.trim(),
    durationMinutes,
    caloriesBurned,
    points: Math.round(durationMinutes),
    performedAt: activityDate,
  });

  const totals = await ActivityModel.aggregate<{
    _id: Types.ObjectId;
    team?: Types.ObjectId;
    points: number;
  }>([
    { $sort: { performedAt: -1 } },
    {
      $group: {
        _id: '$user',
        team: { $first: '$team' },
        points: { $sum: '$points' },
      },
    },
    { $sort: { points: -1, _id: 1 } },
  ]);
  await LeaderboardModel.bulkWrite(
    totals.map((entry, index) => ({
      updateOne: {
        filter: { user: entry._id },
        update: {
          $set: {
            ...(entry.team ? { team: entry.team } : {}),
            points: entry.points,
            rank: index + 1,
          },
          ...(entry.team ? {} : { $unset: { team: 1 } }),
        },
        upsert: true,
      },
    })),
  );
  await LeaderboardModel.deleteMany({
    user: { $nin: totals.map((entry) => entry._id) },
  });

  response.status(201).json(activity);
});
