import mongoose, { Schema, model, models } from 'mongoose';

export interface IMenuItem {
  category: mongoose.Types.ObjectId;
  name: string;
  price: number;
  unit?: string;
  image?: string;
  available: boolean;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: 'pcs' },
    image: { type: String },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.MenuItem || model<IMenuItem>('MenuItem', MenuItemSchema);
