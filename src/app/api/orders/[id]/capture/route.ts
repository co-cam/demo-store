import { NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/db';
import { Payment_api_url, Payment_api_key } from "@/const";

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

    try {
        await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (order.status === 'success') {
        return NextResponse.json(order);
    }

    if (!order.payment_id) {
        return NextResponse.json({ error: 'Payment has not been created yet' }, { status: 400 });
    }

    const patch: Record<string, string | number> = {}

    try {
        const response = await fetch(Payment_api_url + `/${order.payment_id}`, {
            method: 'GET',
            headers: {
                'api-key': Payment_api_key,
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            // Log all headers and body for debugging
            const headersObj: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headersObj[key] = value;
            });

            const errorData = await response.json();

            console.error('API Error - Status:', response.status);
            console.error('API Error - Headers:', headersObj);
            console.error('API Error - Body:', errorData);

            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        if (data && data.payment_token) {
            patch.payment_token = data.payment_token;
            patch.payment_id = data.id;
            if (data.status === 'PAID') {
                patch.status = 'success';
            }
        }
    } catch (error) {
        console.error('Error calling API:', error);
        patch.lastest_error = error instanceof Error ? error.message : 'Unknown error';
    }

    const updated = updateOrder(id, patch);
    if (!updated) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
    return NextResponse.json(updated);
}