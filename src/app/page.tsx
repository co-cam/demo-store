import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/db";
import Link from "next/link";

export default function Home() {
  const products = getProducts();
  const featuredProduct = products[0]; // Get first product as featured

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Demo Store</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/docs_api"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                📘 API Docs
              </Link>
              <Link 
                href="/docs" 
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                📚 Integration Guide
              </Link>
              <span className="text-sm text-gray-500">Premium Fashion</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Product
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our premium collection of carefully selected products. 
            Quality and style that speaks for itself.
          </p>
        </div>

        {/* Featured Product */}
        {featuredProduct && (
          <div className="mb-16">
            <ProductCard product={featuredProduct} />
          </div>
        )}

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
            <p className="text-gray-600">Safe and secure payment processing with multiple payment options.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
            <p className="text-gray-600">Premium quality products with satisfaction guarantee.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H21" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick and reliable delivery to your doorstep.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">© 2024 Demo Store. Built with Next.js and integrated payment processing.</p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link href="/docs_api" className="text-blue-600 hover:text-blue-800">
                📘 API Docs
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/docs" className="text-blue-600 hover:text-blue-800">
                📚 Integration Guide
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/thankyou" className="text-blue-600 hover:text-blue-800">
                Thank You Page
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
