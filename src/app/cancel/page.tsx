'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types';

export default function CancelPage() {
    return (
        <Suspense fallback={<div className='min-h-screen flex items-center justify-center bg-gray-50'><div className='animate-spin rounded-full h-12 w-12 border-t-4 border-red-500'></div></div>}>
            <CancelContent />
        </Suspense>
    );
}

function CancelContent() {
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
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-4 border-red-500'></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg'>
                    <div className='text-center'>
                        <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                            <svg className='h-6 w-6 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </div>
                        <h2 className='text-xl font-semibold text-gray-900 mb-2'>Error</h2>
                        <p className='text-gray-600 mb-4'>{error}</p>
                        <Link href='/' className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 py-12'>
            <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
                    {/* Header */}
                    <div className='bg-red-50 px-6 py-8 text-center border-b border-red-100'>
                        <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4'>
                            <svg className='h-8 w-8 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </div>
                        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Payment Cancelled</h1>
                        <p className='text-lg text-gray-600'>Your payment was cancelled or failed to complete.</p>
                        {orderId && (
                            <p className='text-sm text-gray-500 mt-2'>Order ID: {orderId}</p>
                        )}
                    </div>

                    {/* Order Details */}
                    {order && (
                        <div className='px-6 py-8'>
                            <h2 className='text-xl font-semibold text-gray-900 mb-6'>Order Summary</h2>
                            
                            {/* Order Items */}
                            {order.order_lines && order.order_lines.length > 0 && (
                                <div className='space-y-4 mb-6'>
                                    {order.order_lines.map((item: any, index: number) => (
                                        <div key={index} className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
                                            {item.image_url && (
                                                <div className='flex-shrink-0 h-16 w-16 bg-white rounded-md overflow-hidden'>
                                                    <img 
                                                        src={item.image_url} 
                                                        alt={item.title}
                                                        className='h-full w-full object-cover'
                                                    />
                                                </div>
                                            )}
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-sm font-medium text-gray-900'>{item.title}</p>
                                                <p className='text-sm text-gray-500'>SKU: {item.sku}</p>
                                                <p className='text-sm text-gray-500'>Quantity: {item.quantity}</p>
                                                {item.properties && item.properties.length > 0 && (
                                                    <div className='text-xs text-gray-400 mt-1'>
                                                        {item.properties.map((prop: any, propIndex: number) => (
                                                            <span key={propIndex} className='mr-2'>
                                                                {prop.name}: {prop.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-sm font-medium text-gray-900'>
                                                    ${((item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}
                                                </p>
                                                {item.compared_price && item.compared_price > item.unit_price && (
                                                    <p className='text-xs text-gray-500 line-through'>
                                                        ${(item.compared_price * (item.quantity || 1)).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Order Totals */}
                            <div className='border-t border-gray-200 pt-6'>
                                <div className='space-y-2'>
                                    <div className='flex justify-between text-sm'>
                                        <span className='text-gray-600'>Subtotal:</span>
                                        <span className='text-gray-900'>${(order.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    {order.shipping_fee && order.shipping_fee > 0 && (
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>Shipping:</span>
                                            <span className='text-gray-900'>${order.shipping_fee.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.tax_price && order.tax_price > 0 && (
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>Tax:</span>
                                            <span className='text-gray-900'>${order.tax_price.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.tip_price && order.tip_price > 0 && (
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>Tip:</span>
                                            <span className='text-gray-900'>${order.tip_price.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className='flex justify-between text-base font-medium border-t border-gray-200 pt-2'>
                                        <span className='text-gray-900'>Total:</span>
                                        <span className='text-gray-900'>${(order.amount || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className='bg-gray-50 px-6 py-6 text-center border-t border-gray-200'>
                        <div className='space-y-4'>
                            <div className='text-sm text-gray-600 mb-4'>
                                <p>Don't worry! Your order has been saved and you can try again.</p>
                                <p>If you continue to experience issues, please contact our support team.</p>
                            </div>
                            
                            <div className='space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center'>
                                <button
                                    onClick={() => {
                                        // Retry payment - you can implement this to redirect back to checkout
                                        if (order && order.payment_token) {
                                            // If there's a payment token, try to redirect to payment
                                            const paymentLink = order.links?.find((link: any) => link.rel === 'approval_url');
                                            if (paymentLink) {
                                                window.location.href = paymentLink.href;
                                                return;
                                            }
                                        }
                                        // Otherwise, go back to cart/checkout
                                        router.push('/');
                                    }}
                                    className='w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                >
                                    Try Payment Again
                                </button>
                                
                                <Link href='/' className='w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                                    Continue Shopping
                                </Link>
                            </div>
                            
                            <div className='text-xs text-gray-500'>
                                <p>Need help? <a href='mailto:support@example.com' className='text-blue-600 hover:text-blue-500'>Contact Support</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
