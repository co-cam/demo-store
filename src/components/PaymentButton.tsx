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

let currentOrderId : string | null = null;

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
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }
            const data = await response.json();
            console.log('Internal API Response:', data);
            paymentToken = data?.order?.payment_token || false;
            // Store order ID for later use in onApprove
            currentOrderId = data?.order?.id || null;
            console.log('Payment token:', paymentToken);
        } catch (error) {
            console.error('Error calling internal API:', error);
        } finally {
            setIsLoading(false);
        }
        console.log('Payment token:', paymentToken);
        return paymentToken;
    }

    async function onApprove() {
        console.log('Payment approved demore-store', currentOrderId);

        setIsLoading(true);
        try {
            if (!currentOrderId) {
                throw new Error('Order ID not found');
            }

            // Call internal API to update order status to success
            const response = await fetch(`/api/orders/${currentOrderId}/success`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Success API Response:', data);

            // Check if order status is success
            if (data?.status === 'success') {
                // Redirect to thank you page with order ID
                window.location.href = `/thankyou?orderId=${currentOrderId}`;
            } else {
                throw new Error('Order status is not success');
            }
        } catch (error) {
            console.error("Error on approve:", error);
            // TODO: Show error message to user
            alert('Payment was successful but there was an error updating the order. Please contact support.');
        } finally {
            setIsLoading(false);
        }
    }

    function onCancel() {
        setIsLoading(false);
        // TODO
    }

    function onError(err: unknown) {
        console.error("Payment Button error:", err);
        setIsLoading(false);
        // TODO
    }

    const merchantId = Payment_merchant_id;

    function initPayment() {
        if (typeof window === "undefined") {
            console.error("Window is not defined. This component should only be used in a browser environment.");
            return
        }

        if (window.onecheckout) {
            console.log('Onecheckout script already loaded');
            setIsIniting(false);
            // make sure right merchant of loaded onecheckout script
            return;
        }

        const paymentSrc = `${Payment_js_src}?merchant_id=${merchantId}`;
        const script = document.createElement('script')
        script.setAttribute('src', paymentSrc)
        document.head.appendChild(script)

        const paymentBtnf = function () {
            if (!window.onecheckout) {
                console.error("Onecheckout SDK not loaded");
                // TODO handle
                return
            }

            const style = {
                color: 'gold',
                height: '55px',
                layout: 'horizontal',
                size: 'medium',
                shape: 'rect',
                tagline: false,
                fundingicons: 'false'
            }

            const paymentButton = window.onecheckout.Buttons({ style: style, createOrder: createOrder, onApprove: onApprove, onCancel: onCancel, onError: onError })
            console.log('Payment button created', paymentButton);
            paymentButton.render(`#${btnId}`) // or class?
        }

        script.onload = () => {
            console.log('Onecheckout script loaded successfully');
            paymentBtnf()
            setIsIniting(false)
        };

        script.onerror = () => {
            console.error('Error loading Onecheckout script');
            // TODO handle error
        };
        script.onabort = () => {
            console.error('Script loading was aborted!');
            // TODO handle abort
        };
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            initPayment();
        }
    }, [merchantId]);

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