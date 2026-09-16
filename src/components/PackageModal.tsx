import React, { useState, useEffect } from 'react';
import { X, Wifi, Check } from 'lucide-react';
import { Package } from '../types';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: Partial<Package>) => void;
  existingPackage: Package | null;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingPackage,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState<number>(20);
  const [uploadSpeed, setUploadSpeed] = useState<number>(10);
  const [quotaLimitGb, setQuotaLimitGb] = useState<number>(0);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(200000);
  const [installationFee, setInstallationFee] = useState<number>(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (existingPackage) {
      setCode(existingPackage.code);
      setName(existingPackage.name);
      setDownloadSpeed(existingPackage.download_speed);
      setUploadSpeed(existingPackage.upload_speed);
      setQuotaLimitGb(existingPackage.quota_limit_gb || 0);
      setMonthlyPrice(existingPackage.monthly_price);
      setInstallationFee(existingPackage.installation_fee || 0);
      setDescription(existingPackage.description || '');
    } else {
      setCode('PKG-NEW');
      setName('Paket Home Ultra');
      setDownloadSpeed(30);
      setUploadSpeed(15);
      setQuotaLimitGb(500);
      setMonthlyPrice(250000);
      setInstallationFee(0);
      setDescription('Paket internet rumahan stabil.');
    }
  }, [existingPackage, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code,
      name,
      download_speed: Number(downloadSpeed),
      upload_speed: Number(uploadSpeed),
      speed_unit: 'Mbps',
      quota_limit_gb: quotaLimitGb > 0 ? Number(quotaLimitGb) : undefined,
      monthly_price: Number(monthlyPrice),
      installation_fee: Number(installationFee),
      description,
      connection_type: 'PPPoE',
      status: 'ACTIVE',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {existingPackage ? 'Edit Paket Internet' : 'Tambah Paket Baru'}
              </h3>
              <p className="text-xs text-slate-400">Atur profil bandwidth dan batasan FUP.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Kode Paket *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Paket *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Download (Mbps) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Upload (Mbps) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={uploadSpeed}
                onChange={(e) => setUploadSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Batas FUP Kuota (GB)
              </label>
              <input
                type="number"
                min={0}
                placeholder="0 = Unlimited"
                value={quotaLimitGb}
                onChange={(e) => setQuotaLimitGb(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Isi 0 untuk tanpa batasan (Unlimited)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tarif Bulanan (Rp) *
              </label>
              <input
                type="number"
                min={1000}
                required
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
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
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Paket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
