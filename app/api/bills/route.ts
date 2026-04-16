import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bill from '@/models/Bill';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const bill = await Bill.findById(id);
    return NextResponse.json(bill);
  }

  const bills = await Bill.find({}).sort({ createdAt: -1 });
  return NextResponse.json(bills);
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    const bill = await Bill.create(data);
    return NextResponse.json(bill, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
