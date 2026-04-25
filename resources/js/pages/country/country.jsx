import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { CountryTable } from '@/components/country/table';
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

import { deleteCountry, fetchCountries } from './api';

export default function Countries() {
  const navigate = useNavigate();
  const { setPageTitle } = useAppContext();
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [countryToDelete, setCountryToDelete] = useState(null);

    useEffect(() => {
    setPageTitle('Countries');
    }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadCountries() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchCountries();
        if (!ignore) {
          setCountries(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load countries.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCountries();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!countryToDelete) {
      return;
    }

    const id = countryToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteCountry(id);
      setCountries((previous) => (Array.isArray(previous) ? previous : []).filter((country) => country.id !== id));
      toast.success('Country deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setCountryToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete country.';
      setErrorMessage(message);
      toast.error(message, {
        style: { color: '#dc2626' },
      });
    } finally {
      setDeletingId(null);
    }
  };

    return (
    <div className="space-y-5">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
        <CountryTable
          countries={countries}
          onAdd={() => navigate('/countries/add')}
          onEdit={(id) => navigate(`/countries/${id}/edit`)}
          onRequestDelete={setCountryToDelete}
          deletingId={deletingId}
          isLoading={isLoading}
        />
            </div>

      <AlertDialog open={Boolean(countryToDelete)} onOpenChange={(open) => !open && setCountryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Country</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {countryToDelete?.name}? This action cannot be undone.
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