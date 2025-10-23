
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Onecheckout API Documentation - Demo Store',
  description: 'Complete technical documentation for the Onecheckout API, covering account management, order processing, and more.',
};

const CodeBlock = ({ code }: { code: string }) => (
  <div className="bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto">
    <pre className="text-sm text-gray-100">
      <code>{code.trim()}</code>
    </pre>
  </div>
);

const Table = ({ headers, rows }: { headers: string[], rows: string[][] }) => (
    <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
                <tr>
                    {headers.map(header => (
                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {cell.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function DocsApiPage() {
  return (
    <div className="min-h-screen bg-gray-50 docs-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Onecheckout API Documentation
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Your complete guide to integrating with the Onecheckout REST API.
              </p>
            </div>
            <Link 
              href="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">API Reference</h2>
              <nav className="space-y-2">
                <a href="#overview" className="block text-sm text-blue-600 hover:text-blue-800">Overview</a>
                <a href="#authentication" className="block text-sm text-blue-600 hover:text-blue-800">Authentication</a>
                <a href="#endpoints" className="block text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">Endpoints</a>
                <a href="#account-read" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">GET /me</a>
                <a href="#account-update" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">POST /me</a>
                <a href="#order-create" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">POST /orders</a>
                <a href="#order-read" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">GET /orders/:id</a>
                <a href="#order-capture" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">POST /orders/:id/capture</a>
                <a href="#orders-list" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">POST /orders-list</a>
                <a href="#order-events" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">GET /orders/:id/events</a>
                <a href="#common" className="block text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">Common</a>
                <a href="#errors" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">Error Codes</a>
                <a href="#rate-limiting" className="block text-sm text-blue-600 hover:text-blue-800 pl-4">Rate Limiting</a>
              </nav>
            </div>
          </aside>

          {/* Documentation Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-8 space-y-12">
              
              <section id="overview">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This document provides a comprehensive overview of the Onecheckout REST API. It is designed for developers who need to integrate our payment services into their applications. The API is organized around REST principles, uses JSON for requests and responses, and standard HTTP response codes.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Standard Workflow</h3>
                <p className="text-gray-700 mb-4">The typical payment processing flow involves creating an order, redirecting the user to a secure payment page, and then verifying the payment status.</p>
                <CodeBlock code={`
Client Application         Your Server (Backend)      Onecheckout API
------------------         ---------------------      ---------------
      |                            |                          |
1.  User clicks "Pay"  -------->   |                          |
      |                            |                          |
      |                      2. Create Order Request          |
      |                            | ---------------------->  |
      |                            |                          |
      |                            | <----------------------  |
      |                      3. Receive payment_token         |
      | <------------------------  | & redirect link          |
      |                            |                          |
4.  Redirect user to             |                          |
    Onecheckout URL ------------->                          |
      |                                                       |
      |                5. User completes payment              |
      | <---------------------------------------------------  |
      | 6. Redirected to success_url                          |
      |    with order details                                 |
      |                            |                          |
      |                      7. Verify Payment Status         |
      |                            | ---------------------->  |
      |                            | (GET /orders/:id)        |
      |                            |                          |
      |                            | <----------------------  |
      |                      8. Receive PAID status           |
      |                            |                          |
      | <------------------------  |                          |
9.  Display "Thank You" page     |                          |
      |                            |                          |
                `} />
              </section>

              <section id="authentication">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Onecheckout API uses API keys to authenticate requests. You can manage your API keys from the merchant dashboard. Authentication is performed via HTTP headers. Note that different endpoints may require different headers.
                </p>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">Bearer Token</h3>
                        <p className="text-gray-700">Used for core order operations. Provide your token as a Bearer token in the <code className="bg-gray-100 px-1 py-0.5 rounded">Authorization</code> header.</p>
                        <CodeBlock code={`Authorization: Bearer <your-token>`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">X-API-Key</h3>
                        <p className="text-gray-700">Used for account management and data retrieval. Provide your key in the <code className="bg-gray-100 px-1 py-0.5 rounded">X-API-Key</code> header.</p>
                        <CodeBlock code={`X-API-Key: <your_api_key_here>`} />
                    </div>
                </div>
                 <blockquote className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                    <p className="font-bold">Important:</p>
                    <p>Your API keys carry many privileges. Be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.</p>
                </blockquote>
              </section>

              <section id="endpoints">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
                <p className="text-gray-700 mb-4">Base URL for all API endpoints:</p>
                <CodeBlock code={`Production: https://onecheckout.sandbox.whatee.io/api/v1.0\nStaging:    https://api-staging.onecheckout.com/api/v1.0`} />
              </section>

              {/* Account Endpoints */}
              <div className="space-y-12">
                <section id="account-read">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Read Account</h3>
                    <p className="text-gray-700 mb-4">
                        <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded-md">GET</span> <code className="ml-2 text-gray-800">/me</code>
                    </p>
                    <p className="text-gray-700 mb-4">Retrieves the details of the authenticated merchant account.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Authentication</h4>
                    <p className="text-gray-700 mb-4">Requires <code className="bg-gray-100 px-1 py-0.5 rounded">X-API-Key</code> or <code className="bg-gray-100 px-1 py-0.5 rounded">Authorization: Bearer</code>.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Successful Response (200 OK)</h4>
                    <CodeBlock code={`{\n  "id": "merchant_id_uuid",\n  "email": "merchant@example.com",\n  "full_name": "John Doe",\n  "phone": "+1234567890",\n  "address": "123 Business St, City",\n  "theme": "default",\n  "order_prefix": "ORD-",\n  "currencies": ["USD", "EUR"],\n  "payment_methods": ["paypal", "stripe_hosted"],\n  "success_url": "https://store.example.com/success",\n  "cancel_url": "https://store.example.com/cancel",\n  "webhook_url": "https://store.example.com/webhook",\n  "created": 1698765432000\n}`} />
                </section>

                <section id="account-update">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Update Account</h3>
                    <p className="text-gray-700 mb-4">
                        <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-md">POST</span> <code className="ml-2 text-gray-800">/me</code>
                    </p>
                    <p className="text-gray-700 mb-4">Updates the details of the authenticated merchant account.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Request Body (JSON)</h4>
                    <Table headers={["Field", "Type", "Description"]} rows={[
                        ["email", "string", "Merchant's email address."],
                        ["full_name", "string", "Full name of the merchant."],
                        ["phone", "string", "Contact phone number."],
                        ["address", "string", "Business address."],
                        ["webhook_url", "string", "URL for receiving webhooks."],
                        ["success_url", "string", "Default redirect URL for successful payments."],
                        ["cancel_url", "string", "Default redirect URL for cancelled payments."],
                    ]} />
                    <h4 className="font-semibold text-gray-800 mb-2">Successful Response (200 OK)</h4>
                    <p className="text-gray-700 mb-4">Returns the updated fields of the merchant object.</p>
                </section>
              </div>

              {/* Order Endpoints */}
              <div className="space-y-12">
                <section id="order-create">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Order</h3>
                    <p className="text-gray-700 mb-4">
                        <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-md">POST</span> <code className="ml-2 text-gray-800">/orders</code>
                    </p>
                    <p className="text-gray-700 mb-4">Creates a new order and initializes a payment session.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Authentication</h4>
                    <p className="text-gray-700 mb-4">Requires <code className="bg-gray-100 px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code>.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Request Body (JSON)</h4>
                     <Table headers={["Field", "Type", "Required", "Description"]} rows={[
                        ["currency", "string", "Yes", "ISO 4217 currency code (e.g., 'USD')."],
                        ["order_lines", "array", "Yes", "Array of objects, each representing a line item."],
                        ["order_lines[].title", "string", "Yes", "Name of the product."],
                        ["order_lines[].quantity", "number", "Yes", "Quantity of the product."],
                        ["order_lines[].unit_price", "number", "Yes", "Price per unit."],
                        ["tax_amount", "number", "No", "Total tax amount for the order."],
                        ["success_url", "string", "No", "Override the default success URL."],
                        ["cancel_url", "string", "No", "Override the default cancel URL."],
                        ["reference_id", "string", "No", "Your internal identifier for the order."],
                    ]} />
                    <h4 className="font-semibold text-gray-800 mb-2">Successful Response (200 OK)</h4>
                    <p className="text-gray-700 mb-4">Returns an order object with a <code className="bg-gray-100 px-1 py-0.5 rounded">payment_token</code> and redirect links.</p>
                    <CodeBlock code={`{\n  "id": "0001",\n  "payment_token": "abc123...",\n  "status": "OPEN",\n  "amount": 61.97,\n  "links": [\n    {\n      "href": "https://checkout.onecheckout.com/pay/0001?token=abc123",\n      "rel": "pay"\n    }\n  ]\n}`} />
                </section>

                <section id="order-read">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Read Order</h3>
                    <p className="text-gray-700 mb-4">
                        <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded-md">GET</span> <code className="ml-2 text-gray-800">/orders/:id</code>
                    </p>
                    <p className="text-gray-700 mb-4">Retrieves the details of a specific order by its ID.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Successful Response (200 OK)</h4>
                    <p className="text-gray-700 mb-4">Returns a full order object, including status, payment details, and customer information if available.</p>
                    <CodeBlock code={`{\n  "id": "0001",\n  "status": "PAID",\n  "amount": 61.97,\n  "currency": "USD",\n  "payment_method": "stripe_hosted",\n  "payment_id": "pi_abc123",\n  "created": 1729712400000,\n  "paid": 1729712500000\n}`} />
                </section>

                <section id="order-capture">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Capture Order</h3>
                    <p className="text-gray-700 mb-4">
                        <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-md">POST</span> <code className="ml-2 text-gray-800">/orders/:id/capture</code>
                    </p>
                    <p className="text-gray-700 mb-4">Captures a previously authorized payment. This is typically used to confirm a payment after the user has completed the checkout flow.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Successful Response (200 OK)</h4>
                    <p className="text-gray-700 mb-4">Returns the order object with a status of <code className="bg-gray-100 px-1 py-0.5 rounded">PAID</code> if successful.</p>
                </section>

                <section id="orders-list">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">List Orders</h3>
                    <p className="text-gray-700 mb-4">
                        <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-md">POST</span> <code className="ml-2 text-gray-800">/orders-list</code>
                    </p>
                    <p className="text-gray-700 mb-4">Retrieves a paginated list of orders, with support for filtering.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Request Body (JSON)</h4>
                    <Table headers={["Field", "Type", "Description"]} rows={[
                        ["anchor", "string", "Pagination cursor from `next_anchor` of a previous response."],
                        ["limit", "integer", "Number of orders to return (default: 20, max: 1024)."],
                        ["status", "string", "Filter by status: OPEN, PAID, CANCELLED, REFUNDED."],
                        ["created_hour_from", "timestamp", "Start of creation time window."],
                        ["created_hour_to", "timestamp", "End of creation time window."],
                    ]} />
                    <h4 className="font-semibold text-gray-800 mb-2">Successful Response (200 OK)</h4>
                    <CodeBlock code={`{\n  "anchor": "",\n  "limit": 50,\n  "count": 125,\n  "next_anchor": "order_id_for_next_page",\n  "orders": [\n    {\n      "id": "0001",\n      "status": "PAID",\n      "amount": 99.99\n    }\n  ]\n}`} />
                </section>

                <section id="order-events">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">List Order Events</h3>
                    <p className="text-gray-700 mb-4">
                        <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded-md">GET</span> <code className="ml-2 text-gray-800">/orders/:id/events</code>
                    </p>
                    <p className="text-gray-700 mb-4">Retrieves a list of all events associated with a specific order, such as payment creation and status changes.</p>
                    <h4 className="font-semibold text-gray-800 mb-2">Successful Response (200 OK)</h4>
                    <CodeBlock code={`{\n  "events": [\n    {\n      "id": "event_uuid_1",\n      "order_id": "0001",\n      "type": "payment_created",\n      "created": 1698765432000\n    },\n    {\n      "id": "event_uuid_2",\n      "order_id": "0001", \n      "type": "payment_succeeded",\n      "created": 1698765432200\n    }\n  ]\n}`} />
                </section>
              </div>

              <section id="common">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Information</h2>
              </section>

              <div className="space-y-12">
                <section id="errors">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Codes</h3>
                    <p className="text-gray-700 mb-4">The API uses standard HTTP status codes to indicate the success or failure of a request. In case of an error, the response body will contain a JSON object with details.</p>
                    <Table headers={["Error Code", "HTTP Status", "Description"]} rows={[
                        ["api_key_required", "400", "The API key was not provided."],
                        ["api_key_invalid", "401", "The provided API key is invalid or expired."],
                        ["validation_error", "400", "The request body contains invalid data."],
                        ["id_required", "400", "A required ID parameter is missing."],
                        ["id_invalid", "404", "The requested resource ID does not exist."],
                        ["order_status_invalid", "400", "The operation is not permitted for the order's current status."],
                        ["server_error", "500", "An unexpected error occurred on the server."],
                    ]} />
                </section>

                <section id="rate-limiting">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Rate Limiting</h3>
                    <p className="text-gray-700 mb-4">To ensure API stability, requests are rate-limited per API key.</p>
                     <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li><strong>Rate limit:</strong> 1000 requests per minute.</li>
                        <li><strong>Concurrent requests:</strong> 10 simultaneous requests.</li>
                    </ul>
                    <p className="text-gray-700 mt-2">If you exceed the rate limit, the API will respond with an HTTP <code className="bg-gray-100 px-1 py-0.5 rounded">429 Too Many Requests</code> status code.</p>
                </section>
              </div>

              {/* Footer */}
              <footer className="border-t pt-8 mt-12">
                <div className="text-center text-gray-600">
                  <p className="text-sm">
                    For questions or support, please contact our developer team.
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
