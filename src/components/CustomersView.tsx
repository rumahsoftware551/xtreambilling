import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  Wifi,
  Receipt,
  Eye,
  Edit2,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Customer, Package, Subscription, Invoice, CustomerStatus } from '../types';
import { formatRupiah, formatBytes } from '../services/billingService';

interface CustomersViewProps {
  customers: Customer[];
  packages: Package[];
  subscriptions: Subscription[];
  invoices?: Invoice[];
  onAddCustomer?: () => void;
  onOpenAddModal?: () => void;
  onEditCustomer?: (customer: Customer) => void;
  onOpenEditModal?: (customer: Customer) => void;
  onViewCustomerDetail?: (customer: Customer) => void;
  onToggleSuspend?: (subscriptionId: string) => void;
  onExportData?: () => void;
  onImportData?: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers = [],
  packages = [],
  subscriptions = [],
  invoices = [],
  onAddCustomer,
  onOpenAddModal,
  onEditCustomer,
  onOpenEditModal,
  onViewCustomerDetail = (_cust: Customer) => {},
  onToggleSuspend,
  onExportData,
  onImportData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [packageFilter, setPackageFilter] = useState<string>('ALL');

  const handleAdd = onAddCustomer || onOpenAddModal || (() => {});
  const handleEdit = onEditCustomer || onOpenEditModal || (() => {});

  const handleExport = () => {
    if (onExportData) {
      onExportData();
      return;
    }
    // Default CSV Export
    const headers = ['Kode Pelanggan', 'Nama', 'Telepon', 'Email', 'Alamat', 'Status', 'Tanggal Registrasi'];
    const rows = customers.map((c) => [
      c.customer_code,
      `"${c.name}"`,
      c.phone,
      c.email,
      `"${c.address.address_line}"`,
      c.status,
      c.registered_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pelanggan_isp_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Customer status color badge helper
  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Aktif
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-300 border border-red-800">
            Terisolir
          </span>
        );
      case 'INSTALLATION_PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
            Pasang Baru
          </span>
        );
      case 'PROSPECT':
      case 'LEAD':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            {status}
          </span>
        );
      case 'BLACKLISTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Blacklist
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      // Find customer subscription
      const sub = subscriptions.find((s) => s.customer_id === c.id);
      if (packageFilter !== 'ALL') {
        if (!sub || sub.package_id !== packageFilter) return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(term);
        const matchesCode = c.customer_code.toLowerCase().includes(term);
        const matchesPhone = c.phone.toLowerCase().includes(term);
        const matchesUsername = sub ? sub.username.toLowerCase().includes(term) : false;
        const matchesAddress =
          c.address.address_line.toLowerCase().includes(term) ||
          (c.address.village && c.address.village.toLowerCase().includes(term));
        return matchesName || matchesCode || matchesPhone || matchesUsername || matchesAddress;
      }

      return true;
    });
  }, [customers, statusFilter, packageFilter, searchTerm, subscriptions]);

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Manajemen Data Pelanggan (Customer Directory)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data pelanggan internet, kode identitas otomatis, kontak WhatsApp, alamat pemasangan, dan paket langganan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
            title="Export data pelanggan ke CSV/JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onImportData || (() => alert('Fitur Import CSV: Silakan gunakan berkas berformat .csv atau .xlsx.'))}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
            title="Import pelanggan dari data CSV/Excel"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Data</span>
          </button>

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-900/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelanggan Baru</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, kode ID, no telp, PPPoE user, kelurahan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Status ({customers.length})</option>
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Terisolir</option>
            <option value="INSTALLATION_PENDING">Menunggu Pemasangan</option>
            <option value="PROSPECT">Prospek</option>
          </select>

          {/* Package Filter */}
          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Paket</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Kode & Nama Pelanggan</th>
                <th className="py-3 px-3">Kontak</th>
                <th className="py-3 px-3">Alamat Pasang</th>
                <th className="py-3 px-3">Paket & Akun Jaringan</th>
                <th className="py-3 px-3">Tagihan Terakhir</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada data pelanggan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const sub = subscriptions.find((s) => s.customer_id === customer.id);
                  const pkg = sub ? packages.find((p) => p.id === sub.package_id) : null;
                  const customerInvoices = (invoices || []).filter((i) => i.customer_id === customer.id);
                  const lastInvoice = customerInvoices.length > 0 ? customerInvoices[customerInvoices.length - 1] : null;

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-850/50 transition cursor-pointer"
                      onClick={() => onViewCustomerDetail(customer)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 text-sm">{customer.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-cyan-400 font-semibold bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
                            {customer.customer_code}
                          </span>
                          {customer.identity_number && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              NIK: {customer.identity_number}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[140px]">{customer.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-slate-300 line-clamp-1 max-w-[200px]">
                          {customer.address.address_line}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {customer.address.village ? `${customer.address.village}, ` : ''}
                          {customer.address.city || 'Surakarta'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {pkg ? (
                          <div>
                            <div className="font-semibold text-slate-200">{pkg.name}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-mono text-cyan-400">@{sub?.username}</span>
                              <span>•</span>
                              <span>{formatRupiah(sub?.price || pkg.monthly_price)}/bln</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Belum Berlangganan</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        {lastInvoice ? (
                          <div>
                            <div className="font-mono text-xs font-medium text-slate-200">
                              {formatRupiah(lastInvoice.total)}
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                                lastInvoice.status === 'PAID'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : lastInvoice.status === 'OVERDUE'
                                  ? 'bg-red-950 text-red-400'
                                  : 'bg-amber-950 text-amber-400'
                              }`}
                            >
                              {lastInvoice.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">{getStatusBadge(customer.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onViewCustomerDetail(customer)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                            title="Lihat Rincian Pelanggan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50 rounded transition"
                            title="Edit Data Pelanggan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
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
