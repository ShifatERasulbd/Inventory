import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/supplier/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchSupplier, updateSupplier } from './api';

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

export default function EditSupplier() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Supplier');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadSupplier() {
            setIsLoading(true);
            setLoadError('');

            try {
                const supplier = await fetchSupplier(id);
                if (!ignore) {
                    setForm({
                        name: supplier.name || '',
                        company_name: supplier.company_name || '',
                        phone: supplier.phone || '',
                        email: supplier.email || '',
                        address: supplier.address || '',
                        trade_license: supplier.trade_license || '',
                        contact_person: supplier.contact_person || '',
                        status: supplier.status || 'active',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load Supplier.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadSupplier();

        return () => { ignore = true; };
    }, [id]);

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
        setIsSubmitting(true);
        setErrors({});

        try {
            await updateSupplier(id, {
                name: form.name.trim(),
                company_name: form.company_name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                address: form.address.trim(),
                trade_license: form.trade_license.trim() || null,
                contact_person: form.contact_person.trim(),
                status: form.status,
            });

            toast.success('Supplier updated successfully.', { style: { color: '#16a34a' } });
            navigate('/suppliers');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update Supplier.';
                setLoadError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading Supplier...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}
            <EditForm
                form={form}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/suppliers')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}
