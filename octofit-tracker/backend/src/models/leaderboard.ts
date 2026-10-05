import mongoose, { Schema, Types } from 'mongoose';

export interface LeaderboardEntry {
  user: Types.ObjectId;
  team?: Types.ObjectId;
  points: number;
  rank: number;
}

const leaderboardSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    points: { type: Number, required: true, min: 0 },
    rank: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

leaderboardSchema.index({ rank: 1 });

export const LeaderboardModel = mongoose.model(
  'LeaderboardEntry',
  leaderboardSchema,
);
