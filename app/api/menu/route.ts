import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { withAuth } from '@/lib/jwt';

export const GET = withAuth(async (req: Request) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  
  const query = category ? { category } : {};
  const items = await MenuItem.find(query).sort({ name: 1 });
  return NextResponse.json(items);
});

export const POST = withAuth(async (req: Request) => {
  await dbConnect();
  const data = await req.json();
  const item = await MenuItem.create(data);
  return NextResponse.json(item, { status: 201 });
});

export const PUT = withAuth(async (req: Request) => {
  await dbConnect();
  const data = await req.json();
  const { _id, ...update } = data;
  const item = await MenuItem.findByIdAndUpdate(_id, update, { new: true });
  return NextResponse.json(item);
});

export const DELETE = withAuth(async (req: Request) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  console.log('🗑️ Attempting to delete MenuItem ID:', id);

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const deletedItem = await MenuItem.findByIdAndDelete(id);
  
  if (!deletedItem) {
    console.warn('⚠️ MenuItem not found for deletion:', id);
    return NextResponse.json({ error: 'MenuItem not found' }, { status: 404 });
  }

  console.log('✅ Successfully deleted MenuItem:', id);
  return NextResponse.json({ message: 'Deleted successfully', id });
});
