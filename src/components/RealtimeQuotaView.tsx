import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Search,
  RefreshCw,
  PowerOff,
  Filter,
  AlertCircle,
  Play,
  Pause,
  Zap,
  CheckCircle2,
  Server,
  Wifi,
} from 'lucide-react';
import { RealtimeSession, Router } from '../types';
import { formatBytes, formatDuration } from '../services/billingService';

interface RealtimeQuotaViewProps {
  sessions?: RealtimeSession[];
  routers?: Router[];
  subscriptions?: any[];
  customers?: any[];
  packages?: any[];
  onDisconnectSession: (sessionId: string) => void;
  onSyncRadius?: () => void;
}

export const RealtimeQuotaView: React.FC<RealtimeQuotaViewProps> = ({
  sessions = [],
  routers = [],
  onDisconnectSession,
  onSyncRadius = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'WARNING' | 'CRITICAL' | 'UNLIMITED'>('ALL');
  const [selectedRouter, setSelectedRouter] = useState<string>('ALL');
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Live traffic history buffer for the SVG graph (last 20 seconds)
  const [trafficHistory, setTrafficHistory] = useState<
    { time: string; rxMbps: number; txMbps: number }[]
  >(() => {
    const arr = [];
    const baseRx = 85;
    const baseTx = 22;
    for (let i = 20; i >= 0; i--) {
      arr.push({
        time: `${i}s`,
        rxMbps: Math.max(10, baseRx + (Math.random() * 20 - 10)),
        txMbps: Math.max(5, baseTx + (Math.random() * 10 - 5)),
      });
    }
    return arr;
  });

  // Calculate live aggregate rates
  const totalRxMbps = useMemo(
    () => sessions.filter((s) => s.is_online).reduce((acc, s) => acc + s.rx_rate_kbps, 0) / 1000,
    [sessions]
  );
  const totalTxMbps = useMemo(
    () => sessions.filter((s) => s.is_online).reduce((acc, s) => acc + s.tx_rate_kbps, 0) / 1000,
    [sessions]
  );

  // Live traffic graph updater interval
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      setTrafficHistory((prev) => {
        const jitterRx = (Math.random() - 0.5) * 6;
        const jitterTx = (Math.random() - 0.5) * 3;
        const nextRx = Math.max(5, +(totalRxMbps + jitterRx).toFixed(1));
        const nextTx = Math.max(2, +(totalTxMbps + jitterTx).toFixed(1));

        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const updated = [...prev.slice(1), { time: timeStr, rxMbps: nextRx, txMbps: nextTx }];
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLiveActive, totalRxMbps, totalTxMbps]);

  // Filtering
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Router filter
      if (selectedRouter !== 'ALL' && s.router_id !== selectedRouter) return false;

      // Status / warning filter
      if (filterType === 'WARNING' && (s.quota_percentage < 75 || s.quota_percentage >= 90))
        return false;
      if (filterType === 'CRITICAL' && s.quota_percentage < 90) return false;
      if (filterType === 'UNLIMITED' && s.quota_limit_bytes && s.quota_limit_bytes > 0)
        return false;

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          s.username.toLowerCase().includes(term) ||
          s.customer_name.toLowerCase().includes(term) ||
          s.ip_address.toLowerCase().includes(term) ||
          s.mac_address.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [sessions, selectedRouter, filterType, searchTerm]);

  // SVG Chart rendering helper
  const maxTrafficVal = trafficHistory.length > 0
    ? Math.max(...trafficHistory.map((p) => Math.max(p.rxMbps, p.txMbps)))
    : 100;
  const chartMaxY = Math.max(100, maxTrafficVal * 1.2);

  const getSvgPoints = (key: 'rxMbps' | 'txMbps') => {
    const width = 800;
    const height = 180;
    const step = width / (trafficHistory.length - 1);

    return trafficHistory
      .map((item, i) => {
        const x = i * step;
        const y = height - (item[key] / chartMaxY) * (height - 20) - 10;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const rxPoints = getSvgPoints('rxMbps');
  const txPoints = getSvgPoints('txMbps');

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-time Live Bandwidth Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span>Pemantauan Kuota & Bandwidth Real-Time (RADIUS & MikroTik)</span>
              </h2>
              {isLiveActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Polling 1.5s
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                  Paused
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Data konsumsi kuota FUP terintegrasi dengan FreeRADIUS Accounting dan MikroTik Queue Tree.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
            >
              {isLiveActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Jeda Polling</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lanjutkan</span>
                </>
              )}
            </button>

            <button
              onClick={onSyncRadius}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Sesi RADIUS</span>
            </button>
          </div>
        </div>

        {/* Live Aggregation Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Download (Rx)</span>
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
              {totalRxMbps.toFixed(2)}{' '}
              <span className="text-xs font-sans font-normal text-slate-400">Mbps</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Upload (Tx)</span>
              <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
              {totalTxMbps.toFixed(2)}{' '}
              <span className="text-xs font-sans font-normal text-slate-400">Mbps</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
            <div className="text-xs text-slate-400">Sesi Terhubung</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {sessions.filter((s) => s.is_online).length}{' '}
              <span className="text-xs text-slate-400 font-normal">pelanggan online</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
            <div className="text-xs text-slate-400">Status Gateway</div>
            <div className="text-sm font-semibold text-slate-200 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>2 Core Router Normal</span>
            </div>
          </div>
        </div>

        {/* Live SVG Waveform Bandwidth Graph */}
        <div className="relative bg-slate-950 rounded-lg p-3 border border-slate-800/80 overflow-hidden">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-mono text-slate-400">Live Throughput Waveform</span>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
                <span>Download (Rx)</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-0.5 bg-indigo-400 inline-block"></span>
                <span>Upload (Tx)</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                Skala: ~{chartMaxY.toFixed(0)} Mbps
              </span>
            </div>
          </div>

          <div className="w-full h-44 relative">
            <svg
              viewBox="0 0 800 180"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="800" y2="30" stroke="#1e293b" strokeDasharray="4" />
              <line x1="0" y1="80" x2="800" y2="80" stroke="#1e293b" strokeDasharray="4" />
              <line x1="0" y1="130" x2="800" y2="130" stroke="#1e293b" strokeDasharray="4" />
              <line x1="0" y1="170" x2="800" y2="170" stroke="#334155" />

              {/* Rx Path & Area */}
              <polygon
                points={`0,170 ${rxPoints} 800,170`}
                fill="url(#rxGradient)"
              />
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                points={rxPoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Tx Path & Area */}
              <polygon
                points={`0,170 ${txPoints} 800,170`}
                fill="url(#txGradient)"
              />
              <polyline
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                points={txPoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Sessions Filter & Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Daftar Sesi Online & Monitor Kuota Pelanggan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Menampilkan {filteredSessions.length} dari {sessions.length} sesi terdaftar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari user, nama, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
              />
            </div>

            {/* Router Filter */}
            <select
              value={selectedRouter}
              onChange={(e) => setSelectedRouter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Router</option>
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Quota Threshold Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  filterType === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('WARNING')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  filterType === 'WARNING'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                FUP &gt; 75%
              </button>
              <button
                onClick={() => setFilterType('CRITICAL')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  filterType === 'CRITICAL' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-red-300'
                }`}
              >
                FUP &gt; 90%
              </button>
              <button
                onClick={() => setFilterType('UNLIMITED')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  filterType === 'UNLIMITED'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unlimited
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Pelanggan & Username</th>
                <th className="py-3 px-3">IP & MAC Address</th>
                <th className="py-3 px-3">Router Gateway</th>
                <th className="py-3 px-3">Kecepatan Saat Ini</th>
                <th className="py-3 px-3">Total Data (Rx/Tx)</th>
                <th className="py-3 px-4">Status Kuota FUP</th>
                <th className="py-3 px-3">Uptime</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada sesi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const isUnlimited =
                    !session.quota_limit_bytes || session.quota_limit_bytes === 0;
                  const isWarning =
                    !isUnlimited &&
                    session.quota_percentage >= 75 &&
                    session.quota_percentage < 90;
                  const isCritical = !isUnlimited && session.quota_percentage >= 90;

                  return (
                    <tr key={session.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">
                          {session.customer_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <span className="font-mono text-cyan-400">{session.username}</span>
                          <span>•</span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                            {session.service_type}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-200">{session.ip_address}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {session.mac_address}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-300 font-medium">{session.router_name}</div>
                        <div className="text-[10px] text-slate-400">{session.package_name}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-xs font-semibold text-cyan-300 flex items-center gap-1">
                          <ArrowDown className="w-3 h-3 text-cyan-400" />
                          <span>{(session.rx_rate_kbps / 1000).toFixed(1)} Mbps</span>
                        </div>
                        <div className="font-mono text-[10px] text-indigo-300 flex items-center gap-1 mt-0.5">
                          <ArrowUp className="w-2.5 h-2.5 text-indigo-400" />
                          <span>{(session.tx_rate_kbps / 1000).toFixed(1)} Mbps</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono font-medium text-slate-200">
                          {formatBytes(session.total_bytes)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ↓ {formatBytes(session.output_bytes)} / ↑ {formatBytes(session.input_bytes)}
                        </div>
                      </td>

                      <td className="py-3 px-4 min-w-[150px]">
                        {isUnlimited ? (
                          <div>
                            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                              Unlimited No-FUP
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                              <span
                                className={
                                  isCritical
                                    ? 'text-red-400 font-bold'
                                    : isWarning
                                    ? 'text-amber-400 font-semibold'
                                    : 'text-slate-300'
                                }
                              >
                                {session.quota_percentage.toFixed(1)}%
                              </span>
                              <span className="text-slate-400">
                                {formatBytes(session.quota_limit_bytes!)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  isCritical
                                    ? 'bg-red-500'
                                    : isWarning
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, session.quota_percentage)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {formatDuration(session.uptime_seconds)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onDisconnectSession(session.id)}
                          className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/80 rounded text-[11px] font-medium transition flex items-center gap-1 ml-auto"
                          title="Putus Sesi PPPoE di Router (Kick User)"
                        >
                          <PowerOff className="w-3 h-3" />
                          <span>Disconnect</span>
                        </button>
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
