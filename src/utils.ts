/**
 * Demo function to create an order using the OneCheckout API.
 * In production, need to call this function from the server-side to avoid exposing API keys.
 *
 * @returns
 */
export async function doCreateOrder({ apiKey }: { apiKey?: string | null }): Promise<string> {
  const apiUrl = "http://localhost:9000/api/v1.0/orders";
  apiKey ||= "0ydVp7HyU3QY6iIAIVoPFajhdqRENG0RoatHaWGe4MnclqIqU4iu82aYpHfemph3lcR9Fru1ug24KbsUpOu7HWTYT5lInsaRK1JG0XookpjI5xwk2Jrmt4TVxRo67wx8";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sampleOrder),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    console.log("API Response:", data);

    if (data.payment_token) {
      return data.payment_token;
    }

    throw new Error(`Failed to create order: invalid response from server`);
  } catch (error) {
    console.error("Failed to create order:", error);
    throw new Error(`Failed to create order`);
  }
}

const sampleOrder = {
  amount: 6,
  subtotal: 5,
  shipping_name: "FedEx",
  shipping_fee: 1,
  shipping: {
    email: "johndoe@gmail.com"
  },
  currency: 'usd',
  order_lines: [
    {
      quantity: 1,
      sku: "abc",
      default_price: 3,
      product_title: "Sample Product",
      image_url: "/sample-product.jpg",
      compared_price: 6,
      discount_value: 1,
      properties: [
        { key: "color", value: "blue" },
        { key: "size", value: "xl" },
      ],
    },
    {
      quantity: 1,
      sku: "abc",
      default_price: 2,
      product_title: "Sample Product",
      image_url: "/sample-product.jpg",
      compared_price: 6,
      discount_value: 1,
      properties: [
        { key: "color", value: "blue" },
        { key: "size", value: "xl" },
      ],
    },
  ],
};
