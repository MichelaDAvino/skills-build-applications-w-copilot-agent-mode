import { Router } from 'express';
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
