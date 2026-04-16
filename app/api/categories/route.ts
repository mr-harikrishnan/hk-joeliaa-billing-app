import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  await dbConnect();
  const categories = await Category.find({}).sort({ order: 1 });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const category = await Category.create(data);
  return NextResponse.json(category, { status: 201 });
}
