import React, { useState } from 'react';
import { X, Settings, Check, Building, ShieldCheck, CreditCard } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pengaturan Sistem ISP</h3>
              <p className="text-xs text-slate-400">Identitas ISP, rekening penampung, dan aturan penagihan.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Identitas ISP */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Identitas Badan Usaha ISP</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Brand Produk</label>
                <input
                  type="text"
                  value={formData.isp_brand}
                  onChange={(e) => setFormData({ ...formData, isp_brand: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Nama Perusahaan</label>
                <input
                  type="text"
                  value={formData.isp_name}
                  onChange={(e) => setFormData({ ...formData, isp_name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Alamat Kantor</label>
              <input
                type="text"
                value={formData.company_address}
                onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">No. Telepon / Hotline</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Email Billing</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Aturan Billing & Isolir */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Kebijakan Jatuh Tempo & Masa Tenggang</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">
                  Tanggal Terbit Tagihan (Hari ke-)
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={formData.invoice_generation_day}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_generation_day: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">
                  Masa Tenggang Grace Period (Hari)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={formData.grace_period_days}
                  onChange={(e) =>
                    setFormData({ ...formData, grace_period_days: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">
                  Tarif Pajak PPN (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={formData.tax_rate_percent}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_rate_percent: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">
                  Denda Keterlambatan Flat (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.late_fee_flat}
                  onChange={(e) =>
                    setFormData({ ...formData, late_fee_flat: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rekening Bank */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rekening Penampung Pembayaran</span>
            </h4>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Nama Bank</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">No Rekening</label>
                <input
                  type="text"
                  value={formData.bank_account_number}
                  onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Atas Nama</label>
                <input
                  type="text"
                  value={formData.bank_account_name}
                  onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
