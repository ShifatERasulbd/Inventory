import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/color/addForm';

import { useAppContext } from '@/context/AppContext';

import { createColors } from './api';

const initialForm = {
    name: '',
    color_code: '',
};

function validateForm(form) {
    const trimmedName = form.name.trim();
    const validationErrors = {};

    if (!trimmedName) {
        validationErrors.name = ['The name field is required.'];
    }

    return validationErrors;
}

export default function AddColor() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Colors');
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
            await createColors({
                name: form.name.trim(),
                color_code: form.color_code.trim() || null,
            });

            toast.success('Color created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/colors');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create Color.';
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
                    onCancel={() => navigate('/colors')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
            </div>
        </>
    );
}