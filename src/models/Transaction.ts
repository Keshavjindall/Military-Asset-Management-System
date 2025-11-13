import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'PURCHASE' | 'TRANSFER' | 'ASSIGNMENT' | 'EXPENDITURE';
  timestamp: Date;
  recorded_by_user_id: mongoose.Types.ObjectId;
  equipment_type_id: mongoose.Types.ObjectId;
  quantity: number;
  from_base_id?: mongoose.Types.ObjectId;
  to_base_id?: mongoose.Types.ObjectId;
  assigned_to_personnel?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  type: {
    type: String,
    required: true,
    enum: ['PURCHASE', 'TRANSFER', 'ASSIGNMENT', 'EXPENDITURE']
  },
  timestamp: { type: Date, default: Date.now, index: true },
  recorded_by_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  equipment_type_id: { type: Schema.Types.ObjectId, ref: 'EquipmentType', required: true },
  quantity: { type: Number, required: true, min: 1 },
  from_base_id: { type: Schema.Types.ObjectId, ref: 'Base', sparse: true },
  to_base_id: { type: Schema.Types.ObjectId, ref: 'Base', sparse: true },
  assigned_to_personnel: { type: String, sparse: true },
  notes: { type: String, sparse: true }
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
