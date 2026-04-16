import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bill from '@/models/Bill';
import { withAuth } from '@/lib/jwt';

export const GET = withAuth(async () => {
  await dbConnect();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayData, monthData, allBills] = await Promise.all([
    Bill.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, revenue: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
    ]),
    Bill.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      { $group: { _id: null, revenue: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
    ]),
    Bill.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
  ]);

  // Aggregate daily revenue for the chart
  const dailyRevenue: Record<string, number> = {};
  allBills.forEach((bill) => {
    const date = new Date(bill.createdAt).toLocaleDateString();
    dailyRevenue[date] = (dailyRevenue[date] || 0) + bill.grandTotal;
  });

  const chartData = Object.entries(dailyRevenue).map(([name, revenue]) => ({ name, revenue }));

  return NextResponse.json({
    today: todayData[0] || { revenue: 0, count: 0 },
    month: monthData[0] || { revenue: 0, count: 0 },
    chartData
  });
});
