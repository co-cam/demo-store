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
// Can be read from environment variables or a config file
export const Payment_js_src = 'https://checkout.sandbox.whatee.store/sdk.js'; // Production: use live URL
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
> - Dynamically loads the Onecheckout SDK and renders a payment button with proper loading states
> - Handles order creation by calling the `/api/orders` endpoint and stores order/payment IDs
> - Manages payment approval by capturing payment via `/api/orders/[orderId]/capture` with payment_id
> - Includes comprehensive error handling and prevents duplicate button rendering
> - Provides smooth user experience with loading indicators and proper state management
>
> **Key variables/functions:**
> - `createOrder`: Creates an order and returns a payment token
> - `onApprove`: Captures payment and redirects to thank you page
> - `initPayment`: Loads SDK and initializes the payment button
> - `currentOrderId`/`currentPaymentId`: Store payment session data

```typescript
// src/components/PaymentButton.tsx
'use client';

import { useEffect, useState, useId } from "react";
import { Payment_js_src, Payment_merchant_id } from '../const';

interface PaymentButtonOptions {
    style?: Record<string, unknown>;
    createOrder?: (...args: unknown[]) => unknown;
    onApprove?: (...args: unknown[]) => unknown;
    onCancel?: (...args: unknown[]) => unknown;
    onError?: (...args: unknown[]) => unknown;
    gatewayId?: string;
}

declare global {
    interface Window {
        onecheckout?: {
            Buttons: (options: PaymentButtonOptions) => { render: (selector: string) => void };
        };
    }
}

let currentOrderId: string | null = null;
let currentPaymentId: string | null = null;

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

    async function createOrder() {
        if (disabled) return false;

        setIsLoading(true);
        let paymentToken: string | boolean = false;
        try {
            // Use provided orderLines or default ones
            const orderData = orderLines || [
                { quantity: 1, sku: 'premium-tshirt-black-s', default_price: 1999 },
            ];

            // Call internal Next.js API (route handler)
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
            console.log('Internal API Response:', data);
            paymentToken = data?.order?.payment_token || false;
            // Store order ID and payment ID for later use in onApprove
            currentOrderId = data?.order?.id || null;
            currentPaymentId = data?.order?.payment_id || null;
            console.log('Payment token:', paymentToken);
        } catch (error) {
            console.error('Error calling internal API:', error);
        } finally {
            setIsLoading(false);
        }
        return paymentToken;
    }

    async function onApprove() {
        console.log('Payment approved', currentOrderId);

        setIsLoading(true);
        try {
            if (!currentOrderId) {
                throw new Error('Order ID not found');
            }

            // Call internal API to capture(update) order status to success
            const response = await fetch(`/api/orders/${currentOrderId}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_id: currentPaymentId }),
            });

            if (!response.ok) {
                const errorData: any = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }

            const data: any = await response.json();
            console.log('Success API Response:', data);

            // Check if order status is success
            if (data?.status === 'success') {
                // Redirect to thank you page with order ID and payment ID
                window.location.href = `/thankyou?orderId=${currentOrderId}&payment_id=${currentPaymentId}`;
            } else {
                throw new Error('Order status is not success');
            }
        } catch (error) {
            console.error("Error on approve:", error);
            alert('Payment was successful but there was an error updating the order. Please contact support.');
        } finally {
            setIsLoading(false);
        }
    }

    function initPayment() {
        if (typeof window === "undefined") {
            console.error("Window is not defined. This component should only be used in a browser environment.");
            return;
        }

        const renderPaymentButton = () => {
            if (!window.onecheckout) {
                console.error("Onecheckout SDK not loaded");
                return;
            }

            // Check if button container exists and has content
            const buttonContainer = document.getElementById(btnId);
            if (!buttonContainer) {
                console.error("Button container not found");
                return;
            }

            // If button already rendered (container has content), don't render again
            if (buttonContainer.innerHTML.trim() !== '') {
                console.log('Payment button already rendered');
                return;
            }

            const style = {
                color: 'gold',
                height: '55px',
                layout: 'horizontal',
                size: 'medium',
                shape: 'rect',
                tagline: false,
                fundingicons: 'false'
            };

            const paymentButton = window.onecheckout.Buttons({
                style: style,
                createOrder: createOrder,
                onApprove: onApprove,
                onCancel: () => setIsLoading(false),
                onError: (err) => {
                    console.error("Payment Button error:", err);
                    setIsLoading(false);
                }
            });
            
            console.log('Payment button created', paymentButton);
            paymentButton.render(`#${btnId}`);
        };

        if (window.onecheckout) {
            console.log('Onecheckout script already loaded');
            setIsIniting(false);
            // Script already loaded, render button immediately
            renderPaymentButton();
            return;
        }

        const paymentSrc = `${Payment_js_src}?merchant_id=${Payment_merchant_id}`;
        const script = document.createElement('script');
        script.setAttribute('src', paymentSrc);
        document.head.appendChild(script);

        script.onload = () => {
            console.log('Onecheckout script loaded successfully');
            renderPaymentButton();
            setIsIniting(false);
        };

        script.onerror = () => {
            console.error('Error loading Onecheckout script');
        };
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            initPayment();
        }
    }, []);

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
                </div>
            )}
            {disabled && (
                <button
                    className="w-full bg-gray-400 text-white font-medium py-3 px-6 rounded-lg cursor-not-allowed opacity-75"
                    disabled
                >
                    Out of Stock
                </button>
            )}
            {isIniting && !disabled && (
                <button
                    className="w-full bg-yellow-500 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center cursor-not-allowed opacity-75"
                    disabled
                >
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Loading Payment...
                </button>
            )}
            {!disabled && <div id={btnId}></div>}
        </div>
    );
};

