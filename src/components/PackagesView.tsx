import React, { useState } from 'react';
import { Wifi, Plus, Check, Edit2, Trash2, Shield, Activity } from 'lucide-react';
import { Package } from '../types';
import { formatRupiah } from '../services/billingService';

interface PackagesViewProps {
  packages: Package[];
  onAddPackage: () => void;
  onEditPackage: (pkg: Package) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  onAddPackage,
  onEditPackage,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <span>Paket Layanan Internet & Kebijakan FUP Kuota (Packages)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi kecepatan bandwidth (Download/Upload), batas kuota bulanan (FUP), tarif langganan, dan profil RADIUS/MikroTik.
          </p>
        </div>

        <button
          onClick={onAddPackage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Internet</span>
        </button>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => {
          const isUnlimited = !pkg.quota_limit_gb || pkg.quota_limit_gb === 0;

          return (
            <div
              key={pkg.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden"
            >
              {isUnlimited && (
                <div className="absolute -right-10 top-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-10 py-0.5 rotate-45 shadow">
                  UNLIMITED
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {pkg.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pkg.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {pkg.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3">{pkg.name}</h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white font-mono tracking-tight">
                    {formatRupiah(pkg.monthly_price)}
                  </span>
                  <span className="text-xs text-slate-400">/bln</span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Kecepatan:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      ↓ {pkg.download_speed} {pkg.speed_unit} / ↑ {pkg.upload_speed} {pkg.speed_unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Batas Kuota FUP:</span>
                    <span
                      className={`font-semibold font-mono ${
                        isUnlimited ? 'text-indigo-400' : 'text-amber-400'
                      }`}
                    >
                      {isUnlimited ? 'Unlimited (No FUP)' : `${pkg.quota_limit_gb} GB / Bulan`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Biaya PSB:</span>
                    <span className="font-mono text-slate-200">
                      {pkg.installation_fee === 0 ? 'Gratis' : formatRupiah(pkg.installation_fee)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tipe Koneksi:</span>
                    <span className="font-mono text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded">
                      {pkg.connection_type}
                    </span>
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-[11px] text-slate-400 mt-3 italic leading-relaxed">
                    {pkg.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => onEditPackage(pkg)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Edit Paket</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
