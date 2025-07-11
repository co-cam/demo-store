export type OrderLine = {
    sku?: string,
    quantity: number,
    default_price: number,
    title: string,
    image_url: string,
    compared_price: number,
    discount_value: number,
    properties: KV[],
}

export type ProductVariant = {
    sku: string,
    default_price: number,
    product_title: string,
    image_url: string,
    compared_price: number,
    properties: KV[],
    discount_value?: number, // optional, if not present then no discount
}

export type KV = {
    key: string,
    value: string,
}

export type Order = {
    id?: string,
    status?: string,
    amount: number, // total
    discount_code?: string,
    discount_percent?: number,
    discount_value?: number,
    shipping_name?: string,
    shipping_fee?: number,
    tax_price?: number,
    tip_price?: number,
    order_lines?: OrderLine[],
    subtotal: number,
    shipping_changed?: boolean, // only in client

    // from API of payment gateway
    payment_token?: string,
    payment_id?: string,
    lastest_error?: string,
}
