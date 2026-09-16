import React, { useState } from 'react';
import { X, Send, Phone, MessageSquare, Check, Copy } from 'lucide-react';
import { Invoice, Customer, SystemSettings } from '../types';
import { initialSettings } from '../data/initialData';
import { formatRupiah } from '../services/billingService';

interface WhatsAppNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  customer: Customer | null;
  settings?: SystemSettings;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  isOpen,
  onClose,
  invoice,
  customer,
  settings,
}) => {
  if (!isOpen || !invoice || !customer) return null;

  const safeSettings = settings || initialSettings;
  const [templateType, setTemplateType] = useState<'NEW_INVOICE' | 'REMINDER' | 'SUSPEND_ALERT'>(
    'NEW_INVOICE'
  );
  const [copied, setCopied] = useState(false);

  const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  let messageText = '';

  if (templateType === 'NEW_INVOICE') {
    messageText = `Halo Bapak/Ibu *${customer.name}*,\n\nTerima kasih telah menggunakan layanan internet *${safeSettings.isp_brand}*.\nTagihan internet Anda periode *${invoice.billing_period_start} s/d ${invoice.billing_period_end}* telah terbit:\n\n📄 *No Faktur:* ${invoice.invoice_number}\n💰 *Total Tagihan:* ${formatRupiah(invoice.total)}\n🗓 *Jatuh Tempo:* ${invoice.due_date}\n\nPembayaran dapat ditransfer melalui:\n*${safeSettings.bank_name}:* ${safeSettings.bank_account_number}\nA.N. *${safeSettings.bank_account_name}*\n\nMohon lakukan pembayaran sebelum tanggal jatuh tempo agar koneksi internet tetap lancar tanpa kendala.\n\nSalam,\n*${safeSettings.isp_name}*`;
  } else if (templateType === 'REMINDER') {
    messageText = `Pemberitahuan Tagihan Internet - *${safeSettings.isp_brand}*\n\nYth. Bapak/Ibu *${customer.name}*,\nKami mengingatkan tagihan faktur *${invoice.invoice_number}* sebesar *${formatRupiah(invoice.total)}* akan jatuh tempo pada *${invoice.due_date}*.\n\nSilakan segera melakukan pembayaran melalui rekening *${safeSettings.bank_name} ${safeSettings.bank_account_number}*.\n\nTerima kasih.`;
  } else {
    messageText = `🚨 *PERINGATAN ISOLIR KONEKSI INTERNET* 🚨\n\nYth. *${customer.name}*,\nTagihan internet Anda no. *${invoice.invoice_number}* sebesar *${formatRupiah(invoice.total)}* telah melewati batas jatuh tempo dan masa tenggang (${safeSettings.grace_period_days ?? 3} hari).\n\nLayanan Anda berisiko dinonaktifkan/diisolir secara otomatis oleh sistem kami. Mohon segera selesaikan pelunasan hari ini agar akses tidak terputus.\n\nRekening pembayaran:\n*${safeSettings.bank_name} ${safeSettings.bank_account_number}* a/n *${safeSettings.bank_account_name}*\n\nKonfirmasi bukti bayar ke nomor ini.`;
  }

  const encodedMessage = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kirim Pesan WhatsApp Tagihan</h3>
              <p className="text-xs text-slate-400">Pemberitahuan tagihan dan pengingat jatuh tempo.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Pilih Template Pesan:</span>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value="NEW_INVOICE">Tagihan Baru Terbit</option>
              <option value="REMINDER">Pengingat Menjelang Jatuh Tempo</option>
              <option value="SUSPEND_ALERT">Peringatan Isolir (Overdue)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Pratinjau Pesan WhatsApp:</span>
              <button
                onClick={handleCopy}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={messageText}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Kirim ke nomor tujuan: <strong className="font-mono text-white">{customer.phone}</strong>
            </span>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
          >
            Tutup
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition"
          >
            <Send className="w-4 h-4" />
            <span>Buka WhatsApp Sekarang</span>
          </a>
        </div>
      </div>
    </div>
  );
};
