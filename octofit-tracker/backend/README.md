# OctoFit Tracker backend

The API uses Mongoose to connect to the `octofit_db` MongoDB database before
starting its HTTP server.

By default, it connects to `mongodb://127.0.0.1:27017/octofit_db`. Set
`MONGODB_URI` to use a different MongoDB server, for example:

```sh
MONGODB_URI='mongodb://127.0.0.1:27017/octofit_db' npm run dev
```

The API listens on port `8000`. Its `/api/health` endpoint reports the MongoDB
connection state and returns HTTP 503 if the database is unavailable.

Set a strong `JWT_SECRET` (at least 32 characters) before starting the API.
For local development, for example:

```sh
export JWT_SECRET="$(openssl rand -base64 32)"
npm run dev
```

Browser requests from `http://localhost:5173`, `http://127.0.0.1:5173`, and the
matching Codespaces presentation URL are allowed by default. Set
`FRONTEND_ORIGIN` to a comma-separated list of additional allowed origins when
needed.

## API routes

The collection routes return JSON arrays; adding a MongoDB document ID returns
one record:

- `/api/users`
- `/api/teams`
- `/api/activities`
- `/api/leaderboard`
- `/api/workouts`

Teams, activities, and leaderboard entries include populated user or team
references where applicable.

### Authentication and writes

- `POST /api/auth/register`: create a profile with `username`, `email`,
  `displayName`, and an 8-72-byte `password`; optionally include `bio`.
- `POST /api/auth/login`: exchange `email` and `password` for a one-hour JWT.
- `GET /api/auth/me`: return the authenticated user's profile.
- `PATCH /api/users/me`: update the authenticated user's `displayName` and/or
  `bio`.
- `POST /api/teams`: create a team; the authenticated creator is its first
  member.
- `POST /api/teams/:id/members`: join an existing team.
- `POST /api/activities`: log an activity for the authenticated user. Provide
  `activityType`, positive numeric `durationMinutes`, and non-negative numeric
  `caloriesBurned`; `team` and `performedAt` are optional. Points are awarded
  at one point per minute and the leaderboard is recalculated.
- `GET /api/workouts/recommendations`: return workouts at a difficulty based
  on the user's total logged activity time (under 120 minutes: beginner,
  120-599: intermediate, 600 or more: advanced).

Send the token on protected requests with
`Authorization: Bearer <token>`. Passwords are stored as bcrypt hashes and are
never returned by API responses. The seed script uses the test password
`octofit-demo` for all seeded users; do not use this password outside local
development.

## Seed test data

With MongoDB running, populate `octofit_db` with sample users, teams,
activities, leaderboard entries, and workouts:

```sh
npm run seed
```

The seed uses upserts keyed by each fixture's email, team name, activity
details, leaderboard user, or workout title, so running it again updates those
fixtures instead of inserting duplicates. It does not clear other database
records.
