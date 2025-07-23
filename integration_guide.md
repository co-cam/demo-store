# Onecheckout Integration Guide for Next.js Demo Store

A comprehensive guide for integrating Onecheckout payment processing into your Next.js e-commerce application.

## Overview

This guide demonstrates how to integrate Onecheckout's payment system with a Next.js demo store, covering both client-side checkout components and server-side API routes for order management.

## Prerequisites

- Next.js 13+ application
- TypeScript support
- Onecheckout merchant account with API credentials

## Configuration

### 1. Environment Setup

Create or update your `src/const.ts` file with your Onecheckout credentials:

```typescript
// src/const.ts
export const Payment_js_src = 'https://checkout.sandbox.whatee.store/sdk.js'; // Production: use live URL
export const Payment_merchant_id = 'your-merchant-id';
export const Payment_api_url = 'https://onecheckout.sandbox.whatee.io/api/v1.0/orders'; // Production: use live URL
export const Payment_api_key = 'your-api-key';
```

## Server-Side API Routes

### 1. Create Order API

Create the order creation endpoint at `src/app/api/orders/route.ts`:

> **Explanation:**
>
> This code defines a API route (`POST /api/orders`) for creating a new order and initializing a payment with the Onecheckout API. It:
> - Receives order data from the client, validates the order lines, and calculates the subtotal and total amount.
> - Generates a unique order ID and prepares a request to the Onecheckout payment API, including order details and line items.
> - Handles the response from the payment API, saving the payment token and ID to the order if successful, or logging errors if not.
> - Returns the order (with payment info if available) as a JSON response.
>
> **Key variables/functions:**
> - `order`: The order object being processed.
> - `requestBody`: The payload sent to the Onecheckout API.
```typescript
// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { Payment_api_url, Payment_api_key } from "@/const";
import { Order } from "@/types";

export async function POST(request: Request) {
    try {
        const data: any = await request.json();
        const order: Order = { ...data };

        // Validate order lines
        if (!order.order_lines || !Array.isArray(order.order_lines) || order.order_lines.length === 0) {
            return NextResponse.json({ success: false, error: 'No order lines provided' }, { status: 400 });
        }

        // Calculate totals
        order.subtotal = order.order_lines.reduce((sum, line) => 
            sum + (line.default_price * line.quantity), 0
        );
        order.amount = order.subtotal + (order.shipping_fee || 0) + (order.tax_price || 0);

        // Generate order ID
        const id = `ord-${Date.now()}`;
        order.id = id;

        // Create payment with Onecheckout API
        const requestBody = {
            amount: order.amount,
            subtotal: order.subtotal,
            shipping_name: "Free",
            shipping_fee: order.shipping_fee || 0,
            order_lines: order.order_lines.map(line => ({
                quantity: line.quantity,
                sku: line.sku,
                default_price: line.default_price,
                product_title: line.title,
                image_url: line.image_url,
                compared_price: line.compared_price,
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
                const errorData: any = await response.json();
                throw new Error(`Payment API error: ${response.status} - ${errorData.message}`);
            }

            const paymentData = await response.json();
            
            if (paymentData && paymentData.payment_token) {
                order.payment_token = paymentData.payment_token;
                order.payment_id = paymentData.id;
            }
        } catch (error) {
            console.error('Error calling Onecheckout API:', error);
            order.lastest_error = error instanceof Error ? error.message : 'Unknown error';
        }

        // Save order to your database here
        // saveOrder(order);

        return NextResponse.json({ success: true, order });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
}
```

### 2. Capture Payment API


Create the payment capture endpoint at `src/app/api/orders/[id]/capture/route.ts`:

