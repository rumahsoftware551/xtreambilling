export type CustomerStatus =
  | 'LEAD'
  | 'PROSPECT'
  | 'INSTALLATION_PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TEMPORARILY_STOPPED'
  | 'TERMINATED'
  | 'BLACKLISTED';

export type ConnectionType =
  | 'PPPOE'
  | 'HOTSPOT'
  | 'STATIC_IP'
  | 'DHCP'
  | 'VOUCHER'
  | 'MANAGED_WIFI';

export type SpeedUnit = 'Kbps' | 'Mbps';

export type BillingCycle = 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'CUSTOM';

export type SubscriptionStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'CANCELLED';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID'
  | 'CANCELLED';

export type InvoiceItemType =
  | 'PACKAGE'
  | 'INSTALLATION'
  | 'DEVICE'
  | 'PENALTY'
  | 'DISCOUNT'
  | 'OTHER';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'QRIS'
  | 'VIRTUAL_ACCOUNT'
  | 'E_WALLET'
  | 'COLLECTOR'
  | 'OTHER';

export type PaymentStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REFUNDED'
  | 'CANCELLED';

export type RouterStatus = 'ACTIVE' | 'INACTIVE' | 'OFFLINE' | 'ERROR';

export type RadiusSyncStatus = 'PENDING' | 'SYNCED' | 'FAILED';

export interface CustomerAddress {
  address_line: string;
  rt?: string;
  rw?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  coordinates?: string;
}

export interface CustomerContact {
  id: string;
  type: 'PHONE' | 'WHATSAPP' | 'EMAIL' | 'OTHER';
  value: string;
  is_primary: boolean;
}

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  phone: string;
  email?: string;
  identity_number?: string;
  status: CustomerStatus;
  registration_date: string;
  activation_date?: string;
  collector_id?: string;
  technician_id?: string;
  notes?: string;
  address: CustomerAddress;
  contacts: CustomerContact[];
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  code: string;
  name: string;
  connection_type: ConnectionType;
  download_speed: number;
  upload_speed: number;
  speed_unit: SpeedUnit;
  radius_profile?: string;
  mikrotik_profile?: string;
  monthly_price: number;
  installation_fee: number;
  quota_limit_gb?: number; // FUP quota in GB (null for unlimited)
  prorata_enabled: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  package_id: string;
  router_id: string;
  username: string; // PPPoE or Hotspot username
  password_plain?: string;
  billing_cycle: BillingCycle;
  billing_day: number; // e.g. 1 to 28
  start_date: string;
  next_billing_date: string;
  price: number;
  discount: number;
  status: SubscriptionStatus;
  auto_renew: boolean;
  manual_hold: boolean; // Exempt from automatic suspension
  quota_used_bytes: number;
  quota_limit_bytes?: number;
  last_sync_at?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_type: InvoiceItemType;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id: string;
  customer_id: string;
  subscription_id: string;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  late_fee: number;
  total: number;
  paid_amount: number;
  status: InvoiceStatus;
  sent_at?: string;
  paid_at?: string;
  items: InvoiceItem[];
  created_at: string;
}

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  invoice_id: string;
  allocated_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  payment_code: string;
  customer_id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  payment_date: string;
  reference_number?: string;
  proof_path?: string;
  status: PaymentStatus;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
}

export interface Router {
  id: string;
  name: string;
  host: string;
  api_port: number;
  username: string;
  location?: string;
  routeros_version: string;
  status: RouterStatus;
  cpu_usage_percent: number;
  memory_free_mb: number;
  uptime: string;
  last_seen_at: string;
  last_sync_at: string;
}

export interface RealtimeSession {
  id: string;
  subscription_id: string;
  customer_id: string;
  username: string;
  customer_name: string;
  router_id: string;
  router_name: string;
  service_type: ConnectionType;
  ip_address: string;
  mac_address: string;
  uptime_seconds: number;
  rx_rate_kbps: number; // Download speed current
  tx_rate_kbps: number; // Upload speed current
  input_bytes: number; // Upload total
  output_bytes: number; // Download total
  total_bytes: number;
  quota_limit_bytes?: number;
  quota_percentage: number;
  is_online: boolean;
  package_name: string;
  max_download_speed: number;
  speed_unit: SpeedUnit;
}

export interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}

export interface SchedulerExecution {
  id: string;
  job_name: string;
  run_at: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  processed_count: number;
  message: string;
  details?: string;
}

export interface SystemSettings {
  isp_name: string;
  isp_brand: string;
  company_address: string;
  phone: string;
  email: string;
  bank_account_name: string;
  bank_name: string;
  bank_account_number: string;
  qris_image_url?: string;
  invoice_prefix: string;
  default_due_days: number;
  grace_period_days: number;
  tax_percentage: number;
  late_fee_amount: number;
  auto_suspension_enabled: boolean;
  dry_run_mode: boolean;
  radius_server_ip: string;
  radius_secret: string;
}
