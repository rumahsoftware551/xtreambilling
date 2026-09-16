import React, { useState } from 'react';
import {
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Subscription, Package, Customer, Invoice, SystemSettings } from '../types';
import { formatRupiah, runAutomaticInvoiceGenerator } from '../services/billingService';

interface AutoBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  packages: Package[];
  customers: Customer[];
  invoices: Invoice[];
  settings: SystemSettings;
  onApplyGeneratedInvoices: (newInvoices: Invoice[], auditLogs: any[], schedulerLog: any) => void;
}

export const AutoBillingModal: React.FC<AutoBillingModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  packages,
  customers,
  invoices,
  settings,
  onApplyGeneratedInvoices,
}) => {
  const [simulationDate, setSimulationDate] = useState('2026-09-15');
  const [executionReport, setExecutionReport] = useState<{
    generated: Invoice[];
    skipped: number;
    auditLogs: any[];
    schedulerLog: any;
  } | null>(null);

  if (!isOpen) return null;

  // Dry run preview calculation
  const targetDate = new Date(simulationDate);
  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth();
  const periodStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const periodEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const previewActiveSubs = subscriptions.filter((s) => s.status === 'ACTIVE');

  const pendingEligibleSubs = previewActiveSubs.filter((sub) => {
    const alreadyExists = invoices.some(
      (inv) =>
        inv.subscription_id === sub.id &&
        inv.billing_period_start === periodStart &&
        inv.billing_period_end === periodEnd &&
        inv.status !== 'VOID' &&
        inv.status !== 'CANCELLED'
    );
    return !alreadyExists;
  });

  const alreadyBilledCount = previewActiveSubs.length - pendingEligibleSubs.length;

  const handleExecute = () => {
    const result = runAutomaticInvoiceGenerator(
      subscriptions,
      packages,
      customers,
      invoices,
      settings,
      simulationDate
    );

    setExecutionReport({
      generated: result.generatedInvoices,
      skipped: result.skippedCount,
      auditLogs: result.auditLogs,
      schedulerLog: result.schedulerLog,
    });

    onApplyGeneratedInvoices(
      result.generatedInvoices,
      result.auditLogs,
      result.schedulerLog
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Scheduler 00:30 - Penagihan Otomatis (Auto-Billing)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Blueprint Modul 8.5 & 10.1: Idempotent recurring invoice generator.
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {executionReport ? (
            /* Execution Success Report */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-200">
                    Eksekusi Penagihan Otomatis Selesai!
                  </h4>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    {executionReport.schedulerLog.message}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hasil Pemrosesan Idempotency:
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Faktur Baru Diterbitkan:</span>
                    <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                      {executionReport.generated.length} Faktur
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Dilewati (Mencegah Duplikasi):</span>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      {executionReport.skipped} Langganan
                    </div>
                  </div>
                </div>

                {executionReport.generated.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Faktur yang berhasil digenerate:
                    </span>
                    <ul className="mt-1 space-y-1 max-h-32 overflow-y-auto pr-1 text-xs font-mono text-slate-300">
                      {executionReport.generated.map((inv) => {
                        const c = customers.find((cust) => cust.id === inv.customer_id);
                        return (
                          <li
                            key={inv.id}
                            className="flex justify-between bg-slate-900/60 px-2 py-1 rounded"
                          >
                            <span>{inv.invoice_number} ({c?.name})</span>
                            <span className="text-cyan-400 font-bold">{formatRupiah(inv.total)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Parameters & Preview */
            <div className="space-y-4">
              {/* Parameter Selection */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tanggal Penagihan (Billing Cycle Date):</span>
                  </label>
                  <input
                    type="date"
                    value={simulationDate}
                    onChange={(e) => setSimulationDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Periode Pemakaian Terhitung:{' '}
                  <span className="font-mono text-slate-200">
                    {periodStart} s/d {periodEnd}
                  </span>
                </div>
              </div>

              {/* Idempotency Protection Guarantee Info */}
              <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-blue-200">
                    Proteksi Idempotensi Aktif:
                  </span>{' '}
                  Sistem menjamin tidak ada faktur ganda untuk pelanggan dalam satu periode bulan yang sama (`UNIQUE(subscription_id, start_date, end_date)`).
                </div>
              </div>

              {/* Preview Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Calon Faktur Terbit Baru:</span>
                  <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                    {pendingEligibleSubs.length}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Pelanggan aktif yang belum memiliki tagihan periode ini.
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Sudah Diterbitkan Sebelumnya:</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {alreadyBilledCount}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Aman dilewati secara otomatis tanpa duplikasi.
                  </span>
                </div>
              </div>

              {pendingEligibleSubs.length > 0 && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Daftar Pelanggan yang Akan Diterbitkan Tagihan:
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {pendingEligibleSubs.map((sub) => {
                      const c = customers.find((cust) => cust.id === sub.customer_id);
                      const p = packages.find((pkg) => pkg.id === sub.package_id);
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between text-xs p-2 bg-slate-900 rounded-lg border border-slate-800/80"
                        >
                          <div>
                            <span className="font-semibold text-slate-200">{c?.name}</span>
                            <span className="text-slate-400 text-[11px] block">
                              @{sub.username} • {p?.name}
                            </span>
                          </div>
                          <div className="text-right font-mono font-bold text-cyan-400">
                            {formatRupiah(sub.price - sub.discount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
          >
            {executionReport ? 'Tutup' : 'Batal'}
          </button>

          {!executionReport && (
            <button
              onClick={handleExecute}
              disabled={pendingEligibleSubs.length === 0}
              className={`px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center gap-2 ${
                pendingEligibleSubs.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {pendingEligibleSubs.length === 0
                  ? 'Semua Tagihan Sudah Lengkap'
                  : `Terbitkan ${pendingEligibleSubs.length} Faktur Sekarang`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
