# OneCheckout API Documentation

## Authentication
Tất cả API yêu cầu Bearer token trong header:
```
Authorization: Bearer <your-token>
```

## Currency Format
- **Zero-decimal currencies** (JPY, VND, KRW, v.v.): Giá trị nguyên (ví dụ: 1000 = ¥1,000)  
- **Two-decimal currencies** (USD, EUR, v.v.): Đơn vị nhỏ nhất (ví dụ: 1000 = $10.00)

---

## 1. Create Order

**Endpoint:** `POST /api/v1.0/orders`

### Request Parameters

**Body (JSON):**
```json
{
  "currency": "USD",
  "order_lines": [
    {
      "key": "SKU-001",
      "title": "Product Name",
      "quantity": 1,
      "unit_price": 10.00
    }
  ],
  "tax_amount": 1.30,
  "success_url": "https://example.com/success",
  "cancel_url": "https://example.com/cancel",
  "reference_id": "your_internal_id"
}
```

**Required Fields:**
- `currency`: Mã tiền tệ ISO 4217 (USD, EUR, JPY, v.v.)
- `order_lines`: Mảng sản phẩm, mỗi item cần `title`, `quantity`, `unit_price`

**Optional Fields:**
- `tax_amount`: Thuế
- `success_url`, `cancel_url`: URL callback

### cURL Example
```bash
curl -X POST "https://onecheckout.sandbox.whatee.io/api/v1.0/orders" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "USD",
    "order_lines": [
      {
        "key": "PRODUCT-001",
        "title": "Premium T-Shirt",
        "quantity": 2,
        "unit_price": 25.99
      }
    ],
    "success_url": "https://mystore.com/success",
    "cancel_url": "https://mystore.com/cancel",
    "reference_id": "your_internal_id"
  }'
```

### Response

**HTTP 200 - Success:**
```json
{
  "id": "0001",
  "payment_token": "abc123...",
  "status": "OPEN",
  "currency": "USD",
  "zero_decimal": false,
  "amount": 61.97,
  "order_lines": [
    {
      "key": "PRODUCT-001",
      "title": "Premium T-Shirt",
      "quantity": 2,
      "unit_price": 25.99
    }
  ],
  "tax_amount": 0,
  "merchant_id": "merchant123",
  "created": 1729712400000,
  "links": [
    {
      "href": "https://checkout.onecheckout.com/pay/0001?token=abc123",
      "rel": "pay"
    },
    {
      "href": "https://checkout.onecheckout.com/pay/0001?token=abc123",
      "rel": "order"
    }
  ],
  "reference_id": "your_internal_id"
}
```

**HTTP 400 - Bad Request:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request data",
    "details": [
      {
        "field": "currency",
        "issue": "currency_invalid"
      }
    ]
  }
}
```

**HTTP 401 - Unauthorized:**
```json
{
  "error": "missing token"
}
```

**HTTP 500 - Server Error:**
```json
{
  "error": {
    "code": "server_error",
    "message": "Internal server error"
  }
}
```

---

## 2. Read Order

**Endpoint:** `GET /api/v1.0/orders/:id`

### Request Parameters

**Path Parameters:**
- `id` (required): Order ID

**Query Parameters:**
- `id` (optional): Order ID (alternative to path parameter)

### cURL Example
```bash
curl -X GET "https://onecheckout.sandbox.whatee.io/api/v1.0/orders/0001" \
  -H "Authorization: Bearer your-token"
```

### Response

**HTTP 200 - Success:**
```json
{
  "id": "0001",
  "payment_token": "abc123...",
  "name": "Order #0001",
  "status": "PAID",
  "currency": "USD",
  "zero_decimal": false,
  "amount": 61.97,
  "order_lines": [
    {
      "key": "PRODUCT-001",
      "title": "Premium T-Shirt",
      "quantity": 2,
      "unit_price": 25.99
    }
  ],
  "tax_amount": 0,
  "payment_method": "stripe_hosted",
  "payment_gateway": "STRIPE",
  "gateway_id": "gateway123",
  "payment_id": "pi_abc123",
  "merchant_id": "merchant123",
  "created": 1729712400000,
  "paid": 1729712500000,
  "shipping": {
    "name": "John Doe",
    "line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "links": [
    {
      "href": "https://mystore.com/success?payment_id=0001&reference_id=your_internal_id",
      "rel": "success"
    },
    {
      "href": "https://mystore.com/cancel?payment_id=0001&reference_id=your_internal_id",
      "rel": "cancel"
    }
  ],
  "reference_id": "your_internal_id"
}
```

**HTTP 400 - Bad Request:**
```json
{
  "error": "id_required"
}
```

**HTTP 401 - Unauthorized:**
```json
{
  "error": "missing token"
}
```

**HTTP 500 - Server Error:**
```json
{
  "error": {
    "code": "server_error",
    "message": "Database connection failed"
  }
}
```

---

## 3. Capture Order

**Endpoint:** `POST /api/v1.0/orders/:id/capture`

### Request Parameters

**Path Parameters:**
- `id` (required): Order ID

**Query Parameters:**
- `id` (optional): Order ID (alternative to path parameter)

### cURL Example
```bash
curl -X POST "https://onecheckout.sandbox.whatee.io/api/v1.0/orders/0001/capture" \
  -H "Authorization: Bearer your-token"
```

### Response

**HTTP 200 - Success:**
```json
{
  "id": "0001",
  "payment_token": "abc123...",
  "name": "Order #0001",
  "status": "PAID",
  "currency": "USD",
  "zero_decimal": false,
  "amount": 61.97,
  "order_lines": [
    {
      "key": "PRODUCT-001",
      "title": "Premium T-Shirt",
      "quantity": 2,
      "unit_price": 25.99
    }
  ],
  "tax_amount": 0,
  "payment_method": "paypal",
  "payment_gateway": "PAYPAL",
  "gateway_id": "gateway123",
  "payment_id": "ORDER-123ABC",
  "merchant_id": "merchant123",
  "created": 1729712400000,
  "paid": 1729712600000
}
```

**HTTP 400 - Bad Request (Missing ID):**
```json
{
  "error": "id_required"
}
```

**HTTP 400 - Bad Request (Invalid Order Status):**
```json
{
  "error": "order_status_invalid"
}
```

**HTTP 401 - Unauthorized:**
```json
{
  "error": "missing token"
}
```

**HTTP 500 - Server Error:**
```json
{
  "error": {
    "code": "server_error",
    "message": "Payment capture failed"
  }
}
```

---

## Order Status Flow

1. **OPEN** - Order được tạo, chưa thanh toán
2. **AWAITING_CAPTURE** - Thanh toán đã authorize, chờ capture  
3. **PAID** - Đã capture thành công
4. **CANCELLED** - Order bị hủy
5. **REFUNDED** - Đã hoàn tiền

## Error Codes

| Code | Description |
|------|-------------|
| `validation_error` | Dữ liệu đầu vào không hợp lệ |
| `id_required` | Thiếu Order ID |
| `id_invalid` | Order ID không tồn tại |
| `currency_invalid` | Mã tiền tệ không hợp lệ |
| `amount_invalid` | Số tiền không hợp lệ (< $0.50) |
| `order_status_invalid` | Trạng thái order không cho phép thao tác |
| `server_error` | Lỗi server nội bộ |