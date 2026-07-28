import EditRackRowForm from '@/components/rackrow/editForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import { fetchRackRow, updateRackRow } from './api';
import { fetchRack } from '@/pages/Rack/api';

function validateForm(form) {
    const errors = {};

    if (!form.row_number.trim()) {
        errors.row_number = ['The Row Number is required'];
    }

    return errors;
}

export default function EditRackRow() {
    const navigate = useNavigate();
    const { rack_id, id } = useParams();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState({ row_number: '', code: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [requestError, setRequestError] = useState('');
    const [rackName, setRackName] = useState('');

    useEffect(() => {
        setPageTitle('Edit Rack Row');

        const loadRack = async () => {
            try {
                const rack = await fetchRack(rack_id);
                setRackName(rack?.name || 'RACK');
            } catch {
                setRackName('RACK');
            }
        };
        loadRack();
    }, [setPageTitle, rack_id]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const row = await fetchRackRow(rack_id, id);
                setForm({
                    row_number: row.row_number,
                    code: row.code,
                });
            } catch (error) {
                const message = error.message || 'Failed to load row.';
                setRequestError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [rack_id, id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => {
            const updated = { ...previous, [name]: value };

            // Auto-generate code when row_number changes
            if (name === 'row_number') {
                updated.code = value.trim() ? `${rackName}-${value.trim()}` : '';
            }

            return updated;
        });

        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Auto-fill code before submit if it's still empty
        const code = form.code.trim() || (form.row_number.trim() ? `${rackName}-${form.row_number.trim()}` : '');

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await updateRackRow(rack_id, id, {
                row_number: form.row_number.trim(),
                code: code,
            });
            toast.success('Row updated successfully.', { style: { color: '#16a34a' } });
            navigate(`/racks/${rack_id}/rows`);
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update row.';
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
                <EditRackRowForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    isLoading={isLoading}
                    onCancel={() => navigate(`/racks/${rack_id}/rows`)}
                    errors={errors}
                    requestError={requestError}
                />
            </div>
        </div>
    );
}
