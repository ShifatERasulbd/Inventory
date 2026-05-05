import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/fabric/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchFabric, updateFabrics } from './api';

const initialForm = {
    name: '',
    type: '',
    composition: '',
    construction: '',
    ref_number: '',
    gsm: '',
};

export default function EditFabric() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Fabric');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadFabric() {
            setIsLoading(true);
            setLoadError('');

            try {
                const color = await fetchFabric(id);
                if (!ignore) {
                    setForm({
                        name: color.name || '',
                        type: color.type || '',
                        composition: color.composition || '',
                        construction: color.construction || '',
                        ref_number: color.ref_number || '',
                        gsm: color.gsm != null ? String(color.gsm) : '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load Fabric.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadFabric();

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

    const handleCompositionChange = (html) => {
        setForm((previous) => ({ ...previous, composition: html }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});

        try {
            await updateFabrics(id, {
                name: form.name.trim(),
                type: form.type.trim() || null,
                composition: form.composition.trim() || null,
                construction: form.construction.trim() || null,
                ref_number: form.ref_number.trim() || null,
                gsm: form.gsm !== '' ? Number(form.gsm) : null,
            });

            toast.success('Fabric updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/fabrics');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update Fabrics.';
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
        return <p className="text-sm text-muted-foreground">Loading Fabrics...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onCompositionChange={handleCompositionChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/fabrics')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}