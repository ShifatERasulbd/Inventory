import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Search, Minus, ChevronDown, ChevronRight, Palette } from 'lucide-react';
import { useEffect, useState, useMemo, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';

export function StockTable({
    stocks = [],
    onAddStock,
    onDeductStock,
    isLoading,
    sellingPriceDrafts = {},
    buyingPriceDrafts = {},
    savingSellingPriceIds = [],
    onSellingPriceChange,
    onBuyingPriceChange,
    onSaveSellingPrice,
}) {
    const [search, setSearch] = useState('');
    const [activeBrand, setActiveBrand] = useState('all');
    const [activeWarehouse, setActiveWarehouse] = useState('all');
    
    // Multi-level toggle state management
    const [expandedProducts, setExpandedProducts] = useState({}); // { [productName]: boolean }
    const [expandedColors, setExpandedColors] = useState({});   // { [productName + "||" + color]: boolean }
    
    const { user } = useAppContext();
    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');
    const assignedWarehouses = Array.isArray(user?.warehouses) ? user.warehouses : [];

    const getDesignatedBrands = (stock) => {
        const ids = Array.isArray(stock?.warehouse_brand_ids) ? stock.warehouse_brand_ids : [];
        const names = Array.isArray(stock?.warehouse_brand_names) ? stock.warehouse_brand_names : [];

        return ids
            .map((id, index) => {
                const parsedId = Number(id);
                if (!Number.isInteger(parsedId) || parsedId <= 0) {
                    return null;
                }

                return {
                    value: String(parsedId),
                    label: String(names[index] || `Brand #${parsedId}`),
                };
            })
            .filter(Boolean);
    };

    const resolveStockBrandKeys = (stock) => {
        const rawBrandId = Number(stock?.brand_id);
        if (Number.isInteger(rawBrandId) && rawBrandId > 0) {
            return [String(rawBrandId)];
        }

        const designatedBrands = getDesignatedBrands(stock);
        if (designatedBrands.length > 0) {
            return designatedBrands.map((brand) => brand.value);
        }

        return ['none'];
    };

    const resolveStockBrandLabel = (stock) => {
        const rawBrandId = Number(stock?.brand_id);
        if (Number.isInteger(rawBrandId) && rawBrandId > 0) {
            return String(stock?.brand_name || `Brand #${rawBrandId}`);
        }

        const designatedBrands = getDesignatedBrands(stock);
        if (designatedBrands.length === 1) {
            return designatedBrands[0].label;
        }

        if (designatedBrands.length > 1) {
            return designatedBrands.map((brand) => brand.label).join(', ');
        }

        return 'Unassigned';
    };

    const isArbellaWarehouse = (stock) => String(stock?.warehouse_name ?? '').toLowerCase().includes('arbella');

    // --- BRAND LOGIC CONFIGURATION ---
    const designatedBrandMap = stocks.reduce((accumulator, stock) => {
        getDesignatedBrands(stock).forEach((brand) => {
            if (!accumulator[brand.value]) {
                accumulator[brand.value] = brand;
            }
        });
        return accumulator;
    }, {});

    assignedWarehouses.forEach((warehouse) => {
        const warehouseBrands = Array.isArray(warehouse?.brands) ? warehouse.brands : [];

        warehouseBrands.forEach((brand) => {
            const id = Number(brand?.id);
            if (!Number.isInteger(id) || id <= 0) {
                return;
            }

            const key = String(id);
            if (!designatedBrandMap[key]) {
                designatedBrandMap[key] = {
                    value: key,
                    label: String(brand?.name || `Brand #${id}`),
                };
            }
        });
    });

    const designatedBrandKeys = Object.keys(designatedBrandMap);
    const hasDesignatedBrands = designatedBrandKeys.length > 0;
    const restrictedBrandKeys = hasDesignatedBrands && !isSuperAdmin
        ? new Set(designatedBrandKeys)
        : null;

    const brandCounts = stocks.reduce((accumulator, stock) => {
        const keys = resolveStockBrandKeys(stock);
        keys.forEach((key) => {
            if (restrictedBrandKeys && !restrictedBrandKeys.has(key)) {
                return;
            }

            const label = key === 'none'
                ? 'Unassigned'
                : String(designatedBrandMap[key]?.label || stock.brand_name || `Brand #${key}`);

            if (!accumulator[key]) {
                accumulator[key] = { value: key, label, count: 0 };
            }
            accumulator[key].count += 1;
        });
        return accumulator;
    }, {});

    Object.values(designatedBrandMap).forEach((designatedBrand) => {
        if (!brandCounts[designatedBrand.value]) {
            brandCounts[designatedBrand.value] = {
                value: designatedBrand.value,
                label: designatedBrand.label,
                count: 0,
            };
        }
    });

    const visibleBrandEntries = Object.values(brandCounts)
        .filter((entry) => entry.value !== 'none' || !hasDesignatedBrands || isSuperAdmin)
        .sort((a, b) => a.label.localeCompare(b.label));

    const brandTabs = [{ value: 'all', label: 'All Brands', count: stocks.length }, ...visibleBrandEntries];

    // --- NEW WAREHOUSE TABS LOGIC ---
    const warehouseTabs = useMemo(() => {
        const warehouseMap = stocks.reduce((acc, stock) => {
            const id = stock.warehouse_id ? String(stock.warehouse_id) : 'unknown';
            const label = stock.warehouse_name || `Warehouse #${id}`;
            
            if (!acc[id]) {
                acc[id] = { value: id, label, count: 0 };
            }
            acc[id].count += 1;
            return acc;
        }, {});

        assignedWarehouses.forEach((warehouse) => {
            const id = Number(warehouse?.id);
            if (!Number.isInteger(id) || id <= 0) {
                return;
            }

            const key = String(id);
            if (!warehouseMap[key]) {
                warehouseMap[key] = {
                    value: key,
                    label: String(warehouse?.name || `Warehouse #${key}`),
                    count: 0,
                };
            }
        });

        const sortedWarehouses = Object.values(warehouseMap).sort((a, b) =>
            a.label.localeCompare(b.label)
        );

        return [{ value: 'all', label: 'All Warehouses', count: stocks.length }, ...sortedWarehouses];
    }, [stocks, assignedWarehouses]);

    // --- SYNC EFFECTS ---
    useEffect(() => {
        const hasActiveBrand = activeBrand === 'all' || brandTabs.some((tab) => tab.value === activeBrand);
        if (!hasActiveBrand) {
            setActiveBrand('all');
        }
    }, [activeBrand, brandTabs]);

    useEffect(() => {
        const hasActiveWarehouse = activeWarehouse === 'all' || warehouseTabs.some((tab) => tab.value === activeWarehouse);
        if (!hasActiveWarehouse) {
            setActiveWarehouse('all');
        }
    }, [activeWarehouse, warehouseTabs]);

    // --- COMBINED FILTER LOGIC ---
    const filtered = stocks.filter((stock) => {
        const query = search.toLowerCase();
        
        // 1. Brand Filter
        const brandKeys = resolveStockBrandKeys(stock);
        const matchesBrand = activeBrand === 'all' || brandKeys.includes(activeBrand);
        if (!matchesBrand) return false;

        // 2. Warehouse Filter
        const currentWarehouseId = stock.warehouse_id ? String(stock.warehouse_id) : 'unknown';
        const matchesWarehouse = activeWarehouse === 'all' || currentWarehouseId === activeWarehouse;
        if (!matchesWarehouse) return false;

        // 3. Search Field Filter
        return (
            stock.name?.toLowerCase().includes(query) ||
            String(stock.size ?? '').toLowerCase().includes(query) ||
            String(stock.color_variant ?? '').toLowerCase().includes(query)
        );
    });

    // --- NESTED GROUP BY LOGIC (PRODUCT NAME -> COLOR VARIANT) ---
    const groupedFilteredStocks = useMemo(() => {
        const productGroups = {};

        filtered.forEach((stock) => {
            const pName = stock.name;
            const color = stock.color_variant || 'N/A';

            if (!productGroups[pName]) {
                productGroups[pName] = {
                    productName: pName,
                    totalStock: 0,
                    colors: {},
                };
            }

            if (!productGroups[pName].colors[color]) {
                productGroups[pName].colors[color] = {
                    colorName: color,
                    colorStock: 0,
                    items: [],
                };
            }

            productGroups[pName].totalStock += Number(stock.available_stock ?? 0);
            productGroups[pName].colors[color].colorStock += Number(stock.available_stock ?? 0);
            productGroups[pName].colors[color].items.push(stock);
        });

        // Convert structures to arrays for cleaner rendering maps
        return Object.values(productGroups).map(group => ({
            ...group,
            colors: Object.values(group.colors).sort((a, b) => a.colorName.localeCompare(b.colorName))
        }));
    }, [filtered]);

    const toggleProductExpand = (productName) => {
        setExpandedProducts((prev) => ({
            ...prev,
            [productName]: !prev[productName],
        }));
    };

    const toggleColorExpand = (productName, colorName) => {
        const key = `${productName}||${colorName}`;
        setExpandedColors((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const columnCount = isSuperAdmin ? 10 : 9;

    return (
        <>
            {/* Search Input */}
            <div className="flex items-center gap-3 justify-between">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>
            </div>

            {/* Warehouse Filter Tabbing System */}
            <div className="overflow-x-auto space-y-2 mt-2">
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Warehouses</span>
                <div className="inline-flex min-w-full gap-2 pb-1">
                    {warehouseTabs.map((tab) => {
                        const isActive = activeWarehouse === tab.value;
                        return (
                            <Button
                                key={tab.value}
                                type="button"
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                className="whitespace-nowrap"
                                onClick={() => setActiveWarehouse(tab.value)}
                            >
                                {tab.label} ({tab.count})
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Brand Filter Tabbing System */}
            <div className="overflow-x-auto space-y-2 mt-2">
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Brands</span>
                <div className="inline-flex min-w-full gap-2 pb-1">
                    {brandTabs.map((tab) => {
                        const isActive = activeBrand === tab.value;
                        return (
                            <Button
                                key={tab.value}
                                type="button"
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                className="whitespace-nowrap"
                                onClick={() => setActiveBrand(tab.value)}
                            >
                                {tab.label} ({tab.count})
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Data Table */}
            <Card className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">SL No.</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Color Variant</TableHead>
                            <TableHead>Size</TableHead>
                            {isSuperAdmin && <TableHead>Warehouse Name</TableHead>}
                            <TableHead>Brand</TableHead>
                            <TableHead>Available Stock</TableHead>
                            <TableHead>Buying Price</TableHead>
                            <TableHead>Selling Price</TableHead>
                            <TableHead className="w-[160px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                                    Loading Stocks...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && stocks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                                    No stocks found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && groupedFilteredStocks.length === 0 && stocks.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                                    No products match your current warehouse/brand/search filters.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            groupedFilteredStocks.map((group, groupIndex) => {
                                const isProductExpanded = !!expandedProducts[group.productName];
                                return (
                                    <Fragment key={group.productName}>
                                        {/* LEVEL 1: Product Row */}
                                        <TableRow 
                                            className="cursor-pointer bg-muted/60 hover:bg-muted font-medium select-none"
                                            onClick={() => toggleProductExpand(group.productName)}
                                        >
                                            <TableCell className="font-bold flex items-center gap-2">
                                                {isProductExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                                                {groupIndex + 1}
                                            </TableCell>
                                            <TableCell className="font-bold text-primary">{group.productName}</TableCell>
                                            <TableCell colSpan={isSuperAdmin ? 4 : 3} className="text-xs text-muted-foreground italic">
                                                {group.colors.length} Color Group(s)
                                            </TableCell>
                                            <TableCell className="font-bold">{group.totalStock}</TableCell>
                                            <TableCell colSpan={3}></TableCell>
                                        </TableRow>

                                        {/* LEVEL 2: Color Variant Rows */}
                                        {isProductExpanded && group.colors.map((colorGroup) => {
                                            const colorKey = `${group.productName}||${colorGroup.colorName}`;
                                            const isColorExpanded = !!expandedColors[colorKey];
                                            
                                            return (
                                                <Fragment key={colorGroup.colorName}>
                                                    <TableRow 
                                                        className="cursor-pointer bg-muted/20 hover:bg-muted/40 select-none border-l-2 border-l-muted-foreground/30"
                                                        onClick={() => toggleColorExpand(group.productName, colorGroup.colorName)}
                                                    >
                                                        <TableCell className="pl-6 text-xs text-muted-foreground font-medium">
                                                            {isColorExpanded ? <ChevronDown className="h-3 w-3 inline mr-1" /> : <ChevronRight className="h-3 w-3 inline mr-1" />}
                                                            Color
                                                        </TableCell>
                                                        <TableCell></TableCell>
                                                        <TableCell className="font-medium flex items-center gap-1.5 text-secondary-foreground">
                                                            <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {colorGroup.colorName}
                                                        </TableCell>
                                                        <TableCell colSpan={isSuperAdmin ? 2 : 1} className="text-xs text-muted-foreground italic">
                                                            {colorGroup.items.length} Size(s) available
                                                        </TableCell>
                                                        <TableCell></TableCell>
                                                        <TableCell className="font-medium">{colorGroup.colorStock}</TableCell>
                                                        <TableCell colSpan={3}></TableCell>
                                                    </TableRow>

                                                    {/* LEVEL 3: Core Size and Variant Settings */}
                                                    {isColorExpanded && colorGroup.items.map((stock, variantIndex) => (
                                                        <TableRow key={stock.id} className="hover:bg-muted/10 border-l-4 border-l-primary/40 transition-colors">
                                                            <TableCell className="pl-12 text-xs text-muted-foreground/70">
                                                                {groupIndex + 1}.{variantIndex + 1}
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-xs italic">{stock.name}</TableCell>
                                                            <TableCell className="text-muted-foreground text-sm pl-6">{stock.color_variant || 'N/A'}</TableCell>
                                                            <TableCell className="font-medium">{stock.size || 'N/A'}</TableCell>
                                                            {isSuperAdmin && <TableCell className="text-xs">{stock.warehouse_name || `Warehouse #${stock.warehouse_id ?? 'N/A'}`}</TableCell>}
                                                            <TableCell className="text-xs">{resolveStockBrandLabel(stock)}</TableCell>
                                                            <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">{Number(stock.available_stock ?? 0)}</TableCell>
                                                            <TableCell>
                                                                {isArbellaWarehouse(stock) ? (
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                                                            $
                                                                        </span>
                                                                        <Input
                                                                            className="h-8 w-24 pl-6 text-xs"
                                                                            inputMode="decimal"
                                                                            value={String(buyingPriceDrafts[stock.id] ?? stock.buying_price ?? 0)}
                                                                            onChange={(event) => onBuyingPriceChange?.(stock.id, event.target.value)}
                                                                            disabled={Boolean(stock?.is_placeholder)}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs font-mono">$ {Number(stock.buying_price ?? 0).toFixed(2)}</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                                                            $
                                                                        </span>
                                                                        <Input
                                                                            className="h-8 w-24 pl-6 text-xs"
                                                                            inputMode="decimal"
                                                                            value={String(sellingPriceDrafts[stock.id] ?? stock.selling_price ?? 0)}
                                                                            onChange={(event) => onSellingPriceChange?.(stock.id, event.target.value)}
                                                                            disabled={Boolean(stock?.is_placeholder)}
                                                                        />
                                                                    </div>

                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        className="h-8 text-xs px-2.5"
                                                                        onClick={() => onSaveSellingPrice?.(stock)}
                                                                        disabled={savingSellingPriceIds.includes(stock.id) || Boolean(stock?.is_placeholder)}
                                                                    >
                                                                        {savingSellingPriceIds.includes(stock.id) ? 'Saving' : 'Save'}
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-7 w-7"
                                                                                    aria-label={`Add stock for ${stock.name}`}
                                                                                    onClick={() => onAddStock(stock)}
                                                                                    disabled={Boolean(stock?.is_placeholder)}
                                                                                >
                                                                                    <Plus className="h-3.5 w-3.5" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="bottom">
                                                                                <p>Add Stock</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                    
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-7 w-7"
                                                                                    aria-label={`Deduct stock for ${stock.name}`}
                                                                                    onClick={() => onDeductStock(stock)}
                                                                                    disabled={Boolean(stock?.is_placeholder)}
                                                                                >
                                                                                    <Minus className="h-3.5 w-3.5" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="bottom">
                                                                                <p>Deduct Stock</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </Fragment>
                                            );
                                        })}
                                    </Fragment>
                                );
                            })}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}