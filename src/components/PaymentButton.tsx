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

        let paymentToken: string | boolean = "42b79b8f-9833-493b-a598-812356dcef23"; // TODO replace

        try {
            // TODO create order and return payment token
        } catch (error) {
            console.error("Error on approve:", error);
        } finally {
            // setIsLoading(false);
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

    const merchantId = "72c52373-89fc-4dc4-9c3c-50e21181310e"; // TODO replace

    function initPayment() {
        if (!window.onecheckout) {
            const paymentSrc = `http://localhost:3000/sdk.js?merchant_id=${merchantId}`;
            const script = document.createElement('script')
            script.setAttribute('src', paymentSrc)
            document.head.appendChild(script)
        }

        const interval = setInterval(() => {
            if (!window.onecheckout) {
                clearInterval(interval)
                return // TODO handle
            }

            setIsIniting(false)

            const style = {
                color: 'gold',
                height: '55px',
                layout: 'horizontal',
                size: 'medium',
                shape: 'rect',
                tagline: false,
                fundingicons: 'false'
            }

            window.onecheckout
                .Buttons({
                    style: style,
                    createOrder: createOrder,
                    onApprove: onApprove,
                    onCancel: onCancel,
                    onError: onError
                })
                .render(`#${btnId}`) // or class?

            clearInterval(interval)
        }, 300)
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