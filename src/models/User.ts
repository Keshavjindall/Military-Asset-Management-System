import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password_hash: string;
  role: 'admin' | 'commander' | 'logistics';
  base_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'commander', 'logistics']
  },
  base_id: { type: String, ref: 'Base' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
