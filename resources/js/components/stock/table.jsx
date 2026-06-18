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
import { Plus, Search, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    savingSellingPriceIds = [],
    onSellingPriceChange,
    onSaveSellingPrice,
}) {
    const [search, setSearch] = useState('');
    const [activeBrand, setActiveBrand] = useState('all');
    const { user } = useAppContext();
    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');

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

    const designatedBrandMap = stocks.reduce((accumulator, stock) => {
        getDesignatedBrands(stock).forEach((brand) => {
            if (!accumulator[brand.value]) {
                accumulator[brand.value] = brand;
            }
        });

        return accumulator;
    }, {});

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
                : String(
                    designatedBrandMap[key]?.label
                    || stock.brand_name
                    || `Brand #${key}`
                );

            if (!accumulator[key]) {
                accumulator[key] = {
                    value: key,
                    label,
                    count: 0,
                };
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

    useEffect(() => {
        const hasActiveBrand = activeBrand === 'all' || brandTabs.some((tab) => tab.value === activeBrand);
        if (!hasActiveBrand) {
            setActiveBrand('all');
        }
    }, [activeBrand, brandTabs]);

    const filtered = stocks.filter((stock) => {
        const query = search.toLowerCase();
        const brandKeys = resolveStockBrandKeys(stock);
        const matchesBrand = activeBrand === 'all' || brandKeys.includes(activeBrand);

        if (!matchesBrand) {
            return false;
        }

        return (
            stock.name?.toLowerCase().includes(query) ||
            String(stock.size ?? '').toLowerCase().includes(query) ||
            String(stock.color_variant ?? '').toLowerCase().includes(query)
        );
    });

    const columnCount = isSuperAdmin ? 10 : 9;

    return (
        <>
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

            <div className="overflow-x-auto">
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

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SL No.</TableHead>
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

                        {!isLoading && filtered.length === 0 && stocks.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                                    No products match your current brand/search filters.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            filtered.map((stock, index) => (
                                <TableRow key={stock.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{stock.name}</TableCell>
                                    <TableCell>{stock.color_variant || 'N/A'}</TableCell>
                                    <TableCell>{stock.size || 'N/A'}</TableCell>
                                    {isSuperAdmin && <TableCell>{stock.warehouse_name || `Warehouse #${stock.warehouse_id ?? 'N/A'}`}</TableCell>}
                                    <TableCell>{resolveStockBrandLabel(stock)}</TableCell>
                                    <TableCell>{Number(stock.available_stock ?? 0)}</TableCell>
                                    <TableCell>$ {Number(stock.buying_price ?? 0).toFixed(2)}</TableCell>
                                   <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    $
                                                </span>

                                                <Input
                                                    className="h-8 w-24 pl-7"
                                                    inputMode="decimal"
                                                    value={String(sellingPriceDrafts[stock.id] ?? stock.selling_price ?? 0)}
                                                    onChange={(event) => onSellingPriceChange?.(stock.id, event.target.value)}
                                                />
                                            </div>

                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => onSaveSellingPrice?.(stock)}
                                                disabled={savingSellingPriceIds.includes(stock.id)}
                                            >
                                                {savingSellingPriceIds.includes(stock.id) ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                          <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Add stock for ${stock.name}`}
                                                            onClick={() => onAddStock(stock)}
                                                        >
                                                            <Plus />
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
                                                            aria-label={`Deduct stock for ${stock.name}`}
                                                            onClick={() => onDeductStock(stock)}
                                                        >
                                                            <Minus />
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
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}