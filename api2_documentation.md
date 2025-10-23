# Tài liệu Kỹ thuật API - OneCheckout

## 1. Read Account API

**Endpoint:** `GET /api/v1.0/me`  
**Mô tả:** Lấy thông tin tài khoản merchant hiện tại

### Authentication
- **Header:** `X-API-Key: <api_key>` hoặc `Authorization: Bearer <api_key>`
- API key được tạo khi đăng ký tài khoản merchant

### Request Parameters
Không có parameters

### Request Example
```curl
curl -X GET "https://onecheckout.sandbox.whatee.io/api/v1.0/me" \
  -H "X-API-Key: your_api_key_here"
```

### Response

#### Success (200 OK)
```json
{
  "id": "merchant_id_uuid",
  "email": "merchant@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Business St, City",
  "theme": "default",
  "order_prefix": "ORD-",
  "currencies": ["USD", "EUR"],
  "payment_methods": ["paypal", "stripe_hosted"],
  "success_url": "https://store.example.com/success",
  "cancel_url": "https://store.example.com/cancel",
  "webhook_url": "https://store.example.com/webhook",
  "gateways": [...],
  "created": 1698765432000,
  "updated": 1698765432000
}
```

#### Error (400 Bad Request)
```json
{
  "error": {
    "code": "api_key_required",
    "message": "api_key_required or access_token_required"
  }
}
```

#### Error (401 Unauthorized)
```json
{
  "error": {
    "code": "api_key_invalid",
    "message": "api_key_invalid or access_token_invalid 1"
  }
}
```

#### Error (500 Internal Server Error)
```json
{
  "error": {
    "code": "server_error",
    "message": "Internal server error occurred"
  }
}
```

---

## 2. Update Account API

**Endpoint:** `POST /api/v1.0/me`  
**Mô tả:** Cập nhật thông tin tài khoản merchant

### Authentication
- **Header:** `X-API-Key: <api_key>` hoặc `Authorization: Bearer <api_key>`

### Request Parameters
**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | No | Email merchant |
| full_name | string | No | Họ và tên |
| phone | string | No | Số điện thoại |
| address | string | No | Địa chỉ |
| theme | string | No | Theme giao diện |
| webhook_url | string | No | URL webhook |
| success_url | string | No | URL thành công |
| cancel_url | string | No | URL hủy bỏ |
| gateways | array | No | Danh sách gateway |
| delegate_merchant_id | string | No | ID delegate merchant |

### Request Example
```curl
curl -X POST "https://onecheckout.sandbox.whatee.io/api/v1.0/me" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "full_name": "John Smith",
    "phone": "+1234567891",
    "webhook_url": "https://store.example.com/webhook"
  }'
```

### Response

#### Success (200 OK)
```json
{
  "id": "merchant_id_uuid",
  "email": "newemail@example.com",
  "full_name": "John Smith",
  "phone": "+1234567891",
  "webhook_url": "https://store.example.com/webhook",
  "updated": 1698765432001
}
```

#### Error (400 Bad Request)
```json
{
  "error": {
    "code": "merchant_id_invalid",
    "message": "merchant_id_invalid 1 mismatch"
  }
}
```

#### Error (500 Internal Server Error)
```json
{
  "error": {
    "code": "server_error",
    "message": "Database error occurred"
  }
}
```

---

## 3. List Orders API

**Endpoint:** `POST /api/v1.0/orders-list`  
**Mô tả:** Lấy danh sách orders với bộ lọc và phân trang

### Authentication
- **Header:** `X-API-Key: <api_key>` hoặc `Authorization: Bearer <api_key>`

### Request Parameters
**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| anchor | string | No | ID order để phân trang |
| limit | int | No | Số lượng order (default: 20, max: 1024) |
| status | string | No | Lọc theo trạng thái (OPEN, PAID, CANCELLED, REFUNDED) |
| created_hour_from | int64 | No | Thời gian tạo từ (timestamp) |
| created_hour_to | int64 | No | Thời gian tạo đến (timestamp) |
| updated_hour_from | int64 | No | Thời gian cập nhật từ |
| updated_hour_to | int64 | No | Thời gian cập nhật đến |
| paid_hour_from | int64 | No | Thời gian thanh toán từ |
| paid_hour_to | int64 | No | Thời gian thanh toán đến |

