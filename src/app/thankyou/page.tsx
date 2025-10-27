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
                const response = await fetch(`/api/orders/${orderId}?payment_id=${paymentId}`);
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
    }, [orderId]);

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
                    <div className="text-red-500 text-xl mb-4">❌ Error</div>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-gray-500 text-xl mb-4">Order not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
                    <p className="text-lg text-gray-600">Your order has been successfully processed</p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-medium text-gray-900">{order.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {order.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Order Date</p>
                            <p className="font-medium text-gray-900">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Payment ID</p>
                            <p className="font-medium text-gray-900">{order.payment_id || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    {order.order_lines && order.order_lines.length > 0 ? (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ordered</h3>
                            <div className="space-y-4">
                                {order.order_lines.map((line, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            {line.image_url ? (
                                                <Image
                                                    src={line.image_url}
                                                    alt={line.title || 'Product Image'}
                                                    width={64}
                                                    height={64}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{line.title}</h4>
                                            <p className="text-sm text-gray-600">SKU: {line.sku}</p>
                                            <p className="text-sm text-gray-600">Quantity: {line.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                ${(line.unit_price * line.quantity).toFixed(2)}
                                            </p>
                                            {line.compared_price > line.unit_price && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    ${(line.compared_price * line.quantity).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                            <div className="p-4 border rounded-lg text-center text-gray-600">
                                <p>Order details will be available soon</p>
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="border-t pt-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">${(order.order_lines?.reduce((sum, line) => sum + (line.unit_price * line.quantity), 0) || 0).toFixed(2)}</span>
                            </div>
                            {order.shipping_fee && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900">${order.shipping_fee.toFixed(2)}</span>
                                </div>
                            )}
                            {order.tax_amount && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="text-gray-900">${order.tax_amount.toFixed(2)}</span>
                                </div>
                            )}
                                {order.discount_amount !== undefined && order.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="text-gray-900">-${order.discount_amount.toFixed(2)}</span>
                                    </div>
                                )}
                            {order.tip_price && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tip</span>
                                    <span className="text-gray-900">${order.tip_price.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                <span>Total</span>
                                <span>${(order.amount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
                    <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            You will receive an email confirmation shortly
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            Your order will be processed within 1-2 business days
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            You&apos;ll receive tracking information once your order ships
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="text-center space-y-4">
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
                    >
                        Print Order
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
