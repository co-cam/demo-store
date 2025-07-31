import { NextResponse } from 'next/server';
import { Payment_api_url, Payment_api_key } from "@/const";
import { Order } from '@/types';


export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // PRODUCTION-required: read order from database and return it if status is success
    // PRODUCTION-required: read payment_id from existing order

    // Lấy payment_id từ query string
    const { searchParams } = new URL(request.url);
    let payment_id = searchParams.get('payment_id');

    console.log('Capturing order with ID:', id, 'and payment ID:', payment_id);

    // if read payment_id from request json body
    if (!payment_id) {
        try {
            const body = await request.json();
            if (body && typeof body.payment_id === 'string') {
                payment_id = body.payment_id;
            }
        } catch (e) {
            console.error('Error parsing request body:', e);
            // Ignore JSON parse errors, will handle missing payment_id below
        }
    }

    if (!payment_id) {
        return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const patch: Record<string, string | number> = {}

    let order: Order | null = null;

    try {
        const response = await fetch(Payment_api_url + `/${payment_id}`, {
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

            const errorData: any = await response.json();

            console.error('API Error - Status:', response.status);
            console.error('API Error - Headers:', headersObj);
            console.error('API Error - Body:', errorData);

            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
        }
        const data: any = await response.json();
        console.log('API Response:', data);
        if (data && data.payment_token) {
            patch.payment_token = data.payment_token;
            patch.payment_id = data.id;
            if (data.status === 'PAID') {
                patch.status = 'success';
            } else {
                patch.status = 'failed';
            }
        }

        // Map data to order object if needed
        order = data as Order;
        if (order && data && data.created && data.updated) {
            order.createdAt = new Date(data.created).toISOString();
            order.updatedAt = new Date(data.updated).toISOString();
        }
    } catch (error) {
        console.error('Error calling API:', error);
        patch.lastest_error = error instanceof Error ? error.message : 'Unknown error';
    }

    if (order) {
        order.lastest_error = patch.lastest_error + '';
        order.status = patch.status + '';
        order.payment_id = patch.payment_id + '';
        order.payment_token = patch.payment_token + '';
        order.id = id; // Ensure the order ID matches the requested ID
    }

    // PRODUCTION-required: update order patch in database

    return NextResponse.json(order);
}