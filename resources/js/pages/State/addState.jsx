import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/state/addForm';
import { useAppContext } from '@/context/AppContext';
import { fetchCountries } from '@/pages/Country/api';
import { createState } from './api';

const initialForm = {
    country_id: '',
    name: '',
};

function validateForm(form) {
    const errors = {};

    if (!form.country_id) {
        errors.country_id = ['Please select a country.'];
    }

    if (!form.name.trim()) {
        errors.name = ['The state name field is required.'];
    }

    return errors;
}

export default function AddState() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        setPageTitle('Add State');
    }, [setPageTitle]);

    useEffect(() => {
        fetchCountries().then(setCountries);
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleCountryChange = (value) => {
        setForm((previous) => ({ ...previous, country_id: value }));
        setErrors((previous) => {
            if (!previous.country_id) return previous;
            const next = { ...previous };
            delete next.country_id;
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await createState({
                country_id: Number(form.country_id),
                name: form.name.trim(),
            });
            toast.success('State created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/states');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create state.';
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
                    onCountryChange={handleCountryChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/states')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    countries={countries}
                />
            </div>
        </div>
    );
}