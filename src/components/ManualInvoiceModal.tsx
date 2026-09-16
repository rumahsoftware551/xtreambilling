import React, { useState } from 'react';
import { X, Receipt, Plus, Trash2, Check } from 'lucide-react';
import { Customer, Subscription, SystemSettings, Invoice, InvoiceItem } from '../types';
import { formatRupiah, generateInvoiceNumber } from '../services/billingService';

interface ManualInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  subscriptions: Subscription[];
  settings: SystemSettings;
  onSaveInvoice: (newInvoice: Invoice) => void;
}

export const ManualInvoiceModal: React.FC<ManualInvoiceModalProps> = ({
  isOpen,
  onClose,
  customers,
  subscriptions,
  settings,
  onSaveInvoice,
}) => {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');
  const [dueDate, setDueDate] = useState('2026-09-20');
  const [discount, setDiscount] = useState<number>(0);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: `item-1`,
      description: 'Layanan Internet Dedicated / Broadband Periode September 2026',
      quantity: 1,
      unit_price: 250000,
      total: 250000,
    },
  ]);

  if (!isOpen) return null;

  const customerSubs = subscriptions.filter((s) => s.customer_id === customerId);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: 'Biaya Tambahan / Instalasi',
        quantity: 1,
        unit_price: 50000,
        total: 50000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const taxPercentage = settings?.tax_percentage ?? 11;
  const tax = Math.round((subtotal - discount) * (taxPercentage / 100));
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    const subId = subscriptionId || (customerSubs[0] ? customerSubs[0].id : `sub-man-${Date.now()}`);
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const invoiceNum = `INV-MAN-${ym}-${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')}`;

    const newInvoice: Invoice = {
      id: `inv-man-${Date.now()}`,
      invoice_number: invoiceNum,
      customer_id: customerId,
      subscription_id: subId,
      issue_date: '2026-09-15',
      due_date: dueDate,
      billing_period_start: periodStart,
      billing_period_end: periodEnd,
      subtotal,
      discount,
      tax,
      late_fee: 0,
      total: grandTotal,
      paid_amount: 0,
      status: 'ISSUED',
      items,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    onSaveInvoice(newInvoice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Buat Faktur Tagihan Manual</h3>
              <p className="text-xs text-slate-400">Penerbitan faktur khusus atau biaya instalasi.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Customer & Sub */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Pilih Pelanggan *</label>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  const matchingSubs = subscriptions.filter((s) => s.customer_id === e.target.value);
                  if (matchingSubs[0]) setSubscriptionId(matchingSubs[0].id);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customer_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Langganan / PPPoE *</label>
              <select
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {customerSubs.map((s) => (
                  <option key={s.id} value={s.id}>
                    @{s.username} ({formatRupiah(s.price)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Periods & Due Date */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Awal Periode</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Akhir Periode</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Jatuh Tempo *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-amber-300"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-300">Rincian Item Tagihan:</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Item</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <input
                  type="text"
                  placeholder="Deskripsi..."
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                />
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                  className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-center"
                />
                <input
                  type="number"
                  min={0}
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(idx, 'unit_price', Number(e.target.value))}
                  className="w-28 px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 text-right"
                />
                <span className="w-28 text-right font-mono font-bold text-slate-300">
                  {formatRupiah(item.total)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals Calculation */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Potongan Diskon:</span>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-28 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono text-right text-emerald-400"
              />
            </div>
            <div className="flex justify-between">
              <span>PPN ({taxPercentage}%):</span>
              <span className="font-mono">{formatRupiah(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
              <span>Total Faktur:</span>
              <span className="font-mono text-cyan-300">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Terbitkan Faktur</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
