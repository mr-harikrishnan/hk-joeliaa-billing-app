import mongoose, { Schema, model, models } from 'mongoose';

export interface IBillItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface IBill {
  customerName: string;
  items: IBillItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'upi';
  amountReceived?: number;
  changeReturned?: number;
  status: 'pending' | 'paid';
  createdAt: Date;
}

const BillItemSchema = new Schema<IBillItem>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
});

const BillSchema = new Schema<IBill>(
  {
    customerName: { type: String, required: true },
    items: [BillItemSchema],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'upi'], default: 'upi' },
    amountReceived: { type: Number },
    changeReturned: { type: Number },
    status: { type: String, enum: ['pending', 'paid'], default: 'paid' },
  },
  { timestamps: true }
);

export default models.Bill || model<IBill>('Bill', BillSchema);
