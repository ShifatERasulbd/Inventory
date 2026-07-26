import EditRackColumnForm from '@/components/rackcolumn/editForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import { fetchRackColumn, updateRackColumn } from './api';
import { fetchRackRows } from '@/pages/RackRow/api';

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

export default function EditRackColumn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { rack_id, id } = useParams();
  const { setPageTitle } = useAppContext();

  const [form, setForm] = useState({ row_id: '', column_number: '', code: '' });
  const [rows, setRows] = useState([]);


  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    setPageTitle('Edit Rack Column');
  }, [setPageTitle]);

  const selectedRowId = new URLSearchParams(location.search).get('row_id') || '';

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [column, rackRows] = await Promise.all([
          fetchRackColumn(rack_id, id),
          fetchRackRows(rack_id),
        ]);

        const nextRows = Array.isArray(rackRows) ? rackRows : [];
        if (column?.row && !nextRows.some((row) => String(row.id) === String(column.row.id))) {
          nextRows.unshift(column.row);
        }

        setRows(nextRows);
        setForm({
          row_id: String(column.row_id || column.row?.id || selectedRowId || ''),
          column_number: column.column_number,
          code: column.code,
        });

      } catch (error) {
        const message = error.message || 'Failed to load column.';
        setRequestError(message);
        toast.error(message, { style: { color: '#dc2626' } });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [rack_id, id, selectedRowId]);

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
      await updateRackColumn(rack_id, id, {
        row_id: Number(form.row_id),
        column_number: form.column_number.trim(),
        code: form.code.trim(),
      });


      toast.success('Column updated successfully.', { style: { color: '#16a34a' } });
      navigate(`/racks/${rack_id}/columns`);
    } catch (error) {
      setErrors(error.payload?.errors || {});
      if (!error.payload?.errors) {
        const message = error.message || 'Failed to update column.';
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
        <EditRackColumnForm
          form={form}
          onChange={handleChange}
          onRowChange={handleRowChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          onCancel={() => navigate(`/racks/${rack_id}/columns`)}
          errors={errors}
          requestError={requestError}
          rows={rows}
        />
      </div>
    </div>
  );
}

