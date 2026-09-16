import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  X,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  PowerOff,
  Clock,
  Eye,
} from 'lucide-react';
import {
  Subscription,
  Customer,
  Invoice,
  SystemSettings,
  RealtimeSession,
} from '../types';
import { formatRupiah, checkSuspensionCandidates } from '../services/billingService';

interface SuspensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions?: Subscription[];
  customers?: Customer[];
  invoices?: Invoice[];
  sessions?: RealtimeSession[];
  settings?: SystemSettings;
  onApplySuspensions: (
    suspendedSubIds: string[],
    auditLogs: any[],
    schedulerLog: any
  ) => void;
  onToggleHold: (subscriptionId: string) => void;
}

export const SuspensionModal: React.FC<SuspensionModalProps> = ({
  isOpen,
  onClose,
  subscriptions = [],
  customers = [],
  invoices = [],
  sessions = [],
  settings,
  onApplySuspensions,
  onToggleHold,
}) => {
  const [gracePeriodDays, setGracePeriodDays] = useState(settings?.grace_period_days ?? 3);
  const [isDryRun, setIsDryRun] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Record<string, boolean>>({});
  const [executionResult, setExecutionResult] = useState<{
    count: number;
    dryRun: boolean;
    names: string[];
  } | null>(null);

  const candidates = useMemo(() => {
    return checkSuspensionCandidates(
      subscriptions,
      customers,
      invoices,
      gracePeriodDays,
      '2026-09-15'
    );
  }, [subscriptions, customers, invoices, gracePeriodDays]);

  if (!isOpen) return null;

  const eligibleForSuspension = candidates.filter(
    (c) => !c.isExempted && !excludedIds[c.subscription.id]
  );

  const handleToggleExclude = (subId: string) => {
    setExcludedIds((prev) => ({
      ...prev,
      [subId]: !prev[subId],
    }));
  };

  const handleExecuteSuspension = () => {
    const subIdsToSuspend = eligibleForSuspension.map((c) => c.subscription.id);
    const names = eligibleForSuspension.map((c) => `${c.customer.name} (@${c.subscription.username})`);

    const auditLogs = subIdsToSuspend.map((subId) => {
      const cand = eligibleForSuspension.find((c) => c.subscription.id === subId);
      return {
        id: `log-sus-${Date.now()}-${subId}`,
        user_name: 'Scheduler 01:30 (Suspension Engine)',
        action: isDryRun ? 'DRY_RUN_SUSPENSION' : 'APPLY_SUSPENSION',
        entity_type: 'Subscription',
        entity_id: subId,
        details: isDryRun
          ? `[DRY-RUN] Simulasi isolir pelanggan ${cand?.customer.name}. Piutang: ${formatRupiah(cand?.totalOverdueAmount || 0)}.`
          : `Isolir diterapkan pada pelanggan ${cand?.customer.name}. RADIUS status: DISABLED. Sesi aktif diputus.`,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
    });

    const schedulerLog = {
      id: `sch-${Date.now()}`,
      job_name: '01:30 Check Suspension Candidates',
      run_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: isDryRun ? 'WARNING' : 'SUCCESS',
      processed_count: subIdsToSuspend.length,
      message: isDryRun
        ? `Simulasi dry-run: ${subIdsToSuspend.length} pelanggan teridentifikasi sebagai calon isolir.`
        : `Eksekusi isolir berhasil untuk ${subIdsToSuspend.length} pelanggan. MikroTik/RADIUS disinkronkan.`,
      details: names.join(', '),
    };

    setExecutionResult({
      count: subIdsToSuspend.length,
      dryRun: isDryRun,
      names,
    });

    if (!isDryRun) {
      onApplySuspensions(subIdsToSuspend, auditLogs, schedulerLog);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/20 border border-amber-500/40 rounded-xl text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Scheduler 01:30 - Evaluasi Calon Isolir & Isolir Otomatis</span>
              </h3>
              <p className="text-xs text-slate-400">
                Blueprint Modul 10.3 & 10.4: Emergency Safety, Grace Period, Exemption Hold & RADIUS Disable.
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {executionResult ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  executionResult.dryRun
                    ? 'bg-amber-950/60 border-amber-800/80 text-amber-200'
                    : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">
                    {executionResult.dryRun
                      ? 'Simulasi Dry-Run Berhasil Dijalankan'
                      : 'Eksekusi Isolir Otomatis Selesai'}
                  </h4>
                  <p className="text-xs mt-1 opacity-90">
                    {executionResult.dryRun
                      ? `Terdapat ${executionResult.count} pelanggan yang memenuhi syarat isolir. Tidak ada perubahan jaringan yang disimpan.`
                      : `Berhasil mengisolir ${executionResult.count} pelanggan. RADIUS user dinonaktifkan dan sesi jaringan diputus.`}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <span className="font-semibold text-slate-300 block mb-2">
                  Daftar Pelanggan Diproses:
                </span>
                <ul className="space-y-1 font-mono text-slate-400">
                  {executionResult.names.map((n, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Configuration parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Masa Tenggang (Grace Period):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={gracePeriodDays}
                      onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                      className="w-20 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400">hari setelah jatuh tempo</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mode Pengujian:
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1.5">
                    <input
                      type="checkbox"
                      checked={isDryRun}
                      onChange={(e) => setIsDryRun(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 bg-slate-900 border-slate-700 focus:ring-amber-500"
                    />
                    <span className="font-medium text-amber-300">
                      Dry-Run Mode (Simulasi tanpa isolir riil)
                    </span>
                  </label>
                </div>
              </div>

              {/* Safety notice */}
              <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-200">
                    Kepatuhan Blueprint Section 10.4 (Emergency Safety):
                  </span>{' '}
                  Pelanggan dengan flag "Manual Hold" (seperti klinik atau korporat) secara otomatis dikecualikan. Anda juga dapat mengecualikan pelanggan secara manual sebelum menekan tombol eksekusi.
                </div>
              </div>

              {/* Candidates Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Daftar Calon Isolir ({candidates.length} Ditemukan, {eligibleForSuspension.length} Siap Diproses):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Status RADIUS: Siap kirim CoA Disconnect
                  </span>
                </div>

                {candidates.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
                    Tidak ada pelanggan yang melewati batas grace period ({gracePeriodDays} hari). Kondisi jaringan aman!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {candidates.map((cand) => {
                      const isExcluded = !!excludedIds[cand.subscription.id];
                      const isExempt = cand.isExempted || isExcluded;

                      return (
                        <div
                          key={cand.subscription.id}
                          className={`p-3 rounded-xl border transition ${
                            isExempt
                              ? 'bg-slate-950/40 border-slate-800 opacity-60'
                              : 'bg-red-950/20 border-red-900/50 hover:border-red-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100 text-xs">
                                  {cand.customer.name}
                                </span>
                                <span className="font-mono text-[11px] text-cyan-400">
                                  @{cand.subscription.username}
                                </span>
                                {cand.subscription.manual_hold && (
                                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                                    Manual Hold (Exempt)
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                                <span className="text-red-400 font-semibold">
                                  Telat {cand.daysOverdueMax} hari
                                </span>
                                <span>•</span>
                                <span className="text-slate-300">
                                  {cand.overdueInvoices.length} Faktur Tertunggak:
                                </span>
                                <span className="font-mono font-bold text-amber-400">
                                  {formatRupiah(cand.totalOverdueAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Exclude Toggle Button */}
                              <button
                                onClick={() => handleToggleExclude(cand.subscription.id)}
                                className={`px-2.5 py-1 text-xs rounded border transition ${
                                  isExcluded
                                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                                    : 'bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900'
                                }`}
                              >
                                {isExcluded ? 'Batalkan Exclude' : 'Kecualikan (Skip)'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
          >
            {executionResult ? 'Tutup' : 'Batal'}
          </button>

          {!executionResult && (
            <button
              onClick={handleExecuteSuspension}
              disabled={eligibleForSuspension.length === 0}
              className={`px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center gap-2 ${
                eligibleForSuspension.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isDryRun
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-900/40'
              }`}
            >
              <PowerOff className="w-4 h-4" />
              <span>
                {isDryRun
                  ? `Jalankan Dry-Run (${eligibleForSuspension.length} Calon)`
                  : `Isolir ${eligibleForSuspension.length} Pelanggan Sekarang`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
