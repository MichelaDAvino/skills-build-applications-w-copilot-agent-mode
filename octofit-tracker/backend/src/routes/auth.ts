import { compare, hash } from 'bcryptjs';
import { Router } from 'express';
import { createAccessToken, requireAuth } from '../middleware/auth.js';
import { UserModel } from '../models/user.js';

export const authRouter = Router();

authRouter.post('/register', async (request, response) => {
  const { username, email, displayName, password, bio } = request.body ?? {};

  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof displayName !== 'string' ||
    typeof password !== 'string' ||
    username.trim().length < 3 ||
    displayName.trim().length === 0 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    response.status(400).json({
      error:
        'Provide a username (at least 3 characters), valid email, display name, and password (8-72 bytes)',
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();
  const existingUser = await UserModel.exists({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });
  if (existingUser) {
    response.status(409).json({ error: 'Email or username is already registered' });
    return;
  }

  const user = await UserModel.create({
    username: normalizedUsername,
    email: normalizedEmail,
    displayName: displayName.trim(),
    bio: typeof bio === 'string' ? bio.trim() : undefined,
    passwordHash: await hash(password, 12),
  });

  response.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
    },
    token: createAccessToken(user.id),
  });
});

authRouter.post('/login', async (request, response) => {
  const { email, password } = request.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    response.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = await UserModel.findOne({
    email: email.trim().toLowerCase(),
  }).select('+passwordHash');
  if (!user || !(await compare(password, user.passwordHash))) {
    response.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  response.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
    },
    token: createAccessToken(user.id),
  });
});

authRouter.get('/me', requireAuth, async (request, response) => {
  const user = await UserModel.findById(request.auth!.userId);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
});
