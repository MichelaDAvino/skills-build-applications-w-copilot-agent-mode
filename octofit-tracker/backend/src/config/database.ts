import mongoose from 'mongoose';

const connectionString =
  process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/octofit_db';

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(connectionString, { dbName: 'octofit_db' });
  console.log('Connected to octofit_db');
}

export default mongoose.connection;
