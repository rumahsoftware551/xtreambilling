import React, { useState } from 'react';
import {
  History,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Server,
  RefreshCw,
  Search,
} from 'lucide-react';
import { AuditLog, SchedulerExecution } from '../types';

interface SchedulerAuditViewProps {
  auditLogs: AuditLog[];
  schedulerLogs: SchedulerExecution[];
  onTriggerJob: (jobName: string) => void;
}

export const SchedulerAuditView: React.FC<SchedulerAuditViewProps> = ({
  auditLogs,
  schedulerLogs,
  onTriggerJob,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'SCHEDULER' | 'AUDIT'>('SCHEDULER');
  const [searchTerm, setSearchTerm] = useState('');

  const scheduledJobs = [
    {
      time: '00:30 WIB',
      name: '00:30 Generate Recurring Invoices',
      desc: 'Membuat faktur langganan bulanan otomatis (idempotent, cek duplikasi).',
      frequency: 'Harian',
    },
    {
      time: '01:00 WIB',
      name: '01:00 Update Invoice Overdue Status',
      desc: 'Mengecek jatuh tempo tagihan dan menambahkan denda keterlambatan.',
      frequency: 'Harian',
    },
    {
      time: '01:30 WIB',
      name: '01:30 Check Suspension Candidates',
      desc: 'Mengevaluasi masa tenggang (grace period) & menyiapkan isolir darurat.',
      frequency: 'Harian',
    },
    {
      time: 'Setiap 15 Menit',
      name: 'Every 15m Sync Router & RADIUS Sessions',
      desc: 'Sinkronisasi throughput bandwidth, byte Rx/Tx, dan kuota FUP terpakai.',
      frequency: 'Interval 15m',
    },
  ];

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.entity_type.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.user_name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Pusat Otomasi Scheduler & Rekam Jejak Audit (Audit Logs)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Blueprint Bab 11 & 14: Seluruh siklus cron penagihan, isolir, dan mutasi data dicatat secara rinci dan dapat dijalankan manual.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('SCHEDULER')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeSubTab === 'SCHEDULER'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Jadwal Cron & Eksekusi
          </button>
          <button
            onClick={() => setActiveSubTab('AUDIT')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeSubTab === 'AUDIT'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'SCHEDULER' ? (
        <div className="space-y-6">
          {/* Scheduled Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledJobs.map((job, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-800">
                      {job.time}
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                      {job.frequency}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm mt-2.5">{job.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{job.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Status: Scheduled Active</span>
                  </span>
                  <button
                    onClick={() => onTriggerJob(job.name)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 text-cyan-400" />
                    <span>Jalankan Manual</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scheduler Execution History */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Riwayat Eksekusi Scheduler Terakhir</span>
            </h3>

            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Nama Pekerjaan (Job)</th>
                    <th className="py-2.5 px-3">Waktu Eksekusi</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Hasil / Rangkuman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono text-[11px]">
                  {schedulerLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                        {log.job_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{log.run_at}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300 text-xs">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Logs Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Buku Catatan Audit Transaksi & Perubahan Jaringan</span>
              </h3>
              <p className="text-xs text-slate-400">
                Merekam setiap pembuatan tagihan, penerimaan pembayaran, dan perintah isolir.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari audit log..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-56"
              />
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Pengguna / Pemrakarsa</th>
                  <th className="py-2.5 px-3">Aksi</th>
                  <th className="py-2.5 px-3">Entitas</th>
                  <th className="py-2.5 px-4">Deskripsi Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {log.user_name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-cyan-300 border border-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-400">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
