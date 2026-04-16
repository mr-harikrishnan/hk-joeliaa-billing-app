import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bill from '@/models/Bill';
import { verifyJWT, withAuth } from '@/lib/jwt';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  // PUBLIC ACCESS: If looking for one specific bill, allow without token
  if (id) {
    const bill = await Bill.findById(id);
    return NextResponse.json(bill);
  }

  // PROTECTED ACCESS: For listing all bills (Admin view)
  const { error } = verifyJWT(req);
  if (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bills = await Bill.find({}).sort({ createdAt: -1 });
  return NextResponse.json(bills);
}

export const POST = withAuth(async (req: Request) => {
  try {
    await dbConnect();
    const data = await req.json();
    const bill = await Bill.create(data);
    return NextResponse.json(bill, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
