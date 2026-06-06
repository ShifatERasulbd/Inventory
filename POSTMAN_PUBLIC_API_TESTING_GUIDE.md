# Public API Testing Guide (Postman)

This guide shows how to test the public stock API in Postman, step by step.

## 1) What You Need Before Testing

1. The app is running locally (example: `http://localhost:8000`).
2. A valid API key (example format: `3|xxxxxxxxxxxxxxxxxxxxxxxxxxxx`).
3. Optional: a warehouse ID that is allowed for your API key.

Public endpoint used in this project:

- `GET /api/public/stocks`

Authentication accepted:

- `X-API-Key` header
- `Authorization: Bearer <api_key>`

## 2) Open Postman and Create an Environment

1. Open Postman.
2. Click Environments.
3. Click Create Environment.
4. Name it: `Inventory Local`.
5. Add these variables:

| Variable | Initial Value | Current Value |
|---|---|---|
| `base_url` | `http://localhost:8000` | `http://localhost:8000` |
| `api_key` | `YOUR_API_KEY_HERE` | `YOUR_API_KEY_HERE` |
| `warehouse_id` | `4` | `4` |

6. Click Save.
7. Select this environment from the top-right dropdown.

## 3) Create a Postman Collection

1. Click Collections.
2. Click New Collection.
3. Name it: `Inventory Public API`.

Optional but recommended:

1. Open the collection settings.
2. In Authorization, choose `No Auth` (we will send key in headers manually for clarity).

## 4) Test 1: Get Public Stocks (Success Case)

1. Inside the collection, click Add Request.
2. Request name: `Get Public Stocks`.
3. Method: `GET`.
4. URL:

   `{{base_url}}/api/public/stocks?warehouse_id={{warehouse_id}}`

5. Go to Headers and add:

| Key | Value |
|---|---|
| `Accept` | `application/json` |
| `X-API-Key` | `{{api_key}}` |

6. Click Send.

Expected result:

1. Status code `200 OK`.
2. JSON response with:
   - `data` (array of stock rows)
   - `meta.allowed_warehouse_ids` (array)

Example response shape:

```json
{
  "data": [
    {
      "id": 1,
      "product_id": 5,
      "product_name": "T-Shirt Blue",
      "warehouse_id": 4,
      "warehouse_name": "Toronto Warehouse",
      "stocks": 150,
      "available_stock": 150,
      "updated_at": "2026-05-17T12:30:00Z"
    }
  ],
  "meta": {
    "allowed_warehouse_ids": [4]
  }
}
```

## 5) Add Automated Tests in Postman (Recommended)

In the same request, open the Tests tab and paste:

```javascript
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is JSON", function () {
  pm.response.to.be.json;
});

const body = pm.response.json();

pm.test("Has data array", function () {
  pm.expect(body).to.have.property("data");
  pm.expect(body.data).to.be.an("array");
});

pm.test("Has meta.allowed_warehouse_ids", function () {
  pm.expect(body).to.have.property("meta");
  pm.expect(body.meta).to.have.property("allowed_warehouse_ids");
  pm.expect(body.meta.allowed_warehouse_ids).to.be.an("array");
});
```

Click Send again. You should see all tests pass.

## 6) Test 2: Unauthorized Request (No API Key)

1. Duplicate `Get Public Stocks` request.
2. Rename to: `Get Public Stocks - No Key`.
3. Remove `X-API-Key` header.
4. Click Send.

Expected result:

1. Status `401 Unauthorized`.
2. Error message similar to `Unauthorized`.

## 7) Test 3: Invalid API Key

1. Duplicate success request.
2. Rename to: `Get Public Stocks - Invalid Key`.
3. Set `X-API-Key` to any fake value, for example `invalid-key`.
4. Click Send.

Expected result:

1. Status `401 Unauthorized` (or equivalent auth failure response).

## 8) Test 4: Use Bearer Token Instead of X-API-Key

1. Duplicate success request.
2. Rename to: `Get Public Stocks - Bearer`.
3. Remove `X-API-Key` header.
4. Add header:

| Key | Value |
|---|---|
| `Authorization` | `Bearer {{api_key}}` |

5. Click Send.

Expected result:

1. Status `200 OK`.
2. Same JSON structure as success case.

## 9) Test 5: Warehouse Access Scope Check

1. Use success request.
2. Change `warehouse_id` to a warehouse not allowed for this key.
3. Click Send.

Expected result:

1. Usually `403 Forbidden` if the key has no access to that warehouse.
2. Message similar to warehouse access denied.

## 10) Useful Troubleshooting

1. If all requests fail, verify app URL and port are correct.
2. Confirm API key is active and not revoked.
3. Confirm API key is not expired.
4. Confirm the key has access to the selected warehouse ID.
5. Ensure headers are exactly named:
   - `X-API-Key`
   - `Authorization: Bearer ...`

## 11) Optional: Run All Tests at Once (Collection Runner)

1. Click the collection.
2. Click Run.
3. Select your environment `Inventory Local`.
4. Run all requests.
5. Review pass/fail summary.

## 12) Quick Endpoint Reference

- Base URL: `{{base_url}}`
- Public Stocks: `GET {{base_url}}/api/public/stocks`
- With filter: `GET {{base_url}}/api/public/stocks?warehouse_id={{warehouse_id}}`

Headers:

- `Accept: application/json`
- `X-API-Key: {{api_key}}`

Alternative auth header:

- `Authorization: Bearer {{api_key}}`
