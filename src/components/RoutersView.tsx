import React, { useState } from 'react';
import {
  Server,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  HardDrive,
  Clock,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { Router, SystemSettings } from '../types';

interface RoutersViewProps {
  routers: Router[];
  settings: SystemSettings;
  onTestConnection: (routerId: string) => void;
  onSyncAllRouters: () => void;
}

export const RoutersView: React.FC<RoutersViewProps> = ({
  routers,
  settings,
  onTestConnection,
  onSyncAllRouters,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(
    null
  );

  const handleTest = (routerId: string) => {
    setTestingId(routerId);
    setTestResult(null);
    setTimeout(() => {
      setTestingId(null);
      setTestResult({
        id: routerId,
        success: true,
        msg: 'API Port 8728 responsif (12ms latency). RouterOS handshake OK, identity confirmed.',
      });
      onTestConnection(routerId);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>Integrasi MikroTik RouterOS & FreeRADIUS Server</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Blueprint Modul 8.7 & 8.8: Hubungkan router gateway ISP, test koneksi API, monitoring resource CPU/RAM, dan autentikasi AAA.
          </p>
        </div>

        <button
          onClick={onSyncAllRouters}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Semua Router & RADIUS</span>
        </button>
      </div>

      {/* RADIUS Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-cyan-600/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">FreeRADIUS Server Instance</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full">
                  ONLINE & LISTENING
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Host: <span className="font-mono text-cyan-300">{settings.radius_server_ip}</span> • Ports: 1812 (Auth), 1813 (Acct), 3799 (CoA / Disconnect)
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div>Accounting Interval: <span className="text-slate-200 font-mono">60s</span></div>
            <div>CoA / Disconnect Messages: <span className="text-emerald-400 font-medium">Enabled (RFC 3576)</span></div>
          </div>
        </div>
      </div>

      {/* Routers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routers.map((router) => (
          <div
            key={router.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>{router.name}</span>
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                  <span>Host: {router.host}</span>
                  <span>•</span>
                  <span>Port: {router.api_port}</span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full">
                {router.status}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>CPU Load</span>
                </span>
                <div className="text-base font-bold font-mono text-cyan-300 mt-1">
                  {router.cpu_usage_percent}%
                </div>
              </div>

              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-indigo-400" />
                  <span>RAM Free</span>
                </span>
                <div className="text-base font-bold font-mono text-indigo-300 mt-1">
                  {router.memory_free_mb} MB
                </div>
              </div>

              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Uptime</span>
                </span>
                <div className="text-xs font-mono text-slate-200 mt-1 line-clamp-1">
                  {router.uptime.split(' ')[0]} {router.uptime.split(' ')[1]}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div>Lokasi: <span className="text-slate-200">{router.location || '-'}</span></div>
              <div>RouterOS: <span className="font-mono text-slate-200">{router.routeros_version}</span></div>
              <div>Terakhir Sinkron: <span className="font-mono text-slate-300">{router.last_sync_at}</span></div>
            </div>

            {testResult && testResult.id === router.id && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{testResult.msg}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">API Credentials Terenkripsi</span>
              <button
                onClick={() => handleTest(router.id)}
                disabled={testingId === router.id}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              >
                {testingId === router.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Testing API...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Koneksi API</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
