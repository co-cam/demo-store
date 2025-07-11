"use client";

import { doCreateOrder } from "@/utils";
import Image from "next/image";
import Script from "next/script";
import { useId } from "react";

// Replace with your actual merchant and gateway ID
const merchantId = "9c9b6fc8-2c12-49dd-ac0a-81305ff0d53c";
const gatewayId = "67236560-c7fc-423b-b580-543688312973"; // set stripe_hosted gateway
const apiKey =
  "VH51S27hvFBSXxPQ0wJO0PBTdOXAOsN5A8ImmK5C6HIP70rwyZPWGsP3qx56xW2hKEDbHQ3XvdhqAR1k90POeC8s5nFU1V02LTgkwoxfo9BjpKvCibv4Minmj4bpgqmB";

export default function StripeHosted() {
  const payContainerId = useId();

  const createOrder = async () => {
    return doCreateOrder({
      apiKey,
    });
  };

  const onApprove = async (data: any, actions: any) => {};
  const onCancel = () => {};
  const onError = (err: unknown) => {};

  const onSdkLoaded = () => {
    if (!window.onecheckout) {
      return;
    }

    console.log("Onecheckout script loaded", window.onecheckout);

    window.onecheckout
      .Buttons({
        style: {},
        createOrder,
        onApprove,
        onCancel,
        onError,
        gatewayId,
      })
      .render(`#${payContainerId}`);
  };

  return (
    <>
      <Script
        src={`http://localhost:3000/sdk.js?merchant_id=${merchantId}`}
        strategy="afterInteractive"
        onLoad={onSdkLoaded}
      />

      <div
        style={{
          maxWidth: 400,
          margin: "2rem auto",
          padding: 24,
          border: "1px solid #eee",
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        <Image
          src="/file.svg"
          alt="A Good Product"
          width={300}
          height={200}
          style={{ borderRadius: 8, marginBottom: 16 }}
        />
        <h2>Free Good Product</h2>
        <p style={{ color: "#666", marginBottom: 8 }}>
          A beautiful free product image.
        </p>
        <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 16 }}>
          $19.99
        </div>

        <div id={payContainerId}></div>
      </div>
    </>
  );
}
