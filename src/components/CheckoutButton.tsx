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

            // Gọi API nội bộ Next.js (route handler)
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
            // Store order ID for later use in onApprove
            currentOrderId = data?.order?.id || null;
            console.log('Payment token:', paymentToken);

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
