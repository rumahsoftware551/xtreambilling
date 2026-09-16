/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Customer,
  Subscription,
  Invoice,
  Payment,
  Package,
  Router,
  RealtimeSession,
  SystemSettings,
  AuditLog,
  SchedulerExecution,
} from './types';
import { StorageService } from './services/storageService';
import { generateCustomerCode, generatePaymentCode } from './services/billingService';

// Layout Components
import { Header } from './components/Header';
import { Navigation, NavigationTab } from './components/Navigation';

// View Components
import { DashboardView } from './components/DashboardView';
import { CustomersView } from './components/CustomersView';
import { RealtimeQuotaView } from './components/RealtimeQuotaView';
import { InvoicesView } from './components/InvoicesView';
import { PaymentsView } from './components/PaymentsView';
import { PackagesView } from './components/PackagesView';
import { RoutersView } from './components/RoutersView';
import { SchedulerAuditView } from './components/SchedulerAuditView';

// Modals
import { AutoBillingModal } from './components/AutoBillingModal';
import { SuspensionModal } from './components/SuspensionModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { CustomerModal } from './components/CustomerModal';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { PackageModal } from './components/PackageModal';
import { SettingsModal } from './components/SettingsModal';
import { ManualInvoiceModal } from './components/ManualInvoiceModal';
import { WhatsAppNotificationModal } from './components/WhatsAppNotificationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('DASHBOARD');

  // Core Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [routers, setRouters] = useState<Router[]>([]);
  const [sessions, setSessions] = useState<RealtimeSession[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(StorageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [schedulerLogs, setSchedulerLogs] = useState<SchedulerExecution[]>([]);

  // Modal Visibility States
  const [isAutoBillingOpen, setIsAutoBillingOpen] = useState(false);
  const [isSuspensionOpen, setIsSuspensionOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);
  const [isInvoicePrintOpen, setIsInvoicePrintOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isManualInvoiceOpen, setIsManualInvoiceOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Selected Entities for Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Load from Storage
  useEffect(() => {
    setCustomers(StorageService.getCustomers());
    setSubscriptions(StorageService.getSubscriptions());
    setInvoices(StorageService.getInvoices());
    setPayments(StorageService.getPayments());
    setPackages(StorageService.getPackages());
    setRouters(StorageService.getRouters());
    setSessions(StorageService.getSessions());
    setSettings(StorageService.getSettings());
    setAuditLogs(StorageService.getAuditLogs());
    setSchedulerLogs(StorageService.getSchedulerLogs());
  }, []);

  // Sync to Storage when state changes
  useEffect(() => {
    if (customers.length > 0) StorageService.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    if (subscriptions.length > 0) StorageService.saveSubscriptions(subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    if (invoices.length > 0) StorageService.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    if (payments.length > 0) StorageService.savePayments(payments);
  }, [payments]);

  useEffect(() => {
    if (packages.length > 0) StorageService.savePackages(packages);
  }, [packages]);

  useEffect(() => {
    if (routers.length > 0) StorageService.saveRouters(routers);
  }, [routers]);

  useEffect(() => {
    if (sessions.length > 0) StorageService.saveSessions(sessions);
  }, [sessions]);

  // Handler: Customer Modal Actions
  const handleOpenAddCustomer = () => {
    setSelectedCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsCustomerModalOpen(true);
  };

  const handleViewCustomerDetail = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsCustomerDetailOpen(true);
  };

  const handleSaveCustomer = (customerData: Partial<Customer>, subscriptionData?: any) => {
    if (selectedCustomer) {
      // Edit existing
      const updatedList = customers.map((c) =>
        c.id === selectedCustomer.id ? ({ ...c, ...customerData } as Customer) : c
      );
      setCustomers(updatedList);
      showToast(`Data pelanggan ${customerData.name} berhasil diperbarui.`);
    } else {
      // Create new customer
      const newCustId = `cust-${Date.now()}`;
      const newCustCode = generateCustomerCode(customers.length + 1, '2026-09-15');
      const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newCustomer: Customer = {
        id: newCustId,
        customer_code: newCustCode,
        name: customerData.name || 'Pelanggan Baru',
        phone: customerData.phone || '',
        email: customerData.email,
        identity_number: customerData.identity_number,
        address: customerData.address || { address_line: 'Alamat Pelanggan' },
        status: 'ACTIVE',
        registration_date: '2026-09-15',
        contacts: customerData.contacts || [],
        notes: customerData.notes,
        created_at: nowIso,
        updated_at: nowIso,
      };

      const updatedCustomers = [newCustomer, ...customers];
      setCustomers(updatedCustomers);

      // Create subscription if specified
      if (subscriptionData) {
        const pkg = packages.find((p) => p.id === subscriptionData.package_id) || packages[0];
        const newSub: Subscription = {
          id: `sub-${Date.now()}`,
          customer_id: newCustId,
          package_id: pkg.id,
          router_id: subscriptionData.router_id || (routers[0] ? routers[0].id : 'rtr-1'),
          username: subscriptionData.username || `user_${customers.length + 1}`,
          password_plain: subscriptionData.password || 'net1234',
          billing_cycle: 'MONTHLY',
          billing_day: 1,
          start_date: '2026-09-15',
          next_billing_date: '2026-10-01',
          price: pkg.monthly_price,
          discount: 0,
          status: 'ACTIVE',
          auto_renew: true,
          manual_hold: false,
          quota_used_bytes: 0,
          quota_limit_bytes: pkg.quota_limit_gb ? pkg.quota_limit_gb * 1024 * 1024 * 1024 : undefined,
          created_at: nowIso,
        };
        setSubscriptions([newSub, ...subscriptions]);
      }

      // Add audit log
      const newAudit: AuditLog = {
        id: `audit-${Date.now()}`,
        user_name: 'Admin Billing',
        action: 'CREATE_CUSTOMER',
        entity_type: 'Customer',
        entity_id: newCustId,
        details: `Pendaftaran pelanggan baru ${newCustomer.name} (${newCustCode}) dengan layanan internet.`,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setAuditLogs([newAudit, ...auditLogs]);
      showToast(`Pelanggan baru ${newCustomer.name} berhasil didaftarkan!`);
    }

    setIsCustomerModalOpen(false);
  };

  // Handler: Toggle Suspend Customer / Subscription
  const handleToggleSuspend = (subscriptionId: string) => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return;

    const newStatus = sub.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subscriptionId ? { ...s, status: newStatus } : s))
    );

    // Update customer status too
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === sub.customer_id
          ? { ...c, status: newStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE' }
          : c
      )
    );

    // If suspended, disconnect active session
    if (newStatus === 'SUSPENDED') {
      setSessions((prev) => prev.filter((sess) => sess.username !== sub.username));
    }

    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      user_name: 'Admin Billing',
      action: newStatus === 'SUSPENDED' ? 'ISOLATE_SUBSCRIPTION' : 'REACTIVATE_SUBSCRIPTION',
      entity_type: 'Subscription',
      entity_id: subscriptionId,
      details: `${newStatus === 'SUSPENDED' ? 'Isolir manual' : 'Buka isolir'} akun PPPoE @${sub.username}.`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs([log, ...auditLogs]);
    showToast(
      `Status langganan @${sub.username} berhasil diubah menjadi ${
        newStatus === 'SUSPENDED' ? 'TERISOLIR' : 'AKTIF'
      }.`
    );
  };

  // Handler: Toggle Manual Hold Exemption
  const handleToggleHold = (subscriptionId: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId ? { ...s, manual_hold: !s.manual_hold } : s
      )
    );
    showToast('Status pengecualian manual hold berhasil diperbarui.');
  };

  // Handler: Disconnect / Kick Session
  const handleDisconnectSession = (sessionId: string) => {
    const sess = sessions.find((s) => s.id === sessionId);
    if (!sess) return;

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));

    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      user_name: 'NOC Operator',
      action: 'DISCONNECT_SESSION',
      entity_type: 'Session',
      entity_id: sessionId,
      details: `Kirim RADIUS Disconnect-Request (CoA) ke router untuk user @${sess.username} (IP: ${sess.ip_address}).`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs([log, ...auditLogs]);
    showToast(`Sesi PPPoE @${sess.username} berhasil diputus via RADIUS CoA.`);
  };

  // Handler: Apply Generated Invoices from Auto-Billing Modal
  const handleApplyGeneratedInvoices = (
    newInvoices: Invoice[],
    newAuditLogs: AuditLog[],
    newSchedulerLog: SchedulerExecution
  ) => {
    if (newInvoices.length > 0) {
      setInvoices((prev) => [...newInvoices, ...prev]);
    }
    if (newAuditLogs.length > 0) {
      setAuditLogs((prev) => [...newAuditLogs, ...prev]);
    }
    if (newSchedulerLog) {
      setSchedulerLogs((prev) => [newSchedulerLog, ...prev]);
    }
    showToast(`${newInvoices.length} faktur tagihan otomatis berhasil diterbitkan!`);
  };

  // Handler: Apply Suspensions from Suspension Modal
  const handleApplySuspensions = (
    suspendedSubIds: string[],
    newAuditLogs: AuditLog[],
    newSchedulerLog: SchedulerExecution
  ) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        suspendedSubIds.includes(s.id) ? { ...s, status: 'SUSPENDED' } : s
      )
    );

    // Disconnect matching sessions
    const suspendedUsernames = subscriptions
      .filter((s) => suspendedSubIds.includes(s.id))
      .map((s) => s.username);

    setSessions((prev) => prev.filter((sess) => !suspendedUsernames.includes(sess.username)));

    if (newAuditLogs.length > 0) {
      setAuditLogs((prev) => [...newAuditLogs, ...prev]);
    }
    if (newSchedulerLog) {
      setSchedulerLogs((prev) => [newSchedulerLog, ...prev]);
    }

    showToast(`${suspendedSubIds.length} pelanggan telah berhasil diisolir.`);
    setIsSuspensionOpen(false);
  };

  // Handler: Save Payment (instant verify or pending)
  const handleSavePayment = (paymentData: {
    invoice_id: string;
    customer_id: string;
    amount: number;
    method: any;
    reference_number?: string;
    notes?: string;
    instant_verify: boolean;
  }) => {
    const inv = invoices.find((i) => i.id === paymentData.invoice_id);
    if (!inv) return;

    const paymentId = `pay-${Date.now()}`;
    const paymentCode = generatePaymentCode(payments.length + 1, '2026-09-15');

    const newPayment: Payment = {
      id: paymentId,
      invoice_id: paymentData.invoice_id,
      customer_id: paymentData.customer_id,
      payment_code: paymentCode,
      amount: paymentData.amount,
      payment_date: '2026-09-15',
      method: paymentData.method,
      reference_number: paymentData.reference_number,
      status: paymentData.instant_verify ? 'VERIFIED' : 'PENDING',
      notes: paymentData.notes,
      verified_by: paymentData.instant_verify ? 'Admin Billing (Direct)' : undefined,
      verified_at: paymentData.instant_verify
        ? new Date().toISOString().replace('T', ' ').substring(0, 19)
        : undefined,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setPayments([newPayment, ...payments]);

    // If verified, update invoice paid amount and status
    if (paymentData.instant_verify) {
      const newPaidAmount = inv.paid_amount + paymentData.amount;
      const isFullyPaid = newPaidAmount >= inv.total;

      setInvoices((prev) =>
        prev.map((i) =>
          i.id === inv.id
            ? {
                ...i,
                paid_amount: newPaidAmount,
                status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
              }
            : i
        )
      );

      // If fully paid, restore subscription if it was suspended!
      if (isFullyPaid) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === inv.subscription_id ? { ...s, status: 'ACTIVE' } : s
          )
        );
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === inv.customer_id ? { ...c, status: 'ACTIVE' } : c
          )
        );
      }
    }

    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      user_name: 'Admin Billing',
      action: 'RECORD_PAYMENT',
      entity_type: 'Payment',
      entity_id: paymentId,
      details: `Pencatatan pembayaran ${paymentCode} sebesar Rp ${paymentData.amount.toLocaleString()} untuk faktur ${inv.invoice_number}.`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs([log, ...auditLogs]);

    setIsPaymentModalOpen(false);
    showToast(`Pembayaran ${paymentCode} berhasil dicatat!`);
  };

  // Handler: Verify Pending Payment
  const handleVerifyPayment = (paymentId: string) => {
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay) return;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'VERIFIED',
              verified_by: 'Admin Finance',
              verified_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : p
      )
    );

    const inv = invoices.find((i) => i.id === pay.invoice_id);
    if (inv) {
      const newPaidAmount = inv.paid_amount + pay.amount;
      const isFullyPaid = newPaidAmount >= inv.total;

      setInvoices((prev) =>
        prev.map((i) =>
          i.id === inv.id
            ? {
                ...i,
                paid_amount: newPaidAmount,
                status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
              }
            : i
        )
      );

      if (isFullyPaid) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === inv.subscription_id ? { ...s, status: 'ACTIVE' } : s
          )
        );
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === inv.customer_id ? { ...c, status: 'ACTIVE' } : c
          )
        );
      }
    }

    showToast(`Pembayaran ${pay.payment_code} telah diverifikasi dan disahkan.`);
  };

  // Handler: Void Invoice
  const handleVoidInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: 'VOID' } : i))
    );
    showToast(`Faktur tagihan telah dibatalkan (VOID).`);
  };

  // Handler: Save Package
  const handleSavePackage = (pkgData: Partial<Package>) => {
    if (selectedPackage) {
      setPackages((prev) =>
        prev.map((p) => (p.id === selectedPackage.id ? ({ ...p, ...pkgData } as Package) : p))
      );
      showToast(`Paket internet ${pkgData.name} berhasil diperbarui.`);
    } else {
      const newPkg: Package = {
        id: `pkg-${Date.now()}`,
        code: pkgData.code || 'PKG-NEW',
        name: pkgData.name || 'Paket Internet',
        download_speed: pkgData.download_speed || 20,
        upload_speed: pkgData.upload_speed || 10,
        speed_unit: 'Mbps',
        quota_limit_gb: pkgData.quota_limit_gb,
        monthly_price: pkgData.monthly_price || 200000,
        installation_fee: pkgData.installation_fee || 0,
        connection_type: 'PPPOE',
        prorata_enabled: false,
        status: 'ACTIVE',
        description: pkgData.description,
      };
      setPackages([...packages, newPkg]);
      showToast(`Paket internet ${newPkg.name} berhasil ditambahkan.`);
    }
    setIsPackageModalOpen(false);
  };

  // Handler: Save Manual Invoice
  const handleSaveManualInvoice = (newInv: Invoice) => {
    setInvoices([newInv, ...invoices]);
    setIsManualInvoiceOpen(false);
    showToast(`Faktur ${newInv.invoice_number} berhasil diterbitkan.`);
  };

  // Handler: Trigger Scheduler Job manually
  const handleTriggerJob = (jobName: string) => {
    if (jobName.includes('00:30')) {
      setIsAutoBillingOpen(true);
    } else if (jobName.includes('01:30')) {
      setIsSuspensionOpen(true);
    } else {
      // General job execution
      const newExec: SchedulerExecution = {
        id: `sch-${Date.now()}`,
        job_name: jobName,
        run_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'SUCCESS',
        processed_count: sessions.length,
        message: `Pekerjaan ${jobName} berhasil dieksekusi secara manual.`,
      };
      setSchedulerLogs([newExec, ...schedulerLogs]);
      showToast(`Job ${jobName} sukses dijalankan.`);
    }
  };

  // Router test connection
  const handleTestRouter = (routerId: string) => {
    setRouters((prev) =>
      prev.map((r) =>
        r.id === routerId
          ? {
              ...r,
              last_sync_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
              status: 'ONLINE',
            }
          : r
      )
    );
    showToast('Koneksi RouterOS API berhasil diverifikasi.');
  };

  // Print Invoice Modal Opener
  const handlePrintInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const cust = customers.find((c) => c.id === inv.customer_id) || null;
    setSelectedCustomer(cust);
    setIsInvoicePrintOpen(true);
  };

  // WhatsApp Notification Opener
  const handleSendInvoiceNotification = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const cust = customers.find((c) => c.id === inv.customer_id) || null;
    setSelectedCustomer(cust);
    setIsWhatsAppModalOpen(true);
  };

  // Record Payment for specific invoice
  const handleRecordPaymentForInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPaymentModalOpen(true);
  };

  // Find linked customer, subscription, package for current modals
  const currentInvoiceCustomer = selectedInvoice
    ? customers.find((c) => c.id === selectedInvoice.customer_id) || null
    : selectedCustomer;

  const currentInvoiceSub = selectedInvoice
    ? subscriptions.find((s) => s.id === selectedInvoice.subscription_id) || null
    : selectedCustomer
    ? subscriptions.find((s) => s.customer_id === selectedCustomer.id) || null
    : null;

  const currentInvoicePkg = currentInvoiceSub
    ? packages.find((p) => p.id === currentInvoiceSub.package_id) || null
    : null;

  const currentInvoiceRouter = currentInvoiceSub
    ? routers.find((r) => r.id === currentInvoiceSub.router_id) || null
    : null;

  const currentInvoiceSession = currentInvoiceSub
    ? sessions.find((sess) => sess.username === currentInvoiceSub.username) || null
    : null;

  const currentCustomerInvoices = selectedCustomer
    ? invoices.filter((i) => i.customer_id === selectedCustomer.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-blue-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn text-xs">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        settings={settings}
        activeSessionsCount={sessions.length}
        unpaidInvoicesCount={invoices.filter((i) => i.status === 'OVERDUE' || i.status === 'ISSUED').length}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        customerCount={customers.length}
        invoiceCount={invoices.length}
        overdueCount={invoices.filter((i) => i.status === 'OVERDUE').length}
        sessionCount={sessions.length}
      />

      {/* Primary Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'DASHBOARD' && (
          <DashboardView
            customers={customers}
            subscriptions={subscriptions}
            invoices={invoices}
            payments={payments}
            routers={routers}
            sessions={sessions}
            settings={settings}
            onOpenAutoBilling={() => setIsAutoBillingOpen(true)}
            onRunAutoBilling={() => setIsAutoBillingOpen(true)}
            onOpenSuspension={() => setIsSuspensionOpen(true)}
            onOpenSuspensionModal={() => setIsSuspensionOpen(true)}
            onOpenAddCustomer={handleOpenAddCustomer}
            onOpenRecordPayment={() => {
              setSelectedInvoice(null);
              setIsPaymentModalOpen(true);
            }}
            onNavigateTo={setActiveTab}
            onNavigate={setActiveTab}
            onSyncNetwork={() => {
              setRouters((prev) =>
                prev.map((r) => ({
                  ...r,
                  last_sync_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  status: 'ONLINE',
                }))
              );
              showToast('Semua router gateway & RADIUS berhasil disinkronkan.');
            }}
          />
        )}

        {activeTab === 'CUSTOMERS' && (
          <CustomersView
            customers={customers}
            subscriptions={subscriptions}
            packages={packages}
            invoices={invoices}
            onOpenAddModal={handleOpenAddCustomer}
            onAddCustomer={handleOpenAddCustomer}
            onOpenEditModal={handleOpenEditCustomer}
            onEditCustomer={handleOpenEditCustomer}
            onViewCustomerDetail={handleViewCustomerDetail}
            onToggleSuspend={handleToggleSuspend}
          />
        )}

        {activeTab === 'REALTIME_QUOTA' && (
          <RealtimeQuotaView
            sessions={sessions}
            subscriptions={subscriptions}
            customers={customers}
            packages={packages}
            routers={routers}
            onDisconnectSession={handleDisconnectSession}
            onSyncRadius={() => {
              showToast('Sinkronisasi sesi MikroTik RADIUS Accounting berhasil diperbarui.');
            }}
          />
        )}

        {activeTab === 'INVOICES' && (
          <InvoicesView
            invoices={invoices}
            customers={customers}
            subscriptions={subscriptions}
            settings={settings}
            onOpenAutoBillingModal={() => setIsAutoBillingOpen(true)}
            onOpenSuspensionModal={() => setIsSuspensionOpen(true)}
            onOpenCreateInvoiceModal={() => setIsManualInvoiceOpen(true)}
            onPrintInvoice={handlePrintInvoice}
            onRecordPaymentForInvoice={handleRecordPaymentForInvoice}
            onVoidInvoice={handleVoidInvoice}
            onSendInvoiceNotification={handleSendInvoiceNotification}
          />
        )}

        {activeTab === 'PAYMENTS' && (
          <PaymentsView
            payments={payments}
            customers={customers}
            invoices={invoices}
            onOpenPaymentModal={() => {
              setSelectedInvoice(null);
              setIsPaymentModalOpen(true);
            }}
            onVerifyPayment={handleVerifyPayment}
            onPrintReceipt={(pay) => {
              const inv = invoices.find((i) => i.id === pay.invoice_id);
              if (inv) handlePrintInvoice(inv);
            }}
          />
        )}

        {activeTab === 'PACKAGES' && (
          <PackagesView
            packages={packages}
            onAddPackage={() => {
              setSelectedPackage(null);
              setIsPackageModalOpen(true);
            }}
            onEditPackage={(pkg) => {
              setSelectedPackage(pkg);
              setIsPackageModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ROUTERS' && (
          <RoutersView
            routers={routers}
            settings={settings}
            onTestConnection={handleTestRouter}
            onSyncAllRouters={() => {
              setRouters((prev) =>
                prev.map((r) => ({
                  ...r,
                  last_sync_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  status: 'ONLINE',
                }))
              );
              showToast('Semua router gateway & RADIUS berhasil disinkronkan.');
            }}
          />
        )}

        {activeTab === 'SCHEDULER_AUDIT' && (
          <SchedulerAuditView
            auditLogs={auditLogs}
            schedulerLogs={schedulerLogs}
            onTriggerJob={handleTriggerJob}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-400">{settings.isp_brand}</strong> — {settings.isp_name}. Sistem Billing & Manajemen Kuota ISP.
          </div>
          <div className="flex items-center gap-3">
            <span>FreeRADIUS 3.2.x</span>
            <span>•</span>
            <span>MikroTik RouterOS v7.x API</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">AAA Protected</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AutoBillingModal
        isOpen={isAutoBillingOpen}
        onClose={() => setIsAutoBillingOpen(false)}
        subscriptions={subscriptions}
        packages={packages}
        customers={customers}
        invoices={invoices}
        settings={settings}
        onApplyGeneratedInvoices={handleApplyGeneratedInvoices}
      />

      <SuspensionModal
        isOpen={isSuspensionOpen}
        onClose={() => setIsSuspensionOpen(false)}
        subscriptions={subscriptions}
        customers={customers}
        invoices={invoices}
        sessions={sessions}
        settings={settings}
        onApplySuspensions={handleApplySuspensions}
        onToggleHold={handleToggleHold}
      />

      <InvoicePrintModal
        isOpen={isInvoicePrintOpen}
        onClose={() => setIsInvoicePrintOpen(false)}
        invoice={selectedInvoice}
        customer={currentInvoiceCustomer}
        subscription={currentInvoiceSub}
        pkg={currentInvoicePkg}
        settings={settings}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        existingCustomer={selectedCustomer}
        packages={packages}
        routers={routers}
        customersCount={customers.length}
      />

      <CustomerDetailModal
        isOpen={isCustomerDetailOpen}
        onClose={() => setIsCustomerDetailOpen(false)}
        customer={selectedCustomer}
        subscription={currentInvoiceSub}
        pkg={currentInvoicePkg}
        router={currentInvoiceRouter}
        session={currentInvoiceSession}
        invoices={currentCustomerInvoices}
        onToggleSuspend={handleToggleSuspend}
        onPrintInvoice={handlePrintInvoice}
        onPayInvoice={handleRecordPaymentForInvoice}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoices={invoices}
        customers={customers}
        selectedInvoice={selectedInvoice}
        onSavePayment={handleSavePayment}
      />

      <PackageModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        onSave={handleSavePackage}
        existingPackage={selectedPackage}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          StorageService.saveSettings(newSettings);
          showToast('Pengaturan sistem berhasil disimpan.');
        }}
      />

      <ManualInvoiceModal
        isOpen={isManualInvoiceOpen}
        onClose={() => setIsManualInvoiceOpen(false)}
        customers={customers}
        subscriptions={subscriptions}
        settings={settings}
        onSaveInvoice={handleSaveManualInvoice}
      />

      <WhatsAppNotificationModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        invoice={selectedInvoice}
        customer={currentInvoiceCustomer}
        settings={settings}
      />
    </div>
  );
}
