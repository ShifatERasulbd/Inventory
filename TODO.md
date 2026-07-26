# TODO - Two-Level Nested Collapsible for Purchase Products

## Steps

- [x] Step 1: Analyze current codebase (purchaseDetails.jsx, purchase.jsx, table.jsx)
- [x] Step 2: Plan and confirm with user
- [x] Step 3: Add `expandedColorGroups` state
- [x] Step 4: Replace products rendering with two-level collapsible (Mother: product_name, Child: color)
- [x] Step 5: Verify changes are complete

## Implementation Details

### File to edit:
- `resources/js/pages/Purchase/purchaseDetails.jsx`

### Changes:
1. **State**: Add `expandedColorGroups` state for child-level collapse
2. **Mother Level (product_name)**: Group products by `product_name`. Each row shows product name, total qty across all colors/sizes, total line total. Has collapse toggle.
3. **Child Level (color)**: Within each expanded mother group, group by `color`. Each row shows color name, total qty, total line total. Has collapse toggle.
4. **Detail Rows**: Within each expanded color group, individual size rows with size, purchase price, qty, line total.

