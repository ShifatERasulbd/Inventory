import Barcode from 'react-barcode';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Cleans a string to only contain characters safe for CODE128 barcodes.
 * Keeps A-Z, 0-9, and dashes. Everything else is removed.
 */
function cleanPart(str) {
    return (str || '').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'X';
}

function cleanColorPart(str) {
    const normalized = String(str || '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^A-Za-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return normalized || 'X';
}

function extractRefCode(refNumber) {
    const cleanedRef = cleanPart(refNumber);

    if (!cleanedRef || cleanedRef === 'X') {
        return '000';
    }

    return cleanedRef.slice(-3);
}

function extractStylenumber(styleNumber) {
    const cleanedStyle = cleanPart(styleNumber);

    if (!cleanedStyle || cleanedStyle === 'X') {
        return 'STYLE';
    }

    return cleanedStyle;
}

function findOptionLabel(options, value, labelKey, fallbackPrefix) {
    const match = (options || []).find((option) => String(option.id) === String(value));
    return match?.[labelKey] || `${fallbackPrefix}${value}`;
}

/**
 * Generates the barcode string for a single product variant.
 *
 * Format: {STYLE}-{REF}-{COLOR}-{SIZE}
 * Example: STYLE001-780-BLACK-L
 */
export function generateBarcodeValue({ styleNumber, colorCode, refNumber, sizeName }) {
    const style = extractStylenumber(styleNumber);
    const ref = extractRefCode(refNumber);
    const color = cleanColorPart(colorCode);
    const size = cleanPart(sizeName);
    return `${style}-${ref}-${color}-${size}`;
}

/**
 * Generates the full barcodes map for all color × size combinations.
 * Returns an object keyed by "{colorId}_{sizeId}".
 */
export function generateBarcodesMap({ styleNumber, colorIds, fabricId, refNumber, sizeIds, colors = [], fabrics = [], sizes = [] }) {
    const map = {};
    const validColors = (colorIds || []).filter(Boolean);
    const validSizes = (sizeIds || []).filter(Boolean);

    for (const colorId of validColors) {
        for (const sizeId of validSizes) {
            const key = `${colorId}_${sizeId}`;
            const colorName = findOptionLabel(colors, colorId, 'color_code', 'COLOR');
            const sizeName = findOptionLabel(sizes, sizeId, 'size', 'SIZE');

            map[key] = generateBarcodeValue({
                styleNumber,
                colorCode: colorName,
                refNumber,
                sizeName,
            });
        }
    }

    return map;
}

/**
 * Shows a preview grid of all barcodes that will be generated
 * for each color × size combination. When `editable` is true (i.e. the
 * current user has permission to edit products - super-admin or a role
 * granted "update-products"), each barcode value can be overridden manually;
 * otherwise it's a read-only preview of the auto-generated value.
 */
export default function BarcodePreview({
    styleNumber,
    colorIds,
    fabricId,
    refNumber,
    sizeIds,
    colors = [],
    fabrics = [],
    sizes = [],
    editable = false,
    overrides = {},
    onOverrideChange,
}) {
    const validColors = (colorIds || []).filter(Boolean);
    const validSizes = (sizeIds || []).filter(Boolean);

    const ready = styleNumber?.trim() && fabricId && validColors.length > 0 && validSizes.length > 0;

    if (!ready) {
        return (
            <p className="text-sm text-muted-foreground">
                Fill in Style Number, Colors, Fabric and Sizes to preview barcodes.
            </p>
        );
    }

    const combos = [];
    for (const colorId of validColors) {
        for (const sizeId of validSizes) {
            const key = `${colorId}_${sizeId}`;
            const colorName = findOptionLabel(colors, colorId, 'color_code', 'COLOR');
            const sizeName = findOptionLabel(sizes, sizeId, 'size', 'SIZE');
            const generatedValue = generateBarcodeValue({ styleNumber, colorCode: colorName, refNumber, sizeName });
            const overrideValue = overrides?.[key];
            const value = (typeof overrideValue === 'string' && overrideValue.trim()) ? overrideValue : generatedValue;
            combos.push({ key, colorId, sizeId, colorName, sizeName, generatedValue, overrideValue, value });
        }
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {combos.map(({ key, colorId, sizeId, colorName, sizeName, generatedValue, overrideValue, value }) => (
                <div
                    key={`${colorId}-${sizeId}`}
                    className="flex w-full flex-col rounded-md border bg-white p-3 text-center"
                >
                    <p className="text-xs font-medium text-foreground">
                        {colorName} / {sizeName}
                    </p>
                    <div className="w-full overflow-x-auto py-1">
                        <div className="mx-auto flex min-w-max justify-center">
                            <Barcode
                                value={value}
                                format="CODE128"
                                width={1}
                                height={50}
                                fontSize={10}
                                margin={4}
                            />
                        </div>
                    </div>
                    {editable ? (
                        <div className="mt-1 space-y-1 text-left">
                            <Label htmlFor={`barcode-${key}`} className="sr-only">
                                Barcode value for {colorName} / {sizeName}
                            </Label>
                            <Input
                                id={`barcode-${key}`}
                                value={overrideValue ?? generatedValue}
                                onChange={(event) => onOverrideChange?.(key, event.target.value)}
                                className="h-8 font-mono text-xs"
                                placeholder={generatedValue}
                            />
                            {overrideValue && overrideValue.trim() && overrideValue.trim() !== generatedValue && (
                                <button
                                    type="button"
                                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                                    onClick={() => onOverrideChange?.(key, '')}
                                >
                                    Reset to auto-generated ({generatedValue})
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs font-mono text-muted-foreground break-all text-center">{value}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
