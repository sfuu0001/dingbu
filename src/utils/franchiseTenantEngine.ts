import { FranchiseDishPolicy, FranchiseTenantContext } from '../types/franchise';

export const FRANCHISE_TENANT_EVENT = 'urbanradar_franchise_tenant_event';
export const FRANCHISE_POLICY_EVENT = 'urbanradar_franchise_policy_event';

let tenantContext: FranchiseTenantContext = {
  isHqUser: true,
  operatorName: '黑曜石品控中心',
  accessibleTruckIds: ['truck-01', 'truck-02', 'truck-03', 'truck-04'],
  selectedTruckId: 'truck-01',
  tenantId: 'hq-urbanradar'
};

let dishPolicies: FranchiseDishPolicy[] = [
  { id: 'sku-01', dishName: '招牌黑松露和牛汉堡', isHqLocked: true, basePrice: 58, category: '核心爆品' },
  { id: 'sku-02', dishName: '三重芝士流心热狗', isHqLocked: true, basePrice: 36, category: '核心爆品' },
  { id: 'sku-03', dishName: '现萃冰摇海盐柠檬茶', isHqLocked: true, basePrice: 18, category: '招牌饮品' },
  { id: 'sku-04', dishName: '酥脆松露薯条', isHqLocked: false, basePrice: 22, category: '小食加购' }
];

export const globalFranchiseEngine = {
  getContext(): FranchiseTenantContext {
    return tenantContext;
  },
  setContext(partial: Partial<FranchiseTenantContext>): void {
    tenantContext = { ...tenantContext, ...partial };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(FRANCHISE_TENANT_EVENT, { detail: tenantContext }));
    }
  },
  getPolicies(): FranchiseDishPolicy[] {
    return dishPolicies;
  },
  togglePolicyLock(id: string): FranchiseDishPolicy[] {
    dishPolicies = dishPolicies.map((p) => (p.id === id ? { ...p, isHqLocked: !p.isHqLocked } : p));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(FRANCHISE_POLICY_EVENT, { detail: dishPolicies }));
    }
    return dishPolicies;
  },
  switchTruck(truckId: string): void {
    tenantContext = { ...tenantContext, selectedTruckId: truckId };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(FRANCHISE_TENANT_EVENT, { detail: tenantContext }));
    }
  }
};
