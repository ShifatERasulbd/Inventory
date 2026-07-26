import AddRackColumnForm from '@/components/rackcolumn/addForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import { createRackColumn } from './api';
import { fetchRackRows } from '@/pages/RackRow/api';

const initialForm = {
  row_id: '',
  column_number: '',
  code: '',
};


function validateForm(form) {
  const errors = {};

  if (!form.row_id) {
    errors.row_id = ['The Rack Row is required'];
  }

  if (!form.column_number.trim()) {
    errors.column_number = ['The Column Number is required'];
  }

  if (!form.code.trim()) {
    errors.code = ['The Code is required'];
  }

  return errors;
}

export default function AddRackColumn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { rack_id } = useParams();
  const { setPageTitle } = useAppContext();

  const selectedRowId = new URLSearchParams(location.search).get('row_id') || '';

  const [form, setForm] = useState(() => ({
    ...initialForm,
    row_id: selectedRowId,
  }));
  const [rows, setRows] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    setPageTitle('Add Rack Column');
  }, [setPageTitle]);

  useEffect(() => {
    const loadRows = async () => {
      try {
        const data = await fetchRackRows(rack_id);
        const nextRows = Array.isArray(data) ? data : [];
        setRows(nextRows);
        setForm((previous) => ({
          ...previous,
          row_id: selectedRowId || previous.row_id || (nextRows[0] ? String(nextRows[0].id) : ''),
        }));
      } catch (error) {
        const message = error.message || 'Failed to load rack rows.';
        setRequestError(message);
        toast.error(message, { style: { color: '#dc2626' } });
      }
    };

    loadRows();
  }, [rack_id, selectedRowId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleRowChange = (value) => {
    setForm((prev) => ({ ...prev, row_id: value }));
    setErrors((prev) => {
      if (!prev.row_id) return prev;
      const next = { ...prev };
      delete next.row_id;
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setRequestError('');

    try {
      await createRackColumn(rack_id, {
        row_id: Number(form.row_id),
        column_number: form.column_number.trim(),
        code: form.code.trim(),
      });


      toast.success('Column created successfully.', { style: { color: '#16a34a' } });
      navigate(`/racks/${rack_id}/columns`);
    } catch (error) {
      setErrors(error.payload?.errors || {});
      if (!error.payload?.errors) {
        const message = error.message || 'Failed to create column.';
        setRequestError(message);
        toast.error(message, { style: { color: '#dc2626' } });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
        <AddRackColumnForm
          form={form}
          onChange={handleChange}
          onRowChange={handleRowChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate(`/racks/${rack_id}/columns`)}
          errors={errors}
          requestError={requestError}
          rows={rows}
        />
      </div>
    </div>
  );
}

