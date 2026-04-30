import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/cartoon/addForm';

import { useAppContext } from '@/context/AppContext';

import { createCartoon } from './api';

const initialForm = {
    cartoon_number: '',
   
};

function validateForm(form) {
    const trimmedName = form.cartoon_number.trim();
   
    const validationErrors = {};

    if (!trimmedName) {
        validationErrors.cartoon_number = ['The cartoon number field is required.'];
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
                />
            </div>
            </div>
        </>
    );
}