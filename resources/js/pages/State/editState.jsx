import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/state/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchCountries } from '@/pages/Country/api';

import { fetchState, updateState } from './api';

const initialForm = {
    country_id: '',
    name: '',
};

export default function EditState() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        setPageTitle('Edit State');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [state, countriesPayload] = await Promise.all([fetchState(id), fetchCountries()]);

                if (!ignore) {
                    setForm({
                        country_id: state?.country_id ? String(state.country_id) : '',
                        name: state?.name || '',
                    });
                    setCountries(Array.isArray(countriesPayload) ? countriesPayload : []);
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load state.');
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
        setForm((previous) => ({ ...previous, country_id: value }));

        setErrors((previous) => {
            if (!previous.country_id) {
                return previous;
            }

            const next = { ...previous };
            delete next.country_id;
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateState(id, {
                country_id: Number(form.country_id),
                name: form.name.trim(),
            });

            toast.success('State updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/states');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update state.';
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
        return <p className="text-sm text-muted-foreground">Loading state...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onCountryChange={handleCountryChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/states')}
                isSubmitting={isSubmitting}
                errors={errors}
                countries={countries}
            />
        </div>
    );
}
