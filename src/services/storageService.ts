import {
  Customer,
  Package,
  Subscription,
  Invoice,
  Payment,
  Router,
  RealtimeSession,
  AuditLog,
  SchedulerExecution,
  SystemSettings,
} from '../types';
import {
  initialCustomers,
  initialPackages,
  initialSubscriptions,
  initialInvoices,
  initialPayments,
  initialRouters,
  initialSessions,
  initialAuditLogs,
  initialSchedulerLogs,
  initialSettings,
} from '../data/initialData';

const KEYS = {
  CUSTOMERS: 'xtream_customers_v1',
  PACKAGES: 'xtream_packages_v1',
  SUBSCRIPTIONS: 'xtream_subscriptions_v1',
  INVOICES: 'xtream_invoices_v1',
  PAYMENTS: 'xtream_payments_v1',
  ROUTERS: 'xtream_routers_v1',
  SESSIONS: 'xtream_sessions_v1',
  AUDIT_LOGS: 'xtream_audit_logs_v1',
  SCHEDULER_LOGS: 'xtream_scheduler_logs_v1',
  SETTINGS: 'xtream_settings_v1',
};

function loadItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    return fallback;
  }
}

function saveItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

export const StorageService = {
  getCustomers: (): Customer[] => loadItem(KEYS.CUSTOMERS, initialCustomers),
  saveCustomers: (data: Customer[]): void => saveItem(KEYS.CUSTOMERS, data),

  getPackages: (): Package[] => loadItem(KEYS.PACKAGES, initialPackages),
  savePackages: (data: Package[]): void => saveItem(KEYS.PACKAGES, data),

  getSubscriptions: (): Subscription[] => loadItem(KEYS.SUBSCRIPTIONS, initialSubscriptions),
  saveSubscriptions: (data: Subscription[]): void => saveItem(KEYS.SUBSCRIPTIONS, data),

  getInvoices: (): Invoice[] => loadItem(KEYS.INVOICES, initialInvoices),
  saveInvoices: (data: Invoice[]): void => saveItem(KEYS.INVOICES, data),

  getPayments: (): Payment[] => loadItem(KEYS.PAYMENTS, initialPayments),
  savePayments: (data: Payment[]): void => saveItem(KEYS.PAYMENTS, data),

  getRouters: (): Router[] => loadItem(KEYS.ROUTERS, initialRouters),
  saveRouters: (data: Router[]): void => saveItem(KEYS.ROUTERS, data),

  getSessions: (): RealtimeSession[] => loadItem(KEYS.SESSIONS, initialSessions),
  saveSessions: (data: RealtimeSession[]): void => saveItem(KEYS.SESSIONS, data),

  getAuditLogs: (): AuditLog[] => loadItem(KEYS.AUDIT_LOGS, initialAuditLogs),
  saveAuditLogs: (data: AuditLog[]): void => saveItem(KEYS.AUDIT_LOGS, data),

  getSchedulerLogs: (): SchedulerExecution[] => loadItem(KEYS.SCHEDULER_LOGS, initialSchedulerLogs),
  saveSchedulerLogs: (data: SchedulerExecution[]): void => saveItem(KEYS.SCHEDULER_LOGS, data),

  getSettings: (): SystemSettings => {
    const loaded = loadItem<Partial<SystemSettings>>(KEYS.SETTINGS, initialSettings);
    return { ...initialSettings, ...(loaded || {}) };
  },
  saveSettings: (data: SystemSettings): void => saveItem(KEYS.SETTINGS, data),

  resetToDefaults: (): void => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
