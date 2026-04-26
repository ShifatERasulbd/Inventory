import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/productsfor/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchProductFor, updateProductFor } from './api';

const initialForm = {
    name: '',
    age_limit: '',
};

function validateForm(form) {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = ['The name field is required.'];
    }

    if (!form.age_limit.trim()) {
        errors.age_limit = ['The age limit field is required.'];
    }

    return errors;
}

export default function EditProductsFor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Products For');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadProductFor() {
            setIsLoading(true);
            setLoadError('');

            try {
                const productFor = await fetchProductFor(id);
                if (!ignore) {
                    setForm({
                        name: productFor?.name || '',
                        age_limit: productFor?.age_limit != null ? String(productFor.age_limit) : '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load Products For.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadProductFor();

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setLoadError('');
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateProductFor(id, {
                name: form.name.trim(),
                age_limit: form.age_limit.trim(),
            });

            toast.success('Products For updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/productsfor');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update Products For.';
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
        return <p className="text-sm text-muted-foreground">Loading Products For...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/productsfor')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}
