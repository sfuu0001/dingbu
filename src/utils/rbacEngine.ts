import { MerchantSession } from './staffAndRiderAuthEngine';

export function canAccessMerchantTab(session: MerchantSession | null, tabId: string): boolean {
  if (!session) return true;
  if (session.scope === 'all' || session.role === 'hq_admin') return true;
  if (session.role === 'cashier') {
    return !['finance_settlement', 'franchise_hq'].includes(tabId);
  }
  return true;
}
