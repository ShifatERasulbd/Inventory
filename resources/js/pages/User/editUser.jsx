import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/user/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchWarehouses } from '@/pages/Warehouse/api';

import { fetchUser, updateUser } from './api';

const initialForm = {
    warehouse_id: '',
    name: '',
    email: '',
    password: '',
    c_password: '',
};

export default function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        setPageTitle('Edit User');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [user, warehousesPayload] = await Promise.all([fetchUser(id), fetchWarehouses()]);
                if (!ignore) {
                    setForm({
                        warehouse_id: user?.warehouse_id ? String(user.warehouse_id) : '',
                        name: user?.name || '',
                        email: user?.email || '',
                        password: '',
                        c_password: '',
                    });
                    setWarehouses(Array.isArray(warehousesPayload) ? warehousesPayload : []);
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load user.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
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

    const handleWarehouseChange = (value) => {
        setForm((previous) => ({ ...previous, warehouse_id: value }));
        setErrors((previous) => {
            if (!previous.warehouse_id) return previous;
            const next = { ...previous };
            delete next.warehouse_id;
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.password && form.password !== form.c_password) {
            setErrors({ c_password: ['The confirm password must match password.'] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateUser(id, {
                warehouse_id: Number(form.warehouse_id),
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                c_password: form.c_password,
            });

            toast.success('User updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/users');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update user.';
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
        return <p className="text-sm text-muted-foreground">Loading user...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onWarehouseChange={handleWarehouseChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/users')}
                isSubmitting={isSubmitting}
                warehouses={warehouses}
                errors={errors}
                submitLabel="Update User"
                submittingLabel="Updating..."
            />
        </div>
    );
}
