import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/supplier/addForm';
import { useAppContext } from '@/context/AppContext';

import { createSupplier } from './api';

const initialForm = {
    name: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
    trade_license: '',
    contact_person: '',
    status: 'active',
};

function validateForm(form) {
    const validationErrors = {};

    if (!form.name.trim()) validationErrors.name = ['The name field is required.'];
    if (!form.company_name.trim()) validationErrors.company_name = ['The company name field is required.'];
    if (!form.phone.trim()) validationErrors.phone = ['The phone field is required.'];
    if (!form.email.trim()) validationErrors.email = ['The email field is required.'];
    if (!form.address.trim()) validationErrors.address = ['The address field is required.'];
    if (!form.contact_person.trim()) validationErrors.contact_person = ['The contact person field is required.'];
    if (!form.status) validationErrors.status = ['Please select a status.'];

    return validationErrors;
}

export default function AddSupplier() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add Supplier');
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
            await createSupplier({
                name: form.name.trim(),
                company_name: form.company_name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                address: form.address.trim(),
                trade_license: form.trade_license.trim() || null,
                contact_person: form.contact_person.trim(),
                status: form.status,
            });

            toast.success('Supplier created successfully.', { style: { color: '#16a34a' } });
            navigate('/suppliers');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create Supplier.';
                setRequestError(message);
                toast.error(message, { style: { color: '#dc2626' } });
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
                        onSelectChange={handleSelectChange}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/suppliers')}
                        isSubmitting={isSubmitting}
                        errors={errors}
                    />
                </div>
            </div>
        </>
    );
}
