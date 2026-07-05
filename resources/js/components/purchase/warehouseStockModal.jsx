import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight, Palette } from 'lucide-react';
import { useState, useMemo, Fragment } from 'react';

export default function WarehouseStockModal({
    open,
    onOpenChange,
    warehouseName,
    rows = [],
}) {
    // Multi-level toggle state management
    const [expandedProducts, setExpandedProducts] = useState({}); // { [productName]: boolean }
    const [expandedColors, setExpandedColors] = useState({});   // { [productName + "||" + color]: boolean }

    // --- NESTED GROUP BY LOGIC (PRODUCT NAME -> COLOR) ---
    const groupedRows = useMemo(() => {
        const productGroups = {};

        rows.forEach((row) => {
            const pName = row.name;
            const color = row.color || 'N/A';

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

            productGroups[pName].totalStock += Number(row.available_stock ?? 0);
            productGroups[pName].colors[color].colorStock += Number(row.available_stock ?? 0);
            productGroups[pName].colors[color].items.push(row);
        });

        return Object.values(productGroups).map(group => ({
            ...group,
            colors: Object.values(group.colors).sort((a, b) => a.colorName.localeCompare(b.colorName))
        }));
    }, [rows]);

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

    return (
        // Changed max-w-5xl to max-w-7xl to widen the modal workspace
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[95vw] sm:max-w-7xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Warehouse Stock</AlertDialogTitle>
                    <AlertDialogDescription>
                        {warehouseName ? `Current stock for ${warehouseName}.` : 'Select a warehouse to view stock.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="max-h-[65vh] overflow-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">SL No.</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead className="text-right">Available Stock</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No product in stock.
                                    </TableCell>
                                </TableRow>
                            )}

                            {rows.length > 0 &&
                                groupedRows.map((group, groupIndex) => {
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
                                                <TableCell colSpan={2} className="text-xs text-muted-foreground italic">
                                                    {group.colors.length} Color Variant(s)
                                                </TableCell>
                                                <TableCell className="text-right font-bold">{group.totalStock}</TableCell>
                                                <TableCell></TableCell>
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
                                                            <TableCell className="text-xs text-muted-foreground italic">
                                                                {colorGroup.items.length} Size(s)
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">{colorGroup.colorStock}</TableCell>
                                                            <TableCell></TableCell>
                                                        </TableRow>

                                                        {/* LEVEL 3: Deepest Item Variations (Sizes & Prices) */}
                                                        {isColorExpanded && colorGroup.items.map((row, variantIndex) => (
                                                            <TableRow key={`${row.product_id}-${variantIndex}`} className="hover:bg-muted/10 border-l-4 border-l-primary/40 transition-colors">
                                                                <TableCell className="pl-12 text-xs text-muted-foreground/70">
                                                                    {groupIndex + 1}.{variantIndex + 1}
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground text-xs italic">{row.name}</TableCell>
                                                                <TableCell className="text-muted-foreground text-sm pl-6">{row.color || 'N/A'}</TableCell>
                                                                <TableCell className="font-medium">{row.size || 'N/A'}</TableCell>
                                                                <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                                                                    {Number(row.available_stock ?? 0)}
                                                                </TableCell>
                                                                <TableCell className="text-right font-mono text-sm">
                                                                    $ {Number(row.unit_price ?? 0).toFixed(2)}
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
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}