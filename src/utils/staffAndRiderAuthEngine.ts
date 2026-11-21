export interface MerchantSession {
  id: string;
  name: string;
  phone: string;
  role: 'hq_admin' | 'store_manager' | 'cashier';
  scope: 'all' | 'store';
  truckId?: string;
  hardwareBound?: boolean;
}

export const DEMO_SESSIONS: MerchantSession[] = [
  {
    id: 'staff-hq-01',
    name: '张伟 (店长)',
    phone: '13800138000',
    role: 'hq_admin',
    scope: 'all',
    truckId: 'truck-01',
    hardwareBound: true
  },
  {
    id: 'staff-store-02',
    name: '李敏 (值班副店)',
    phone: '13922446688',
    role: 'store_manager',
    scope: 'store',
    truckId: 'truck-02',
    hardwareBound: true
  },
  {
    id: 'staff-cashier-03',
    name: '陈晨 (前台收银)',
    phone: '13711223344',
    role: 'cashier',
    scope: 'store',
    truckId: 'truck-01',
    hardwareBound: false
  }
];

const SESSION_KEY = 'urbanradar_merchant_session_v2';

let memorySession: MerchantSession | null = DEMO_SESSIONS[0];

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '138****8000';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 7) {
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
  }
  return phone;
}

export function getMerchantSession(): MerchantSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MerchantSession;
      memorySession = parsed;
      return parsed;
    }
  } catch {
    // ignore storage failures
  }
  return memorySession;
}

export function setMerchantSession(session: MerchantSession | null): void {
  memorySession = session;
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    window.dispatchEvent(new CustomEvent('merchant-session-changed', { detail: session }));
  } catch {
    // ignore
  }
}
