import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/shipment/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchShipment, updateShipment } from './api';

const initialForm = {
    shipmentTime: '',
    productionTime: '',
};

export default function EditShipment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Shipment');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadShipment() {
            setIsLoading(true);
            setLoadError('');

            try {
                const shipment = await fetchShipment(id);
                if (!ignore) {
                    setForm({
                        shipmentTime: shipment.shipmentTime || '',
                        productionTime: shipment.productionTime || '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load shipment.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadShipment();

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
            await updateShipment(id, {
                shipmentTime: form.shipmentTime.trim(),
                productionTime: form.productionTime.trim(),
            });

            toast.success('Shipment updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/shipments');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update shipment.';
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
        return <p className="text-sm text-muted-foreground">Loading Shipments...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/shipments')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}