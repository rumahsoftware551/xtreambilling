import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, AlertCircle, Banknote, QrCode } from 'lucide-react';
import { Invoice, Customer, PaymentMethod } from '../types';
import { formatRupiah } from '../services/billingService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices?: Invoice[];
  customers?: Customer[];
  selectedInvoice: Invoice | null;
  onSavePayment: (paymentData: {
    invoice_id: string;
    customer_id: string;
    amount: number;
    method: PaymentMethod;
    reference_number?: string;
    notes?: string;
    instant_verify: boolean;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoices = [],
  customers = [],
  selectedInvoice,
  onSavePayment,
}) => {
  const safeInvoices = invoices || [];
  const safeCustomers = customers || [];
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [instantVerify, setInstantVerify] = useState(true);

  // Unpaid invoices
  const unpaidInvoices = safeInvoices.filter(
    (i) => i.status === 'ISSUED' || i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID'
  );

  useEffect(() => {
    if (selectedInvoice) {
      setInvoiceId(selectedInvoice.id);
      setAmount(selectedInvoice.total - selectedInvoice.paid_amount);
      setReferenceNumber(`TRX-BCA-${Math.floor(100000 + Math.random() * 900000)}`);
    } else if (unpaidInvoices.length > 0) {
      setInvoiceId(unpaidInvoices[0].id);
      setAmount(unpaidInvoices[0].total - unpaidInvoices[0].paid_amount);
      setReferenceNumber(`TRX-BCA-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [selectedInvoice, isOpen]);

  const currentInv = safeInvoices.find((i) => i.id === invoiceId);
  const currentCust = currentInv ? safeCustomers.find((c) => c.id === currentInv.customer_id) : null;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId || !amount || !currentInv) return;

    onSavePayment({
      invoice_id: invoiceId,
      customer_id: currentInv.customer_id,
      amount: Number(amount),
      method,
      reference_number: referenceNumber || undefined,
      notes: notes || undefined,
      instant_verify: instantVerify,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Catat Pembayaran Tagihan</h3>
              <p className="text-xs text-slate-400">
                Blueprint Modul 8.6 & 10.2: Payment verification & instant balance allocation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Choose Invoice */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Pilih Faktur Tagihan *
            </label>
            <select
              value={invoiceId}
              onChange={(e) => {
                setInvoiceId(e.target.value);
                const inv = invoices.find((i) => i.id === e.target.value);
                if (inv) setAmount(inv.total - inv.paid_amount);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {unpaidInvoices.map((inv) => {
                const c = customers.find((cust) => cust.id === inv.customer_id);
                return (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} - {c?.name} ({formatRupiah(inv.total - inv.paid_amount)})
                  </option>
                );
              })}
            </select>
          </div>

          {currentInv && currentCust && (
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Pelanggan:</span>
                <span className="font-semibold text-slate-200">{currentCust.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jatuh Tempo:</span>
                <span className="text-red-400 font-medium">{currentInv.due_date}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-800 pt-1">
                <span className="text-slate-300">Sisa Tagihan:</span>
                <span className="text-emerald-400 font-mono">
                  {formatRupiah(currentInv.total - currentInv.paid_amount)}
                </span>
              </div>
            </div>
          )}

          {/* Amount Paid */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nominal yang Dibayar (Rp) *
            </label>
            <input
              type="number"
              required
              min={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Metode Pembayaran *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="BANK_TRANSFER">Transfer Bank (BCA / Mandiri / BRI)</option>
              <option value="QRIS">QRIS Dinamis</option>
              <option value="CASH">Tunai (Kolektor / Kasir Kantor)</option>
              <option value="VIRTUAL_ACCOUNT">Virtual Account</option>
              <option value="E_WALLET">E-Wallet (GoPay, OVO, Dana)</option>
              <option value="COLLECTOR">Petugas Kolektor Lapangan</option>
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nomor Referensi / Bukti Transfer
            </label>
            <input
              type="text"
              placeholder="Contoh: TRX-BCA-889123 atau No Kwitansi"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Instant Verification */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={instantVerify}
                onChange={(e) => setInstantVerify(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 mt-0.5"
              />
              <div className="text-xs">
                <span className="font-semibold text-emerald-200">
                  Verifikasi Langsung & Aktifkan Otomatis (Re-aktivasi RADIUS)
                </span>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  Jika saldo tagihan menjadi nol, sistem akan otomatis mengubah status invoice menjadi LUNAS dan mengaktifkan kembali akun jika sebelumnya terisolir.
                </p>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pembayaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
