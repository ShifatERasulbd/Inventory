import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/shipment/addForm';

import { useAppContext } from '@/context/AppContext';

import { createShipment } from './api';

const initialForm = {
    shipmentTime: '',
    productionTime: '',
   
};

function validateForm(form) {
    const trimmedShipmentTime = form.shipmentTime.trim();
    const trimmedProductionTime = form.productionTime.trim();

    const validationErrors = {};

    if (!trimmedShipmentTime) {
        validationErrors.shipmentTime = ['The shipment time field is required.'];
    }

    if (!trimmedProductionTime) {
        validationErrors.productionTime = ['The production time field is required.'];
    }

    return validationErrors;
}

export default function AddShipments() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Shipment');
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
            await createShipment({
                shipmentTime: form.shipmentTime.trim(),
                productionTime: form.productionTime.trim(),
            });

            toast.success('Shipment created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/shipments');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create Shipment.';
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
        <>
            <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/shipments')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
            </div>
        </>
    );
}