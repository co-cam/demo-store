'use client';

import { useEffect, useState, useId } from "react";

interface PaymentButtonOptions {
    style?: Record<string, unknown>;
    createOrder?: (...args: unknown[]) => unknown;
    onApprove?: (...args: unknown[]) => unknown;
    onCancel?: (...args: unknown[]) => unknown;
    onError?: (...args: unknown[]) => unknown;
}

declare global {
    interface Window {
        onecheckout?: {
            Buttons: (options: PaymentButtonOptions) => { render: (selector: string) => void };
        };
    }
}

const PaymentButton = ({
}: {
    }) => {
    const btnId = useId();

    const [isIniting, setIsIniting] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    async function createOrder() {
        // TODO handle by backend
        // if (order.payment_id && order.status == "AWAITING_CAPTURE") {
        //     return order.payment_id
        // }

        setIsLoading(true);

        let paymentToken: string | boolean = "0be52e68-5df9-4f06-8726-9ed9db259dd6"; // TODO replace

        const apiUrl = 'http://localhost:9000/api/v1.0/orders';
        const apiKey = '0ydVp7HyU3QY6iIAIVoPFajhdqRENG0RoatHaWGe4MnclqIqU4iu82aYpHfemph3lcR9Fru1ug24KbsUpOu7HWTYT5lInsaRK1JG0XookpjI5xwk2Jrmt4TVxRo67wx8';

        const requestBody = {
            "amount": 6,
            "subtotal": 5,
            "shipping_name": "FedEx",
            "shipping_fee": 1,
            "order_lines": [
                {
                    "quantity": 1,
                    "sku": "abc",
                    "default_price": 3,
                    "product_title": "Sample Product",
                    "image_url": "/sample-product.jpg",
                    "compared_price": 6,
                    "discount_value": 1,
                    "properties": [
                        { "key": "color", "value": "blue" },
                        { "key": "size", "value": "xl" }
                    ]
                },
                {
                    "quantity": 1,
                    "sku": "abc",
                    "default_price": 2,
                    "product_title": "Sample Product",
                    "image_url": "/sample-product.jpg",
                    "compared_price": 6,
                    "discount_value": 1,
                    "properties": [
                        { "key": "color", "value": "blue" },
                        { "key": "size", "value": "xl" }
                    ]
                }
            ]
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }
            const data = await response.json();
            console.log('API Response:', data);
            if (data && data.payment_token) {
                // TODO handle payment_token
                // if (data.payment_token && data.status == "AWAITING_CAPTURE") {
                //     return data.payment_token;
                //     paymentToken = data.payment_token;
                // }
                paymentToken = data.payment_token;
            }
        } catch (error) {
            console.error('Error calling API:', error);
        } finally {
            setIsLoading(false);
        }

        if (!paymentToken) {
            setIsLoading(false);
            return false;
        }

        return paymentToken;
    }

    async function onApprove() {
        try {
            // TODO capture order
        } catch (error) {
            console.error("Error on approve:", error);
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

    const merchantId = "8cb7d434-83a7-46f5-acf7-a38426585543"; // TODO replace

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

        const paymentSrc = `http://localhost:3000/sdk.js?merchant_id=${merchantId}`;
        const script = document.createElement('script')
        script.setAttribute('src', paymentSrc)
        document.head.appendChild(script)

        const paymentBtnf = function () {
            if (!window.onecheckout) {
                console.error("PayPal SDK not loaded");
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
            console.log('PayPal script loaded successfully');
            paymentBtnf()
            setIsIniting(false)
        };

        script.onerror = () => {
            console.error('Error loading PayPal script');
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
            {isIniting && (
                <button
                    className="w-full bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center cursor-not-allowed opacity-75"
                    disabled
                >
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    Loading...
                </button>
            )}
            <div id={btnId}></div>
        </div>
    );
};

export default PaymentButton;