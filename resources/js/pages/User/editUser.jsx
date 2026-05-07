import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/user/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchWarehouses } from '@/pages/Warehouse/api';
import { fetchRoles } from '@/pages/Role/api';

import { fetchUser, updateUser } from './api';

const initialForm = {
    warehouse_ids: [],
    role_ids: [],
    name: '',
    email: '',
    password: '',
    c_password: '',
};

export default function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle, user: authUser } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [warehouses, setWarehouses] = useState([]);
    const [roles, setRoles] = useState([]);

    const isSelfEdit = Number(id) === Number(authUser?.id);
    const canManageRoles = authUser?.role_slugs?.includes('super-admin');

    useEffect(() => {
        setPageTitle('Edit User');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [user, warehousesPayload] = await Promise.all([
                    fetchUser(id),
                    fetchWarehouses(),
                ]);

                let rolesPayload = [];
                if (canManageRoles) {
                    try {
                        rolesPayload = await fetchRoles();
                    } catch (error) {
                        if (error?.status !== 403) {
                            throw error;
                        }
                    }
                }

                if (!ignore) {
                    setForm({
                        warehouse_ids: Array.isArray(user?.warehouse_ids) ? user.warehouse_ids : [],
                        role_ids: Array.isArray(user?.roles) ? user.roles.map((r) => r.id) : [],
                        name: user?.name || '',
                        email: user?.email || '',
                        password: '',
                        c_password: '',
                    });
                    setWarehouses(Array.isArray(warehousesPayload) ? warehousesPayload : []);
                    setRoles(Array.isArray(rolesPayload) ? rolesPayload : []);
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
    }, [id, canManageRoles]);

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

    const handleWarehouseToggle = (warehouseId) => {
        setForm((previous) => {
            const warehouse_ids = previous.warehouse_ids.includes(warehouseId)
                ? previous.warehouse_ids.filter((w) => w !== warehouseId)
                : [...previous.warehouse_ids, warehouseId];
            return { ...previous, warehouse_ids };
        });
        setErrors((previous) => {
            if (!previous.warehouse_ids) return previous;
            const next = { ...previous };
            delete next.warehouse_ids;
            return next;
        });
    };

    const handleRoleToggle = (roleId) => {
        setForm((previous) => {
            const role_ids = previous.role_ids.includes(roleId)
                ? previous.role_ids.filter((r) => r !== roleId)
                : [...previous.role_ids, roleId];
            return { ...previous, role_ids };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.warehouse_ids.length === 0) {
            setErrors({ warehouse_ids: ['Please select at least one warehouse.'] });
            return;
        }

        if (form.password && form.password !== form.c_password) {
            setErrors({ c_password: ['The confirm password must match password.'] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            const payload = {
                warehouse_ids: form.warehouse_ids,
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                c_password: form.c_password,
            };

            if (canManageRoles && !isSelfEdit) {
                payload.role_ids = form.role_ids;
            }

            await updateUser(id, payload);

            toast.success('User updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/users');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update user.';
                setLoadError(message);
                toast.error(message, { style: { color: '#dc2626' } });
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
                onWarehouseToggle={handleWarehouseToggle}
                onRoleToggle={handleRoleToggle}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/users')}
                isSubmitting={isSubmitting}
                warehouses={warehouses}
                roles={roles}
                showRoles={canManageRoles && !isSelfEdit}
                errors={errors}
                submitLabel="Update User"
                submittingLabel="Updating..."
            />
        </div>
    );
}