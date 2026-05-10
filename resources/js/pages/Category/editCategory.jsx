import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/category/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchCategory, updateCategory } from './api';

const initialForm = {
    name: '',
};

export default function EditCategory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit Category');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadCategory() {
            setIsLoading(true);
            setLoadError('');

            try {
                const category = await fetchCategory(id);
                if (!ignore) {
                    setForm({
                        name: category.name || '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load category.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadCategory();

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
            await updateCategory(id, {
                name: form.name.trim(),
            });

            toast.success('Category updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/categories');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update category.';
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
        return <p className="text-sm text-muted-foreground">Loading Categories...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/categories')}
                isSubmitting={isSubmitting}
                errors={errors}
            />
        </div>
    );
}
