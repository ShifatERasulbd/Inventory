import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CountryTable } from '@/components/country/table';
import { useAppContext } from '@/context/AppContext';

import { deleteCountry, fetchCountries } from './api';

export default function Countries() {
  const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (id) => {
    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteCountry(id);
      setCountries((previous) => (Array.isArray(previous) ? previous : []).filter((country) => country.id !== id));
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete country.');
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
          onDelete={handleDelete}
          deletingId={deletingId}
          isLoading={isLoading}
        />
            </div>

    </div>
    );
}