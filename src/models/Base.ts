import mongoose, { Schema, Document } from 'mongoose';

export interface IBase extends Document {
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const baseSchema = new Schema<IBase>({
  name: { type: String, required: true },
  location: { type: String }
}, { timestamps: true });

export default mongoose.models.Base || mongoose.model<IBase>('Base', baseSchema);
