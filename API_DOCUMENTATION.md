# API Documentation

## Overview

This document describes the available API endpoints for the Inventory Management System. The API supports two types of authentication:

1. **Session Authentication (Admin)**: For administrative operations via the web dashboard
2. **API Key Authentication (Public)**: For external clients accessing stock data

---

## Authentication

### Session Authentication (Admin Routes)

Admin routes use Laravel Sanctum session-based authentication. Authentication headers are automatically handled when logged into the dashboard.

- **Required**: User must be logged in via the dashboard
- **Middleware**: `auth:sanctum`
- **Super Admin Routes**: Additional `super-admin` middleware for API key management

### API Key Authentication (Public Routes)

External clients access the public API using an API key. Provide the key in one of two ways:

#### Method 1: X-API-Key Header
```bash
curl -H "X-API-Key: your_api_key_here" http://localhost:8000/api/public/stocks
```

#### Method 2: Bearer Token
```bash
curl -H "Authorization: Bearer your_api_key_here" http://localhost:8000/api/public/stocks
```

---

## Public API Endpoints

### Get Stock Data

**Endpoint**: `GET /api/public/stocks`

**Authentication**: API Key (X-API-Key header or Bearer token)

**Description**: Retrieve warehouse stock data. The response is filtered based on the warehouses assigned to the API key.

**Query Parameters**:
- `warehouse_id` (optional): Filter results by specific warehouse ID

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "product_id": 5,
      "product_name": "T-Shirt Blue",
      "product_color_name": "Blue",
      "product_size": "L",
      "warehouse_id": 4,
      "warehouse_name": "Toronto Warehouse",
      "price": 59.99,
      "selling_price": 59.99,
      "buying_price": 34.5,
      "stocks": 150,
      "available_stock": 150,
      "barcode": ["ABC-123"],
      "updated_at": "2026-05-17T12:30:00Z"
    }
  ],
  "meta": {
    "allowed_warehouse_ids": [4]
  }
}
```

**Error Response**: `401 Unauthorized`
```json
{
  "message": "Unauthorized"
}
```

**Example**:
```bash
curl -H "X-API-Key: 3|SItHPA****...02ce" \
  http://localhost:8000/api/public/stocks?warehouse_id=4
```

---

## Admin API Endpoints

### List All API Keys

**Endpoint**: `GET /api/access-keys`

**Authentication**: Session (logged in user must be super-admin)

**Description**: Retrieve all API keys in the system. Super-admin only.

**Query Parameters**:
- `user_id` (optional): Filter API keys by specific user ID

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "sanctum_token_id": 12,
    "name": "Canada Warehouse Key",
    "abilities": [
      "stocks:read",
      "warehouse:4"
    ],
    "last_used_at": null,
    "expires_at": "2026-05-12T11:52:00Z",
    "revoked_at": null,
    "is_active": true,
    "key_preview": "3|SItHPA****...02ce",
    "created_at": "2026-05-17T10:15:00Z",
    "user": {
      "id": 2,
      "name": "Canada Warehouse",
      "email": "canadawarehouse@gmail.com"
    }
  }
]
```

**Error Response**: `403 Forbidden` (Not super-admin)

---

### Create API Key

**Endpoint**: `POST /api/access-keys`

**Authentication**: Session (logged in user must be super-admin)

**Description**: Create a new API key for a user. Super-admin only.

**Request Body**:
```json
{
  "user_id": 2,
  "name": "Production API Key",
  "expires_at": "2026-06-17",
  "warehouse_ids": [4, 5]
}
```

**Parameters**:
- `user_id` (required, integer): ID of the user to create the key for
- `name` (required, string): Name/description for the API key
- `expires_at` (optional, date): Expiration date (format: YYYY-MM-DD)
- `warehouse_ids` (optional, array): Array of warehouse IDs to grant access to. If not provided, uses user's assigned warehouses

**Response**: `201 Created`
```json
{
  "message": "API key created successfully. Save it now because it will not be shown again.",
  "api_key": "3|SItHPA1234567890abcdefghijklmnop02ce",
  "token": {
    "id": 12,
    "name": "Production API Key",
    "abilities": [
      "stocks:read",
      "warehouse:4",
      "warehouse:5"
    ],
    "expires_at": "2026-06-17T00:00:00Z"
  }
}
```

