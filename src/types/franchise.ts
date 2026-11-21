export interface FranchiseTenantContext {
  isHqUser: boolean;
  operatorName: string;
  accessibleTruckIds: string[];
  selectedTruckId?: string;
  tenantId?: string;
}

export interface FranchiseDishPolicy {
  id: string;
  dishName: string;
  isHqLocked: boolean;
  basePrice: number;
  category?: string;
}
