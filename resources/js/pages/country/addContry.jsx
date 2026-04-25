import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/country/addForm';

import { useAppContext } from '@/context/AppContext';

import { createCountry } from './api';

const initialForm = {
    name: '',
    code: '',
    currency_code: '',
};

function validateForm(form) {
    const trimmedName = form.name.trim();
    const trimmedCode = form.code.trim();
    const trimmedCurrencyCode = form.currency_code.trim();
    const validationErrors = {};

    if (!trimmedName) {
        validationErrors.name = ['The name field is required.'];
    }

    if (!trimmedCode) {
        validationErrors.code = ['The code field is required.'];
    } else if (trimmedCode.length !== 2) {
        validationErrors.code = ['The code field must be 2 characters.'];
    }

    if (!trimmedCurrencyCode) {
        validationErrors.currency_code = ['The currency code field is required.'];
    } else if (trimmedCurrencyCode.length !== 3) {
        validationErrors.currency_code = ['The currency code field must be 3 characters.'];
    }

    return validationErrors;
}

export default function AddContry() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Country');
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
            await createCountry({
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                currency_code: form.currency_code.trim().toUpperCase(),
            });

            toast.success('Country created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/countries');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create country.';
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
                    onCancel={() => navigate('/countries')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
            </div>
        </>
    );
}