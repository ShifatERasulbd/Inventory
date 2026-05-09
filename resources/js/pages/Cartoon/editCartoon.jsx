import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/cartoon/editForm';
import { useAppContext } from '@/context/AppContext';
import { fetchPurchases } from '@/pages/Purchase/api';
import { fetchWarehouses } from '@/pages/Purchase/api';

import { fetchCartoon, updateCartoon } from './api';

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

export default function EditCartoon() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle, user, setUser } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
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
                        p_o_number: cartoon.p_o_number ? String(cartoon.p_o_number) : '',
                        warehouse_id: cartoon.warehouse_id ? String(cartoon.warehouse_id) : '',
                        rack_id: cartoon.rack_id ? String(cartoon.rack_id) : '',
                        rack_row_id: cartoon.rack_row_id ? String(cartoon.rack_row_id) : '',
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

    const handlePurchaseChange = (value) => {
        setForm((previous) => ({ ...previous, p_o_number: value }));
        setErrors((previous) => {
            if (!previous.p_o_number) return previous;
            const next = { ...previous };
            delete next.p_o_number;
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});

        try {
            await updateCartoon(id, {
                cartoon_number: form.cartoon_number.trim(),
                ...(form.p_o_number ? { p_o_number: Number(form.p_o_number) } : {}),
                ...(form.warehouse_id ? { warehouse_id: Number(form.warehouse_id) } : {}),
                ...(form.rack_id ? { rack_id: Number(form.rack_id) } : { rack_id: null }),
                ...(form.rack_row_id ? { rack_row_id: Number(form.rack_row_id) } : { rack_row_id: null }),
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
                onPurchaseChange={handlePurchaseChange}
                purchases={purchases}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/cartoons')}
                isSubmitting={isSubmitting}
                errors={errors}
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
    );
}