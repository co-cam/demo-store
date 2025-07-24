// lib/db.ts
import { ProductVariant, Product } from './types';

const productVariants: ProductVariant[] = [
    {
        sku: "premium-tshirt-black-s",
        default_price: 2,
        product_title: "Premium Cotton T-Shirt",
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        compared_price: 3,
        properties: [
            { key: "material", value: "100% Organic Cotton" },
            { key: "fit", value: "Regular" },
            { key: "care", value: "Machine wash cold" }
        ],
        inventory_quantity: 50,
        available: true,
        option1: "Color",
        option2: "Size",
        value1: "Black",
        value2: "S",
    },
    {
        sku: "premium-tshirt-black-m",
        default_price: 2,
        product_title: "Premium Cotton T-Shirt",
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        compared_price: 3,
        properties: [
            { key: "material", value: "100% Organic Cotton" },
            { key: "fit", value: "Regular" },
            { key: "care", value: "Machine wash cold" }
        ],
        inventory_quantity: 75,
        available: true,
        option1: "Color",
        option2: "Size",
        value1: "Black",
        value2: "M",
    },
    {
        sku: "premium-tshirt-black-l",
        default_price: 2,
        product_title: "Premium Cotton T-Shirt",
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        compared_price: 3,
        properties: [
            { key: "material", value: "100% Organic Cotton" },
            { key: "fit", value: "Regular" },
            { key: "care", value: "Machine wash cold" }
        ],
        inventory_quantity: 100,
        available: true,
        option1: "Color",
        option2: "Size",
        value1: "Black",
        value2: "L",
    },
    {
        sku: "premium-tshirt-white-s",
        default_price: 2,
        product_title: "Premium Cotton T-Shirt",
        image_url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=500&fit=crop",
        compared_price: 3,
        properties: [
            { key: "material", value: "100% Organic Cotton" },
            { key: "fit", value: "Regular" },
            { key: "care", value: "Machine wash cold" }
        ],
        inventory_quantity: 30,
        available: true,
        option1: "Color",
        option2: "Size",
        value1: "White",
        value2: "S",
    },
    {
        sku: "premium-tshirt-white-m",
        default_price: 2,
        product_title: "Premium Cotton T-Shirt",
        image_url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=500&fit=crop",
        compared_price: 3,
        properties: [
            { key: "material", value: "100% Organic Cotton" },
            { key: "fit", value: "Regular" },
            { key: "care", value: "Machine wash cold" }
        ],
        inventory_quantity: 85,
        available: true,
        option1: "Color",
        option2: "Size",
        value1: "White",
        value2: "M",
    },
    {
        sku: "premium-tshirt-white-l",
        default_price: 2,
        product_title: "Premium Cotton T-Shirt",
        image_url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=500&fit=crop",
        compared_price: 3,
        properties: [
            { key: "material", value: "100% Organic Cotton" },
            { key: "fit", value: "Regular" },
            { key: "care", value: "Machine wash cold" }
        ],
        inventory_quantity: 60,
        available: true,
        option1: "Color",
        option2: "Size",
        value1: "White",
        value2: "L",
    }
];

const products: Product[] = [
    {
        id: "premium-tshirt-001",
        title: "Premium Cotton T-Shirt",
        description: "Elevate your casual wardrobe with our Premium Cotton T-Shirt. Made from 100% organic cotton, this t-shirt offers unmatched comfort and style. Perfect for everyday wear, it features a classic fit that flatters every body type. Available in multiple colors and sizes to suit your personal style.",
        vendor: "Demo Store",
        product_type: "T-Shirts",
        tags: ["cotton", "organic", "casual", "unisex", "premium"],
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop"
        ],
        variants: productVariants,
        options: [
            {
                name: "Color",
                values: ["Black", "White"]
            },
            {
                name: "Size",
                values: ["S", "M", "L"]
            }
        ],
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-20T14:30:00Z",
        status: "active",
        seo_title: "Premium Cotton T-Shirt - Organic & Comfortable",
        seo_description: "Shop our premium cotton t-shirt made from 100% organic cotton. Available in multiple colors and sizes. Perfect for everyday wear."
    }
];

export const getProductVariants = (): ProductVariant[] => productVariants;

export const getProducts = (): Product[] => products;
