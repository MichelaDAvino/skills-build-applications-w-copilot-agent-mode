import mongoose, { Schema, Types } from 'mongoose';

export interface Team {
  name: string;
  description: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
}

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  },
  { timestamps: true },
);

export const TeamModel = mongoose.model('Team', teamSchema);
