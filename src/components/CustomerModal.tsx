import React, { useState, useEffect } from 'react';
import { X, Users, MapPin, Wifi, Check, Sparkles } from 'lucide-react';
import { Customer, Package, Router, CustomerStatus } from '../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>, subscriptionData?: any) => void;
  existingCustomer: Customer | null;
  packages: Package[];
  routers: Router[];
  customersCount: number;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCustomer,
  packages,
  routers,
  customersCount,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('ACTIVE');
  const [notes, setNotes] = useState('');

  // Address
  const [addressLine, setAddressLine] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');
  const [village, setVillage] = useState('Banjarsari');
  const [district, setDistrict] = useState('Banjarsari');
  const [city, setCity] = useState('Surakarta');
  const [coordinates, setCoordinates] = useState('-7.548210, 110.824102');

  // Initial Subscription (if new customer)
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || '');
  const [selectedRouterId, setSelectedRouterId] = useState(routers[0]?.id || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('net1234');

  useEffect(() => {
    if (existingCustomer) {
      setName(existingCustomer.name);
      setPhone(existingCustomer.phone);
      setEmail(existingCustomer.email || '');
      setIdentityNumber(existingCustomer.identity_number || '');
      setStatus(existingCustomer.status);
      setNotes(existingCustomer.notes || '');

      setAddressLine(existingCustomer.address.address_line);
      setRt(existingCustomer.address.rt || '');
      setRw(existingCustomer.address.rw || '');
      setVillage(existingCustomer.address.village || 'Banjarsari');
      setDistrict(existingCustomer.address.district || 'Banjarsari');
      setCity(existingCustomer.address.city || 'Surakarta');
      setCoordinates(existingCustomer.address.coordinates || '');
    } else {
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setIdentityNumber('');
      setStatus('ACTIVE');
      setNotes('');
      setAddressLine('');
      setRt('01');
      setRw('02');
      setVillage('Banjarsari');
      setDistrict('Banjarsari');
      setCity('Surakarta');
      setCoordinates('-7.550100, 110.820000');
      setSelectedPackageId(packages[0]?.id || '');
      setSelectedRouterId(routers[0]?.id || '');
      setUsername('');
      setPassword('net1234');
    }
  }, [existingCustomer, isOpen, packages, routers]);

  // Auto-generate username when name changes for new customers
  const handleNameChange = (val: string) => {
    setName(val);
    if (!existingCustomer && val) {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
      setUsername(`${clean}_pppoe`);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !addressLine) return;

    const customerPayload: Partial<Customer> = {
      name,
      phone,
      email: email || undefined,
      identity_number: identityNumber || undefined,
      status,
      notes: notes || undefined,
      address: {
        address_line: addressLine,
        rt: rt || undefined,
        rw: rw || undefined,
        village: village || undefined,
        district: district || undefined,
        city: city || undefined,
        coordinates: coordinates || undefined,
      },
      contacts: [
        { id: `cnt-${Date.now()}`, type: 'WHATSAPP', value: phone, is_primary: true },
        ...(email
          ? [{ id: `cnt-email-${Date.now()}`, type: 'EMAIL' as const, value: email, is_primary: false }]
          : []),
      ],
    };

    const subscriptionPayload = !existingCustomer
      ? {
          package_id: selectedPackageId,
          router_id: selectedRouterId,
          username: username || `user${customersCount + 1}`,
          password,
        }
      : undefined;

    onSave(customerPayload, subscriptionPayload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {existingCustomer ? 'Edit Data Pelanggan' : 'Pendaftaran Pelanggan Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                {existingCustomer
                  ? `ID: ${existingCustomer.customer_code}`
                  : 'Kode Pelanggan (CUST-YYYYMM-XXX) otomatis dibuat oleh sistem.'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Section 1: Customer Personal Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Informasi Personal Pelanggan</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nomor WhatsApp / Telp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0812-xxxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  placeholder="email@domain.com (opsional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  No. Identitas (NIK/KTP/NPWP)
                </label>
                <input
                  type="text"
                  placeholder="337201xxxxxxxxxx"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alamat Pemasangan Jaringan</span>
            </h4>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Alamat Lengkap / Jalan / Blok Rumah *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Jl. Melati No. 12, Perumahan Asri..."
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">RT</label>
                <input
                  type="text"
                  placeholder="02"
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">RW</label>
                <input
                  type="text"
                  placeholder="05"
                  value={rw}
                  onChange={(e) => setRw(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Kelurahan</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Kota / Kab</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Package & Network Account (for new customer) */}
          {!existingCustomer && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>Paket Langganan & Akun PPPoE / RADIUS</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Pilih Paket Internet *
                  </label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.download_speed} {pkg.speed_unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Pilih Router Gateway *
                  </label>
                  <select
                    value={selectedRouterId}
                    onChange={(e) => setSelectedRouterId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {routers.map((rtr) => (
                      <option key={rtr.id} value={rtr.id}>
                        {rtr.name} ({rtr.host})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Username PPPoE *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Password PPPoE *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer inside form */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Data Pelanggan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
