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
    
    // Ensure data integrity by recalculating totals on the server
    const items = data.items.map((item: any) => ({
      ...item,
      total: Number(item.price) * Number(item.quantity)
    }));

    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    const deliveryCharge = Number(data.deliveryCharge) || 0;
    const discount = Number(data.discount) || 0;
    const grandTotal = subtotal + deliveryCharge - discount;

    const bill = await Bill.create({
      ...data,
      items,
      subtotal,
      grandTotal,
      deliveryCharge,
      discount
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
