import { Button } from '@/components/ui/button';

const STATUS_OPTIONS = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

function Field({ label, required, error, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default function EditForm({ form, fieldErrors, isSaving, onChangeField, onSave }) {
    function inputCls(field) {
        return `h-9 w-full rounded border px-3 text-sm text-zinc-900 outline-none focus:border-zinc-700 ${
            fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-zinc-300 bg-white'
        }`;
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left Column: Input Fields */}
            <div className="space-y-6">
                {/* Contact */}
                <section className="rounded border border-zinc-200 bg-white p-5">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Contact Information</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="First Name" required error={fieldErrors.first_name}>
                            <input value={form.first_name} onChange={(e) => onChangeField('first_name', e.target.value)} className={inputCls('first_name')} />
                        </Field>
                        <Field label="Last Name" required error={fieldErrors.last_name}>
                            <input value={form.last_name} onChange={(e) => onChangeField('last_name', e.target.value)} className={inputCls('last_name')} />
                        </Field>
                        <Field label="Email" required error={fieldErrors.email}>
                            <input type="email" value={form.email} onChange={(e) => onChangeField('email', e.target.value)} className={inputCls('email')} />
                        </Field>
                        <Field label="Phone" error={fieldErrors.phone}>
                            <input type="tel" value={form.phone} onChange={(e) => onChangeField('phone', e.target.value)} className={inputCls('phone')} />
                        </Field>
                    </div>
                </section>

                {/* Shipping */}
                <section className="rounded border border-zinc-200 bg-white p-5">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Shipping Address</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Field label="Address Line 1" required error={fieldErrors.address_line_1}>
                                <input value={form.address_line_1} onChange={(e) => onChangeField('address_line_1', e.target.value)} className={inputCls('address_line_1')} />
                            </Field>
                        </div>
                        <Field label="Address Line 2" error={fieldErrors.address_line_2}>
                            <input value={form.address_line_2} onChange={(e) => onChangeField('address_line_2', e.target.value)} className={inputCls('address_line_2')} />
                        </Field>
                        <Field label="City" required error={fieldErrors.city}>
                            <input value={form.city} onChange={(e) => onChangeField('city', e.target.value)} className={inputCls('city')} />
                        </Field>
                        <Field label="State" error={fieldErrors.state}>
                            <input value={form.state} onChange={(e) => onChangeField('state', e.target.value)} className={inputCls('state')} />
                        </Field>
                        <Field label="Postal Code" error={fieldErrors.postal_code}>
                            <input value={form.postal_code} onChange={(e) => onChangeField('postal_code', e.target.value)} className={inputCls('postal_code')} />
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Country" error={fieldErrors.country}>
                                <input value={form.country} onChange={(e) => onChangeField('country', e.target.value)} className={inputCls('country')} />
                            </Field>
                        </div>
                    </div>
                </section>

                {/* Notes */}
                <section className="rounded border border-zinc-200 bg-white p-5">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Notes</h2>
                    <textarea
                        value={form.notes}
                        onChange={(e) => onChangeField('notes', e.target.value)}
                        rows={4}
                        className="w-full resize-none rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-700"
                    />
                </section>
            </div>

            {/* Right Column: Order Actions status configurations */}
            <div className="space-y-5">
                <section className="rounded border border-zinc-200 bg-white p-5">
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Order Status</h2>
                    <select
                        value={form.status}
                        onChange={(e) => onChangeField('status', e.target.value)}
                        className="h-9 w-full rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-zinc-700"
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>

                    <Button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving}
                        className="mt-4 h-9 w-full bg-zinc-900 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
                    >
                        {isSaving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </section>
            </div>
        </div>
    );
}