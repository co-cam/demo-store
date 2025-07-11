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
    inventory_quantity: number,
    available: boolean,
    option1?: string, // e.g. "Size", "Color"
    option2?: string,
    option3?: string,
    value1?: string, // e.g. "M", "Red"
    value2?: string,
    value3?: string,
}

export type Product = {
    id: string,
    title: string,
    description: string,
    vendor: string,
    product_type: string,
    tags: string[],
    images: string[],
    variants: ProductVariant[],
    options: ProductOption[],
    created_at: string,
    updated_at: string,
    status: 'active' | 'draft' | 'archived',
    seo_title?: string,
    seo_description?: string,
}

export type ProductOption = {
    name: string, // e.g. "Size", "Color"
    values: string[], // e.g. ["S", "M", "L", "XL"]
}

export type KV = {
    key: string,
    value: string,
}

export type Order = {
    id?: string,
    status?: string,
    amount?: number, // total
    discount_code?: string,
    discount_percent?: number,
    discount_value?: number,
    shipping_name?: string,
    shipping_fee?: number,
    tax_price?: number,
    tip_price?: number,
    order_lines?: OrderLine[],
    subtotal?: number,
    shipping_changed?: boolean, // only in client

    // from API of payment gateway
    payment_token?: string,
    payment_id?: string,
    lastest_error?: string,

    // metadata
    createdAt?: string,
    updatedAt?: string,
}
