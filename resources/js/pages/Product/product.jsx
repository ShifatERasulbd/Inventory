import { useEffect, useState } from 'react';
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
import { useAppContext } from '@/context/AppContext';

import { bulkDeleteProducts, deleteProducts, fetchProducts } from './api';

export default function Product() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

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

    return (
    <div className="space-y-5">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <ProductTable
                products={products}
                selectedIds={selectedIds}
                onToggleSelectAll={handleToggleSelectAll}
                onToggleSelectRow={handleToggleSelectRow}
                onRequestBulkDelete={() => setIsBulkDeleteDialogOpen(true)}
                onAdd={() => navigate('/products/add')}
                onEdit={(id) => navigate(`/products/${id}/edit`)}
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

    </div>
    );
}