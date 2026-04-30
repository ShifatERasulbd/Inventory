import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/cartoon/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchCartoon, updateCartoon } from './api';

const initialForm = {
    cartoon_number: '',
};

export default function EditCartoon() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Cartoon');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadCartoon() {
            setIsLoading(true);
            setLoadError('');

            try {
                const cartoon = await fetchCartoon(id);
                if (!ignore) {
                    setForm({
                        cartoon_number: cartoon.cartoon_number || '',
                        
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load cartoon number.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCartoon();

        return () => {
            ignore = true;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});

        try {
            await updateCartoon(id, {
                cartoon_number: form.cartoon_number.trim(),
               
            });

            toast.success('Cartoon updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/cartoons');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update cartoon.';
                setLoadError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading Cartoon...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/cartoons')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}