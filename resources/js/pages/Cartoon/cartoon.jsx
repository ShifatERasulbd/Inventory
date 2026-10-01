import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { CartoonTable } from '@/components/cartoon/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import Barcode from 'react-barcode';
import JsBarcode from 'jsbarcode';

import {
  adjustCartoonQuantity,
  assignCartoonRack,
  deleteCartoon,
  fetchCartoons,
  fetchRackColumns,
  fetchRackRows,
  fetchRacks,
} from './api';

function getBarcodeWidth(value) {
  const length = value?.length || 0;

  if (length >= 30) {
    return 0.65;
  }

  if (length >= 24) {
    return 0.8;
  }

  if (length >= 18) {
    return 0.95;
  }

  return 1.15;
}

function getPrintBarcodeWidth(value) {
  const length = value?.length || 0;

  if (length >= 30) {
    return 1;
  }

  if (length >= 24) {
    return 1.2;
  }

  if (length >= 18) {
    return 1.5;
  }

  return 1.8;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanBarcodeValue(value) {
  const normalized = String(value ?? '').trim();
  return normalized === '' ? 'NA' : normalized;
}

function renderBarcodeSvgMarkup(value, { width, height, fontSize }) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, value, {
    format: 'CODE128',
    width,
    height,
    fontSize,
    margin: 0,
    displayValue: true,
  });
  return svg.outerHTML;
}

function normalizeBarcode(value) {
  return String(value ?? '').trim().toLowerCase();
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XXXL', '4XL', 'XXXXL'];

function getSizeRank(sizeLabel) {
  const normalized = String(sizeLabel ?? '').trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalized);
  return index === -1 ? SIZE_ORDER.length : index;
}

function getProductBarcodeGroups(value, purchaseProducts = []) {
  const codes = Array.isArray(value) ? value : (value != null ? [value] : []);
  const counts = codes.reduce((result, code) => {
    const normalized = String(code ?? '').trim();
    if (!normalized) {
      return result;
    }

    result[normalized] = (result[normalized] ?? 0) + 1;
    return result;
  }, {});

  const sizeByBarcode = new Map();
  (Array.isArray(purchaseProducts) ? purchaseProducts : []).forEach((product) => {
    const barcode = String(product?.barcode ?? '').trim();
    if (barcode && !sizeByBarcode.has(barcode)) {
      sizeByBarcode.set(barcode, product?.size ?? '');
    }
  });

  return Object.entries(counts)
    .map(([code, quantity]) => ({ code, quantity, size: sizeByBarcode.get(code) ?? '' }))
    .sort((a, b) => {
      const rankDiff = getSizeRank(a.size) - getSizeRank(b.size);
      if (rankDiff !== 0) {
        return rankDiff;
      }
      return a.code.localeCompare(b.code);
    });
}

function getProductSummaryLines(cartoon) {
  const purchaseProducts = Array.isArray(cartoon?.purchase?.products) ? cartoon.purchase.products : [];
  const scannedCodes = getProductBarcodeGroups(cartoon?.product_code, purchaseProducts).map((group) => group.code);

  const seen = new Set();
  const lines = [];

  purchaseProducts.forEach((product) => {
    const barcode = String(product?.barcode ?? '').trim();
    if (!barcode || !scannedCodes.includes(barcode)) {
      return;
    }

    const label = [product?.style_number, product?.product_name, product?.color]
      .map((part) => String(part ?? '').trim())
      .filter(Boolean)
      .join('- ');

    if (label && !seen.has(label)) {
      seen.add(label);
      lines.push(label);
    }
  });

  return lines;
}

function extractApiErrorMessage(error, fallbackMessage) {
  const detail = error?.payload?.errors;

  if (detail?.product_code?.[0]) {
    return String(detail.product_code[0]);
  }

  if (detail?.barcode?.[0]) {
    return String(detail.barcode[0]);
  }

  return error?.message || fallbackMessage;
}

