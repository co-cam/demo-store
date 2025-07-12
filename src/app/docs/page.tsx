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
                <p className="text-gray-700 leading-relaxed">
                  This guide demonstrates how to integrate Onecheckout&apos;s payment system with a Next.js demo store, 
                  covering both client-side checkout components and server-side API routes for order management.
                </p>
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
export const Payment_js_src = 'https://checkout.sandbox.whatee.store/sdk.js'; // Production: use live URL
export const Payment_merchant_id = 'your-merchant-id';
export const Payment_api_url = 'https://onecheckout.sandbox.whatee.io/api/v1.0/orders'; // Production: use live URL
export const Payment_api_key = 'your-api-key';`}</code>
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
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                      <pre className="text-sm text-gray-100">
                        <code>{`// src/app/api/orders/route.ts
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
        const id = \`ord-\${Date.now()}\`;
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
                throw new Error(\`Payment API error: \${response.status} - \${errorData.message}\`);
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
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Capture Payment API</h3>
                    <p className="text-gray-700 mb-4">
                      Create the payment capture endpoint at <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/app/api/orders/[id]/capture/route.ts</code>:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                      <pre className="text-sm text-gray-100">
                        <code>{`// src/app/api/orders/[id]/capture/route.ts
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
        const response = await fetch(\`\${Payment_api_url}/\${order.payment_id}\`, {
            method: 'GET',
            headers: {
                'api-key': Payment_api_key,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const errorData: any = await response.json();
            throw new Error(\`Payment API error: \${response.status} - \${errorData.message}\`);
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Payment Button Component</h3>
                    <p className="text-gray-700 mb-4">
                      Create a reusable payment button component that handles the Onecheckout SDK:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                      <pre className="text-sm text-gray-100">
                        <code>{`// src/components/PaymentButton.tsx
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
                throw new Error(\`HTTP error! Status: \${response.status}\`);
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
            const response = await fetch(\`/api/orders/\${currentOrderId}/capture\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(\`HTTP error! Status: \${response.status}\`);
            }

            const data: any = await response.json();
            
            if (data?.status === 'success') {
                window.location.href = \`/thankyou?orderId=\${currentOrderId}\`;
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
        script.src = \`\${Payment_js_src}?merchant_id=\${Payment_merchant_id}\`;
        
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
                
                paymentButton.render(\`#\${btnId}\`);
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

export default PaymentButton;`}</code>
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
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{`// src/app/thankyou/page.tsx
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
                </div>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
