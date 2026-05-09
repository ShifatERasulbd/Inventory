import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';

import { adjustCartoonQuantity, deleteCartoon, fetchCartoons } from './api';

export default function Cartoon() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [cartoons, setCartoons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [cartoonToDelete, setCartoonToDelete] = useState(null);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState('add');
  const [adjustCartoonTarget, setAdjustCartoonTarget] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [scannedCodes, setScannedCodes] = useState([]);
  const [isAdjusting, setIsAdjusting] = useState(false);

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

    return (
    <div className="space-y-5">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <CartoonTable
                cartoons={cartoons}
                onAdd={() => navigate('/cartoons/add')}
                onAddQuantity={(cartoon) => openAdjustDialog('add', cartoon)}
                onDeductQuantity={(cartoon) => openAdjustDialog('deduct', cartoon)}
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

    </div>
    );
}