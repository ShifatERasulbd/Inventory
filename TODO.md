# TODO - Packing List & Shipping Guard

## Step 1: DB schema
- [ ] Add migration to add `packing_list_path` (nullable string) and `packing_list_generated_at` (nullable datetime) to `purchases`.

## Step 2: Backend PDF generation + download
- [ ] Create a Packing List PDF generator (service or controller method) that outputs a PDF for a given Purchase (approved PO).
- [ ] Add route + controller action to generate and download `packing_list_path` (no upload).
- [ ] Save the generated PDF to `public/uploads/packing-lists/` and persist path in DB.

## Step 3: Shipping restriction
- [ ] In `PurchaseController@updateRequestStatus`, block transition to `shipped` unless `packing_list_path` exists.

## Step 4: UI action
- [ ] Update `resources/js/components/purchase/table.jsx` to add a “Packing List” action button visible when status is `approved`.
- [ ] Add client handler calling the new backend route (generate/download).

## Step 5: Smoke testing
- [ ] Verify PO list UI shows Packing List for approved purchases.
- [ ] Try setting status to shipped without packing list -> should be blocked.
- [ ] Click Packing List -> PDF downloads.
- [ ] After packing list exists, shipping transition should succeed.

