import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Clock,
  ShieldAlert,
  Printer,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  CreditCard,
  Ban,
  ArrowDownRight,
  Send,
  Zap,
} from 'lucide-react';
import { Invoice, Customer, Subscription, SystemSettings, InvoiceStatus } from '../types';
import { initialSettings } from '../data/initialData';
import { formatRupiah } from '../services/billingService';

interface InvoicesViewProps {
  invoices?: Invoice[];
  customers?: Customer[];
  subscriptions?: Subscription[];
  settings?: SystemSettings;
  onOpenAutoBillingModal: () => void;
  onOpenSuspensionModal: () => void;
  onOpenCreateInvoiceModal: () => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onRecordPaymentForInvoice: (invoice: Invoice) => void;
  onVoidInvoice: (invoiceId: string) => void;
  onSendInvoiceNotification: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices = [],
  customers = [],
  subscriptions = [],
  settings = initialSettings,
  onOpenAutoBillingModal,
  onOpenSuspensionModal,
  onOpenCreateInvoiceModal,
  onPrintInvoice,
  onRecordPaymentForInvoice,
  onVoidInvoice,
  onSendInvoiceNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Status Badge Helper
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Lunas
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800 animate-pulse">
            Jatuh Tempo (Overdue)
          </span>
        );
      case 'ISSUED':
      case 'SENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            Menunggu Pembayaran
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
            Sebagian
          </span>
        );
      case 'VOID':
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Batal
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'UNPAID') {
          if (inv.status === 'PAID' || inv.status === 'VOID' || inv.status === 'CANCELLED')
            return false;
        } else if (inv.status !== statusFilter) {
          return false;
        }
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const cust = customers.find((c) => c.id === inv.customer_id);
        const sub = subscriptions.find((s) => s.id === inv.subscription_id);
        const matchesNumber = inv.invoice_number.toLowerCase().includes(term);
        const matchesCustomer = cust ? cust.name.toLowerCase().includes(term) : false;
        const matchesUsername = sub ? sub.username.toLowerCase().includes(term) : false;
        return matchesNumber || matchesCustomer || matchesUsername;
      }

      return true;
    });
  }, [invoices, statusFilter, searchTerm, customers, subscriptions]);

  // Aggregate Metrics
  const totalReceivables = invoices
    .filter((i) => i.status === 'ISSUED' || i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID')
    .reduce((acc, i) => acc + (i.total - i.paid_amount), 0);

  const overdueCount = invoices.filter((i) => i.status === 'OVERDUE').length;
  const paidCount = invoices.filter((i) => i.status === 'PAID').length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>Penagihan Otomatis & Manajemen Invoice (Billing Core)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistem penagihan otomatis siklus bulanan (idempotent), pengecekan jatuh tempo, isolir otomatis dengan grace period, dan pencetakan faktur.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAutoBillingModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-900/30 transition flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Jalankan Penagihan Otomatis</span>
          </button>

          <button
            onClick={onOpenSuspensionModal}
            className="px-3.5 py-2 bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Calon Isolir & Isolir Otomatis</span>
          </button>

          <button
            onClick={onOpenCreateInvoiceModal}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Invoice Manual</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Billing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Piutang Berjalan</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {formatRupiah(totalReceivables)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Belum terbayar oleh pelanggan
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Tagihan Lewat Jatuh Tempo (Overdue)</div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            {overdueCount} <span className="text-sm font-sans font-normal text-slate-400">faktur</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Grace period: {settings?.grace_period_days ?? 3} hari setelah due date
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Tagihan Lunas (Bulan Ini)</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {paidCount} <span className="text-sm font-sans font-normal text-slate-400">faktur</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Telah diverifikasi oleh Admin/Finance
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor faktur (INV-...), nama pelanggan, atau akun PPPoE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Faktur ({invoices.length})</option>
            <option value="UNPAID">Belum Lunas (Issued & Overdue)</option>
            <option value="OVERDUE">Overdue (Lewat Tempo)</option>
            <option value="PAID">Lunas (Paid)</option>
            <option value="VOID">Batal (Void)</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">No Faktur & Tanggal</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Periode Pemakaian</th>
                <th className="py-3 px-3">Jatuh Tempo</th>
                <th className="py-3 px-3">Rincian Nominal</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada faktur tagihan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const cust = customers.find((c) => c.id === invoice.customer_id);
                  const sub = subscriptions.find((s) => s.id === invoice.subscription_id);
                  const isPaid = invoice.status === 'PAID';

                  return (
                    <tr key={invoice.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-100 text-xs">
                          {invoice.invoice_number}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Terbit: {invoice.issue_date}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-200">
                          {cust ? cust.name : 'Unknown Customer'}
                        </div>
                        {sub && (
                          <div className="font-mono text-[11px] text-cyan-400 mt-0.5">
                            @{sub.username}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-slate-300">
                          {invoice.billing_period_start} s/d {invoice.billing_period_end}
                        </div>
                        <div className="text-[10px] text-slate-500">Siklus Bulanan</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div
                          className={`font-medium ${
                            invoice.status === 'OVERDUE'
                              ? 'text-red-400 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          {invoice.due_date}
                        </div>
                        {invoice.status === 'OVERDUE' && (
                          <span className="text-[10px] text-red-400 font-semibold block">
                            Grace period lewat!
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-100">
                          {formatRupiah(invoice.total)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {invoice.tax > 0 && `PPN 11%: ${formatRupiah(invoice.tax)} `}
                          {invoice.late_fee > 0 && `| Denda: ${formatRupiah(invoice.late_fee)}`}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">{getStatusBadge(invoice.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print / View PDF */}
                          <button
                            onClick={() => onPrintInvoice(invoice)}
                            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                            title="Cetak Faktur / Kwitansi PDF"
                          >
                            <Printer className="w-4 h-4 text-blue-400" />
                          </button>

                          {/* Send notification */}
                          <button
                            onClick={() => onSendInvoiceNotification(invoice)}
                            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                            title="Kirim Notifikasi WhatsApp Tagihan"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          {/* Record Payment if unpaid */}
                          {!isPaid && invoice.status !== 'VOID' && (
                            <button
                              onClick={() => onRecordPaymentForInvoice(invoice)}
                              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-xs font-semibold transition flex items-center gap-1"
                              title="Catat Pembayaran"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Bayar</span>
                            </button>
                          )}

                          {/* Void button */}
                          {!isPaid && invoice.status !== 'VOID' && (
                            <button
                              onClick={() => onVoidInvoice(invoice.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition"
                              title="Batalkan Faktur (Void)"
                            >
                              <Ban className="w-3.5 h-3.5" />
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
