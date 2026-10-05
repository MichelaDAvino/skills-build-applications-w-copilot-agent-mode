import { hash } from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { ActivityModel } from '../models/activity.js';
import { LeaderboardModel } from '../models/leaderboard.js';
import { TeamModel } from '../models/team.js';
import { UserModel } from '../models/user.js';
import { WorkoutModel } from '../models/workout.js';

async function seedDatabase(): Promise<void> {
  try {
    await connectDatabase();

    const demoPasswordHash = await hash('octofit-demo', 12);
    const userFixtures = [
      {
        username: 'alex.runner',
        email: 'alex.runner@example.test',
        displayName: 'Alex Runner',
        bio: 'Enjoys running and strength training.',
        passwordHash: demoPasswordHash,
      },
      {
        username: 'sam.stride',
        email: 'sam.stride@example.test',
        displayName: 'Sam Stride',
        bio: 'Training for a first half marathon.',
        passwordHash: demoPasswordHash,
      },
      {
        username: 'taylor.trail',
        email: 'taylor.trail@example.test',
        displayName: 'Taylor Trail',
        bio: 'Weekend hiker and cyclist.',
        passwordHash: demoPasswordHash,
      },
      {
        username: 'jordan.cycle',
        email: 'jordan.cycle@example.test',
        displayName: 'Jordan Cycle',
        bio: 'Likes long rides and outdoor workouts.',
        passwordHash: demoPasswordHash,
      },
    ];

    const users = await Promise.all(
      userFixtures.map((fixture) =>
        UserModel.findOneAndUpdate(
          { email: fixture.email },
          { $set: fixture },
          { upsert: true, new: true, runValidators: true },
        ),
      ),
    );
    const [alex, sam, taylor, jordan] = users;

    const teamFixtures = [
      {
        name: 'Pace Setters',
        description: 'A team focused on steady progress and running.',
        createdBy: alex._id,
        members: [alex._id, sam._id],
      },
      {
        name: 'Trail Blazers',
        description: 'A team for outdoor training and cycling.',
        createdBy: taylor._id,
        members: [taylor._id, jordan._id],
      },
    ];
    const teams = await Promise.all(
      teamFixtures.map((fixture) =>
        TeamModel.findOneAndUpdate(
          { name: fixture.name },
          { $set: fixture },
          { upsert: true, new: true, runValidators: true },
        ),
      ),
    );
    const [paceSetters, trailBlazers] = teams;

    const activityFixtures = [
      {
        user: alex._id,
        team: paceSetters._id,
        activityType: 'Running',
        durationMinutes: 32,
        caloriesBurned: 310,
        points: 32,
        performedAt: new Date('2026-10-01T08:00:00.000Z'),
      },
      {
        user: sam._id,
        team: paceSetters._id,
        activityType: 'Cycling',
        durationMinutes: 45,
        caloriesBurned: 390,
        points: 45,
        performedAt: new Date('2026-10-02T09:00:00.000Z'),
      },
      {
        user: taylor._id,
        team: trailBlazers._id,
        activityType: 'Hiking',
        durationMinutes: 60,
        caloriesBurned: 460,
        points: 60,
        performedAt: new Date('2026-10-03T10:00:00.000Z'),
      },
      {
        user: jordan._id,
        team: trailBlazers._id,
        activityType: 'Cycling',
        durationMinutes: 50,
        caloriesBurned: 420,
        points: 50,
        performedAt: new Date('2026-10-04T11:00:00.000Z'),
      },
    ];

    await Promise.all(
      activityFixtures.map((fixture) =>
        ActivityModel.findOneAndUpdate(
          {
            user: fixture.user,
            activityType: fixture.activityType,
            performedAt: fixture.performedAt,
          },
          { $set: fixture },
          { upsert: true, new: true, runValidators: true },
        ),
      ),
    );

    const leaderboardFixtures = [
      { user: alex._id, team: paceSetters._id, points: 32, rank: 4 },
      { user: sam._id, team: paceSetters._id, points: 45, rank: 3 },
      { user: taylor._id, team: trailBlazers._id, points: 60, rank: 1 },
      { user: jordan._id, team: trailBlazers._id, points: 50, rank: 2 },
    ];
    await Promise.all(
      leaderboardFixtures.map((fixture) =>
        LeaderboardModel.findOneAndUpdate(
          { user: fixture.user },
          { $set: fixture },
          { upsert: true, new: true, runValidators: true },
        ),
      ),
    );

    const workoutFixtures = [
      {
        title: 'Beginner Cardio Boost',
        description: 'A low-impact session to build your cardio base.',
        difficulty: 'beginner' as const,
        target: 'Cardio',
        durationMinutes: 20,
        activities: ['Brisk walking', 'Easy cycling'],
      },
      {
        title: 'Full Body Strength',
        description: 'A balanced strength session using bodyweight exercises.',
        difficulty: 'intermediate' as const,
        target: 'Strength',
        durationMinutes: 35,
        activities: ['Squats', 'Push-ups', 'Plank'],
      },
      {
        title: 'Advanced Interval Run',
        description: 'A challenging interval workout for experienced runners.',
        difficulty: 'advanced' as const,
        target: 'Endurance',
        durationMinutes: 40,
        activities: ['Warm-up jog', 'Run intervals', 'Cool-down jog'],
      },
    ];
    await Promise.all(
      workoutFixtures.map((fixture) =>
        WorkoutModel.findOneAndUpdate(
          { title: fixture.title },
          { $set: fixture },
          { upsert: true, new: true, runValidators: true },
        ),
      ),
    );

    console.log(
      `Seed complete: ${users.length} users, ${teams.length} teams, ` +
        `${activityFixtures.length} activities, ${leaderboardFixtures.length} ` +
        `leaderboard entries, ${workoutFixtures.length} workouts.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase().catch((error: unknown) => {
  console.error('Error seeding octofit_db:', error);
  process.exitCode = 1;
});