### Request Example
```curl
curl -X POST "https://onecheckout.sandbox.whatee.io/api/v1.0/orders-list" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 50,
    "status": "PAID",
    "created_hour_from": 1698700000,
    "created_hour_to": 1698800000
  }'
```

### Response

#### Success (200 OK)
```json
{
  "anchor": "",
  "limit": 50,
  "count": 125,
  "next_anchor": "order_id_for_next_page",
  "orders": [
    {
      "id": "0001",
      "name": "Order #0001",
      "status": "PAID",
      "amount": 99.99,
      "currency": "USD",
      "zero_decimal": false,
      "tax_amount": 8.50,
      "order_lines": [
        {
          "key": "SKU-1234",
          "title": "Product Name",
          "quantity": 2,
          "unit_price": 49.99
        }
      ],
      "payment_method": "paypal",
      "payment_gateway": "PAYPAL",
      "gateway_id": "gateway_123",
      "merchant_id": "merchant_id_uuid",
      "created": 1698765432000,
      "updated": 1698765432100,
      "paid": 1698765432200
    }
  ]
}
```

#### Error (400 Bad Request)
```json
{
  "error": {
    "code": "api_key_required",
    "message": "api_key_required or access_token_required"
  }
}
```

#### Error (500 Internal Server Error)
```json
{
  "error": {
    "code": "server_error",
    "message": "Database connection failed"
  }
}
```

---

## 4. List Order Events API

**Endpoint:** `GET /api/v1.0/orders/{id}/events`  
**Mô tả:** Lấy danh sách events của một order cụ thể

### Authentication
- **Header:** `X-API-Key: <api_key>` hoặc `Authorization: Bearer <api_key>`

### Request Parameters
**Path Parameters:**
- `id` (string, required): ID của order

**Query Parameters:**
- `id` (string, optional): Alternative way to pass order ID

### Request Example
```curl
curl -X GET "https://onecheckout.sandbox.whatee.io/api/v1.0/orders/0001/events" \
  -H "X-API-Key: your_api_key_here"
```

### Response

#### Success (200 OK)
```json
{
  "events": [
    {
      "id": "event_uuid_1",
      "order_id": "0001",
      "type": "payment_created",
      "merchant_id": "merchant_id_uuid",
      "created": 1698765432000,
      "error": "",
      "order": {
        "id": "0001",
        "status": "OPEN",
        "amount": 99.99,
        "currency": "USD"
      },
      "payment_status": "PENDING"
    },
    {
      "id": "event_uuid_2",
      "order_id": "0001", 
      "type": "payment_succeeded",
      "merchant_id": "merchant_id_uuid",
      "created": 1698765432200,
      "error": "",
      "order": {
        "id": "0001",
        "status": "PAID",
        "amount": 99.99,
        "currency": "USD",
        "paid": 1698765432200
      },
      "payment_status": "COMPLETED"
    }
  ]
}
```

#### Error (400 Bad Request)
```json
{
  "error": {
    "code": "id_required",
    "message": "id_required"
  }
}
```

#### Error (404 Not Found)
```json
{
  "error": {
    "code": "id_invalid",
    "message": "id_invalid"
  }
}
```

#### Error (403 Forbidden)
```json
{
  "error": {
    "code": "id_invalid", 
    "message": "id_invalid"
  }
}
```

#### Error (500 Internal Server Error)
```json
{
  "error": {
    "code": "server_error",
    "message": "Failed to retrieve order events"
  }
}
```

---

## Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `api_key_required` | 400 | API key không được cung cấp |
| `api_key_invalid` | 401 | API key không hợp lệ |
| `id_required` | 400 | ID tham số bị thiếu |
| `id_invalid` | 400/404 | ID không hợp lệ hoặc không tồn tại |
| `merchant_id_invalid` | 400 | Merchant ID không hợp lệ |
| `server_error` | 500 | Lỗi server nội bộ |

## Rate Limiting

Tất cả API đều có giới hạn:
- **Rate limit:** 1000 requests/minute per API key
- **Concurrent requests:** 10 requests đồng thời per API key

## Base URL

- **Production:** `https://onecheckout.sandbox.whatee.io`
- **Staging:** `https://api-staging.onecheckout.com`