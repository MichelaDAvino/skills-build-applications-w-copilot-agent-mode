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

## API routes

The following read-only routes return a JSON array for a collection and accept
a MongoDB document ID for a single record:

- `/api/users`
- `/api/teams`
- `/api/activities`
- `/api/leaderboard`
- `/api/workouts`

Teams, activities, and leaderboard entries include populated user or team
references where applicable.

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