function extractInvalidBarcodesFromMessage(message) {
  const text = String(message || '');
  const separatorIndex = text.indexOf(':');

  if (separatorIndex < 0) {
    return [];
  }

  const listText = text.slice(separatorIndex + 1);
  return listText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Cartoon() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const barcodePrintSourceRef = useRef(null);
  const [cartoons, setCartoons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [cartoonToDelete, setCartoonToDelete] = useState(null);
  const [barcodeCartoon, setBarcodeCartoon] = useState(null);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState('add');
  const [adjustCartoonTarget, setAdjustCartoonTarget] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [scannedCodes, setScannedCodes] = useState([]);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [assignCartoonTarget, setAssignCartoonTarget] = useState(null);
  const [racks, setRacks] = useState([]);
  const [rackRows, setRackRows] = useState([]);
  const [rackColumns, setRackColumns] = useState([]);
  const [selectedRackId, setSelectedRackId] = useState('');
  const [selectedRackRowId, setSelectedRackRowId] = useState('');
  const [selectedRackColumnId, setSelectedRackColumnId] = useState('');
  const [isAssigningRack, setIsAssigningRack] = useState(false);
  const allCartoonsFetched = useRef(false);

    useEffect(() => {
    setPageTitle('Cartons');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadCartoons() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const payload = await fetchCartoons({ page: 1, per_page: 999999 });
        if (!ignore) {
          setCartoons(Array.isArray(payload.data) ? payload.data : []);
          allCartoonsFetched.current = true;
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Cartons.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (!allCartoonsFetched.current) {
      loadCartoons();
    }

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!cartoonToDelete) {
      return;
    }

    const id = cartoonToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteCartoon(id);
      setCartoons((previous) => (Array.isArray(previous) ? previous : []).filter((cartoon) => cartoon.id !== id));
      toast.success('Carton deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setCartoonToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Carton.';
      setErrorMessage(message);
      toast.error(message, {
        style: { color: '#dc2626' },
      });
    } finally {
      setDeletingId(null);
    }
  };

  const openAdjustDialog = (mode, cartoon) => {
    setAdjustMode(mode);
    setAdjustCartoonTarget(cartoon);
    setCodeInput('');
    setScannedCodes([]);
    setErrorMessage('');
    setIsAdjustDialogOpen(true);
  };

  const handleCodeScan = () => {
    const normalized = codeInput.trim();
    if (!normalized) return;

    const allowedBarcodes = Array.isArray(adjustCartoonTarget?.purchase?.products)
      ? adjustCartoonTarget.purchase.products
          .flatMap((item) => [item?.barcode, item?.sku])
          .map((value) => String(value ?? '').trim())
          .filter(Boolean)
      : [];

    const allowedBarcodeSet = new Set(allowedBarcodes.map(normalizeBarcode));

    if (allowedBarcodeSet.size > 0 && !allowedBarcodeSet.has(normalizeBarcode(normalized))) {
      const message = 'The Scanned Product does not Match with the Purchase Order Product. Please Scan the correct product.';
      setErrorMessage(message);
      toast.error(message, { style: { color: '#dc2626' } });
      setCodeInput('');
      return;
    }

    setErrorMessage('');
    setScannedCodes((previous) => [...previous, normalized]);
    setCodeInput('');
  };

  const handleConfirmAdjustQuantity = async () => {
    if (scannedCodes.length === 0) {
      setErrorMessage(adjustMode === 'add' ? 'Scan at least one code before adding.' : 'Scan at least one code before deducting.');
      return;
    }

    const targetCartoon = cartoons.find((c) => c.id === adjustCartoonTarget?.id);
    if (!targetCartoon) {
      setErrorMessage('Carton not found. Please try again.');
      return;
    }

    if (adjustMode === 'deduct' && scannedCodes.length > Number(targetCartoon.quantity ?? 0)) {
      setErrorMessage('Deducted quantity cannot exceed current quantity.');
      return;
    }

    setIsAdjusting(true);
    setErrorMessage('');

    try {
      const updated = await adjustCartoonQuantity(targetCartoon.id, {
        product_code: scannedCodes,
        adjust_mode: adjustMode,
      });

      setCartoons((previous) =>
        previous.map((cartoon) => (cartoon.id === updated.id ? updated : cartoon))
      );

      toast.success(adjustMode === 'add' ? 'Quantity added successfully.' : 'Quantity deducted successfully.', {
        style: { color: '#16a34a' },
      });

      setIsAdjustDialogOpen(false);
      setAdjustCartoonTarget(null);
      setScannedCodes([]);
      setCodeInput('');
    } catch (error) {
      const message = extractApiErrorMessage(error, 'Failed to update quantity.');
      setErrorMessage(message);

      const invalidCodes = extractInvalidBarcodesFromMessage(message);
      if (invalidCodes.length > 0) {
        const invalidSet = new Set(invalidCodes.map((code) => code.trim()));
        setScannedCodes((previous) => previous.filter((code) => !invalidSet.has(String(code).trim())));
      }

      toast.error(message, { style: { color: '#dc2626' } });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handlePrintBarcode = () => {
    if (!barcodeCartoon || !barcodePrintSourceRef.current) {
      return;
    }

    const cartoonNumber = cleanBarcodeValue(barcodeCartoon.cartoon_number);

    const barcodeMarkup = barcodePrintSourceRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=420,height=640');

    if (!printWindow) {
      toast.error('Unable to open print window. Please allow popups and try again.', {
        style: { color: '#dc2626' },
      });
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(cartoonNumber)}</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html, body {
              margin: 0;
              padding: 0;
              width: 4in;
              height: 6in;
              font-family: Arial, sans-serif;
              background: #ffffff;
              overflow: hidden;
            }

            .print-sheet {
              width: 4in;
              height: 6in;
              padding: 0.15in;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .barcode-card {
              width: 100%;
              text-align: center;
              transform-origin: center center;
            }

            .barcode-card h1 {
              margin: 0 0 4px;
              font-size: 21px;
            }

            .barcode-card p {
              margin: 0 0 8px;
              color: #52525b;
              font-size: 11px;
            }

            .barcode-wrap svg {
              display: block;
              max-width: 100%;
              height: auto;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-sheet">
            <div class="barcode-card" id="barcode-card">
              <h1>${escapeHtml(cartoonNumber)}</h1>
              <p></p>
              <div class="barcode-wrap">${barcodeMarkup}</div>
            </div>
          </div>
          <script>
            (function () {
              function scaleToFit() {
                var sheet = document.querySelector('.print-sheet');
                var card = document.getElementById('barcode-card');
                if (!sheet || !card) { return; }
                card.style.transform = 'none';
                var scale = Math.min(
                  sheet.clientHeight / card.scrollHeight,
                  sheet.clientWidth / card.scrollWidth,
                  1
                ) * 0.97;
                card.style.transform = 'scale(' + scale + ')';
              }

              window.onload = function () {
                scaleToFit();
                window.print();
                window.close();
              };
            })();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  const handlePrintSelectedCartons = (selectedCartons) => {
    if (!Array.isArray(selectedCartons) || selectedCartons.length === 0) {
      toast.error('Please select at least one carton to print.', {
        style: { color: '#dc2626' },
      });
      return;
    }

    const printWindow = window.open('', '_blank', 'width=420,height=640');

    if (!printWindow) {
      toast.error('Unable to open print window. Please allow popups and try again.', {
        style: { color: '#dc2626' },
      });
      return;
    }

    const pagesMarkup = selectedCartons
      .map((cartoon) => {
        const cartoonNumber = cleanBarcodeValue(cartoon.cartoon_number);
        const barcodeMarkup = renderBarcodeSvgMarkup(cartoonNumber, {
          width: getPrintBarcodeWidth(cartoonNumber),
          height: 70,
          fontSize: 13,
        });
        const poNumber = cleanBarcodeValue(cartoon.purchase?.po_number ?? cartoon.p_o_number);
        const productLines = getProductSummaryLines(cartoon);
        const productGroups = getProductBarcodeGroups(cartoon.product_code, cartoon.purchase?.products);
        const quantity = cleanBarcodeValue(String(cartoon.quantity ?? 0));

        return `
          <div class="print-sheet">
            <div class="barcode-card" id="barcode-card">
              <h1>${escapeHtml(cartoonNumber)}</h1>
              <div class="section-title">Carton Number</div>
              <div class="barcode-wrap">${barcodeMarkup}</div>
              <div class="section-title">Purchase Order Number</div>
              <div class="section-value">${escapeHtml(poNumber)}</div>
              <div class="section-title">Product List</div>
              ${productLines.map((label) => `<div class="product-line">${escapeHtml(label)}</div>`).join('')}
              ${productGroups
                .map((group) => `<div class="product-code">${escapeHtml(cleanBarcodeValue(group.code))} &mdash; Qty: ${group.quantity}</div>`)
                .join('')}
              <div class="section-title">Total Quantity</div>
              <div class="section-value">${escapeHtml(quantity)}</div>
            </div>
          </div>
        `;
      })
      .join('');

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carton Stickers</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html, body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #ffffff;
            }

            .print-sheet {
              width: 4in;
              height: 6in;
              padding: 0.15in;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              overflow: hidden;
            }

            .print-sheet:last-child {
              page-break-after: auto;
            }

            .barcode-card {
              width: 100%;
              text-align: center;
              transform-origin: center center;
            }

            .barcode-card h1 {
              margin: 0 0 4px;
              font-size: 21px;
            }

            .section-title {
              margin-top: 10px;
              font-size: 13px;
              font-weight: 600;
              text-transform: uppercase;
              color: #000;
            }

            .section-value {
              margin-top: 4px;
              font-size: 11px;
              color: #52525b;
              word-break: break-all;
            }

            .product-line {
              margin-top: 8px;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              color: #000;
              word-break: break-all;
            }

            .product-code {
              margin-top: 4px;
              font-size: 13px;
              color: #000;
              word-break: break-all;
            }

            .barcode-wrap svg {
              display: block;
              margin: 0 auto;
              max-width: 100%;
              height: auto;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${pagesMarkup}
          <script>
            (function () {
              function scaleToFit() {
                document.querySelectorAll('.print-sheet').forEach(function (sheet) {
                  var card = sheet.querySelector('.barcode-card');
                  if (!card) { return; }
                  card.style.transform = 'none';
                  var scale = Math.min(
                    sheet.clientHeight / card.scrollHeight,
                    sheet.clientWidth / card.scrollWidth,
                    1
                  ) * 0.97;
                  card.style.transform = 'scale(' + scale + ')';
                });
              }

              window.onload = function () {
                scaleToFit();
                window.print();
                window.close();
              };
            })();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  const openAssignRackDialog = async (cartoon) => {
    if (String(cartoon?.purchase?.status ?? '').toLowerCase() !== 'received') {
      toast.error('Rack can be assigned only when purchase status is received.', {
        style: { color: '#dc2626' },
      });
      return;
    }

    setAssignCartoonTarget(cartoon);
    setSelectedRackId('');
    setSelectedRackRowId('');
    setSelectedRackColumnId('');
    setRackRows([]);
    setRackColumns([]);

    try {
      const rackData = await fetchRacks();
      setRacks(Array.isArray(rackData) ? rackData : []);
    } catch (error) {
      setRacks([]);
      toast.error(error.message || 'Failed to load racks.', {
        style: { color: '#dc2626' },
      });
    }
  };

  const handleRackChange = async (value) => {
    setSelectedRackId(value);
    setSelectedRackRowId('');
    setSelectedRackColumnId('');

    if (!value) {
      setRackRows([]);
      setRackColumns([]);
      return;
    }

    try {
      const [rows, columns] = await Promise.all([
        fetchRackRows(value),
        fetchRackColumns(value),
      ]);
      setRackRows(Array.isArray(rows) ? rows : []);
      setRackColumns(Array.isArray(columns) ? columns : []);
    } catch (error) {
      setRackRows([]);
      setRackColumns([]);
      toast.error(error.message || 'Failed to load rack rows.', {
        style: { color: '#dc2626' },
      });
    }
  };

  const handleRackRowChange = (value) => {
    setSelectedRackRowId(value);
    setSelectedRackColumnId('');
  };

  const handleRackColumnChange = (value) => {
    setSelectedRackColumnId(value);
  };

  const handleAssignRack = async () => {
    if (!assignCartoonTarget?.id) {
      return;
    }

    if (!selectedRackId) {
      toast.error('Please select a rack first.', {
        style: { color: '#dc2626' },
      });
      return;
    }

    setIsAssigningRack(true);
    try {
      const updated = await assignCartoonRack(assignCartoonTarget.id, {
        rack_id: Number(selectedRackId),
        ...(selectedRackRowId ? { rack_row_id: Number(selectedRackRowId) } : {}),
        ...(selectedRackColumnId ? { rack_column_id: Number(selectedRackColumnId) } : {}),
      });

      setCartoons((previous) => previous.map((cartoon) => (
        cartoon.id === updated.id ? updated : cartoon
      )));

      toast.success('Carton assigned to rack successfully.', {
        style: { color: '#16a34a' },
      });

      setAssignCartoonTarget(null);
      setSelectedRackId('');
      setSelectedRackRowId('');
      setSelectedRackColumnId('');
      setRackRows([]);
      setRackColumns([]);
    } catch (error) {
      toast.error(error.message || 'Failed to assign rack.', {
        style: { color: '#dc2626' },
      });
    } finally {
      setIsAssigningRack(false);
    }
  };

  const destinationRacks = racks.filter((rack) => (
    Number(rack?.warehouse_id ?? 0) === Number(assignCartoonTarget?.warehouse_id ?? 0)
  ));

    return (
    <div className="space-y-5">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <CartoonTable
                cartoons={cartoons}
                onAdd={() => navigate('/cartoons/add')}
                onAddQuantity={(cartoon) => openAdjustDialog('add', cartoon)}
                onDeductQuantity={(cartoon) => openAdjustDialog('deduct', cartoon)}
                onAssignRack={openAssignRackDialog}
                onViewBarcode={(cartoon) => setBarcodeCartoon(cartoon)}
                onEdit={(id) => navigate(`/cartoons/${id}/edit`)}
                onRequestDelete={setCartoonToDelete}
                deletingId={deletingId}
                isLoading={isLoading}
                onViewPurchaseDetails={(purchaseId) => navigate(`/purchases/${purchaseId}`)}
                onPrintSelectedCartons={handlePrintSelectedCartons}
                />
            </div>

            <AlertDialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{adjustMode === 'add' ? 'Add Quantity' : 'Deduct Quantity'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {adjustMode === 'add'
                                ? `Increase quantity for ${adjustCartoonTarget?.cartoon_number || ''}.`
                                : `Deduct quantity for ${adjustCartoonTarget?.cartoon_number || ''}.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Carton</Label>
                            <p className="rounded-md border bg-muted px-3 py-2 text-sm">
                                {adjustCartoonTarget?.cartoon_number || 'N/A'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code_input">Scan Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="code_input"
                                    value={codeInput}
                                    onChange={(event) => setCodeInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleCodeScan();
                                        }
                                    }}
                                    placeholder="Scan or type code"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleCodeScan}
                                    className="shrink-0 rounded-md border bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Add
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Scanned: <span className="font-semibold text-foreground">{scannedCodes.length}</span>
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isAdjusting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAdjustQuantity}
                            disabled={isAdjusting || !adjustCartoonTarget || scannedCodes.length === 0}
                        >
                            {isAdjusting ? 'Saving...' : adjustMode === 'add' ? 'Add Quantity' : 'Deduct Quantity'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

             <AlertDialog open={Boolean(barcodeCartoon)} onOpenChange={(open) => !open && setBarcodeCartoon(null)}>
              <AlertDialogContent className="max-w-[95vw] sm:max-w-3xl flex flex-col max-h-[85vh]">
                
                {/* Pinned Header */}
                <AlertDialogHeader className="pb-2">
                  <AlertDialogTitle>Carton Barcode</AlertDialogTitle>
                  <AlertDialogDescription>
                    {barcodeCartoon?.cartoon_number || 'Selected carton'}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Scrollable Barcode Body */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-center border rounded-md p-4 bg-muted/10">
                  {barcodeCartoon?.cartoon_number ? (
                    <>
                      {/* 1. Cartoon Number */}
                      <div className="rounded-md border p-3 bg-background">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Carton Number</p>
                        <div className="mx-auto flex justify-center bg-white mt-3">
                          <Barcode
                            value={cleanBarcodeValue(barcodeCartoon.cartoon_number)}
                            format="CODE128"
                            width={getBarcodeWidth(cleanBarcodeValue(barcodeCartoon.cartoon_number))}
                            height={72}
                            fontSize={14}
                            margin={0}
                            displayValue
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground break-all">{cleanBarcodeValue(barcodeCartoon.cartoon_number)}</p>
                      </div>

                      {/* 2. Purchase Order Number */}
                      <div className="rounded-md border p-3 bg-background">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Purchase Order Number</p>
                        <p className="mt-2 text-xs text-muted-foreground break-all">
                          {cleanBarcodeValue(barcodeCartoon.purchase?.po_number ?? barcodeCartoon.p_o_number)}
                        </p>
                      </div>

                      {/* 3. Product List*/}
                              <div className="rounded-md border p-3 bg-background mt-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Product List</p>
                        {getProductSummaryLines(barcodeCartoon).map((label) => (
                          <p key={label} className="mb-2 text-xs font-semibold text-foreground">{label}</p>
                        ))}
                        {getProductBarcodeGroups(barcodeCartoon.product_code, barcodeCartoon.purchase?.products).map((group) => (
                          <div key={group.code} className="mb-4 last:mb-0">
                            <p className="mt-2 text-xs text-muted-foreground break-all">
                              {cleanBarcodeValue(group.code)}
                            </p>
                            <p className="text-xs text-muted-foreground">Quantity: {group.quantity}</p>
                          </div>
                        ))}
                      </div>

                      {/* 4. Quantity */}
                     <div className="rounded-md border p-3 bg-background">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Quantity</p>
                        <p className="mt-2 text-xs text-muted-foreground break-all">
                          {cleanBarcodeValue(String(barcodeCartoon.quantity ?? 0))}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground py-8">No barcode is available for this carton.</p>
                  )}
                </div>

                {/* Pinned Footer */}
                <AlertDialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="default"
                    onClick={handlePrintBarcode}
                    disabled={!barcodeCartoon?.cartoon_number}
                    className="sm:mr-auto"
                  >
                    Print
                  </Button>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>

              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={Boolean(cartoonToDelete)} onOpenChange={(open) => !open && setCartoonToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Carton</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete {cartoonToDelete?.name}? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                    variant="destructive"
                    disabled={deletingId !== null}
                    onClick={handleConfirmDelete}
                    >
                    {deletingId !== null ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={Boolean(assignCartoonTarget)}
              onOpenChange={(open) => {
                if (!open) {
                  setAssignCartoonTarget(null);
                  setSelectedRackId('');
                  setSelectedRackRowId('');
                  setSelectedRackColumnId('');
                  setRackRows([]);
                  setRackColumns([]);
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Assign Carton To Rack</AlertDialogTitle>
                  <AlertDialogDescription>
                    Assign rack for carton {assignCartoonTarget?.cartoon_number || ''}.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rack</Label>
                    <Select value={selectedRackId} onValueChange={handleRackChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a rack" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinationRacks.map((rack) => (
                          <SelectItem key={rack.id} value={String(rack.id)}>
                            {rack.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {destinationRacks.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No racks are available in this warehouse.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Rack Row (Optional)</Label>
                    <Select value={selectedRackRowId} onValueChange={handleRackRowChange} disabled={!selectedRackId}>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedRackId ? 'Select a rack row' : 'Select a rack first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {rackRows.map((row) => (
                          <SelectItem key={row.id} value={String(row.id)}>
                            Row {row.row_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Column (Optional)</Label>
                    <Select
                      value={selectedRackColumnId}
                      onValueChange={handleRackColumnChange}
                      disabled={!selectedRackRowId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedRackRowId ? 'Select a column' : 'Select a rack row first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {rackColumns
                          .filter((column) => String(column.row_id) === String(selectedRackRowId))
                          .map((column) => (
                            <SelectItem key={column.id} value={String(column.id)}>
                              Column {column.column_number}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isAssigningRack}>Cancel</AlertDialogCancel>
                  <Button type="button" onClick={handleAssignRack} disabled={isAssigningRack}>
                    {isAssigningRack ? 'Assigning...' : 'Assign Rack'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0" aria-hidden="true">
              <div ref={barcodePrintSourceRef} className="bg-white p-2">
                {barcodeCartoon?.cartoon_number ? (
                  <div>
                    <div style={{ marginBottom: '6px', textAlign: 'center', fontSize: '24px', fontWeight: 700, color: '#000' }}>
                      {cleanBarcodeValue(barcodeCartoon.cartoon_number)}
                    </div>
                    <div style={{ marginBottom: '10px', textAlign: 'center', fontSize: '20px', fontWeight: 600, color: '#000',textTransform: 'uppercase' }}>Carton Number</div>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                      <Barcode
                        value={cleanBarcodeValue(barcodeCartoon.cartoon_number)}
                        format="CODE128"
                        width={getPrintBarcodeWidth(cleanBarcodeValue(barcodeCartoon.cartoon_number))}
                        height={70}
                        fontSize={13}
                        margin={0}
                        displayValue
                      />
                    </div>

                    <div style={{ marginTop:'25px',marginBottom: '10px', textAlign: 'center', fontSize: '20px', fontWeight: 600, color: '#000', textTransform: 'uppercase' }}>Purchase Order Number</div>
                    <div style={{ marginBottom: '10px', textAlign: 'center', fontSize: '16px',fontWeight: 600, color: '#000' }}>
                      {cleanBarcodeValue(barcodeCartoon.purchase?.po_number ?? barcodeCartoon.p_o_number)}
                    </div>

                    <div style={{ marginTop:'25px', marginBottom: '10px', textAlign: 'center', fontSize: '20px', fontWeight: 600, color: '#000', textTransform: 'uppercase' }}>Product List</div>
                    {getProductSummaryLines(barcodeCartoon).map((label) => (
                      <div key={label} style={{ marginBottom: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#000', textTransform: 'uppercase' }}>
                        {label}
                      </div>
                    ))}
                    {getProductBarcodeGroups(barcodeCartoon.product_code, barcodeCartoon.purchase?.products).map((group) => (
                      <div key={group.code} style={{ marginBottom: '10px', textAlign: 'center', fontSize: '16px', color: '#000',textTransform: 'uppercase' }}>
                        {cleanBarcodeValue(group.code)} — Qty: {group.quantity}
                      </div>
                    ))}

                    <div style={{ marginTop: '15px', marginBottom: '10px', textAlign: 'center', fontSize: '20px', fontWeight: 600, color: '#000',textTransform: 'uppercase' }}>Total Quantity</div>
                    <div style={{ marginBottom: '10px', textAlign: 'center', fontSize: '16px', color: '#000' }}>
                      {cleanBarcodeValue(String(barcodeCartoon.quantity ?? 0))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

    </div>
    );
}