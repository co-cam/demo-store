import { Order } from "@/types";

import { NextResponse } from 'next/server';
import { Payment_api_url, Payment_api_key } from "@/const";
import { getProductVariants } from "@/db";

// CreateOrder API (POST)
export async function POST(request: Request) {
    try {
        const data: any = await request.json();
        const order: Order = { ...data };

        // Get product variants from database
        const productVariants = getProductVariants();

        // Validate order.order_lines with product variants
        const validSkus = productVariants.map(variant => variant.sku);
        if (!order.order_lines || !Array.isArray(order.order_lines) || order.order_lines.length === 0) {
            return NextResponse.json({ success: false, error: 'No order lines provided' }, { status: 400 });
        }
        for (const line of order.order_lines) {
            if (!line.sku || !validSkus.includes(line.sku)) {
                return NextResponse.json({ success: false, error: `Invalid SKU: ${line.sku}` }, { status: 400 });
            }
        }

        // Overwrite order_lines with product variants data, exclude quantity
        order.order_lines = order.order_lines.map(line => {
            const variant = productVariants.find(v => v.sku === line.sku);
            if (variant) {
                // Copy all properties from variant except quantity
                const { sku, default_price, product_title, image_url, compared_price, properties } = variant;
                return {
                    ...line, // keep quantity from line
                    sku: sku,
                    unit_price: default_price,
                    title: product_title,
                    image_url,
                    compared_price,
                    properties
                };
            }
            // If not found, return line as is
            return line;
        });

        // Calculate subtotal
        order.subtotal = (order.order_lines ?? []).reduce((sum, line) => {
            // Find the variant for this line
            const variant = productVariants.find(v => v.sku === line.sku);
            const price = variant ? variant.default_price : (line.unit_price || 0);

            return sum + price * (line.quantity || 1);
        }, 0);

        order.shipping_fee = 1.2; // sample shipping fee
        order.tax_amount = 0.6; // sample tax price
        order.discount_amount = 0.2; // sample discount amount

        order.amount = order.subtotal + (order.shipping_fee || 0) + (order.tax_amount || 0) + (order.tip_price || 0) - (order.discount_amount || 0);

        // PRODUCTION-required: insert order into database and return id if you need manage orders in database
        order.id = "order_id";

        // Lấy origin từ headers
        const origin = request.headers.get("origin") || `https://${request.headers.get("host")}`;
        const requestBody = {
            paypal_manual_capture: false, // true for test
            amount: order.amount,
            tax_amount: order.tax_amount || 0,
            // discount_amount: order.discount_amount || 0,
            currency: order.currency || 'USD',
            subtotal: order.subtotal,
            shipping_name: "Free",
            shipping_fee: order.shipping_fee || 0,
            order_lines: order.order_lines?.map(line => ({
                quantity: line.quantity,
                key: line.sku,
                unit_price: line.unit_price,
                title: line.title,
                image_url: line.image_url,
                compared_price: line.compared_price,
                properties: line.properties || []
            })),
            success_url: origin + "/thankyou?orderId=" + order.id,
            cancel_url: origin + "/cancel?orderId=" + order.id, // TODO cancel page
        };

        try {
            const response = await fetch(Payment_api_url, {
                method: 'POST',
                headers: {
                    'api-key': Payment_api_key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
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
                order.payment_token = data.payment_token;
                order.payment_id = data.id;
                order.links = data.links || [];
            }
        } catch (error) {
            console.error('Error calling API:', error);
            order.lastest_error = error instanceof Error ? error.message : 'Unknown error';
        }

        // PRODUCTION-required: save order to database if you need manage orders in database

        return NextResponse.json({ success: true, order });
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
}
