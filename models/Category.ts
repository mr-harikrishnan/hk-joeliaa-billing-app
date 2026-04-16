import mongoose, { Schema, model, models } from 'mongoose';

export interface ICategory {
  name: string;
  order: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Category || model<ICategory>('Category', CategorySchema);
