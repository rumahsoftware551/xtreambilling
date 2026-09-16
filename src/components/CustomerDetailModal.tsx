import React from 'react';
import {
  X,
  Users,
  Phone,
  Mail,
  MapPin,
  Wifi,
  Receipt,
  Printer,
  CreditCard,
  PowerOff,
  CheckCircle,
  Activity,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  Customer,
  Subscription,
  Package,
  Invoice,
  Router,
  RealtimeSession,
} from '../types';
import { formatRupiah, formatBytes } from '../services/billingService';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  subscription: Subscription | null;
  pkg: Package | null;
  router: Router | null;
  session: RealtimeSession | null;
  invoices?: Invoice[];
  onToggleSuspend: (subId: string) => void;
  onPrintInvoice: (inv: Invoice) => void;
  onPayInvoice: (inv: Invoice) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  subscription,
  pkg,
  router,
  session,
  invoices = [],
  onToggleSuspend,
  onPrintInvoice,
  onPayInvoice,
}) => {
  if (!isOpen || !customer) return null;

  const safeInvoices = invoices || [];
  const isSuspended = subscription?.status === 'SUSPENDED' || customer.status === 'SUSPENDED';

  // Format WhatsApp Link (strip 0 replace with 62)
  const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  const waUrl = `https://wa.me/${waNumber}?text=Halo%20Bapak%2FIbu%20${encodeURIComponent(customer.name)}%2C%20informasi%20layanan%20internet%20XtreamBilling%3A`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{customer.name}</h3>
                <span className="font-mono text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/80">
                  {customer.customer_code}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    isSuspended
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}
                >
                  {isSuspended ? 'TERISOLIR' : 'AKTIF'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Terdaftar sejak {customer.registration_date} • {customer.address.city || 'Surakarta'}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact & Address */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kontak & Lokasi Pasang</span>
              </h4>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">WhatsApp / Telp:</span>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{customer.phone}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {customer.email && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200">{customer.email}</span>
                </div>
              )}

              {customer.identity_number && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">NIK / Identitas:</span>
                  <span className="font-mono text-slate-300">{customer.identity_number}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block mb-0.5">Alamat Lengkap:</span>
                <span className="text-slate-200 font-medium">
                  {customer.address.address_line}, RT {customer.address.rt || '-'} / RW{' '}
                  {customer.address.rw || '-'}, Kel. {customer.address.village}, Kec.{' '}
                  {customer.address.district}
                </span>
              </div>
            </div>

            {/* Network Subscription & Quota status */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paket & Jaringan (PPPoE)</span>
                </h4>
                {subscription && (
                  <button
                    onClick={() => onToggleSuspend(subscription.id)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition ${
                      isSuspended
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                        : 'bg-red-950 text-red-300 border-red-800 hover:bg-red-900'
                    }`}
                  >
                    {isSuspended ? 'Buka Isolir' : 'Isolir Manual'}
                  </button>
                )}
              </div>

              {pkg && subscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nama Paket:</span>
                    <span className="font-bold text-cyan-300">{pkg.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Username PPPoE:</span>
                    <span className="font-mono font-bold text-slate-200">
                      @{subscription.username}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tarif Bulanan:</span>
                    <span className="font-mono text-slate-200">
                      {formatRupiah(subscription.price - subscription.discount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Router Gateway:</span>
                    <span className="text-slate-200">{router ? router.name : '-'}</span>
                  </div>

                  {/* Quota Progress */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-400">Penggunaan Kuota FUP:</span>
                      <span className="font-mono text-cyan-300">
                        {formatBytes(subscription.quota_used_bytes)}
                        {subscription.quota_limit_bytes && subscription.quota_limit_bytes > 0 && (
                          <span className="text-slate-500">
                            {' '}/ {formatBytes(subscription.quota_limit_bytes)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-cyan-500"
                        style={{
                          width: `${
                            subscription.quota_limit_bytes && subscription.quota_limit_bytes > 0
                              ? Math.min(
                                  100,
                                  (subscription.quota_used_bytes / subscription.quota_limit_bytes) * 100
                                )
                              : 40
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 italic py-4 text-center">
                  Pelanggan belum mengaktifkan paket internet.
                </div>
              )}
            </div>
          </div>

          {/* Invoices History Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span>Riwayat Tagihan & Pembayaran ({safeInvoices.length} Faktur)</span>
            </h4>

            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">No Faktur</th>
                    <th className="py-2.5 px-3">Periode</th>
                    <th className="py-2.5 px-3">Jatuh Tempo</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {safeInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        Belum ada riwayat tagihan untuk pelanggan ini.
                      </td>
                    </tr>
                  ) : (
                    safeInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">
                          {inv.invoice_number}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {inv.billing_period_start} s/d {inv.billing_period_end}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{inv.due_date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-100">
                          {formatRupiah(inv.total)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-400'
                                : inv.status === 'OVERDUE'
                                ? 'bg-red-950 text-red-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1">
                          <button
                            onClick={() => onPrintInvoice(inv)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                            title="Cetak Faktur"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          {inv.status !== 'PAID' && inv.status !== 'VOID' && (
                            <button
                              onClick={() => onPayInvoice(inv)}
                              className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-[10px] font-semibold"
                            >
                              Bayar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
