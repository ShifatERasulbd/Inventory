import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/country/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchCountry, updateCountry } from './api';

const initialForm = {
    name: '',
    code: '',
    currency_code: '',
};

export default function EditContry() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Country');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadCountry() {
            setIsLoading(true);
            setLoadError('');

            try {
                const country = await fetchCountry(id);
                if (!ignore) {
                    setForm({
                        name: country.name || '',
                        code: country.code || '',
                        currency_code: country.currency_code || '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load country.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCountry();

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
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});

        try {
            await updateCountry(id, {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                currency_code: form.currency_code.trim().toUpperCase(),
            });

            toast.success('Country updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/countries');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update country.';
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
        return <p className="text-sm text-muted-foreground">Loading country...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/countries')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}