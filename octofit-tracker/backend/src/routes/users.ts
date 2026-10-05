import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UserModel } from '../models/user.js';

export const usersRouter = Router();

usersRouter.get('/', async (_request, response) => {
  const users = await UserModel.find().sort({ username: 1 });
  response.json(users);
});

usersRouter.get('/:id', async (request, response) => {
  const user = await UserModel.findById(request.params.id);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
});

usersRouter.patch('/me', requireAuth, async (request, response) => {
  const { displayName, bio } = request.body ?? {};
  if (
    (displayName !== undefined &&
      (typeof displayName !== 'string' || displayName.trim().length === 0)) ||
    (bio !== undefined && typeof bio !== 'string') ||
    (displayName === undefined && bio === undefined)
  ) {
    response.status(400).json({ error: 'Provide a valid displayName or bio' });
    return;
  }

  const updates: { displayName?: string; bio?: string } = {};
  if (displayName !== undefined) updates.displayName = displayName.trim();
  if (bio !== undefined) updates.bio = bio.trim();

  const user = await UserModel.findByIdAndUpdate(
    request.auth!.userId,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
});
