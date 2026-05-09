import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/cartoon/addForm';
import { useAppContext } from '@/context/AppContext';
import { fetchPurchases } from '@/pages/Purchase/api';
import { fetchWarehouses } from '@/pages/Purchase/api';

import { createCartoon } from './api';

const initialForm = {
    cartoon_number: '',
    p_o_number: '',
    warehouse_id: '',
    rack_id: '',
    rack_row_id: '',
};

async function fetchCurrentUser() {
    const response = await fetch('/api/user', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}

function validateForm(form) {
    const trimmedName = form.cartoon_number.trim();
    const trimmedPONumber = String(form.p_o_number ?? '').trim();
    const validationErrors = {};

    if (!trimmedName) {
        validationErrors.cartoon_number = ['The cartoon number field is required.'];
    }

    if (!trimmedPONumber) {
        validationErrors.p_o_number = ['The Purchase order number field is required.'];
    }

    return validationErrors;
}

export default function AddCartoons() {
    const navigate = useNavigate();
    const { setPageTitle, user, setUser } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [purchases, setPurchases] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [racks, setRacks] = useState([]);
    const [rackRows, setRackRows] = useState([]);
    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');

    useEffect(() => {
        let ignore = false;

        async function loadOptions() {
            try {
                const [purchaseData, warehouseData, currentUser] = await Promise.all([
                    fetchPurchases(),
                    fetchWarehouses(),
                    user ? Promise.resolve(user) : fetchCurrentUser(),
                ]);

                if (!ignore) {
                    const approvedOnly = (Array.isArray(purchaseData) ? purchaseData : []).filter((purchase) => {
                        const status = String(purchase?.status ?? '').toLowerCase();
                        return ['approve', 'approved', 'active'].includes(status);
                    });
                    setPurchases(approvedOnly);
                    setWarehouses(Array.isArray(warehouseData) ? warehouseData : []);

                    if (!user && currentUser) {
                        setUser(currentUser);
                    }
                }
            } catch (error) {
                if (!ignore) {
                    setPurchases([]);
                    setWarehouses([]);
                }
            }
        }

        loadOptions();

        return () => {
            ignore = true;
        };
    }, [setUser, user]);

    useEffect(() => {
        // Fetch all racks
        fetch('/api/racks')
            .then((response) => response.json())
            .then((data) => {
                setRacks(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error('Failed to fetch racks:', error);
                setRacks([]);
            });
    }, []);

    useEffect(() => {
        // Fetch rack rows when rack is selected
        if (form.rack_id) {
            fetch(`/api/racks/${form.rack_id}/rows`)
                .then((response) => response.json())
                .then((data) => {
                    setRackRows(Array.isArray(data) ? data : []);
                })
                .catch((error) => {
                    console.error('Failed to fetch rack rows:', error);
                    setRackRows([]);
                });
        } else {
            setRackRows([]);
        }
    }, [form.rack_id]);

    useEffect(() => {
        setPageTitle('Add Cartoon');
    }, [setPageTitle]);

    const warehouseLabel = (() => {
        if (user?.warehouse?.id) {
            return `${user.warehouse.name} (ID: ${user.warehouse.id})`;
        }

        if (Array.isArray(user?.warehouses) && user.warehouses.length > 0) {
            const first = user.warehouses[0];
            return `${first.name} (ID: ${first.id})`;
        }

        return 'Auto from login user warehouse';
    })();

    useEffect(() => {
        if (isSuperAdmin) {
            return;
        }

        const loginWarehouseId = user?.warehouse?.id || (Array.isArray(user?.warehouses) && user.warehouses.length > 0 ? user.warehouses[0].id : '');

        if (loginWarehouseId) {
            setForm((previous) => ({
                ...previous,
                warehouse_id: String(loginWarehouseId),
            }));
        }
    }, [isSuperAdmin, user]);

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

    const handleRackChange = (value) => {
        setForm((previous) => ({
            ...previous,
            rack_id: value,
            rack_row_id: '', // Reset rack row when rack changes
        }));
    };

    const handleRackRowChange = (value) => {
        setForm((previous) => ({
            ...previous,
            rack_row_id: value,
        }));
    };

    const handleWarehouseChange = (value) => {
        setForm((previous) => ({
            ...previous,
            warehouse_id: value,
        }));
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
            await createCartoon({
                cartoon_number: form.cartoon_number.trim(),
                p_o_number: Number(form.p_o_number),
                ...(form.warehouse_id ? { warehouse_id: Number(form.warehouse_id) } : {}),
                ...(form.rack_id && { rack_id: Number(form.rack_id) }),
                ...(form.rack_row_id && { rack_row_id: Number(form.rack_row_id) }),
            });

            toast.success('Cartoon created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/cartoons');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create Cartoon.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePurchaseChange = (value) => {
        setForm((previous) => ({ ...previous, p_o_number: value }));
        setErrors((previous) => {
            if (!previous.p_o_number && !previous.P_O_number) {
                return previous;
            }

            const next = { ...previous };
            delete next.p_o_number;
            delete next.P_O_number;
            return next;
        });
    };

    return (
        <>
            <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/cartoons')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    onPurchaseChange={handlePurchaseChange}
                    purchases={purchases}
                    racks={racks}
                    rackRows={rackRows}
                    onRackChange={handleRackChange}
                    onRackRowChange={handleRackRowChange}
                    warehouses={warehouses}
                    isSuperAdmin={isSuperAdmin}
                    warehouseLabel={warehouseLabel}
                    onWarehouseChange={handleWarehouseChange}
                />
            </div>
            </div>
        </>
    );
}