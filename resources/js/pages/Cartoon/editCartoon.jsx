import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/cartoon/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchPurchases } from '@/pages/Purchase/api';

import { fetchCartoon, updateCartoon } from './api';

const initialForm = {
    cartoon_number: '',
    p_o_number: '',
};

export default function EditCartoon() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [purchases, setPurchases] = useState([]);

    useEffect(() => {
        fetchPurchases().then((data) => {
            const approvedOnly = (Array.isArray(data) ? data : []).filter((purchase) => {
                const status = String(purchase?.status ?? '').toLowerCase();
                return ['approve', 'approved', 'active'].includes(status);
            });
            setPurchases(approvedOnly);
        });
    }, []);

    useEffect(() => {
        setPageTitle('Edit Cartoon');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadCartoon() {
            setIsLoading(true);
            setLoadError('');

            try {
                const cartoon = await fetchCartoon(id);
                if (!ignore) {
                    setForm({
                        cartoon_number: cartoon.cartoon_number || '',
                        p_o_number: cartoon.p_o_number ? String(cartoon.p_o_number) : '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load cartoon number.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCartoon();

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

    const handlePurchaseChange = (value) => {
        setForm((previous) => ({ ...previous, p_o_number: value }));
        setErrors((previous) => {
            if (!previous.p_o_number) return previous;
            const next = { ...previous };
            delete next.p_o_number;
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});

        try {
            await updateCartoon(id, {
                cartoon_number: form.cartoon_number.trim(),
                ...(form.p_o_number ? { p_o_number: Number(form.p_o_number) } : {}),
            });

            toast.success('Cartoon updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/cartoons');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update cartoon.';
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
        return <p className="text-sm text-muted-foreground">Loading Cartoon...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onPurchaseChange={handlePurchaseChange}
                purchases={purchases}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/cartoons')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}