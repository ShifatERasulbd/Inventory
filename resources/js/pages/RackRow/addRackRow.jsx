import AddRackRowForm from '@/components/rackrow/addForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import { createRackRow } from './api';

const initialForm = {
    row_number: '',
    code: '',
};

function validateForm(form) {
    const errors = {};

    if (!form.row_number.trim()) {
        errors.row_number = ['The Row Number is required'];
    }

    if (!form.code.trim()) {
        errors.code = ['The Code is required'];
    }

    return errors;
}

export default function AddRackRow() {
    const navigate = useNavigate();
    const { rack_id } = useParams();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Rack Row');
    }, [setPageTitle]);

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
            await createRackRow(rack_id, {
                row_number: form.row_number.trim(),
                code: form.code.trim(),
            });
            toast.success('Row created successfully.', { style: { color: '#16a34a' } });
            navigate(`/racks/${rack_id}/rows`);
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create row.';
                setRequestError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddRackRowForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate(`/racks/${rack_id}/rows`)}
                    errors={errors}
                    requestError={requestError}
                />
            </div>
        </div>
    );
}
