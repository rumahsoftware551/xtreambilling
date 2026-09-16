import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { Invoice, Customer, Subscription, SystemSettings, Package } from '../types';
import { formatRupiah } from '../services/billingService';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  customer: Customer | null;
  subscription: Subscription | null;
  pkg: Package | null;
  settings: SystemSettings;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  customer,
  subscription,
  pkg,
  settings,
}) => {
  if (!isOpen || !invoice || !customer) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'PAID';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (hidden on paper print) */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">
              Faktur Tagihan Resmi: {invoice.invoice_number}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (Styled in clean white document layout for authenticity) */}
        <div className="p-8 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0" id="printable-invoice">
          {/* Header ISP Branding */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-black text-base flex items-center justify-center">
                  XB
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                    {settings.isp_brand}
                  </h1>
                  <p className="text-xs font-medium text-slate-600">{settings.isp_name}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                {settings.company_address}
                <br />
                Hotline: {settings.phone} • Email: {settings.email}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black tracking-tight text-blue-800 uppercase">
                FAKTUR TAGIHAN
              </span>
              <div className="mt-1 font-mono font-bold text-sm text-slate-800">
                {invoice.invoice_number}
              </div>
              {/* Paid / Unpaid Stamp */}
              <div className="mt-2">
                {isPaid ? (
                  <span className="inline-block border-2 border-emerald-600 text-emerald-700 font-black text-xs px-3 py-0.5 rounded tracking-widest uppercase rotate-[-2deg]">
                    ✓ LUNAS / PAID
                  </span>
                ) : (
                  <span className="inline-block border-2 border-red-600 text-red-600 font-black text-xs px-3 py-0.5 rounded tracking-widest uppercase rotate-[-2deg]">
                    MENUNGGU PEMBAYARAN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Invoice Meta Info */}
          <div className="grid grid-cols-2 gap-8 my-6 text-xs">
            <div>
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Ditujukan Kepada:
              </div>
              <div className="font-bold text-sm text-slate-900">{customer.name}</div>
              <div className="font-mono text-slate-600 mt-0.5">ID: {customer.customer_code}</div>
              <div className="text-slate-600 mt-1">{customer.address.address_line}</div>
              <div className="text-slate-600">
                {customer.address.village}, {customer.address.city || 'Surakarta'}
              </div>
              <div className="text-slate-600 mt-0.5">Telp: {customer.phone}</div>
            </div>

            <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Akun Internet (PPPoE):</span>
                <span className="font-mono font-bold text-slate-800">
                  {subscription ? `@${subscription.username}` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode Pemakaian:</span>
                <span className="font-medium text-slate-800">
                  {invoice.billing_period_start} s/d {invoice.billing_period_end}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Terbit:</span>
                <span className="font-medium text-slate-800">{invoice.issue_date}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="font-semibold text-slate-700">Jatuh Tempo:</span>
                <span className="font-bold text-red-600">{invoice.due_date}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs mb-6 border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Deskripsi Layanan</th>
                <th className="py-2.5 px-3 text-center">Jml</th>
                <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-800">{item.description}</span>
                    {pkg && (
                      <span className="block text-[11px] text-slate-500">
                        Speed: {pkg.download_speed} {pkg.speed_unit} | FUP:{' '}
                        {pkg.quota_limit_gb ? `${pkg.quota_limit_gb} GB` : 'Unlimited'}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {formatRupiah(item.unit_price)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatRupiah(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Calculation */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatRupiah(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Promo:</span>
                  <span className="font-mono">- {formatRupiah(invoice.discount)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>PPN (11%):</span>
                  <span className="font-mono">{formatRupiah(invoice.tax)}</span>
                </div>
              )}
              {invoice.late_fee > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Denda Keterlambatan:</span>
                  <span className="font-mono">+ {formatRupiah(invoice.late_fee)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t-2 border-slate-800">
                <span>Total Tagihan:</span>
                <span className="font-mono text-blue-900">{formatRupiah(invoice.total)}</span>
              </div>
              {isPaid && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Telah Dibayar:</span>
                  <span className="font-mono">{formatRupiah(invoice.paid_amount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                Instruksi Pembayaran:
              </h4>
              <p className="leading-relaxed">
                Pembayaran via transfer bank resmi:
                <br />
                <span className="font-bold text-slate-900">
                  {settings.bank_name}: {settings.bank_account_number}
                </span>
                <br />
                A.N. <span className="font-semibold">{settings.bank_account_name}</span>
                <br />
                Atau bayar tunai melalui kolektor resmi berkwitansi XtreamBilling.
              </p>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-slate-500">Surakarta, {invoice.issue_date}</p>
              <div className="h-16 flex items-end justify-center font-bold text-slate-800">
                ( Bagian Keuangan / Billing )
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Dokumen sah dihasilkan secara elektronik oleh sistem.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
