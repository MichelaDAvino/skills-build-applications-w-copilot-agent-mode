import mongoose, { Schema } from 'mongoose';

export interface User {
  username: string;
  email: string;
  displayName: string;
  bio?: string;
}

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    displayName: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<User>('User', userSchema);
