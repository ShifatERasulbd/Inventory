import Barcode from 'react-barcode';

/**
 * Cleans a string to only contain characters safe for CODE128 barcodes.
 * Keeps A-Z, 0-9, and dashes. Everything else is removed.
 */
function cleanPart(str) {
    return (str || '').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'X';
}

function findOptionLabel(options, value, labelKey, fallbackPrefix) {
    const match = (options || []).find((option) => String(option.id) === String(value));
    return match?.[labelKey] || `${fallbackPrefix}${value}`;
}

/**
 * Generates the barcode string for a single product variant.
 *
 * Format: {STYLE}-{REF}-{COLOR}-{FABRIC}-{SIZE}
 * Example: STNUMBER-REF001-BLACK-COTTON-L
 */
export function generateBarcodeValue({ styleNumber, colorName, fabricName, refNumber, sizeName }) {
    const style = cleanPart(styleNumber);
    const ref = cleanPart(refNumber);
    const color = cleanPart(colorName);
    const fabric = cleanPart(fabricName);
    const size = cleanPart(sizeName);
    return `${style}-${ref}-${color}-${fabric}-${size}`;
}

/**
 * Generates the full barcodes map for all color × size combinations.
 * Returns an object keyed by "{colorId}_{sizeId}".
 */
export function generateBarcodesMap({ styleNumber, colorIds, fabricId, refNumber, sizeIds, colors = [], fabrics = [], sizes = [] }) {
    const map = {};
    const validColors = (colorIds || []).filter(Boolean);
    const validSizes = (sizeIds || []).filter(Boolean);
    const fabricName = findOptionLabel(fabrics, fabricId, 'name', 'FABRIC');

    for (const colorId of validColors) {
        for (const sizeId of validSizes) {
            const key = `${colorId}_${sizeId}`;
            const colorName = findOptionLabel(colors, colorId, 'name', 'COLOR');
            const sizeName = findOptionLabel(sizes, sizeId, 'size', 'SIZE');

            map[key] = generateBarcodeValue({
                styleNumber,
                colorName,
                fabricName,
                refNumber,
                sizeName,
            });
        }
    }

    return map;
}

/**
 * Shows a preview grid of all barcodes that will be generated
 * for each color × size combination.
 */
export default function BarcodePreview({ styleNumber, colorIds, fabricId, refNumber, sizeIds, colors = [], fabrics = [], sizes = [] }) {
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
    const fabricName = findOptionLabel(fabrics, fabricId, 'name', 'FABRIC');

    for (const colorId of validColors) {
        for (const sizeId of validSizes) {
            const colorName = findOptionLabel(colors, colorId, 'name', 'COLOR');
            const sizeName = findOptionLabel(sizes, sizeId, 'size', 'SIZE');
            const value = generateBarcodeValue({ styleNumber, colorName, fabricName, refNumber, sizeName });
            combos.push({ colorId, sizeId, colorName, sizeName, value });
        }
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {combos.map(({ colorId, sizeId, colorName, sizeName, value }) => (
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
                    <p className="text-xs font-mono text-muted-foreground break-all text-center">{value}</p>
                </div>
            ))}
        </div>
    );
}
