import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/fabric/addForm';

import { useAppContext } from '@/context/AppContext';

import { createFabrics } from './api';
import { fetchSuppliers } from '@/pages/Suppliers/api';

const initialForm = {
    name: '',
    type: '',
    composition: '',
    construction: '',
    ref_number: '',
    gsm: '',
    supplier_id: '',
};

function validateForm(form) {
    const validationErrors = {};

    if (!form.name.trim()) {
        validationErrors.name = ['The name field is required.'];
    }

    return validationErrors;
}

export default function AddFabric() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        setPageTitle('Add Fabric');
        fetchSuppliers().then(setSuppliers).catch(() => {});
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

    const handleCompositionChange = (html) => {
        setForm((previous) => ({ ...previous, composition: html }));
        setErrors((previous) => {
            if (!previous.composition) return previous;
            const next = { ...previous };
            delete next.composition;
            return next;
        });
    };

    const handleSelectChange = (field, value) => {
        setForm((previous) => ({ ...previous, [field]: value || '' }));
        setErrors((previous) => {
            if (!previous[field]) return previous;
            const next = { ...previous };
            delete next[field];
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
            await createFabrics({
                name: form.name.trim(),
                type: form.type.trim() || null,
                composition: form.composition.trim() || null,
                construction: form.construction.trim() || null,
                ref_number: form.ref_number.trim() || null,
                gsm: form.gsm !== '' ? Number(form.gsm) : null,
                supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
            });

            toast.success('Fabric created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/fabrics');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create Fabrics.';
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
                    onCompositionChange={handleCompositionChange}
                    onSelectChange={handleSelectChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/fabric')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    suppliers={suppliers}
                />
            </div>
            </div>
        </>
    );
}