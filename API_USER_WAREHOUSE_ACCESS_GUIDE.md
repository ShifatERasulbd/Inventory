# API User & Warehouse Access Guide

This guide explains how to give API access to any user for one or more warehouses, and how to connect that key in another app like TimelessFashion.

## Access Model (How It Works)

1. User access starts from `users.warehouse_ids`.
2. API key access is then scoped with abilities like `warehouse:4`.
3. Effective access is the intersection of:
- user assigned warehouse IDs
- API key warehouse abilities
4. For `super-admin`, keys can include any warehouse scope.

## Step 1: Create or Update the User and Assign Warehouses

Use the admin User page (or API) and ensure the user has the correct `warehouse_ids`.

Rules:
1. Non-super-admin users must have at least one warehouse.
2. Super-admin users can have empty `warehouse_ids`.

Example payload (User create/update):

```json
{
  "name": "Canada Warehouse",
  "email": "canadawarehouse@gmail.com",
  "warehouse_ids": [4],
  "role_ids": [2]
}
```

## Step 2: Create API Key for That User (Recommended Method)

Use the API Users page in Inventory:
1. Go to API Users.
2. Select user.
3. Enter key name.
4. (Optional) set expiry.
5. Create key and copy it immediately.

API endpoint used by UI:
- `POST /api/access-keys`

Example request:

```json
{
  "user_id": 4,
  "name": "Timeless Canada Key",
  "warehouse_ids": [4]
}
```

Important validation:
1. For non-super-admin users, `warehouse_ids` in key must be inside the user's `warehouse_ids`.
2. If not, API returns `422` with `invalid_warehouse_ids`.

## Step 3: Verify Key Stored in Both Places

After key creation, verify:
1. `personal_access_tokens` has the token hash (Sanctum auth).
2. `api_keys` has metadata (`user_id`, `warehouse_ids`, `key_preview`, encrypted key).

If a key exists in `personal_access_tokens` but not in `api_keys`, generate a new key via Inventory API Users page (or command below) so both tables stay consistent.

## Step 4: Command-Line Key Generation (No Tinker Required)

Use this command in Inventory:

```bash
php artisan api-key:generate canadawarehouse@gmail.com "Timeless Canada Key" --warehouse=4
```

What this command does:
1. Creates Sanctum token.
2. Inserts metadata row into `api_keys`.
3. Prints plaintext API key once.

## Step 5: Connect Key in TimelessFashion

Set in TimelessFashion `.env`:

```dotenv
INVENTORY_API_BASE_URL=http://localhost:8000
INVENTORY_CANADA_API_KEY=YOUR_NEW_KEY_HERE
INVENTORY_CANADA_WAREHOUSE_ID=4
```

Then reload config/cache:

```bash
php artisan optimize:clear
```

## Step 6: Test Public Stocks API

Direct Inventory test:

```bash
curl -H "X-API-Key: YOUR_NEW_KEY_HERE" "http://localhost:8000/api/public/stocks?warehouse_id=4"
```

Expected:
1. `200 OK`
2. JSON object with `data` array and `meta.allowed_warehouse_ids`

## Give Access to Other Warehouses (Step-by-Step)

1. Assign additional warehouse IDs to user (example: `[4, 5, 8]`).
2. Create a new API key scoped to required warehouses only.
3. Replace old key in client app `.env`.
4. Clear app cache (`php artisan optimize:clear`).
5. Revoke old key from API Users page.

## Give Access to Another User (Step-by-Step)

1. Create/update the user and assign warehouse IDs.
2. Create API key for that user with required warehouse scopes.
3. Share key securely one time.
4. Configure consuming app with that key.
5. Verify response using `/api/public/stocks` with `warehouse_id`.

## Rotation and Revocation Best Practice

1. Create new key first.
2. Update consuming app to use new key.
3. Confirm successful stock fetch.
4. Revoke old key.

## Common Errors and Fixes

1. `401 API key has expired`: Create new key and update consuming app env.
2. `403 You do not have access to this warehouse`: key warehouse scope/user assignment mismatch.
3. `422 API key warehouse scope must match warehouses assigned to the selected user`: fix user `warehouse_ids` or key `warehouse_ids`.
4. Key not in `api_keys` table: key was created outside Inventory API flow; regenerate using API Users page or `api-key:generate` command.

## Related Files

1. `app/Http/Controllers/Api/ApiKeyController.php`
2. `app/Http/Controllers/Api/PublicStockController.php`
3. `app/Http/Middleware/AuthenticateApiKey.php`
4. `routes/web.php`
5. `routes/console.php`
