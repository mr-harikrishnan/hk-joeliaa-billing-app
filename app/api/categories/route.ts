import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { withAuth } from '@/lib/jwt';

export const GET = withAuth(async () => {
  await dbConnect();
  const categories = await Category.find({}).sort({ order: 1 });
  return NextResponse.json(categories);
});

export const POST = withAuth(async (req: Request) => {
  await dbConnect();
  const data = await req.json();
  const category = await Category.create(data);
  return NextResponse.json(category, { status: 201 });
});
