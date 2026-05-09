import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/cartoon/addForm';
import { fetchPurchases } from '@/pages/Purchase/api';
import { useAppContext } from '@/context/AppContext';

import { createCartoon } from './api';

const initialForm = {
    cartoon_number: '',
    p_o_number: '',
};

function validateForm(form) {
    const trimmedName = form.cartoon_number.trim();
    const trimmedPONumber = String(form.p_o_number ?? '').trim();
    const validationErrors = {};

    if (!trimmedName) {
        validationErrors.cartoon_number = ['The cartoon number field is required.'];
    }

    if (!trimmedPONumber) {
        validationErrors.p_o_number = ['The Purchase order number field is required.'];
    }

    return validationErrors;
}

export default function AddCartoons() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
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
        setPageTitle('Add Cartoon');
    }, [setPageTitle]);

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
            setRequestError('');
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await createCartoon({
                cartoon_number: form.cartoon_number.trim(),
                p_o_number: Number(form.p_o_number),
            });

            toast.success('Cartoon created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/cartoons');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create Cartoon.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePurchaseChange = (value) => {
        setForm((previous) => ({ ...previous, p_o_number: value }));
        setErrors((previous) => {
            if (!previous.p_o_number && !previous.P_O_number) {
                return previous;
            }

            const next = { ...previous };
            delete next.p_o_number;
            delete next.P_O_number;
            return next;
        });
    };

    return (
        <>
            <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/cartoons')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    onPurchaseChange={handlePurchaseChange}
                    purchases={purchases}
                />
            </div>
            </div>
        </>
    );
}