> **Explanation:**
>
> This code defines a API route (`POST /api/orders/[id]/capture`) for capturing a payment after an order has been created. It:
> - Receives the order ID from the URL parameters and validates it.
> - Retrieves the order from your database (requires implementing `getOrderById`).
> - Calls the Onecheckout API to check the payment status for the order's payment ID.
> - If the payment is marked as 'PAID', updates the order status to 'success' (requires implementing `updateOrder`).
> - Returns the updated order as a JSON response, or handles errors appropriately.
>
> **Key variables/functions:**
> - `order`: The order object fetched from your database.
> - `getOrderById`: Function to retrieve the order (to be implemented).
> - `updateOrder`: Function to update the order (to be implemented).

```typescript
// src/app/api/orders/[id]/capture/route.ts
import { NextResponse } from 'next/server';
import { Payment_api_url, Payment_api_key } from "@/const";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    if (!id) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get order from your database
    const order = getOrderById(id); // Implement this function
    
    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'success') {
        return NextResponse.json(order);
    }

    if (!order.payment_id) {
        return NextResponse.json({ error: 'Payment not initialized' }, { status: 400 });
    }

    try {
        // Check payment status with Onecheckout API
        const response = await fetch(`${Payment_api_url}/${order.payment_id}`, {
            method: 'GET',
            headers: {
                'api-key': Payment_api_key,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const errorData: any = await response.json();
            throw new Error(`Payment API error: ${response.status} - ${errorData.message}`);
        }

        const paymentData = await response.json();
        const updates: any = {};

        if (paymentData && paymentData.status === 'PAID') {
            updates.status = 'success';
            updates.payment_token = paymentData.payment_token;
        }

        // Update order in your database
        const updatedOrder = updateOrder(id, updates); // Implement this function
        
        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error capturing payment:', error);
        return NextResponse.json({ 
            error: 'Payment capture failed' 
        }, { status: 500 });
    }
}
```

## Client-Side Implementation

### 1a. Payment Button Component

Create a reusable payment button component that handles the Onecheckout SDK:

> **Explanation:**
>
> This code defines a reusable React component (`PaymentButton`) for integrating the Onecheckout payment SDK in a Next.js app. It:
> - Dynamically loads the Onecheckout SDK and renders a payment button.
> - Handles order creation by calling the `/api/orders` endpoint and retrieves a payment token.
> - Manages payment approval by capturing the payment via `/api/orders/[orderId]/capture` and redirects to a thank you page on success.
> - Shows loading states and disables the button when needed.
>
> **Key variables/functions:**
> - `createOrder`: Creates an order and returns a payment token.
> - `onApprove`: Captures payment and handles post-payment actions.
> - `initPayment`: Loads the SDK and initializes the payment button.
> - `btnId`: Unique ID for the payment button container.
>
> Error handling and UI feedback are included for a smooth user experience.
```typescript
// src/components/PaymentButton.tsx
'use client';

import { useEffect, useState, useId } from "react";
import { Payment_js_src, Payment_merchant_id } from '../const';

interface OrderLineInput {
    sku: string;
    quantity: number;
    default_price: number;
}

const PaymentButton = ({
    orderLines,
    disabled = false
}: {
    orderLines?: OrderLineInput[];
    disabled?: boolean;
}) => {
    const btnId = useId();
    const [isIniting, setIsIniting] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    let currentOrderId: string | null = null;

    // Create order and get payment token
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

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: any = await response.json();
            currentOrderId = data?.order?.id || null;
            return data?.order?.payment_token || false;
        } catch (error) {
            console.error('Error creating order:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    // Handle successful payment
    async function onApprove() {
        if (!currentOrderId) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`/api/orders/${currentOrderId}/capture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: any = await response.json();
            
            if (data?.status === 'success') {
                window.location.href = `/thankyou?orderId=${currentOrderId}`;
            }
        } catch (error) {
            console.error("Payment capture error:", error);
            alert('Payment was successful but there was an error. Please contact support.');
        } finally {
            setIsLoading(false);
        }
    }

    // Initialize Onecheckout SDK
    function initPayment() {
        if (typeof window === "undefined" || window.onecheckout) {
            setIsIniting(false);
            return;
        }

        const script = document.createElement('script');
        script.src = `${Payment_js_src}?merchant_id=${Payment_merchant_id}`;
        
        script.onload = () => {
            if (window.onecheckout) {
                const paymentButton = window.onecheckout.Buttons({
                    style: {
                        color: 'gold',
                        height: '55px',
                        layout: 'horizontal',
                        size: 'medium',
                        shape: 'rect',
                    },
                    createOrder,
                    onApprove,
                    onCancel: () => setIsLoading(false),
                    onError: (err) => {
                        console.error("Payment error:", err);
                        setIsLoading(false);
                    }
                });
                
                paymentButton.render(`#${btnId}`);
            }
            setIsIniting(false);
        };

        document.head.appendChild(script);
    }

    useEffect(() => {
        initPayment();
    }, []);

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
                </div>
            )}
            
            {disabled ? (
                <button className="w-full bg-gray-400 text-white font-medium py-3 px-6 rounded-lg cursor-not-allowed">
                    Out of Stock
                </button>
            ) : isIniting ? (
                <button className="w-full bg-yellow-500 text-white font-medium py-3 px-6 rounded-lg cursor-not-allowed">
                    Loading Payment...
                </button>
            ) : (
                <div id={btnId}></div>
            )}
        </div>
    );
};