**Error Response**: `422 Unprocessable Content`
```json
{
  "message": "API key warehouse scope must match warehouses assigned to the selected user.",
  "invalid_warehouse_ids": [10, 15]
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/access-keys \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "name": "Production Key",
    "expires_at": "2026-06-17",
    "warehouse_ids": [4]
  }'
```

---

### Get API Key Details (with Decrypted Key)

**Endpoint**: `GET /api/access-keys/{id}`

**Authentication**: Session (logged in user must be super-admin)

**Description**: Retrieve a specific API key with its decrypted plaintext key. Super-admin only.

**URL Parameters**:
- `id` (required, integer): API key ID

**Response**: `200 OK`
```json
{
  "id": 1,
  "sanctum_token_id": 12,
  "name": "Canada Warehouse Key",
  "abilities": [
    "stocks:read",
    "warehouse:4"
  ],
  "last_used_at": null,
  "expires_at": "2026-05-12T11:52:00Z",
  "revoked_at": null,
  "is_active": true,
  "key_preview": "3|SItHPA****...02ce",
  "api_key": "3|SItHPA1234567890abcdefghijklmnop02ce",
  "created_at": "2026-05-17T10:15:00Z",
  "user": {
    "id": 2,
    "name": "Canada Warehouse",
    "email": "canadawarehouse@gmail.com"
  }
}
```

**Error Response**: `404 Not Found`
```json
{
  "message": "Not found"
}
```

---

### Revoke API Key

**Endpoint**: `DELETE /api/access-keys/{id}`

**Authentication**: Session (logged in user must be super-admin)

**Description**: Revoke an API key. The key will no longer be valid for authentication. Super-admin only.

**URL Parameters**:
- `id` (required, integer): API key ID

**Response**: `200 OK`
```json
{
  "message": "API key revoked successfully."
}
```

**Error Response**: `404 Not Found`
```json
{
  "message": "Not found"
}
```

**Example**:
```bash
curl -X DELETE http://localhost:8000/api/access-keys/1
```

---

## API Key Abilities/Scopes

API keys are granted specific abilities that restrict what data they can access:

- `stocks:read`: Permission to read stock data (required for all API keys)
- `warehouse:N`: Access to stocks in warehouse with ID N (where N is the warehouse ID)

**Example**:
An API key with abilities `["stocks:read", "warehouse:4", "warehouse:5"]` can only read stock data from warehouses 4 and 5.

---

## Rate Limiting

Authentication routes are rate limited:
- `POST /api/login`: 6 requests per 1 minute

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "message": "Invalid request parameters"
}
```

**401 Unauthorized**
```json
{
  "message": "Invalid API key"
}
```

**403 Forbidden**
```json
{
  "message": "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "message": "Resource not found"
}
```

**422 Unprocessable Content**
```json
{
  "errors": {
    "field_name": ["Error message"]
  }
}
```

**500 Internal Server Error**
```json
{
  "message": "An error occurred while processing your request"
}
```

---

## Examples

### Get Stock Data from Specific Warehouse

```bash
curl -H "X-API-Key: 3|SItHPA****...02ce" \
  "http://localhost:8000/api/public/stocks?warehouse_id=4"
```

### Create API Key for User

```bash
curl -X POST http://localhost:8000/api/access-keys \
  -H "Content-Type: application/json" \
  -H "Cookie: XSRF-TOKEN=...; laravel_session=..." \
  -d '{
    "user_id": 2,
    "name": "Integration Key",
    "warehouse_ids": [4, 5]
  }'
```

### View Decrypted API Key

```bash
curl http://localhost:8000/api/access-keys/1 \
  -H "Cookie: XSRF-TOKEN=...; laravel_session=..."
```

---

## Security Considerations

1. **Store Keys Securely**: Never commit API keys to version control. Use environment variables.
2. **Rotation**: Regularly rotate old API keys for security.
3. **Expiration**: Set expiration dates on API keys when possible.
4. **Scoping**: Only grant API keys access to warehouses they need.
5. **Monitoring**: Monitor `last_used_at` to detect unused keys.
6. **Encryption**: API keys are encrypted at rest in the database.

---

## Changelog

### Version 1.0.0 (2026-05-17)
- Initial API release
- Public stock data endpoint
- Admin API key management endpoints
- Support for X-API-Key and Bearer token authentication
