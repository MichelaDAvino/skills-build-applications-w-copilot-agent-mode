import mongoose, { Schema, Types } from 'mongoose';

export interface Activity {
  user: Types.ObjectId;
  team?: Types.ObjectId;
  activityType: string;
  durationMinutes: number;
  caloriesBurned: number;
  points: number;
  performedAt: Date;
}

const activitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    activityType: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, required: true, min: 0 },
    points: { type: Number, required: true, min: 0 },
    performedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const ActivityModel = mongoose.model('Activity', activitySchema);