export default PaymentButton;
```
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
> - Calls the order creation API via the `/api/orders` endpoint and retrieves payment token and redirect links
> - Depending on the button type (`pay_now` or `checkout`), redirects users to the appropriate Onecheckout page
> - Shows loading state and provides proper error handling
> - Optionally accepts a `setNote` callback to return order info if no redirect link is available
>
> **Key variables/functions:**
> - `createOrder`: Creates the order and handles redirection based on returned links
> - `type`: Button type, either 'pay_now' or 'checkout'
> - `links`: Array of redirect links returned from the payment API

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
            // Use provided orderLines or default ones
            const orderData = orderLines || [
                { quantity: 1, sku: 'premium-tshirt-black-s', default_price: 1999 },
            ];

            // Call internal Next.js API (route handler)
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
            console.log('Internal API Response:', data);
            paymentToken = data?.order?.payment_token || false;
            // Store order ID for later use
            currentOrderId = data?.order?.id || null;
            console.log('Payment token:', paymentToken);

            // Check for redirect links and redirect based on button type
            const links = data?.order?.links || [];
            for (const link of links) {
                if (link.rel === 'pay' && type === 'pay_now') {
                    // Redirect to payment link if available
                    window.location.href = link.href;
                    return paymentToken;
                }
                if (link.rel === 'order' && type === 'checkout') {
                    // Redirect to order link if available
                    window.location.href = link.href;
                    return paymentToken;
                }
            }
        } catch (error) {
            console.error('Error calling internal API:', error);
        } finally {
            setIsLoading(false);
        }
        console.log('Payment token:', paymentToken);
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

> **Explanation:**
>
> This enhanced Thank You page includes:
> - Suspense boundary for loading states during server-side rendering
> - Automatic order fetching and status verification using both orderId and payment_id
> - Dynamic order details display with comprehensive error handling
> - Loading indicators and error states for better user experience

```typescript
// src/app/thankyou/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Order } from '@/types';

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className='min-h-screen flex items-center justify-center bg-gray-50'><div className='animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500'></div></div>}>
            <ThankYouContent />
        </Suspense>
    );
}

function ThankYouContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
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
                const response = await fetch(`/api/orders/${orderId}/capture?payment_id=${paymentId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch order');
                }
                const data: any = await response.json();
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Return to Store
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-green-600 mb-2">
                            Thank You for Your Purchase!
                        </h1>
                        <p className="text-gray-600">Your order has been successfully processed.</p>
                    </div>

                    {order && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Order Details</h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p><strong>Order ID:</strong> {order.id}</p>
                                    <p><strong>Status:</strong> <span className="text-green-600 font-medium">{order.status}</span></p>
                                    {order.payment_id && <p><strong>Payment ID:</strong> {order.payment_id}</p>}
                                    {order.amount && <p><strong>Total:</strong> ${(order.amount / 100).toFixed(2)}</p>}
                                </div>
                            </div>

                            {order.order_lines && order.order_lines.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">Items Ordered</h2>
                                    <div className="space-y-2">
                                        {order.order_lines.map((line, index) => (
                                            <div key={index} className="flex items-center bg-gray-50 rounded-lg p-3">
                                                {line.image_url && (
                                                    <Image
                                                        src={line.image_url}
                                                        alt={line.title}
                                                        width={60}
                                                        height={60}
                                                        className="rounded-lg mr-4"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium">{line.title}</p>
                                                    <p className="text-sm text-gray-600">Quantity: {line.quantity}</p>
                                                    <p className="text-sm text-gray-600">Price: ${((line.unit_price || 0) / 100).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 mb-4">You will receive a confirmation email shortly.</p>
                        <button 
                            onClick={() => router.push('/')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Continue Shopping
                        </button>
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
