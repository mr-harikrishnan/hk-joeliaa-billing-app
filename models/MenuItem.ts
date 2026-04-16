import mongoose, { Schema, model, models } from 'mongoose';

export interface IMenuItem {
  category: string; // References Category name or ID
  name: string;
  price: number;
  unit: string; // e.g., 'kg', 'piece', 'pkt'
  image?: string;
  available: boolean;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    category: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    image: { type: String },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.MenuItem || model<IMenuItem>('MenuItem', MenuItemSchema);
