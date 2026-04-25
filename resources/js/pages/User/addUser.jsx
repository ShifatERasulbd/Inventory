import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/user/addForm';
import { useAppContext } from '@/context/AppContext';
import { fetchWarehouses } from '@/pages/Warehouse/api';
import { fetchRoles } from '@/pages/Role/api';

import { createUser } from './api';

const initialForm = {
    warehouse_ids: [],
    role_ids: [],
    name: '',
    email: '',
    password: '',
    c_password: '',
};

function validateForm(form) {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = ['The user name field is required.'];
    }

    if (!form.email.trim()) {
        errors.email = ['The email field is required.'];
    }

    if (!form.password) {
        errors.password = ['The password field is required.'];
    }

    if (!form.c_password) {
        errors.c_password = ['The confirm password field is required.'];
    } else if (form.password !== form.c_password) {
        errors.c_password = ['The confirm password must match password.'];
    }

    if (!form.warehouse_ids || form.warehouse_ids.length === 0) {
        errors.warehouse_ids = ['Please select at least one warehouse.'];
    }

    return errors;
}

export default function AddUser() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [warehouses, setWarehouses] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        setPageTitle('Add User');
    }, [setPageTitle]);

    useEffect(() => {
        Promise.all([fetchWarehouses(), fetchRoles()]).then(([w, r]) => {
            setWarehouses(w);
            setRoles(r);
        });
    }, []);

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

    const handleWarehouseToggle = (id) => {
        setForm((previous) => {
            const warehouse_ids = previous.warehouse_ids.includes(id)
                ? previous.warehouse_ids.filter((w) => w !== id)
                : [...previous.warehouse_ids, id];
            return { ...previous, warehouse_ids };
        });
        setErrors((previous) => {
            if (!previous.warehouse_ids) return previous;
            const next = { ...previous };
            delete next.warehouse_ids;
            return next;
        });
    };

    const handleRoleToggle = (id) => {
        setForm((previous) => {
            const role_ids = previous.role_ids.includes(id)
                ? previous.role_ids.filter((r) => r !== id)
                : [...previous.role_ids, id];
            return { ...previous, role_ids };
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
            await createUser({
                warehouse_ids: form.warehouse_ids,
                role_ids: form.role_ids,
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                c_password: form.c_password,
            });

            toast.success('User created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/users');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create user.';
                setRequestError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onWarehouseToggle={handleWarehouseToggle}
                    onRoleToggle={handleRoleToggle}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/users')}
                    isSubmitting={isSubmitting}
                    warehouses={warehouses}
                    roles={roles}
                    errors={errors}
                />
            </div>
        </div>
    );
}


