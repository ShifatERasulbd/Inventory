import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/warehouse/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchCountries } from '@/pages/Country/api';
import { fetchStates } from '@/pages/State/api';

import { fetchWarehouse, updateWarehouse } from './api';

const initialForm = {
    name: '',
    country_id: '',
    state_id: '',
    fulladress: '',
};

export default function EditWarehouse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);

    useEffect(() => {
        setPageTitle('Edit Warehouse');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [warehouse, countriesPayload, statesPayload] = await Promise.all([
                    fetchWarehouse(id),
                    fetchCountries(),
                    fetchStates(),
                ]);

                if (!ignore) {
                    setForm({
                        name: warehouse?.name || '',
                        country_id: warehouse?.country_id ? String(warehouse.country_id) : '',
                        state_id: warehouse?.state_id ? String(warehouse.state_id) : '',
                        fulladress: warehouse?.fulladress || '',
                    });
                    setCountries(Array.isArray(countriesPayload) ? countriesPayload : []);
                    setStates(Array.isArray(statesPayload) ? statesPayload : []);
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load warehouse.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
    }, [id]);

    const filteredStates = states.filter((state) => String(state.country_id) === String(form.country_id));

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => {
            if (!previous[name]) {
                return previous;
            }

            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleCountryChange = (value) => {
        setForm((previous) => ({ ...previous, country_id: value, state_id: '' }));
        setErrors((previous) => {
            const next = { ...previous };
            delete next.country_id;
            delete next.state_id;
            return next;
        });
    };

    const handleStateChange = (value) => {
        setForm((previous) => ({ ...previous, state_id: value }));
        setErrors((previous) => {
            if (!previous.state_id) {
                return previous;
            }

            const next = { ...previous };
            delete next.state_id;
            return next;
        });
    };

    const handleStateOpenChange = (open) => {
        if (!open || form.country_id) {
            return;
        }

        setErrors((previous) => ({
            ...previous,
            state_id: ['Select the country first.'],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateWarehouse(id, {
                country_id: Number(form.country_id),
                state_id: Number(form.state_id),
                name: form.name.trim(),
                fulladress: form.fulladress.trim(),
            });

            toast.success('Warehouse updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/warehouses');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update warehouse.';
                setLoadError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading warehouse...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onCountryChange={handleCountryChange}
                onStateChange={handleStateChange}
                onStateOpenChange={handleStateOpenChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/warehouses')}
                isSubmitting={isSubmitting}
                countries={countries}
                states={filteredStates}
                errors={errors}
            />
        </div>
    );
}
