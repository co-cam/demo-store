import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder, getOrders } from '@/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    console.log('Updating order status to success for ID:', id);
    
    // why? if comment out, it will not work
    // const orders = getOrders();
    // console.log('Current orders:', orders);

    const order = getOrderById(id);
    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let data;
    try {
        data = await request.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (order.status === 'success') {
        return NextResponse.json(order);
    }

    const updated = updateOrder(id, {"status": "success"});
    if (!updated) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
    return NextResponse.json(updated);
}