import { useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { Button } from '@/components/ui/button';

const A4_W = 794;
const A4_H = 1123;

const cell = (extra = {}) => ({
    border: '1px solid #e2e8f0',
    padding: '8px 10px',
    fontSize: 12,
    ...extra,
});

export default function PurchaseInvoiceModal({ purchase, open, onClose }) {
    const sheetRef = useRef(null);
    const [discount, setDiscount] = useState('0');

    const products  = Array.isArray(purchase?.products) ? purchase.products : [];
    const subtotal  = products.reduce((s, i) => s + Number(i.quantity ?? 0) * Number(i.purchase_price ?? 0), 0);
    const discountAmt = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
    const grandTotal  = subtotal - discountAmt;

    const purchaseFrom = purchase?.purchase_form_name || `Warehouse #${purchase?.purchase_form ?? ''}`;
    const purchaseTo   = purchase?.purchase_to_name   || `Warehouse #${purchase?.purchase_to   ?? ''}`;
    const invoiceDate  = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    /* ── print ─────────────────────────────────────────────────────── */
    const handlePrint = () => {
        if (!sheetRef.current) return;
        const markup = sheetRef.current.innerHTML;
        const win = window.open('', '_blank', `width=${A4_W + 40},height=${A4_H + 80}`);
        if (!win) return;

        win.document.open();
        win.document.write(`<!doctype html><html><head>
            <meta charset="UTF-8"/>
            <title>Invoice ${purchase?.po_number ?? ''}</title>
            <style>
                @page { size: A4 portrait; margin: 14mm 16mm; }
                * { box-sizing: border-box; }
                body { margin:0; padding:0; background:#fff; color:#0f172a;
                       font-family:"Segoe UI",Tahoma,sans-serif;
                       -webkit-print-color-adjust:exact; print-color-adjust:exact; }
                /* party block */
                .party-row { display:flex; gap:0; margin-bottom:20px; }
                .party-box { flex:1; padding:12px 14px; }
                .party-box.from { background:#0369a1; color:#fff; border-radius:6px 0 0 6px; }
                .party-box.to   { background:#f0f9ff; border:1px solid #bae6fd; border-left:none; border-radius:0 6px 6px 0; }
                .party-label { font-size:9px; text-transform:uppercase; letter-spacing:.06em; opacity:.75; margin:0 0 4px; }
                .party-name  { font-size:14px; font-weight:700; margin:0; }
                /* meta row */
                .meta-row { display:flex; gap:12px; margin-bottom:20px; }
                .meta-box { flex:1; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; background:#f8fafc; }
                .meta-label { font-size:9px; text-transform:uppercase; letter-spacing:.05em; color:#64748b; margin:0 0 3px; }
                .meta-val   { font-size:13px; font-weight:600; margin:0; }
                .badge { display:inline-block; padding:2px 10px; border-radius:9999px;
                         background:#e0f2fe; color:#0369a1; font-size:11px; font-weight:600; }
                /* table */
                table { width:100%; border-collapse:collapse; margin-bottom:16px; }
                th { background:#0369a1; color:#fff; font-size:10px; font-weight:600;
                     text-transform:uppercase; letter-spacing:.04em; padding:8px 10px; text-align:left; }
                td { border:1px solid #e2e8f0; padding:8px 10px; font-size:12px; }
                tr:nth-child(even) td { background:#f8fbff; }
                .tr { text-align:right; }
                /* totals */
                .totals-wrap { display:flex; justify-content:flex-end; }
                .totals-table { border-collapse:collapse; min-width:260px; }
                .totals-table td { border:1px solid #e2e8f0; padding:7px 14px; font-size:12px; }
                .totals-table .lbl { color:#64748b; }
                .totals-table .grand td { background:#0369a1; color:#fff; font-weight:700; font-size:14px; }
            </style>
        </head><body><div>${markup}</div></body></html>`);
        win.document.close();
        win.focus();
        win.onload = () => { win.print(); win.close(); };
    };

    /* ── shared inline styles ───────────────────────────────────────── */
    const S = {
        sheet: {
            width: A4_W, minHeight: A4_H,
            padding: '40px 48px',
            background: '#fff',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            color: '#0f172a', fontSize: 13,
        },
        /* party */
        partyRow: { display: 'flex', marginBottom: 22 },
        partyFrom: { flex: 1, background: '#0369a1', color: '#fff', padding: '14px 18px', borderRadius: '6px 0 0 6px' },
        partyTo:   { flex: 1, background: '#f0f9ff', border: '1px solid #bae6fd', borderLeft: 'none', padding: '14px 18px', borderRadius: '0 6px 6px 0' },
        partyLabel:{ margin: '0 0 4px', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.06em', opacity: .75 },
        partyName: { margin: 0, fontSize: 15, fontWeight: 700 },
        /* meta */
        metaRow: { display: 'flex', gap: 12, marginBottom: 22 },
        metaBox: { flex: 1, border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', background: '#f8fafc' },
        metaLbl: { margin: '0 0 3px', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b' },
        metaVal: { margin: 0, fontSize: 13, fontWeight: 600 },
        /* table header */
        th: (right) => ({ background: '#0369a1', color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', padding: '8px 10px', textAlign: right ? 'right' : 'left' }),
        /* totals */
        totalsWrap: { display: 'flex', justifyContent: 'flex-end', marginTop: 4 },
        totalsTable: { borderCollapse: 'collapse', minWidth: 280 },
        totalsLbl: { ...cell(), color: '#64748b', width: 130 },
        totalsVal: { ...cell({ textAlign: 'right', fontWeight: 500 }) },
        grandTd:   { padding: '9px 10px', fontSize: 14, fontWeight: 700, background: '#0369a1', color: '#fff' },
    };

    return (
        <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
                    <Dialog.Content
                        className="relative mx-auto my-8 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                        style={{ width: A4_W }}
                    >
                        {/* Toolbar */}
                        <div className="mb-3 flex items-center justify-between">
                            <Dialog.Title className="text-sm font-semibold text-white">
                                Purchase Invoice &nbsp;·&nbsp;
                                <span className="font-normal opacity-75">PO: {purchase?.po_number ?? '—'}</span>
                            </Dialog.Title>
                            <div className="flex items-center gap-2">
                                <Button size="sm" onClick={handlePrint}>
                                    <Printer className="mr-1.5 h-3.5 w-3.5" />
                                    Print
                                </Button>
                                <Dialog.Close asChild>
                                    <Button variant="secondary" size="icon" aria-label="Close">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </Dialog.Close>
                            </div>
                        </div>

                        {/* ── A4 sheet ── */}
                        <div ref={sheetRef} style={S.sheet}>

                            {/* 1. FROM / TO */}
                            <div style={S.partyRow}>
                                <div style={S.partyFrom}>
                                    <p style={S.partyLabel}>Purchase From</p>
                                    <p style={S.partyName}>{purchaseFrom}</p>
                                </div>
                                <div style={S.partyTo}>
                                    <p style={{ ...S.partyLabel, color: '#0369a1', opacity: 1 }}>Purchase To</p>
                                    <p style={{ ...S.partyName, color: '#0f172a' }}>{purchaseTo}</p>
                                </div>
                            </div>

                            {/* 2. Invoice meta */}
                            <div style={S.metaRow}>
                                {[
                                    { label: 'PO Number',    value: purchase?.po_number ?? '—' },
                                    { label: 'Invoice Date', value: invoiceDate },
                                    { label: 'Total Items',  value: products.length },
                                    { label: 'Status',
                                      value: (
                                          <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:9999, background:'#e0f2fe', color:'#0369a1', fontSize:11, fontWeight:600, textTransform:'capitalize' }}>
                                              {purchase?.status ?? 'pending'}
                                          </span>
                                      )
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label} style={S.metaBox}>
                                        <p style={S.metaLbl}>{label}</p>
                                        {typeof value === 'string'
                                            ? <p style={S.metaVal}>{value}</p>
                                            : <div style={{ marginTop: 2 }}>{value}</div>}
                                    </div>
                                ))}
                            </div>

                            {/* 3. Products table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                                <thead>
                                    <tr>
                                        <th style={S.th(false)}>#</th>
                                        <th style={S.th(false)}>Product</th>
                                        <th style={S.th(true)}>Qty</th>
                                        <th style={S.th(true)}>Unit Price</th>
                                        <th style={S.th(true)}>Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={cell({ textAlign: 'center', color: '#64748b' })}>
                                                No products found.
                                            </td>
                                        </tr>
                                    ) : products.map((item, idx) => {
                                        const qty   = Number(item.quantity ?? 0);
                                        const price = Number(item.purchase_price ?? 0);
                                        return (
                                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fbff' }}>
                                                <td style={cell({ color: '#64748b', width: 36 })}>{idx + 1}</td>
                                                <td style={cell({ fontWeight: 500 })}>
                                                    {item.product_name || `Product #${item.product_id ?? ''}`}
                                                </td>
                                                <td style={cell({ textAlign: 'right', width: 60 })}>{qty}</td>
                                                <td style={cell({ textAlign: 'right', width: 110 })}>{price.toFixed(2)}</td>
                                                <td style={cell({ textAlign: 'right', width: 110, fontWeight: 600 })}>
                                                    {(qty * price).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* 4. Totals */}
                            <div style={S.totalsWrap}>
                                <table style={S.totalsTable}>
                                    <tbody>
                                        <tr>
                                            <td style={S.totalsLbl}>Subtotal</td>
                                            <td style={S.totalsVal}>{subtotal.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td style={S.totalsLbl}>Discount</td>
                                            <td style={cell({ textAlign: 'right', padding: '4px 6px' })}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={discount}
                                                    onChange={(e) => setDiscount(e.target.value)}
                                                    style={{
                                                        width: '100%', textAlign: 'right',
                                                        border: '1px solid #cbd5e1', borderRadius: 4,
                                                        padding: '4px 8px', fontSize: 12,
                                                        outline: 'none', background: '#fff',
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                        </tr>
                                        <tr className="grand">
                                            <td style={S.grandTd}>Grand Total</td>
                                            <td style={{ ...S.grandTd, textAlign: 'right' }}>{grandTotal.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                        </div>{/* /A4 sheet */}
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    );
}



