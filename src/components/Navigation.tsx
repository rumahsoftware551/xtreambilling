import React from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  Receipt,
  CreditCard,
  Wifi,
  Server,
  History,
} from 'lucide-react';

export type NavigationTab =
  | 'DASHBOARD'
  | 'CUSTOMERS'
  | 'REALTIME_QUOTA'
  | 'INVOICES'
  | 'PAYMENTS'
  | 'PACKAGES'
  | 'ROUTERS'
  | 'SCHEDULER_AUDIT';

export type ActiveTab = NavigationTab;

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  customerCount?: number;
  invoiceCount?: number;
  overdueCount?: number;
  sessionCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  customerCount = 0,
  invoiceCount = 0,
  overdueCount = 0,
  sessionCount = 0,
}) => {
  const tabs = [
    {
      id: 'DASHBOARD' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'CUSTOMERS' as NavigationTab,
      label: 'Pelanggan',
      icon: Users,
      badge: customerCount > 0 ? `${customerCount}` : undefined,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'REALTIME_QUOTA' as NavigationTab,
      label: 'Monitoring Kuota & Traffic Live',
      icon: Activity,
      badge: sessionCount > 0 ? `${sessionCount} Online` : undefined,
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800 animate-pulse',
    },
    {
      id: 'INVOICES' as NavigationTab,
      label: 'Penagihan & Invoice',
      icon: Receipt,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : invoiceCount > 0 ? `${invoiceCount}` : undefined,
      badgeColor: overdueCount > 0 ? 'bg-red-950 text-red-300 border-red-800' : 'bg-blue-950 text-blue-300 border-blue-800',
    },
    {
      id: 'PAYMENTS' as NavigationTab,
      label: 'Pembayaran',
      icon: CreditCard,
    },
    {
      id: 'PACKAGES' as NavigationTab,
      label: 'Paket Internet',
      icon: Wifi,
    },
    {
      id: 'ROUTERS' as NavigationTab,
      label: 'Router & MikroTik',
      icon: Server,
    },
    {
      id: 'SCHEDULER_AUDIT' as NavigationTab,
      label: 'Scheduler & Audit',
      icon: History,
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
