import mongoose, { Schema } from 'mongoose';

export interface Workout {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  target: string;
  durationMinutes: number;
  activities: string[];
}

const workoutSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    target: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    activities: [{ type: String, required: true, trim: true }],
  },
  { timestamps: true },
);

export const WorkoutModel = mongoose.model('Workout', workoutSchema);
