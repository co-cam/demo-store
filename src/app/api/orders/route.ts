import { Order, ProductVariant } from "@/types";

import { NextResponse } from 'next/server';
import { Payment_api_url, Payment_api_key } from "@/const";

// In-memory order storage
let orders: Order[] = [];

const ProductVariant1: ProductVariant = {
    sku: "sku-001",
    default_price: 3,
    product_title: "Sample Product",
    image_url: "/sample-product.jpg",
    compared_price: 6,
    discount_value: 0,
    properties: [
        { key: "color", value: "blue" },
        { key: "size", value: "xl" }
    ]
};

const ProductVariant2: ProductVariant = {
    sku: "sku-002",
    default_price: 2,
    product_title: "Sample Product",
    image_url: "/sample-product.jpg",
    compared_price: 6,
    discount_value: 0,
    properties: [
        { key: "color", value: "blue" },
        { key: "size", value: "xl" }
    ]
};

// CreateOrder API (POST)
export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Generate a simple id (timestamp + random)
        const id = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        const order: Order = { ...data, id };
        orders.push(order);

        // Validate order.order_lines with ProductVariant1 and ProductVariant2
        const validSkus = [ProductVariant1.sku, ProductVariant2.sku];
        if (!order.order_lines || !Array.isArray(order.order_lines) || order.order_lines.length === 0) {
            return NextResponse.json({ success: false, error: 'No order lines provided' }, { status: 400 });
        }
        for (const line of order.order_lines) {
            if (!line.sku || !validSkus.includes(line.sku)) {
                return NextResponse.json({ success: false, error: `Invalid SKU: ${line.sku}` }, { status: 400 });
            }
        }

        // Overwrite order_lines with ProductVariant1 and ProductVariant2, exclude quantity
        order.order_lines = order.order_lines.map(line => {
            let variant = null;
            if (line.sku === ProductVariant1.sku) {
                variant = ProductVariant1;
            } else if (line.sku === ProductVariant2.sku) {
                variant = ProductVariant2;
            }
            if (variant) {
                // Copy all properties from variant except quantity
                const { sku, default_price, product_title, image_url, compared_price, properties, discount_value } = variant;
                return {
                    ...line, // keep quantity and discount_value from line
                    sku,
                    default_price,
                    title: product_title,
                    image_url,
                    compared_price,
                    properties,
                    discount_value: discount_value ?? 0 // ensure number, not undefined
                };
            }
            // If not found, return line as is
            return line;
        });


        // Calculate subtotal
        order.subtotal = (order.order_lines ?? []).reduce((sum, line) => {
            // Use default_price from the product variant
            let price = 0;
            if (line.sku === ProductVariant1.sku) {
                price = ProductVariant1.default_price;
            } else if (line.sku === ProductVariant2.sku) {
                price = ProductVariant2.default_price;
            } else {
                price = line.default_price || 0;
            }
            // Apply discount if present
            const discount = line.discount_value || 0;
            return sum + (price - discount) * (line.quantity || 1);
        }, 0);

        order.amount = order.subtotal + (order.shipping_fee || 0) + (order.tax_price || 0) + (order.tip_price || 0);

        const requestBody = {
            amount: order.amount,
            subtotal: order.subtotal,
            shipping_name: "Free",
            shipping_fee: order.shipping_fee || 0,
            order_lines: order.order_lines?.map(line => ({
                quantity: line.quantity,
                sku: line.sku,
                default_price: line.default_price,
                product_title: line.title,
                image_url: line.image_url,
                compared_price: line.compared_price,
                discount_value: line.discount_value,
                properties: line.properties || []
            }))
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

                const errorData = await response.json();

                console.error('API Error - Status:', response.status);
                console.error('API Error - Headers:', headersObj);
                console.error('API Error - Body:', errorData);

                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }
            const data = await response.json();
            console.log('API Response:', data);
            if (data && data.payment_token) {
                order.payment_token = data.payment_token;
                order.payment_id = data.id;
            }
        } catch (error) {
            console.error('Error calling API:', error);
            order.lastest_error = error instanceof Error ? error.message : 'Unknown error';
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
}

// ListOrders API (GET)
export async function GET() {
    return NextResponse.json({ success: true, orders });
}
