# Onecheckout Integration Guide for Next.js Demo Store

A comprehensive guide for integrating Onecheckout payment processing into your Next.js e-commerce application.

## Overview

This section provides a technical overview for developers on how the Onecheckout integration works in the Next.js demo store.

Main flow (summary):
    1. The client sends a request to create an order to the internal endpoint POST `/api/orders` (with `order_lines`).
    2. The server (file `src/app/api/orders/route.ts`) validates SKUs against the product database (`src/db.ts`), overwrites line info with variant data, calculates `subtotal`/`amount`, and generates `order.id`.
    3. The server calls the Onecheckout API (URL and api-key from `src/const.ts`) to initialize payment, receives `payment_token`, `payment_id`, and `links` (redirect/pay links).
    4. The client uses the `payment_token` (SDK) or redirects to `links` for the customer to complete payment on Onecheckout.
    5. After payment, Onecheckout can redirect the client to `success_url` (e.g. `/thankyou?orderId=...&payment_id=...`) or send a webhook; the server will check status via the internal endpoint POST `/api/orders/[id]/capture` (or call Onecheckout GET /{payment_id}) to confirm and update order status.

Key endpoints & files:
    - `POST /api/orders` — `src/app/api/orders/route.ts` (create order, call Onecheckout)
    - `POST /api/orders/[id]/capture` — `src/app/api/orders/[id]/capture/route.ts` (check/capture payment)
    - `src/const.ts` — configures `Payment_api_url`, `Payment_api_key`, `Payment_js_src`, `Payment_merchant_id`
    - Client components: `src/components/PaymentButton.tsx`, `src/components/CheckoutButton.tsx`
    - UX: `src/app/thankyou/page.tsx` (displays order status after redirect)

The detailed guide below describes each endpoint, component, and example payload.

## Prerequisites

- Next.js 13+ application
- TypeScript support
- Onecheckout merchant account with API credentials

## Configuration

### 1. Environment Setup

Create or update your `src/const.ts` file with your Onecheckout credentials:

```typescript
// src/const.ts
// Can be read from environment variables or a config file
export const Payment_js_src = 'https://demo-store.sandbox.whatee.io/sdk.js'; // Production: use live URL
export const Payment_merchant_id = 'your-merchant-id'; // Replace with actual merchant ID
export const Payment_api_url = 'https://onecheckout.sandbox.whatee.io/api/v1.0/orders'; // Production: use live URL
export const Payment_api_key = 'your-api-key'; // Replace with actual API key

// Example local development configuration:
// export const Payment_js_src = 'http://localhost:3000/sdk.js'
// export const Payment_merchant_id = 'your-local-merchant-id';
// export const Payment_api_url = 'http://localhost:9000/api/v1.0/orders';
// export const Payment_api_key = 'your-local-api-key';
```

## Server-Side API Routes

### 1. Create Order API

Create the order creation endpoint at `src/app/api/orders/route.ts`:

> **Explanation:**
>
> This code defines an API route (`POST /api/orders`) for creating a new order and initializing a payment with the Onecheckout API. It:
> - Receives order data from the client and validates order lines against the product database
> - Overwrites order line data with product variant information from the database
> - Calculates subtotal, amount, and includes shipping fees
> - Generates success and cancel URLs based on the request origin
> - Makes a request to the Onecheckout payment API with order details
> - Returns the order with payment information if successful
>
> **Key variables/functions:**
> - `order`: The order object being processed
> - `productVariants`: Product data fetched from the database
> - `requestBody`: The payload sent to the Onecheckout API

