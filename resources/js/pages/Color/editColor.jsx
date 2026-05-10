import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/color/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchColor, updateColors } from './api';

const initialForm = {
    name: '',
    color_code: '',
};

export default function EditColor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Color');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadColor() {
            setIsLoading(true);
            setLoadError('');

            try {
                const color = await fetchColor(id);
                if (!ignore) {
                    setForm({
                        name: color.name || '',
                        color_code: color.color_code || '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load Color.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadColor();

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
            await updateColors(id, {
                name: form.name.trim(),
                color_code: form.color_code.trim() || null,
            });

            toast.success('Color updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/colors');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update color.';
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
        return <p className="text-sm text-muted-foreground">Loading Colors...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/colors')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}