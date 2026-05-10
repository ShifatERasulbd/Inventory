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

import {
  adjustCartoonQuantity,
  assignCartoonRack,
  deleteCartoon,
  fetchCartoons,
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
  const [selectedRackId, setSelectedRackId] = useState('');
  const [selectedRackRowId, setSelectedRackRowId] = useState('');
  const [isAssigningRack, setIsAssigningRack] = useState(false);

    useEffect(() => {
    setPageTitle('Cartoons');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadCartoons() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchCartoons();
        if (!ignore) {
          setCartoons(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Cartoons.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCartoons();

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
      toast.success('Cartoon deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setCartoonToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Cartoon.';
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
      setErrorMessage('Cartoon not found. Please try again.');
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
      const message = error.message || 'Failed to update quantity.';
      setErrorMessage(message);
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
    const poNumber = cleanBarcodeValue(barcodeCartoon.purchase?.po_number ?? barcodeCartoon.p_o_number);
    const quantity = cleanBarcodeValue(String(barcodeCartoon.quantity ?? 0));

    const barcodeMarkup = barcodePrintSourceRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=600');

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
          <title>Print Cartoon Barcode</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: #ffffff;
            }

            .print-sheet {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              box-sizing: border-box;
            }

            .barcode-card {
              width: 100%;
              max-width: 760px;
              border: 1px solid #d4d4d8;
              border-radius: 12px;
              padding: 24px;
              box-sizing: border-box;
              text-align: center;
            }

            .barcode-card h1 {
              margin: 0 0 8px;
              font-size: 24px;
            }

            .barcode-card p {
              margin: 0;
              color: #52525b;
            }

            .barcode-wrap {
              margin-top: 20px;
              display: flex;
              justify-content: center;
            }

            .barcode-wrap svg {
              display: block;
            }

            .barcode-value {
              margin-top: 12px;
              word-break: break-all;
              font-size: 14px;
              color: #71717a;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .print-sheet {
                padding: 0;
              }

              .barcode-card {
                border: none;
                max-width: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-sheet">
            <div class="barcode-card">
              <h1>${escapeHtml(cartoonNumber)}</h1>
              <p>Cartoon And Purchase Order Barcode</p>
              <div class="barcode-wrap">${barcodeMarkup}</div>
              <div class="barcode-value">Cartoon: ${escapeHtml(cartoonNumber)}</div>
              <div class="barcode-value">PO: ${escapeHtml(poNumber)}</div>
              <div class="barcode-value">Quantity: ${escapeHtml(quantity)}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
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
    setRackRows([]);

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

    if (!value) {
      setRackRows([]);
      return;
    }

    try {
      const rows = await fetchRackRows(value);
      setRackRows(Array.isArray(rows) ? rows : []);
    } catch (error) {
      setRackRows([]);
      toast.error(error.message || 'Failed to load rack rows.', {
        style: { color: '#dc2626' },
      });
    }
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
      });

      setCartoons((previous) => previous.map((cartoon) => (
        cartoon.id === updated.id ? updated : cartoon
      )));

      toast.success('Cartoon assigned to rack successfully.', {
        style: { color: '#16a34a' },
      });

      setAssignCartoonTarget(null);
      setSelectedRackId('');
      setSelectedRackRowId('');
      setRackRows([]);
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
                            <Label>Cartoon</Label>
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
              <AlertDialogContent className="max-w-[95vw] sm:max-w-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Cartoon Barcode</AlertDialogTitle>
                  <AlertDialogDescription>
                    {barcodeCartoon?.cartoon_number || 'Selected cartoon'}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="w-full rounded-md border p-4 overflow-hidden">
                  {barcodeCartoon?.cartoon_number ? (
                    <div className="space-y-4 text-center">
                      <div className="rounded-md border p-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Cartoon Number</p>
                        <div className="mx-auto flex justify-center overflow-hidden bg-white">
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

                      <div className="rounded-md border p-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Purchase Order Number</p>
                        <div className="mx-auto flex justify-center overflow-hidden bg-white">
                          <Barcode
                            value={cleanBarcodeValue(barcodeCartoon.purchase?.po_number ?? barcodeCartoon.p_o_number)}
                            format="CODE128"
                            width={getBarcodeWidth(cleanBarcodeValue(barcodeCartoon.purchase?.po_number ?? barcodeCartoon.p_o_number))}
                            height={72}
                            fontSize={14}
                            margin={0}
                            displayValue
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground break-all">{cleanBarcodeValue(barcodeCartoon.purchase?.po_number ?? barcodeCartoon.p_o_number)}</p>
                      </div>

                      <div className="rounded-md border p-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Quantity</p>
                        <div className="mx-auto flex justify-center overflow-hidden bg-white">
                          <Barcode
                            value={cleanBarcodeValue(String(barcodeCartoon.quantity ?? 0))}
                            format="CODE128"
                            width={getBarcodeWidth(cleanBarcodeValue(String(barcodeCartoon.quantity ?? 0)))}
                            height={72}
                            fontSize={14}
                            margin={0}
                            displayValue
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground break-all">{cleanBarcodeValue(String(barcodeCartoon.quantity ?? 0))}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No barcode is available for this cartoon.</p>
                  )}
                </div>

                <AlertDialogFooter>
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
                    <AlertDialogTitle>Delete Cartoon</AlertDialogTitle>
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
                  setRackRows([]);
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Assign Cartoon To Rack</AlertDialogTitle>
                  <AlertDialogDescription>
                    Assign rack for cartoon {assignCartoonTarget?.cartoon_number || ''}.
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
                    <Select value={selectedRackRowId} onValueChange={setSelectedRackRowId} disabled={!selectedRackId}>
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
                    <div style={{ marginBottom: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>Cartoon Number</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Barcode
                        value={cleanBarcodeValue(barcodeCartoon.cartoon_number)}
                        format="CODE128"
                        width={getPrintBarcodeWidth(cleanBarcodeValue(barcodeCartoon.cartoon_number))}
                        height={96}
                        fontSize={16}
                        margin={0}
                        displayValue
                      />
                    </div>

                    <div style={{ margin: '20px 0 10px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>Purchase Order Number</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Barcode
                        value={cleanBarcodeValue(barcodeCartoon.purchase?.po_number ?? barcodeCartoon.p_o_number)}
                        format="CODE128"
                        width={getPrintBarcodeWidth(cleanBarcodeValue(barcodeCartoon.purchase?.po_number ?? barcodeCartoon.p_o_number))}
                        height={96}
                        fontSize={16}
                        margin={0}
                        displayValue
                      />
                    </div>

                    <div style={{ margin: '20px 0 10px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>Quantity</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Barcode
                        value={cleanBarcodeValue(String(barcodeCartoon.quantity ?? 0))}
                        format="CODE128"
                        width={getPrintBarcodeWidth(cleanBarcodeValue(String(barcodeCartoon.quantity ?? 0)))}
                        height={96}
                        fontSize={16}
                        margin={0}
                        displayValue
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

    </div>
    );
}