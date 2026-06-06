import ProductSelect from '../ProductSelect';

export default function ProductSelections({
    form,
    onSelectChange,
    errors,
    brands,
    categories,
    fabrics,
    productFors,
    warehouses,
    seasons,
}) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ProductSelect
                id="product-brand"
                label="Brand"
                value={form.brand_id}
                options={brands}
                placeholder="Select a brand"
                onValueChange={(v) => onSelectChange('brand_id', v)}
                error={errors.brand_id}
            />

            <ProductSelect
                id="product-category"
                label="Category"
                value={form.category_id}
                options={categories}
                placeholder="Select a category"
                onValueChange={(v) => onSelectChange('category_id', v)}
            />

            <ProductSelect
                id="product-fabric"
                label="Fabric"
                value={form.fabric_id}
                options={fabrics}
                placeholder="Select a fabric"
                onValueChange={(v) => onSelectChange('fabric_id', v)}
                error={errors.fabric_id}
            />

            <ProductSelect
                id="product-gender"
                label="Product For"
                value={form.gender_id}
                options={productFors}
                placeholder="Select product for"
                onValueChange={(v) => onSelectChange('gender_id', v)}
                error={errors.gender_id}
            />

            <ProductSelect
                id="product-warehouse"
                label="Warehouse"
                value={form.warehouse_id}
                options={warehouses}
                placeholder="Select a warehouse"
                onValueChange={(v) => onSelectChange('warehouse_id', v)}
                error={errors.warehouse_id}
            />

            <ProductSelect
                id="product-season"
                label="Season"
                value={form.season_id}
                options={seasons}
                placeholder="Select a season"
                onValueChange={(v) => onSelectChange('season_id', v)}
            />
        </div>
    );
}