import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    const where: any = { orderNumber: params.orderNumber };
    if (phone) {
      where.customerPhone = { contains: phone.trim() };
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: {
        cafe: {
          select: {
            name: true,
            slug: true,
            logo: true,
            themeColor: true,
            description: true,
          },
        },
        items: {
          include: { addons: true },
        },
        payment: true,
        invoice: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