export default PaymentButton;
```

### 1b. Checkout Button Component


Create a reusable checkout button component (`CheckoutButton`) that handles order creation logic and redirects users to the payment or order page:

> **Explanation:**
>
> The React component `CheckoutButton` integrates the Onecheckout payment flow into your Next.js app. It:
> - Calls the order creation API via the `/api/orders` endpoint and retrieves the payment token and payment/order links.
> - Depending on the button type (`pay_now` or `checkout`), redirects users to the Onecheckout payment or order page.
> - Shows loading state and disables the button when needed.
> - Optionally accepts a `setNote` callback to return order info if no redirect link is available.
>
> **Key variables/functions:**
> - `createOrder`: Creates the order and handles redirection.
> - `type`: Button type, either 'pay_now' or 'checkout'.
>
> Includes error handling and UI feedback for a smooth user experience.

```typescript
// src/components/CheckoutButton.tsx
'use client';

import { useState } from "react";

let currentOrderId: string | null = null;

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
        let paymentToken: string | boolean = false;
        try {
            const orderData = orderLines || [
                { quantity: 1, sku: 'premium-tshirt-black-s', default_price: 1999 },
            ];

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_lines: orderData,
                }),
            });
            if (!response.ok) {
                const errorData: any = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }
            const data: any = await response.json();
            paymentToken = data?.order?.payment_token || false;
            currentOrderId = data?.order?.id || null;

            const links = data?.order?.links || [];
            for (const link of links) {
                if (link.rel === 'pay' && type === 'pay_now') {
                    window.location.href = link.href;
                    return paymentToken;
                }
                if (link.rel === 'order' && type === 'checkout') {
                    window.location.href = link.href;
                    return paymentToken;
                }
            }
        } catch (error) {
            console.error('Error calling internal API:', error);
        } finally {
            setIsLoading(false);
        }
        setNote?.(`Order created with ID: ${currentOrderId}, no redirect link available`);
        return paymentToken;
    }

    return (
        <button
            onClick={createOrder}
            disabled={isLoading || disabled}
            className={`w-full h-full px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isLoading || disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
            <PaymentButton orderLines={orderLines} />
            {/* or */}
            <CheckoutButton orderLines={orderLines} type="pay_now" />
            {/* or */}
            <CheckoutButton orderLines={orderLines} type="checkout" />
        </div>
    );
}
```

### 3. Thank You Page

Create a thank you page at `src/app/thankyou/page.tsx`:

```typescript
// src/app/thankyou/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function ThankYouPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-green-600 mb-4">
                Thank You for Your Purchase!
            </h1>
            {orderId && (
                <p className="text-lg mb-4">
                    Your order ID is: <strong>{orderId}</strong>
                </p>
            )}
            <p>You will receive a confirmation email shortly.</p>
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
