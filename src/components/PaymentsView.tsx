import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Ban,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Payment, Customer, Invoice, PaymentStatus } from '../types';
import { formatRupiah } from '../services/billingService';

interface PaymentsViewProps {
  payments?: Payment[];
  customers?: Customer[];
  invoices?: Invoice[];
  onOpenPaymentModal: () => void;
  onVerifyPayment: (paymentId: string) => void;
  onPrintReceipt: (payment: Payment) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments = [],
  customers = [],
  invoices = [],
  onOpenPaymentModal,
  onVerifyPayment,
  onPrintReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredPayments = payments.filter((pay) => {
    if (statusFilter !== 'ALL' && pay.status !== statusFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const cust = customers.find((c) => c.id === pay.customer_id);
      const inv = invoices.find((i) => i.id === pay.invoice_id);
      const matchesCode = pay.payment_code.toLowerCase().includes(term);
      const matchesRef = pay.reference_number
        ? pay.reference_number.toLowerCase().includes(term)
        : false;
      const matchesCustomer = cust ? cust.name.toLowerCase().includes(term) : false;
      const matchesInvoice = inv ? inv.invoice_number.toLowerCase().includes(term) : false;
      return matchesCode || matchesRef || matchesCustomer || matchesInvoice;
    }

    return true;
  });

  const totalVerified = payments
    .filter((p) => p.status === 'VERIFIED')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Manajemen Transaksi & Pembayaran (Payment Gateway)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verifikasi pembayaran bank, QRIS, dan setoran tunai kolektor. Pelunasan otomatis memulihkan akses isolir jaringan.
          </p>
        </div>

        <button
          onClick={onOpenPaymentModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Pembayaran Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Pembayaran Terverifikasi</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {formatRupiah(totalVerified)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Kas masuk berhasil dicatat ke sistem
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Menunggu Verifikasi Finance</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {pendingCount} <span className="text-sm font-sans font-normal text-slate-400">transaksi</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Memerlukan persetujuan staf billing
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Transaksi</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{payments.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Metode: Transfer, QRIS, Tunai</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor pembayaran, referensi transaksi, atau nama pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Status ({payments.length})</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="PENDING">Menunggu Verifikasi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Kode Pembayaran</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Faktur Tagihan</th>
                <th className="py-3 px-3">Metode & Referensi</th>
                <th className="py-3 px-3">Nominal (Rp)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada transaksi pembayaran yang cocok.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => {
                  const cust = customers.find((c) => c.id === pay.customer_id);
                  const inv = invoices.find((i) => i.id === pay.invoice_id);

                  return (
                    <tr key={pay.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-100 text-xs">
                          {pay.payment_code}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{pay.payment_date}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-200">
                          {cust ? cust.name : 'Unknown Customer'}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {cust?.customer_code}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-mono text-cyan-400 font-semibold">
                          {inv ? inv.invoice_number : '-'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {inv?.billing_period_start} s/d {inv?.billing_period_end}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {pay.method}
                        </span>
                        {pay.reference_number && (
                          <div className="font-mono text-[10px] text-slate-400 mt-1">
                            Ref: {pay.reference_number}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400 text-sm">
                        {formatRupiah(pay.amount)}
                      </td>

                      <td className="py-3.5 px-3">
                        {pay.status === 'VERIFIED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800 animate-pulse">
                            Pending Verifikasi
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pay.status === 'PENDING' ? (
                            <button
                              onClick={() => onVerifyPayment(pay.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition flex items-center gap-1"
                              title="Verifikasi Pembayaran & Lunaskan Faktur"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verifikasi</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onPrintReceipt(pay)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition flex items-center gap-1"
                              title="Cetak Kwitansi Pembayaran"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-400" />
                              <span>Kwitansi</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
