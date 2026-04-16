import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';

const initialMenuItems = [
  { name: 'Traditional Laddu', category: 'Sweets', price: 450, unit: 'kg', available: true },
  { name: 'Special Murukku', category: 'Snacks', price: 280, unit: 'kg', available: true },
  { name: 'Homemade Samosa', category: 'Snacks', price: 15, unit: 'piece', available: true },
  { name: 'Sweet Poli', category: 'Sweets', price: 25, unit: 'piece', available: true },
  { name: 'Carrot Halwa', category: 'Sweets', price: 550, unit: 'kg', available: true },
  { name: 'Banana Chips', category: 'Snacks', price: 320, unit: 'kg', available: true },
];

export async function GET() {
  try {
    await dbConnect();
    
    // Check if items already exist
    const count = await MenuItem.countDocuments();
    
    if (count === 0) {
      await MenuItem.insertMany(initialMenuItems);
      return NextResponse.json({ message: 'Menu items seeded successfully', count: initialMenuItems.length });
    }
    
    return NextResponse.json({ message: 'Menu already has data', count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
