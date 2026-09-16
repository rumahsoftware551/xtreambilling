import React from 'react';
import {
  Server,
  Radio,
  ShieldAlert,
  Clock,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SystemSettings } from '../types';

interface HeaderProps {
  settings: SystemSettings;
  activeSessionsCount: number;
  unpaidInvoicesCount: number;
  onRefreshAll: () => void;
  onOpenSettings: () => void;
  emergencyMode: boolean;
  onToggleEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeSessionsCount,
  unpaidInvoicesCount,
  onRefreshAll,
  onOpenSettings,
  emergencyMode,
  onToggleEmergency,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Instance Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/40 text-white font-black text-xl tracking-tight border border-cyan-400/30">
            XB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {settings.isp_brand}
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/50 rounded-full">
                Single ISP Server
              </span>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                v1.0.4-prod
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {settings.isp_name} • Node ID: <span className="font-mono text-slate-300">RSN-SRV-01</span>
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Router & RADIUS Health Pill */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5" title="MikroTik RouterOS API Port 8728 connected">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">MikroTik API:</span>
              <span className="text-emerald-400 font-medium">Connected</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5" title="FreeRADIUS Service Listening">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">RADIUS:</span>
              <span className="text-cyan-400 font-medium">{settings.radius_server_ip}</span>
            </div>
          </div>

          {/* Real-time Online Counter */}
          <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/50 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>{activeSessionsCount} Sesi Online</span>
          </div>

          {/* Emergency Safety Mode Switch (Blueprint section 10.4) */}
          <button
            onClick={onToggleEmergency}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              emergencyMode
                ? 'bg-amber-950/80 border-amber-600 text-amber-200 hover:bg-amber-900'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Emergency Safety: Mencegah isolir otomatis jika kondisi jaringan tidak stabil"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${emergencyMode ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{emergencyMode ? 'Safety Hold Aktif' : 'Auto Isolir Siap'}</span>
          </button>

          {/* Refresh Action */}
          <button
            onClick={onRefreshAll}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Sinkronisasi Data Sesi & Billing"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Pengaturan Sistem ISP"
          >
            <Sliders className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
