import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipmentType extends Document {
  name: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentTypeSchema = new Schema<IEquipmentType>({
  name: { type: String, required: true },
  category: { type: String }
}, { timestamps: true });

export default mongoose.models.EquipmentType || mongoose.model<IEquipmentType>('EquipmentType', equipmentTypeSchema);
