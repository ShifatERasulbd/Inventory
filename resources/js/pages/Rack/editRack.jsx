import EditForm from '@/components/rack/editForm'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { fetchWarehouses } from '@/pages/Warehouse/api';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import { fetchRack, updateRack } from './api';

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

function validateForm(form, isSuperAdmin){
    const errors={};

    if(!form.name.trim()){
        errors.name=['The Rack Name is Required']
    }

    if(isSuperAdmin && !form.warehouse_id){
        errors.warehouse_id=['Please select the warehouse']
    }

    return errors;
}

export default function EditRack(){
    const navigate = useNavigate();
    const { id } = useParams();
    const { setPageTitle, user, setUser } = useAppContext();
    const [form, setForm] = useState({ name: '', warehouse_id: '' });
    const [errors, setErrors] = useState({});
    const [warehouses, setWarehouses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [requestError, setRequestError] = useState('');
    const isSuperAdmin = Array.isArray(user?.role_slugs) && user.role_slugs.includes('super-admin');
   
    useEffect(() => {
        setPageTitle('Edit Rack');
    }, [setPageTitle]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [rack, warehouseData, currentUser] = await Promise.all([
                    fetchRack(id),
                    fetchWarehouses(),
                    user ? Promise.resolve(user) : fetchCurrentUser(),
                ]);
                setForm({
                    name: rack.name,
                    warehouse_id: rack.warehouse_id,
                });
                setWarehouses(Array.isArray(warehouseData) ? warehouseData : []);

                if (!user && currentUser) {
                    setUser(currentUser);
                }
            } catch (error) {
                const message = error.message || 'Failed to load rack.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [id, setUser, user]);

    const warehouseLabel = (() => {
        const currentWarehouseId = Number(form.warehouse_id ?? 0);
        if (!currentWarehouseId) {
            return 'Auto from login warehouse';
        }

        const matched = warehouses.find((warehouse) => Number(warehouse.id) === currentWarehouseId);
        return matched ? `${matched.name} (ID: ${matched.id})` : `Warehouse ID: ${currentWarehouseId}`;
    })();

    const handleWarehouseChange = (value) => {
        setForm((previous) => ({
            ...previous,
            warehouse_id: value || '',
        }));
        setErrors((previous) => {
            if (!previous.warehouse_id) return previous;
            const next = { ...previous };
            delete next.warehouse_id;
            return next;
        });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(form, isSuperAdmin);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await updateRack(id, {
                name: form.name.trim(),
                warehouse_id: Number(form.warehouse_id),
            });
            toast.success('Rack updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/racks');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update rack.';
                setRequestError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <>
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <EditForm
                    form={form}
                    onWarehouseChange={handleWarehouseChange}
                    warehouses={warehouses}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/racks')}
                    errors={errors}
                    requestError={requestError}
                    isSuperAdmin={isSuperAdmin}
                    warehouseLabel={warehouseLabel}
                />
            </div>
        </div>
        </>
    )
}
