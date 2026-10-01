import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/return-orders/addForm';

import { useAppContext } from '@/context/AppContext';

import { createReturnOrder,fetchRemoteOrders } from './api';

const initialForm = {
    order_number_id: '',
    reason: '',
};

function validateForm(form) {
    const trimmedorderId = form.order_number_id.trim();
    const validationErrors = {};

    if (!trimmedorderId) {
        validationErrors.order_number_id = ['The Order Number field is required.'];
    }

    return validationErrors;
}

export default function AddReturnOrders() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [remoteOrders, setRemoteOrders] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setPageTitle('Add Return Orders');
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


    useEffect(() => {
        let ignore = false;
    
        async function loadReturnOrders() {
          setIsLoading(true);
          setRequestError('');
    
          try {
            const data = await fetchRemoteOrders();
            if (!ignore) {
              setRemoteOrders(Array.isArray(data) ? data : []);
            }

            console.log(data);
          } catch (error) {
            if (!ignore) {
              setErrorMessage(error.message || 'Failed to load Return Orders.');
            }
          } finally {
            if (!ignore) {
              setIsLoading(false);
            }
          }
        }
    
        loadReturnOrders();
    
        return () => {
          ignore = true;
        };
      }, []);

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
            await createReturnOrder({
                order_number_id: form.order_number_id.trim(),
                reason: form.reason.trim() || null,
            });

            toast.success('Order Returned successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/return-orders');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to return orders.';
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
                    remoteOrders={remoteOrders}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/return-orders')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
            </div>
        </>
    );
}