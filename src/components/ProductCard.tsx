'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant } from '@/types';
import PaymentButton from './PaymentButton';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const options: Record<string, string> = {};
        product.options.forEach(option => {
            options[option.name] = option.values[0];
        });
        return options;
    });
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Update selected variant when options change
    const handleOptionChange = (optionName: string, value: string) => {
        const newSelectedOptions = { ...selectedOptions, [optionName]: value };
        setSelectedOptions(newSelectedOptions);

        // Find matching variant
        const matchingVariant = product.variants.find(variant => {
            return Object.entries(newSelectedOptions).every(([key, val]) => {
                if (key === 'Color') return variant.value1 === val;
                if (key === 'Size') return variant.value2 === val;
                return true;
            });
        });

        if (matchingVariant) {
            setSelectedVariant(matchingVariant);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const discountedPrice = selectedVariant.default_price - (selectedVariant.discount_value || 0);
    const discountPercentage = selectedVariant.discount_value 
        ? Math.round((selectedVariant.discount_value / selectedVariant.default_price) * 100) 
        : 0;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden rounded-lg">
                        <Image
                            src={product.images[selectedImageIndex]}
                            alt={product.title}
                            width={600}
                            height={600}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                    
                    {/* Image thumbnails */}
                    {product.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                                        selectedImageIndex === index 
                                            ? 'border-blue-500' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.title} ${index + 1}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                        <p className="text-sm text-gray-600 mb-4">by {product.vendor}</p>
                        
                        {/* Pricing */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl font-bold text-gray-900">
                                {formatPrice(discountedPrice)}
                            </span>
                            {selectedVariant.discount_value && (
                                <>
                                    <span className="text-lg text-gray-500 line-through">
                                        {formatPrice(selectedVariant.default_price)}
                                    </span>
                                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                        -{discountPercentage}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Stock status */}
                        <div className="mb-4">
                            {selectedVariant.available && selectedVariant.inventory_quantity > 0 ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-600">
                                        In stock ({selectedVariant.inventory_quantity} available)
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-sm text-red-600">Out of stock</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Product Options */}
                        <div className="space-y-4">
                            {product.options.map((option) => (
                                <div key={option.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {option.name}: {selectedOptions[option.name]}
                                    </label>
                                    <div className="flex gap-2">
                                        {option.values.map((value) => (
                                            <button
                                                key={value}
                                                onClick={() => handleOptionChange(option.name, value)}
                                                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                                                    selectedOptions[option.name] === value
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(selectedVariant.inventory_quantity, quantity + 1))}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Product Properties */}
                        {selectedVariant.properties.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Product Details</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {selectedVariant.properties.map((prop, index) => (
                                        <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-600 capitalize">
                                                {prop.key}:
                                            </span>
                                            <span className="text-sm text-gray-900">{prop.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Button */}
                        <div className="mt-8">
                            <PaymentButton
                                orderLines={[{
                                    sku: selectedVariant.sku,
                                    quantity: quantity,
                                    default_price: discountedPrice
                                }]}
                                disabled={!selectedVariant.available || selectedVariant.inventory_quantity === 0}
                            />
                        </div>

                        {/* Tags */}
                        {product.tags.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
