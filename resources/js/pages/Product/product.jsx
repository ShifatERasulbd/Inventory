import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ProductTable } from '@/components/product/table';
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
import { useAppContext } from '@/context/AppContext';
import Barcode from 'react-barcode';

import { bulkDeleteProducts, deleteProducts, fetchProducts } from './api';

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

export default function Product() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const barcodePrintSourceRef = useRef(null);
  const bulkBarcodePrintSourceRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [barcodeDialogProducts, setBarcodeDialogProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkBarcodeDialogOpen, setIsBulkBarcodeDialogOpen] = useState(false);

    useEffect(() => {
    setPageTitle('Products');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchProducts();
        if (!ignore) {
          setProducts(Array.isArray(data) ? data : []);
          setSelectedIds((previous) => previous.filter((id) => (Array.isArray(data) ? data : []).some((product) => product.id === id)));
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load Products.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!productToDelete) {
      return;
    }

    const id = productToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteProducts(id);
      setProducts((previous) => (Array.isArray(previous) ? previous : []).filter((product) => product.id !== id));
      setSelectedIds((previous) => previous.filter((selectedId) => selectedId !== id));
      toast.success('Product deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setProductToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete Product.';
      setErrorMessage(message);
      toast.error(message, {
        style: { color: '#dc2626' },
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleSelectAll = (visibleIds, checked) => {
    setSelectedIds((previous) => {
      const previousSet = new Set(previous);

      if (checked) {
        visibleIds.forEach((id) => previousSet.add(id));
      } else {
        visibleIds.forEach((id) => previousSet.delete(id));
      }

      return Array.from(previousSet);
    });
  };

  const handleToggleSelectRow = (id, checked) => {
    setSelectedIds((previous) => {
      if (checked) {
        if (previous.includes(id)) {
          return previous;
        }

        return [...previous, id];
      }

      return previous.filter((selectedId) => selectedId !== id);
    });
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    setIsBulkDeleting(true);
    setErrorMessage('');

    try {
      await bulkDeleteProducts(selectedIds);
      const selectedSet = new Set(selectedIds);
      setProducts((previous) => (Array.isArray(previous) ? previous : []).filter((product) => !selectedSet.has(product.id)));
      setSelectedIds([]);
      setIsBulkDeleteDialogOpen(false);
      toast.success('Selected products deleted successfully.', {
        style: { color: '#16a34a' },
      });
    } catch (error) {
      const message = error.message || 'Failed to delete selected products.';
      setErrorMessage(message);
      toast.error(message, {
        style: { color: '#dc2626' },
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handlePrintBarcode = () => {
    if (barcodeDialogProducts.length === 0 || !barcodePrintSourceRef.current) {
      return;
    }

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
          <title>Print Barcode</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: #ffffff;
            }

            .print-sheet {
              min-height: 100vh;
              padding: 24px;
              box-sizing: border-box;
            }

            .barcode-list {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }

            .barcode-card {
              width: 100%;
              border: 1px solid #d4d4d8;
              border-radius: 12px;
              padding: 16px;
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

            .barcode-missing {
              margin-top: 12px;
              font-size: 13px;
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
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-sheet">
            <div class="barcode-list">
              ${barcodeMarkup}
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

  const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
  const selectedProductsWithBarcode = selectedProducts.filter((product) => Boolean(product?.barCode));
  const barcodeDialogProductsWithBarcode = barcodeDialogProducts.filter((product) => Boolean(product?.barCode));

  const handlePrintBulkBarcodes = () => {
    if (selectedProducts.length === 0 || !bulkBarcodePrintSourceRef.current) {
      return;
    }

    const barcodeMarkup = bulkBarcodePrintSourceRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

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
          <title>Print Product Barcodes</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: #ffffff;
            }

            .print-sheet {
              min-height: 100vh;
              padding: 24px;
              box-sizing: border-box;
            }

            .print-sheet h1 {
              margin: 0 0 6px;
              text-align: center;
            }

            .print-sheet .subtitle {
              margin: 0 0 16px;
              text-align: center;
              color: #52525b;
              font-size: 14px;
            }

            .barcode-list {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }

            .barcode-item {
              border: 1px solid #d4d4d8;
              border-radius: 10px;
              padding: 12px;
              text-align: center;
            }

            .barcode-item h2 {
              margin: 0 0 8px;
              font-size: 16px;
            }

            .barcode-item .barcode-wrap {
              display: flex;
              justify-content: center;
            }

            .barcode-item .barcode-wrap svg {
              display: block;
              max-width: 100%;
              height: auto;
            }

            .barcode-item .barcode-value {
              margin-top: 8px;
              font-size: 12px;
              color: #71717a;
              word-break: break-all;
            }

            .barcode-item .missing {
              color: #71717a;
              font-size: 13px;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .print-sheet {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-sheet">
            <h1>Selected Product Barcodes</h1>
            <p class="subtitle">${selectedProducts.length} product(s)</p>
            <div class="barcode-list">${barcodeMarkup}</div>
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

    return (
    <div className="space-y-5">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <ProductTable
                products={products}
                selectedIds={selectedIds}
                onToggleSelectAll={handleToggleSelectAll}
                onToggleSelectRow={handleToggleSelectRow}
                onRequestBulkBarcode={() => setIsBulkBarcodeDialogOpen(true)}
                onRequestBulkDelete={() => setIsBulkDeleteDialogOpen(true)}
                onAdd={() => navigate('/products/add')}
                onEdit={(id, options = {}) => {
                  const query = options?.variantOnly ? '?variant_only=1' : '';
                  navigate(`/products/${id}/edit${query}`);
                }}
                onCopy={(product, options = {}) => navigate('/products/add', {
                  state: {
                    copyFrom: product,
                    copyVariants: Array.isArray(options.variants) ? options.variants : [product],
                  },
                })}
                onViewBarcode={(product, options = {}) => {
                  const variants = Array.isArray(options?.variants) && options.variants.length > 0
                    ? options.variants
                    : [product];
                  setBarcodeDialogProducts(variants);
                }}
                onRequestDelete={setProductToDelete}
                deletingId={deletingId}
                isBulkDeleting={isBulkDeleting}
                isLoading={isLoading}
                />
                    </div>

            <AlertDialog open={Boolean(productToDelete)} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete {productToDelete?.name}? This action cannot be undone.
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

            <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
              <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Selected Products</AlertDialogTitle>
                <AlertDialogDescription>
                Are you sure you want to delete {selectedIds.length} selected product(s)? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                variant="destructive"
                disabled={isBulkDeleting || selectedIds.length === 0}
                onClick={handleConfirmBulkDelete}
                >
                {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
                </AlertDialogAction>
              </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={isBulkBarcodeDialogOpen}
              onOpenChange={(open) => {
                setIsBulkBarcodeDialogOpen(open);
              }}
            >
              <AlertDialogContent className="max-w-[95vw] sm:max-w-4xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Selected Product Barcodes</AlertDialogTitle>
                  <AlertDialogDescription>
                    {selectedProducts.length} selected product(s), {selectedProductsWithBarcode.length} with barcode.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="max-h-[65vh] space-y-3 overflow-y-auto rounded-md border p-3">
                  {selectedProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No selected products found.</p>
                  ) : (
                    selectedProducts.map((product) => (
                      <div key={product.id} className="rounded-md border bg-white p-3 text-center">
                        <p className="text-sm font-medium">{product.name || 'Product'}</p>

                        {product?.barCode ? (
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-center overflow-hidden">
                              <Barcode
                                value={product.barCode}
                                format="CODE128"
                                width={getBarcodeWidth(product.barCode)}
                                height={72}
                                fontSize={14}
                                margin={0}
                                displayValue
                              />
                            </div>
                            <p className="text-xs text-muted-foreground break-all">{product.barCode}</p>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">No barcode is available for this product.</p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <AlertDialogFooter>
                  <Button
                    type="button"
                    variant="default"
                    onClick={handlePrintBulkBarcodes}
                    disabled={selectedProducts.length === 0}
                    className="sm:mr-auto"
                  >
                    Print All
                  </Button>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={barcodeDialogProducts.length > 0} onOpenChange={(open) => !open && setBarcodeDialogProducts([])}>
              <AlertDialogContent className="max-w-[95vw] sm:max-w-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Product Barcodes</AlertDialogTitle>
                  <AlertDialogDescription>
                    {barcodeDialogProducts.length} product(s), {barcodeDialogProductsWithBarcode.length} with barcode.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="max-h-[65vh] space-y-3 overflow-y-auto rounded-md border p-3">
                  {barcodeDialogProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products found.</p>
                  ) : (
                    barcodeDialogProducts.map((product) => (
                      <div key={product.id} className="rounded-md border bg-white p-3 text-center">
                        <p className="text-sm font-medium">{product.name || 'Product'}</p>

                        {product?.barCode ? (
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-center overflow-hidden">
                              <Barcode
                                value={product.barCode}
                                format="CODE128"
                                width={getBarcodeWidth(product.barCode)}
                                height={72}
                                fontSize={14}
                                margin={0}
                                displayValue
                              />
                            </div>
                            <p className="text-xs text-muted-foreground break-all">{product.barCode}</p>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">No barcode is available for this product.</p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <AlertDialogFooter>
                  <Button
                    type="button"
                    variant="default"
                    onClick={handlePrintBarcode}
                    disabled={barcodeDialogProductsWithBarcode.length === 0}
                    className="sm:mr-auto"
                  >
                    Print All
                  </Button>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0" aria-hidden="true">
              <div ref={barcodePrintSourceRef} className="bg-white p-2">
                {barcodeDialogProducts.map((product) => (
                  <div key={product.id} className="barcode-card">
                    <h1>{product.name || 'Product Barcode'}</h1>
                    <p>Barcode Label</p>
                    {product?.barCode ? (
                      <>
                        <div className="barcode-wrap">
                          <Barcode
                            value={product.barCode}
                            format="CODE128"
                            width={getPrintBarcodeWidth(product.barCode)}
                            height={120}
                            fontSize={28}
                            margin={0}
                            displayValue
                          />
                        </div>
                        <div className="barcode-value">{product.barCode}</div>
                      </>
                    ) : (
                      <div className="barcode-missing">No barcode is available for this product.</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

    </div>
    );
}