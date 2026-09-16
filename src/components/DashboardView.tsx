import React from 'react';
import {
  Users,
  CreditCard,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Server,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Customer,
  Subscription,
  Invoice,
  Payment,
  RealtimeSession,
  Router,
  SystemSettings,
} from '../types';
import { initialSettings } from '../data/initialData';
import { formatRupiah, formatBytes } from '../services/billingService';

interface DashboardViewProps {
  customers: Customer[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  sessions: RealtimeSession[];
  routers: Router[];
  settings?: SystemSettings;
  onNavigate?: (tab: any) => void;
  onNavigateTo?: (tab: any) => void;
  onRunAutoBilling?: () => void;
  onOpenAutoBilling?: () => void;
  onOpenSuspensionModal?: () => void;
  onOpenSuspension?: () => void;
  onSyncNetwork?: () => void;
  onOpenAddCustomer?: () => void;
  onOpenRecordPayment?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers = [],
  subscriptions = [],
  invoices = [],
  payments = [],
  sessions = [],
  routers = [],
  settings = initialSettings,
  onNavigate,
  onNavigateTo,
  onRunAutoBilling,
  onOpenAutoBilling,
  onOpenSuspensionModal,
  onOpenSuspension,
  onSyncNetwork,
  onOpenAddCustomer,
  onOpenRecordPayment,
}) => {
  const safeSettings = settings || initialSettings;

  const navigate = (tab: string) => {
    let targetTab = 'DASHBOARD';
    const upper = tab.toUpperCase();
    if (upper === 'CUSTOMERS') targetTab = 'CUSTOMERS';
    else if (upper === 'QUOTA' || upper === 'REALTIME_QUOTA') targetTab = 'REALTIME_QUOTA';
    else if (upper === 'INVOICES') targetTab = 'INVOICES';
    else if (upper === 'PAYMENTS') targetTab = 'PAYMENTS';
    else if (upper === 'PACKAGES') targetTab = 'PACKAGES';
    else if (upper === 'ROUTERS') targetTab = 'ROUTERS';
    else if (upper === 'SCHEDULER_AUDIT') targetTab = 'SCHEDULER_AUDIT';

    if (onNavigate) onNavigate(targetTab);
    else if (onNavigateTo) onNavigateTo(targetTab);
  };

  const handleRunAutoBilling = () => {
    if (onRunAutoBilling) onRunAutoBilling();
    else if (onOpenAutoBilling) onOpenAutoBilling();
  };

  const handleOpenSuspension = () => {
    if (onOpenSuspensionModal) onOpenSuspensionModal();
    else if (onOpenSuspension) onOpenSuspension();
  };
  // Calculations
  const activeCustomers = customers.filter((c) => c.status === 'ACTIVE').length;
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const suspendedSubs = subscriptions.filter((s) => s.status === 'SUSPENDED').length;

  // Monthly Recurring Revenue potential
  const mrr = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((acc, curr) => acc + (curr.price - (curr.discount || 0)), 0);

  // Revenue collected this month (PAID invoices)
  const currentMonthInvoices = invoices.filter((inv) => inv.issue_date.startsWith('2026-09'));
  const collectedRevenue = currentMonthInvoices.reduce((acc, inv) => acc + inv.paid_amount, 0);

  // Unpaid & Overdue
  const unpaidInvoices = invoices.filter(
    (inv) => inv.status === 'ISSUED' || inv.status === 'OVERDUE' || inv.status === 'PARTIALLY_PAID'
  );
  const totalUnpaidAmount = unpaidInvoices.reduce(
    (acc, inv) => acc + (inv.total - inv.paid_amount),
    0
  );
  const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE').length;

  // Live Bandwidth
  const onlineSessions = sessions.filter((s) => s.is_online);
  const totalRxKbps = onlineSessions.reduce((acc, s) => acc + s.rx_rate_kbps, 0);
  const totalTxKbps = onlineSessions.reduce((acc, s) => acc + s.tx_rate_kbps, 0);
  const totalBandwidthUsedBytes = onlineSessions.reduce((acc, s) => acc + s.total_bytes, 0);

  return (
    <div className="space-y-6">
      {/* Emergency Isolir & Overdue Notice Banner if applicable */}
      {overdueCount > 0 && (
        <div className="bg-gradient-to-r from-amber-950/80 via-red-950/80 to-slate-900 border border-amber-500/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-200 text-sm sm:text-base">
                Peringatan Tagihan Jatuh Tempo & Calon Isolir ({overdueCount} Pelanggan)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Terdapat tagihan melewati batas grace period ({safeSettings.grace_period_days ?? 3} hari).
                Sistem isolir darurat memiliki proteksi dry-run dan pengecualian hold.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
            <button
              onClick={handleOpenSuspension}
              className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review Calon Isolir</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Customers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Pelanggan</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{customers.length}</span>
            <span className="text-xs text-emerald-400 font-medium">{activeCustomers} Aktif</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Langganan: {activeSubs} Aktif</span>
            <span className="text-amber-400">{suspendedSubs} Terisolir</span>
          </div>
        </div>

        {/* Card 2: MRR & Terkumpul */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pendapatan Bulan Ini</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">
              {formatRupiah(collectedRevenue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Potensi MRR:</span>
            <span className="text-slate-200 font-medium">{formatRupiah(mrr)}</span>
          </div>
        </div>

        {/* Card 3: Unpaid Invoices */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Piutang / Belum Terbayar</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 tracking-tight">
              {formatRupiah(totalUnpaidAmount)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>{unpaidInvoices.length} Faktur Tagihan</span>
            <span className="text-red-400 font-semibold">{overdueCount} Overdue</span>
          </div>
        </div>

        {/* Card 4: Bandwidth & Real-time Sessions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Traffic Jaringan Live</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-300 font-mono tracking-tight">
              {(totalRxKbps / 1000).toFixed(1)}{' '}
              <span className="text-sm font-sans font-normal text-slate-400">Mbps</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {(totalTxKbps / 1000).toFixed(1)} Up
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Sesi: {onlineSessions.length} Online</span>
            <span className="text-cyan-400 font-medium">{formatBytes(totalBandwidthUsedBytes)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar / Quick Scheduler Triggers */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Operasi Cepat Billing & Otomasi Jaringan</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Satu klik untuk memicu scheduler invoice berkala, sync router RADIUS, atau isolir darurat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunAutoBilling}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Jalankan Penagihan Otomatis</span>
          </button>

          <button
            onClick={handleOpenSuspension}
            className="px-3.5 py-2 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition shadow flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cek Calon Isolir</span>
          </button>

          <button
            onClick={onSyncNetwork}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sinkronisasi MikroTik</span>
          </button>

          <button
            onClick={() => navigate('CUSTOMERS')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Kelola Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Real-time Quota Top Consuming Sessions & Router Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Quota & Bandwidth Top Users */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Pemantauan Kuota & Penggunaan Tertinggi (Real-time FUP)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring kuota bulanan pelanggan aktif beserta kecepatan Rx/Tx saat ini.
              </p>
            </div>
            <button
              onClick={() => navigate('REALTIME_QUOTA')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>Lihat Semua Sesi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => {
              const isWarning = session.quota_percentage >= 75 && session.quota_percentage < 90;
              const isCritical = session.quota_percentage >= 90;
              const isUnlimited = !session.quota_limit_bytes || session.quota_limit_bytes === 0;

              return (
                <div
                  key={session.id}
                  className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <div>
                        <span className="text-sm font-semibold text-slate-100">
                          {session.customer_name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono text-cyan-400">{session.username}</span>
                          <span>•</span>
                          <span>{session.package_name}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">{session.ip_address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-cyan-300">
                        ↓ {(session.rx_rate_kbps / 1000).toFixed(1)} Mbps | ↑ {(session.tx_rate_kbps / 1000).toFixed(1)} Mbps
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatBytes(session.total_bytes)}
                        {!isUnlimited && (
                          <span className="text-slate-500">
                            {' '}/ {formatBytes(session.quota_limit_bytes!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isUnlimited
                            ? 'bg-blue-500'
                            : isCritical
                            ? 'bg-red-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: isUnlimited ? '45%' : `${Math.min(100, session.quota_percentage)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>
                        {isUnlimited ? 'Kuota Unlimited (Tanpa FUP)' : `Penggunaan Kuota: ${session.quota_percentage.toFixed(1)}%`}
                      </span>
                      {isCritical && (
                        <span className="text-red-400 font-semibold">Mendekati Batas FUP!</span>
                      )}
                      {isWarning && (
                        <span className="text-amber-400 font-medium">Batas FUP 80% Tercapai</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: MikroTik Core Routers Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Router Gateway ISP</span>
            </h3>
            <button
              onClick={() => navigate('ROUTERS')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>Detail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {routers.map((router) => (
              <div
                key={router.id}
                className="p-3 bg-slate-950/70 rounded-lg border border-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{router.name}</h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {router.host}:{router.api_port}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full">
                    {router.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-400">CPU Load:</span>
                    <div className="font-medium text-slate-200">{router.cpu_usage_percent}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Mem Free:</span>
                    <div className="font-medium text-slate-200">{router.memory_free_mb} MB</div>
                  </div>
                  <div className="col-span-2 text-slate-400 text-[10px]">
                    OS: {router.routeros_version}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-lg text-xs text-blue-200">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Autentikasi RADIUS Aktif</span>
            </div>
            <p className="text-[11px] text-blue-300/80 mt-1">
              Semua router sinkron dengan FreeRADIUS port 1812/1813. Transaksi isolir & aktivasi langsung dikirim via CoA/Disconnect Message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
