import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Onecheckout Integration Guide - Demo Store',
  description: 'A comprehensive guide for integrating Onecheckout payment processing into your Next.js e-commerce application.',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 docs-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Onecheckout Integration Guide
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                A comprehensive guide for integrating Onecheckout payment processing into your Next.js e-commerce application.
              </p>
            </div>
            <Link 
              href="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
              <nav className="space-y-2">
                <a href="#overview" className="block text-sm text-blue-600 hover:text-blue-800">Overview</a>
                <a href="#prerequisites" className="block text-sm text-blue-600 hover:text-blue-800">Prerequisites</a>
                <a href="#configuration" className="block text-sm text-blue-600 hover:text-blue-800">Configuration</a>
                <a href="#server-side" className="block text-sm text-blue-600 hover:text-blue-800">Server-Side API Routes</a>
                <a href="#client-side" className="block text-sm text-blue-600 hover:text-blue-800">Client-Side Implementation</a>
                <a href="#features" className="block text-sm text-blue-600 hover:text-blue-800">Key Features</a>
                <a href="#security" className="block text-sm text-blue-600 hover:text-blue-800">Security Notes</a>
                <a href="#troubleshooting" className="block text-sm text-blue-600 hover:text-blue-800">Troubleshooting</a>
              </nav>
            </div>
          </aside>

          {/* Documentation Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-8 space-y-12">
              
              {/* Overview Section */}
              <section id="overview">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This section provides a technical overview for developers on how the Onecheckout integration works in the Next.js demo store.
                </p>
                <div className="space-y-4 text-gray-700">
                  <p className="font-semibold">Main flow (summary):</p>
                  <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>The client sends a request to create an order to the internal endpoint <code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/orders</code> (with <code className="bg-gray-100 px-1 py-0.5 rounded">order_lines</code>).</li>
                    <li>The server (file <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/api/orders/route.ts</code>) validates SKUs against the product database (<code className="bg-gray-100 px-1 py-0.5 rounded">src/db.ts</code>), overwrites line info with variant data, calculates <code className="bg-gray-100 px-1 py-0.5 rounded">subtotal</code>/<code className="bg-gray-100 px-1 py-0.5 rounded">amount</code>, and generates <code className="bg-gray-100 px-1 py-0.5 rounded">order.id</code>.</li>
                    <li>The server calls the Onecheckout API (URL and api-key from <code className="bg-gray-100 px-1 py-0.5 rounded">src/const.ts</code>) to initialize payment, receives <code className="bg-gray-100 px-1 py-0.5 rounded">payment_token</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">payment_id</code>, and <code className="bg-gray-100 px-1 py-0.5 rounded">links</code> (redirect/pay links).</li>
                    <li>The client uses the <code className="bg-gray-100 px-1 py-0.5 rounded">payment_token</code> (SDK) or redirects to <code className="bg-gray-100 px-1 py-0.5 rounded">links</code> for the customer to complete payment on Onecheckout.</li>
                    <li>After payment, Onecheckout can redirect the client to <code className="bg-gray-100 px-1 py-0.5 rounded">success_url</code> (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded">/thankyou?orderId=...&payment_id=...</code>) or send a webhook; the server will check status via the internal endpoint <code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/orders/[id]/capture</code> (or call Onecheckout <code className="bg-gray-100 px-1 py-0.5 rounded">GET /{'{payment_id}'}</code>) to confirm and update order status.</li>
                  </ol>
                  <p className="font-semibold mt-4">Key endpoints & files:</p>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/orders</code> — <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/api/orders/route.ts</code> (create order, call Onecheckout)</li>
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/orders/[id]/capture</code> — <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/api/orders/[id]/capture/route.ts</code> (check/capture payment)</li>
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">src/const.ts</code> — configures <code className="bg-gray-100 px-1 py-0.5 rounded">Payment_api_url</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">Payment_api_key</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">Payment_js_src</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">Payment_merchant_id</code></li>
                    <li>Client components: <code className="bg-gray-100 px-1 py-0.5 rounded">src/components/PaymentButton.tsx</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">src/components/CheckoutButton.tsx</code></li>
                    <li>UX: <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/thankyou/page.tsx</code> (displays order status after redirect)</li>
                  </ul>
                  <p className="mt-4">
                    The detailed guide below describes each endpoint, component, and example payload.
                  </p>
                </div>
              </section>

              {/* Prerequisites Section */}
              <section id="prerequisites">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Prerequisites</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Next.js 13+ application</li>
                  <li>TypeScript support</li>
                  <li>Onecheckout merchant account with API credentials</li>
                </ul>
              </section>

              {/* Configuration Section */}
              <section id="configuration">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuration</h2>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Environment Setup</h3>
                  <p className="text-gray-700 mb-4">
                    Create or update your <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/const.ts</code> file with your Onecheckout credentials:
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100">
                      <code>{`// src/const.ts
// Can be read from environment variables or a config file
export const Payment_js_src = 'https://demo-store.sandbox.whatee.io/sdk.js'; // Production: use live URL
export const Payment_merchant_id = 'your-merchant-id'; // Replace with actual merchant ID
export const Payment_api_url = 'https://onecheckout.sandbox.whatee.io/api/v1.0/orders'; // Production: use live URL
export const Payment_api_key = 'your-api-key'; // Replace with actual API key`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              {/* Server-Side API Routes */}
              <section id="server-side">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Server-Side API Routes</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Create Order API</h3>
                    <p className="text-gray-700 mb-4">
                      Create the order creation endpoint at <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/app/api/orders/route.ts</code>:
                    </p>
                    <blockquote className="bg-gray-100 border-l-4 border-blue-500 text-blue-700 p-4">
                      <p><strong>Explanation:</strong></p>
                      <p>This code defines an API route (<code>POST /api/orders</code>) for creating a new order and initializing a payment with the Onecheckout API. It:</p>
                      <ul className="list-disc pl-6">
                        <li>Receives order data from the client and validates order lines against the product database</li>
                        <li>Overwrites order line data with product variant information from the database</li>
                        <li>Calculates subtotal, amount, and includes shipping fees</li>
                        <li>Generates success and cancel URLs based on the request origin</li>
                        <li>Makes a request to the Onecheckout payment API with order details</li>
                        <li>Returns the order with payment information if successful</li>
                      </ul>
                      <p><strong>Key variables/functions:</strong></p>
                      <ul className="list-disc pl-6">
                        <li><code>order</code>: The order object being processed</li>
                        <li><code>productVariants</code>: Product data fetched from the database</li>
                        <li><code>requestBody</code>: The payload sent to the Onecheckout API</li>
                      </ul>
                    </blockquote>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                      <pre className="text-sm text-gray-100">
                        <code>{`// src/app/api/orders/route.ts
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
                return NextResponse.json({ success: false, error: \`Invalid SKU: \${line.sku}\` }, { status: 400 });
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
        const origin = request.headers.get("origin") || \`https://\${request.headers.get("host")}\`;
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

                throw new Error(\`HTTP error! Status: \${response.status}, Message: \${errorData.message || 'Unknown error'}\`);
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
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Capture Payment API</h3>
                    <p className="text-gray-700 mb-4">
                      Create the payment capture endpoint at <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/app/api/orders/[id]/capture/route.ts</code>:
                    </p>
                    <blockquote className="bg-gray-100 border-l-4 border-blue-500 text-blue-700 p-4">
                      <p><strong>Explanation:</strong></p>
                      <p>This code defines an API route (<code>POST /api/orders/[id]/capture</code>) for capturing a payment after an order has been created. It:</p>
                      <ul className="list-disc pl-6">
                        <li>Receives the order ID from URL parameters and payment ID from query string or request body</li>
                        <li>Makes a GET request to the Onecheckout API to check payment status</li>
                        <li>Maps the payment data to an order object and updates status if payment is PAID</li>
                        <li>Handles comprehensive error logging for debugging</li>
                        <li>Returns the order object with updated payment information</li>
                      </ul>
                      <p><strong>Key variables/functions:</strong></p>
                      <ul className="list-disc pl-6">
                        <li><code>order</code>: The order object mapped from payment data</li>
                        <li><code>patch</code>: Object containing updates to be applied to the order</li>
                        <li><code>payment_id</code>: Payment ID extracted from query string or request body</li>
                      </ul>
                    </blockquote>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                      <pre className="text-sm text-gray-100">
                        <code>{`// src/app/api/orders/[id]/capture/route.ts
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
        const response = await fetch(Payment_api_url + \`/\${payment_id}\`, {
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

            throw new Error(\`HTTP error! Status: \${response.status}, Message: \${errorData.message || 'Unknown error'}\`);
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
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* Client-Side Implementation */}
              <section id="client-side">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Client-Side Implementation</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">1a. Payment Button Component</h3>
                    <p className="text-gray-700 mb-4">
                      Create a reusable payment button component that handles the Onecheckout SDK. Detailed setup information is available in the source code.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">1b. Checkout Button Component (Recommended)</h3>
                    <p className="text-gray-700 mb-4">
                      Create a reusable checkout button component (<code className="bg-gray-100 px-2 py-1 rounded text-sm">CheckoutButton</code>) that handles order creation logic and redirects users to the payment or order page:
                    </p>
                    <blockquote className="bg-gray-100 border-l-4 border-blue-500 text-blue-700 p-4">
                      <p><strong>Explanation:</strong></p>
                      <p>This component creates orders and redirects users to external Onecheckout pages. It:</p>
                      <ul className="list-disc pl-6">
                        <li>Creates orders via <code>/api/orders</code> endpoint and retrieves redirect links</li>
                        <li>Supports two button types: <code>pay_now</code> (direct payment) and <code>checkout</code> (order page)</li>
                        <li>Redirects users to appropriate external pages based on returned links</li>
                        <li>Provides feedback via optional <code>setNote</code> callback when no redirect is available</li>
                      </ul>
                      <p><strong>Key functions:</strong></p>
                      <ul className="list-disc pl-6">
                        <li><code>createOrder</code>: Creates order and handles redirection</li>
                        <li><code>type</code>: Button behavior - 'pay_now' or 'checkout'</li>
                      </ul>
                    </blockquote>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                      <pre className="text-sm text-gray-100">
                        <code>{`// src/components/CheckoutButton.tsx
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
                throw new Error(\`HTTP error! Status: \${response.status}, Message: \${errorData.message || 'Unknown error'}\`);
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
        setNote?.(\`Order created with ID: \${currentOrderId}, no redirect link available\`);
        return paymentToken;
    }

    return (
        <button
            onClick={createOrder}
            disabled={isLoading || disabled}
            className={\`w-full h-full px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                \${isLoading || disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}\`}
        >
            {isLoading ? 'Processing...' : (type === 'pay_now' ? 'Pay now' : 'Proceed to Checkout')}
        </button>
    );
}

export default CheckoutButton;`}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Product Page Implementation</h3>
                    <p className="text-gray-700 mb-4">
                      Use the payment button component in your product page or cart:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{`// In your product page or cart
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
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Thank You Page</h3>
                    <p className="text-gray-700 mb-4">
                      Create a thank you page at <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/app/thankyou/page.tsx</code>:
                    </p>
                    <blockquote className="bg-gray-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                      <p><strong>Explanation:</strong></p>
                      <p>This page handles order confirmation after payment completion. It:</p>
                      <ul className="list-disc pl-6">
                        <li>Uses Suspense for loading states during server-side rendering</li>
                        <li>Fetches order details using orderId and payment_id from URL parameters</li>
                        <li>Displays comprehensive order information with error handling</li>
                        <li>Provides user-friendly loading and error states</li>
                      </ul>
                    </blockquote>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{`// src/app/thankyou/page.tsx
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
                const response = await fetch(\`/api/orders/\${orderId}?payment_id=\${paymentId}\`);
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
                            <p className="font-medium">$\{(order.amount / 100).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              

              {/* Key Features */}
              <section id="features">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">🔒 Secure Payment Processing</h3>
                    <p className="text-blue-800 text-sm">All payments are handled through Onecheckout&apos;s secure API</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">📦 Order Management</h3>
                    <p className="text-green-800 text-sm">Complete order lifecycle from creation to completion</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Error Handling</h3>
                    <p className="text-yellow-800 text-sm">Comprehensive error handling for both client and server operations</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">🎯 Loading States</h3>
                    <p className="text-purple-800 text-sm">User-friendly loading indicators during payment processing</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">💎 TypeScript Support</h3>
                    <p className="text-indigo-800 text-sm">Full type safety throughout the integration</p>
                  </div>
                </div>
              </section>

              {/* Security Notes */}
              <section id="security">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Notes</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">🛡️ Important Security Considerations</h3>
                  <ul className="space-y-2 text-red-800">
                    <li>• Never expose your API key in client-side code</li>
                    <li>• Always validate order data on the server side</li>
                    <li>• Implement proper error handling and logging</li>
                    <li>• Use HTTPS in production environments</li>
                  </ul>
                </div>
              </section>

              {/* Troubleshooting */}
              <section id="troubleshooting">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Payment button not loading</h3>
                    <p className="text-gray-700 text-sm">Check that your merchant ID and SDK URL are correct</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Order creation fails</h3>
                    <p className="text-gray-700 text-sm">Verify your API key and endpoint URL</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Payment capture issues</h3>
                    <p className="text-gray-700 text-sm">Ensure proper order ID handling and API responses</p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="border-t pt-8 mt-12">
                <div className="text-center text-gray-600">
                  <p className="text-sm">
                    This integration provides a robust foundation for e-commerce payments while maintaining security and user experience best practices.
                  </p>
                  <p className="text-sm mt-2">
                    For complete API documentation and advanced features, visit the{' '}
                    <Link href="/" className="text-blue-600 hover:text-blue-800">Onecheckout Documentation</Link>.
                  </p>
                  <p className="text-sm mt-2">
                    View the full example integration source code at{' '}
                    <a href="https://github.com/co-cam/demo-store" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">https://github.com/co-cam/demo-store</a>.
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
