'use client';

import { useEffect, useState, useId } from "react";

// TODO replace with actual merchant ID
const Payment_js_src = 'https://checkout.sandbox.whatee.store/sdk.js'
const Payment_merchant_id = "8f1615ea-5181-4079-923a-c428450099eb";

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
        setIsLoading(true);
        let paymentToken: string | boolean = false;
        try {
            // Gọi API nội bộ Next.js (route handler)
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_lines: [
                        { quantity: 1, sku: 'sku-001', default_price: 3 },
                        { quantity: 1, sku: 'sku-002', default_price: 2 },
                    ],
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            }
            const data = await response.json();
            console.log('Internal API Response:', data);
            if (data && data.payment_token) {
                paymentToken = data.payment_token;
            }
        } catch (error) {
            console.error('Error calling internal API:', error);
        } finally {
            setIsLoading(false);
        }
        console.log('Payment token:', paymentToken);
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