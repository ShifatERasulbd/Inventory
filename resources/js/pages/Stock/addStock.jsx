import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/stock/addForm';
import { useAppContext } from '@/context/AppContext';

import { createStock } from './api';

const initialForm = {
    product_id: '',
    stocks: '',
    warehouse_id: '',
    cartoon_id: '',
    barcode: '',
};

function validateForm(form) {
    const productId = Number(form.product_id);
    const stockValue = Number(form.stocks);
    const warehouseId = form.warehouse_id === '' ? null : Number(form.warehouse_id);
    const cartoonId = form.cartoon_id === '' ? null : Number(form.cartoon_id);
    const barcode = form.barcode.trim();
    const validationErrors = {};

    if (!Number.isInteger(productId) || productId <= 0) {
        validationErrors.product_id = ['Product ID must be a positive integer.'];
    }

    if (!Number.isInteger(stockValue) || stockValue < 0) {
        validationErrors.stocks = ['Stocks must be a non-negative integer.'];
    }

    if (warehouseId !== null && (!Number.isInteger(warehouseId) || warehouseId <= 0)) {
        validationErrors.warehouse_id = ['Warehouse ID must be a positive integer.'];
    }

    if (cartoonId !== null && (!Number.isInteger(cartoonId) || cartoonId <= 0)) {
        validationErrors.cartoon_id = ['Cartoon ID must be a positive integer.'];
    }

    if (barcode.length > 200) {
        validationErrors.barcode = ['Barcode must not exceed 200 characters.'];
    }

    return validationErrors;
}

export default function AddStock() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Stock');
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
            await createStock({
                product_id: Number(form.product_id),
                stocks: Number(form.stocks),
                warehouse_id: form.warehouse_id === '' ? null : Number(form.warehouse_id),
                cartoon_id: form.cartoon_id === '' ? null : Number(form.cartoon_id),
                barcode: form.barcode.trim() ? form.barcode.split(',').map((b) => b.trim()).filter(Boolean) : null,
            });

            toast.success('Stock created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/stocks');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create stock.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/stocks')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
        </div>
    );
}