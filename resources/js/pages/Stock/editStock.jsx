import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/stock/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchStock, updateStock } from './api';

const initialForm = {
    name: '',
    available_stock: '',
};

export default function EditStock() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Stock');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadStock() {
            setIsLoading(true);
            setLoadError('');

            try {
                const stock = await fetchStock(id);
                if (!ignore) {
                    setForm({
                        name: stock.name || '',
                        available_stock: String(stock.available_stock ?? 0),
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load stock.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadStock();

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
            await updateStock(id, {
                name: form.name.trim(),
                available_stock: Number(form.available_stock),
            });

            toast.success('Stock updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/stocks');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update stock.';
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
        return <p className="text-sm text-muted-foreground">Loading Stock...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/stocks')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}