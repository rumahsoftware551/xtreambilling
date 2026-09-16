import {
  Customer,
  Package,
  Subscription,
  Invoice,
  InvoiceItem,
  Payment,
  RealtimeSession,
  AuditLog,
  SystemSettings,
  SchedulerExecution,
} from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
}

// Generates next invoice number like INV-RSN-YYYYMM-0008
export function generateInvoiceNumber(prefix: string, existingInvoices: Invoice[]): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthInvoices = existingInvoices.filter((inv) =>
    inv.invoice_number.includes(`${prefix}-${yearMonth}`)
  );
  const nextSeq = currentMonthInvoices.length + 1;
  return `${prefix}-${yearMonth}-${String(nextSeq).padStart(4, '0')}`;
}

export function generateCustomerCode(seq: number, dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `CUST-${ym}-${String(seq).padStart(4, '0')}`;
}

export function generatePaymentCode(seq: number, dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `PAY-${ym}-${String(seq).padStart(4, '0')}`;
}

export interface GenerateInvoicesResult {
  generatedInvoices: Invoice[];
  skippedCount: number;
  auditLogs: AuditLog[];
  schedulerLog: SchedulerExecution;
}

export function runAutomaticInvoiceGenerator(
  subscriptions: Subscription[],
  packages: Package[],
  customers: Customer[],
  existingInvoices: Invoice[],
  settings: SystemSettings,
  currentDateStr: string = '2026-09-15'
): GenerateInvoicesResult {
  const generatedInvoices: Invoice[] = [];
  const auditLogs: AuditLog[] = [];
  let skippedCount = 0;

  const targetDate = new Date(currentDateStr);
  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth();

  // Period: start of month to end of month (or customer cycle)
  const periodStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const periodEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

  const activeSubs = subscriptions.filter(
    (sub) => sub.status === 'ACTIVE' || sub.status === 'PENDING'
  );

  for (const sub of activeSubs) {
    // IDEMPOTENCY CHECK:
    // Blueprint rule: UNIQUE(subscription_id, billing_period_start, billing_period_end)
    const alreadyExists = existingInvoices.some(
      (inv) =>
        inv.subscription_id === sub.id &&
        inv.billing_period_start === periodStart &&
        inv.billing_period_end === periodEnd &&
        inv.status !== 'VOID' &&
        inv.status !== 'CANCELLED'
    );

    if (alreadyExists) {
      skippedCount++;
      continue;
    }

    const pkg = packages.find((p) => p.id === sub.package_id);
    const customer = customers.find((c) => c.id === sub.customer_id);
    if (!pkg || !customer) continue;

    const basePrice = sub.price || pkg.monthly_price;
    const discount = sub.discount || 0;
    const subtotal = Math.max(0, basePrice - discount);
    const tax = settings.tax_percentage > 0 ? Math.round((subtotal * settings.tax_percentage) / 100) : 0;
    const total = subtotal + tax;

    // Due date = issue date + settings.default_due_days
    const issueDate = currentDateStr;
    const dueDateObj = new Date(targetDate);
    dueDateObj.setDate(dueDateObj.getDate() + settings.default_due_days);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const invoiceNum = generateInvoiceNumber(
      settings.invoice_prefix,
      [...existingInvoices, ...generatedInvoices]
    );

    const items: InvoiceItem[] = [
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        invoice_id: invoiceId,
        item_type: 'PACKAGE',
        description: `${pkg.name} (${pkg.download_speed} ${pkg.speed_unit}) - Periode ${periodStart} s/d ${periodEnd}`,
        quantity: 1,
        unit_price: basePrice,
        discount: discount,
        tax: tax,
        total: total,
      },
    ];

    const newInvoice: Invoice = {
      id: invoiceId,
      customer_id: customer.id,
      subscription_id: sub.id,
      invoice_number: invoiceNum,
      billing_period_start: periodStart,
      billing_period_end: periodEnd,
      issue_date: issueDate,
      due_date: dueDate,
      subtotal: basePrice,
      discount: discount,
      tax: tax,
      late_fee: 0,
      total: total,
      paid_amount: 0,
      status: 'ISSUED',
      sent_at: `${issueDate} 06:00:00`,
      items: items,
      created_at: `${issueDate} 00:30:00`,
    };

    generatedInvoices.push(newInvoice);

    auditLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_name: 'System Scheduler (Cron 00:30)',
      action: 'GENERATE_RECURRING_INVOICES',
      entity_type: 'Invoice',
      entity_id: invoiceNum,
      details: `Invoice dibuat untuk pelanggan ${customer.name} (${sub.username}) total ${formatRupiah(total)}. Idempotency check: PASSED.`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
  }

  const schedulerLog: SchedulerExecution = {
    id: `sch-${Date.now()}`,
    job_name: '00:30 Generate Recurring Invoices',
    run_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: generatedInvoices.length > 0 ? 'SUCCESS' : 'WARNING',
    processed_count: generatedInvoices.length,
    message: `Eksekusi selesai. Dibuat: ${generatedInvoices.length} tagihan baru. Dilewati (sudah ditagih): ${skippedCount}.`,
    details: generatedInvoices.map((i) => i.invoice_number).join(', ') || 'Semua pelanggan aktif sudah memiliki invoice untuk periode ini.',
  };

  return { generatedInvoices, skippedCount, auditLogs, schedulerLog };
}

export interface SuspensionCandidate {
  subscription: Subscription;
  customer: Customer;
  overdueInvoices: Invoice[];
  totalOverdueAmount: number;
  daysOverdueMax: number;
  isExempted: boolean;
  exemptionReason?: string;
}

export function checkSuspensionCandidates(
  subscriptions: Subscription[] = [],
  customers: Customer[] = [],
  invoices: Invoice[] = [],
  gracePeriodDays: number = 3,
  currentDateStr: string = '2026-09-15'
): SuspensionCandidate[] {
  const today = new Date(currentDateStr);
  const candidates: SuspensionCandidate[] = [];
  const safeInvoices = invoices || [];

  for (const sub of (subscriptions || [])) {
    // Only active subscriptions can be considered for suspension
    if (sub.status !== 'ACTIVE') continue;

    const customer = (customers || []).find((c) => c.id === sub.customer_id);
    if (!customer) continue;

    // Find overdue invoices for this subscription
    const overdueInvoices = safeInvoices.filter((inv) => {
      if (inv.subscription_id !== sub.id) return false;
      if (inv.status === 'PAID' || inv.status === 'VOID' || inv.status === 'CANCELLED') return false;

      const due = new Date(inv.due_date);
      // Diff in days
      const diffTime = today.getTime() - due.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

      return diffDays > gracePeriodDays;
    });

    if (overdueInvoices.length > 0) {
      let maxDays = 0;
      let totalAmount = 0;

      for (const inv of overdueInvoices) {
        const due = new Date(inv.due_date);
        const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
        if (diffDays > maxDays) maxDays = diffDays;
        totalAmount += inv.total - inv.paid_amount;
      }

      let isExempted = false;
      let exemptionReason: string | undefined;

      if (sub.manual_hold) {
        isExempted = true;
        exemptionReason = 'Manual Hold aktif (Pengecualian khusus)';
      } else if (customer.status === 'BLACKLISTED') {
        isExempted = false;
      }

      candidates.push({
        subscription: sub,
        customer,
        overdueInvoices,
        totalOverdueAmount: totalAmount,
        daysOverdueMax: maxDays,
        isExempted,
        exemptionReason,
      });
    }
  }

  return candidates;
}
