import { NextResponse } from 'next/server';
import { updateOrder, readOrder } from '@/db2';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    const order = await readOrder(id);
    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
}

// API UpdateOrder
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await readOrder(id);
    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.payment_id) {
        return NextResponse.json({ error: 'Order cannot be updated after payment' }, { status: 400 });
    }

    let data;
    try {
        data = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (order.payment_id) {
        return NextResponse.json({ error: 'Order cannot be updated after payment' }, { status: 400 });
    }

    const updated = updateOrder(id, data);
    if (!updated) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
    return NextResponse.json(updated);
}
