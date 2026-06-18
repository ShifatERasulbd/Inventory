import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/warehouse/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchBrands } from '@/pages/Brand/api';
import { fetchCountries } from '@/pages/Country/api';
import { fetchStates } from '@/pages/State/api';

import { fetchWarehouse, updateWarehouse } from './api';

const initialForm = {
    name: '',
    country_id: '',
    state_id: '',
    fulladress: '',
    brand_ids: [''],
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
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        setPageTitle('Edit Warehouse');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [warehouse, countriesPayload, statesPayload, brandsPayload] = await Promise.all([
                    fetchWarehouse(id),
                    fetchCountries(),
                    fetchStates(),
                    fetchBrands(),
                ]);

                if (!ignore) {
                    const selectedBrandIds = Array.isArray(warehouse?.brands)
                        ? warehouse.brands.map((brand) => String(brand?.id)).filter(Boolean)
                        : [];

                    setForm({
                        name: warehouse?.name || '',
                        country_id: warehouse?.country_id ? String(warehouse.country_id) : '',
                        state_id: warehouse?.state_id ? String(warehouse.state_id) : '',
                        fulladress: warehouse?.fulladress || '',
                        brand_ids: selectedBrandIds.length > 0 ? selectedBrandIds : [''],
                    });
                    setCountries(Array.isArray(countriesPayload) ? countriesPayload : []);
                    setStates(Array.isArray(statesPayload) ? statesPayload : []);
                    setBrands(Array.isArray(brandsPayload) ? brandsPayload : []);
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

    const handleBrandChange = (index, value) => {
        setForm((previous) => {
            const current = Array.isArray(previous.brand_ids) && previous.brand_ids.length > 0
                ? [...previous.brand_ids]
                : [''];

            current[index] = value || '';

            return {
                ...previous,
                brand_ids: current,
            };
        });
    };

    const handleAddBrand = () => {
        setForm((previous) => ({
            ...previous,
            brand_ids: [...(Array.isArray(previous.brand_ids) ? previous.brand_ids : ['']), ''],
        }));
    };

    const handleRemoveBrand = (index) => {
        setForm((previous) => {
            const current = Array.isArray(previous.brand_ids) && previous.brand_ids.length > 0
                ? [...previous.brand_ids]
                : [''];

            if (current.length === 1) {
                current[0] = '';
            } else {
                current.splice(index, 1);
            }

            return {
                ...previous,
                brand_ids: current,
            };
        });
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
                brand_ids: (Array.isArray(form.brand_ids) ? form.brand_ids : [])
                    .filter(Boolean)
                    .map((value) => Number(value)),
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
                brands={brands}
                onBrandChange={handleBrandChange}
                onAddBrand={handleAddBrand}
                onRemoveBrand={handleRemoveBrand}
                errors={errors}
            />
        </div>
    );
}