```typescript
// src/app/api/orders/route.ts
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

        order.amount = order.subtotal + (order.shipping_fee || 0) + (order.tax_price || 0) + (order.tip_price || 0);
        order.shipping_fee = 1.99; // sample shipping fee

        // PRODUCTION-required: insert order into database and return id if you need manage orders in database
        order.id = "order_id";

        // Get origin from headers for redirect URLs
        const origin = request.headers.get("origin") || `https://${request.headers.get("host")}`;
        const requestBody = {
            amount: order.amount,
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
            cancel_url: origin + "/thankyou?orderId=" + order.id,
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
```

### 2. Capture Payment API

Create the payment capture endpoint at `src/app/api/orders/[id]/capture/route.ts`:

> **Explanation:**
>
> This code defines an API route (`POST /api/orders/[id]/capture`) for capturing a payment after an order has been created. It:
> - Receives the order ID from URL parameters and payment ID from query string or request body
> - Makes a GET request to the Onecheckout API to check payment status
> - Maps the payment data to an order object and updates status if payment is PAID
> - Handles comprehensive error logging for debugging
> - Returns the order object with updated payment information
>
> **Key variables/functions:**
> - `order`: The order object mapped from payment data
> - `patch`: Object containing updates to be applied to the order
> - `payment_id`: Payment ID extracted from query string or request body

```typescript
// src/app/api/orders/[id]/capture/route.ts
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

    // Get payment_id from query string
    const { searchParams } = new URL(request.url);
    let payment_id = searchParams.get('payment_id');

    console.log('Capturing order with ID:', id, 'and payment ID:', payment_id);

    // If payment_id not in query string, try to get it from request body
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
```

## Client-Side Implementation

### 1a. Payment Button Component

Create a reusable payment button component that handles the Onecheckout SDK. Detailed setup information is available in the source code.

### 1b. Checkout Button Component (Recommended)

Create a checkout button component that redirects to external payment pages:

> **Explanation:**
>
> This component creates orders and redirects users to external Onecheckout pages. It:
> - Creates orders via `/api/orders` endpoint and retrieves redirect links
> - Supports two button types: `pay_now` (direct payment) and `checkout` (order page)
> - Redirects users to appropriate external pages based on returned links
> - Provides feedback via optional `setNote` callback when no redirect is available
>
> **Key functions:**
> - `createOrder`: Creates order and handles redirection
> - `type`: Button behavior - 'pay_now' or 'checkout'

```typescript
// src/components/CheckoutButton.tsx
'use client';

import { useState } from "react";

interface OrderLineInput {
    sku: string;
    quantity: number;
    default_price: number;
}

const CheckoutButton = ({
    orderLines,
    disabled = false,
    type = 'pay_now',
    setNote,
}: {
    orderLines?: OrderLineInput[];
    disabled?: boolean;
    type?: 'pay_now' | 'checkout';
    setNote?: (note: string) => void;
}) => {
    const [isLoading, setIsLoading] = useState(false);

    async function createOrder() {
        if (disabled) return false;
        setIsLoading(true);
        
        try {
            const orderData = orderLines || [
                { quantity: 1, sku: 'premium-tshirt-black-s', default_price: 1999 },
            ];

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_lines: orderData }),
            });
            
            if (!response.ok) throw new Error('Order creation failed');
            
            const data = await response.json();
            const links = data?.order?.links || [];
            
            // Redirect based on button type
            for (const link of links) {
                if (link.rel === 'pay' && type === 'pay_now') {
                    window.location.href = link.href;
                    return;
                }
                if (link.rel === 'order' && type === 'checkout') {
                    window.location.href = link.href;
                    return;
                }
            }
            
            setNote?.(`Order created, no redirect link available`);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={createOrder}
            disabled={isLoading || disabled}
            className={`w-full px-6 py-2 rounded-lg font-semibold transition-colors
                ${isLoading || disabled 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
            {isLoading ? 'Processing...' : (type === 'pay_now' ? 'Pay now' : 'Proceed to Checkout')}
        </button>
    );
}

export default CheckoutButton;
```

### 2. Product Page

```typescript
// In your product page or cart
import PaymentButton from '@/components/PaymentButton';
import CheckoutButton from '@/components/CheckoutButton';

const orderLines = [
    {
        sku: 'premium-tshirt-black-s',
        quantity: 1,
        default_price: 1999 // Price in cents
    }
];

export default function ProductPage() {
    return (
        <div>
            <h1>Premium T-Shirt</h1>
            <p>$19.99</p>
            
            {/* SDK Payment Button (pop-up/iframe) */}
            <PaymentButton orderLines={orderLines} />
            
            {/* External Redirect Buttons */}
            <CheckoutButton orderLines={orderLines} type="pay_now" />
            <CheckoutButton orderLines={orderLines} type="checkout" />
        </div>
    );
}
```

### 3. Thank You Page

Create a thank you page at `src/app/thankyou/page.tsx`:

> **Explanation:**
>
> This page handles order confirmation after payment completion. It:
> - Uses Suspense for loading states during server-side rendering
> - Fetches order details using orderId and payment_id from URL parameters
> - Displays comprehensive order information with error handling
> - Provides user-friendly loading and error states

```typescript
// src/app/thankyou/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order } from '@/types';

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>}>
            <ThankYouContent />
        </Suspense>
    );
}

function ThankYouContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('payment_id');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setError('Order ID not found');
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}?payment_id=${paymentId}`);
                if (!response.ok) throw new Error('Failed to fetch order');
                
                const data = await response.json();
                setOrder(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, paymentId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>;
    }

    if (error || !order) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="text-red-500 text-xl mb-4">❌ Error</div>
                <p>{error || 'Order not found'}</p>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
                    <p className="text-lg text-gray-600">Your order has been successfully processed</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-medium">{order.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-medium">{order.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-medium">${(order.amount / 100).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

## Key Features

- **Secure Payment Processing**: All payments are handled through Onecheckout's secure API
- **Order Management**: Complete order lifecycle from creation to completion
- **Error Handling**: Comprehensive error handling for both client and server operations
- **Loading States**: User-friendly loading indicators during payment processing
- **TypeScript Support**: Full type safety throughout the integration

## Security Notes

- Never expose your API key in client-side code
- Always validate order data on the server side
- Implement proper error handling and logging
- Use HTTPS in production environments

## Additional Resources

For complete API documentation and advanced features, visit the [Onecheckout Documentation](/docs).

## Troubleshooting

1. **Payment button not loading**: Check that your merchant ID and SDK URL are correct
2. **Order creation fails**: Verify your API key and endpoint URL
3. **Payment capture issues**: Ensure proper order ID handling and API responses

This integration provides a robust foundation for e-commerce payments while maintaining security and user experience best practices.
