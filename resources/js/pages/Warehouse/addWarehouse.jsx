import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddForm from '@/components/warehouse/addForm';
import { useAppContext } from '@/context/AppContext';
import { fetchCountries } from '@/pages/Country/api';
import { fetchStates } from '@/pages/State/api';
import { toast } from 'sonner';

const initialForm={
    name:'',
    country_id:'',
    state_id:'',
    fulladress:''
};

function validateForm(form){
    const errors={};

    if(!form.country_id){
        errors.country_id = ['Please select a country.'];
    }

    if(!form.state_id){
        errors.state_id=['please select a state'];
    }

    if(!form.name){
        errors.name=['Please enter the name of the warehouse'];
    }

    if(!form.fulladress){
        errors.fulladress=['Please enter the full adress of the warehouse']
    }
    return errors;
}
export default function AddWarehouse(){
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);

    useEffect(() => {
        setPageTitle('Add Warehouse');
    }, [setPageTitle]);

    useEffect(() => {
        fetchCountries().then(setCountries);
        fetchStates().then(setStates);
    }, []);

    const filteredStates = states.filter((state) => String(state.country_id) === String(form.country_id));

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

    const handleCountryChange = (value) => {
        setForm((previous) => ({ ...previous, country_id: value, state_id: '' }));
        setErrors((previous) => {
            if (!previous.country_id) return previous;
            const next = { ...previous };
            delete next.country_id;
            delete next.state_id;
            return next;
        });
    };

    const handleStateChange = (value) => {
        setForm((previous) => ({ ...previous, state_id: value }));
        setErrors((previous) => {
            if (!previous.state_id) return previous;
            const next = { ...previous };
            delete next.state_id;
            return next;
        });
    };

    const handleStateOpenChange = (open) => {
        if (!open || form.country_id) {
            return;
        }

        setErrors((previous) => ({
            ...previous,
            state_id: ['Select the country first.'],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Wire to warehouse API when backend endpoints are ready.
            toast.success('Warehouse data is valid and ready to save.', {
                style: { color: '#16a34a' },
            });
            navigate('/warehouses');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
              <div className="space-y-5">
                     <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                        <AddForm
                             form={form}
                             onChange={handleChange}
                             onCountryChange={handleCountryChange}
                                onStateChange={handleStateChange}
                                          onStateOpenChange={handleStateOpenChange}
                             onSubmit={handleSubmit}
                             onCancel={() => navigate('/warehouses')}
                             isSubmitting={isSubmitting}
                             countries={countries}
                                states={filteredStates}
                             errors={errors}
                        />
                     </div>  
              </div>
        </>
    )
}