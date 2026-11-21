export interface BusinessStatusConfig {
  isOpen: boolean;
  dineInOpen?: boolean;
  deliveryOpen?: boolean;
  pickupOpen?: boolean;
  closeReason?: string;
  resumeTime?: string;
}

const STORAGE_KEY = 'urbanradar_business_statuses_v2';

const DEFAULT_STATUSES: Record<string, BusinessStatusConfig> = {
  'truck-01': { isOpen: true, dineInOpen: true, deliveryOpen: true, pickupOpen: true },
  'truck-02': { isOpen: true, dineInOpen: true, deliveryOpen: true, pickupOpen: true },
  'truck-03': { isOpen: true, dineInOpen: false, deliveryOpen: true, pickupOpen: true },
  'truck-04': { isOpen: false, dineInOpen: false, deliveryOpen: false, pickupOpen: false, closeReason: '设备例行消杀' }
};

let memoryStatuses: Record<string, BusinessStatusConfig> = { ...DEFAULT_STATUSES };

function readAll(): Record<string, BusinessStatusConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, BusinessStatusConfig>;
      memoryStatuses = { ...DEFAULT_STATUSES, ...parsed };
      return memoryStatuses;
    }
  } catch {
    // ignore
  }
  return memoryStatuses;
}

function writeAll(next: Record<string, BusinessStatusConfig>): void {
  memoryStatuses = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('business-status-change', { detail: next }));
  }
}

export function getAllTruckBusinessStatuses(): Record<string, BusinessStatusConfig> {
  return readAll();
}

export function getTruckBusinessStatus(truckId: string): BusinessStatusConfig {
  const all = readAll();
  return all[truckId] || { isOpen: true, dineInOpen: true, deliveryOpen: true, pickupOpen: true };
}

export function toggleTruckOperating(truckId: string, nextIsOpen: boolean): BusinessStatusConfig {
  const all = readAll();
  const prev = all[truckId] || { isOpen: true, dineInOpen: true, deliveryOpen: true, pickupOpen: true };
  const updated: BusinessStatusConfig = { ...prev, isOpen: nextIsOpen };
  writeAll({ ...all, [truckId]: updated });
  return updated;
}

export function toggleTruckChannelOperating(
  truckId: string,
  channel: 'dine_in' | 'delivery' | 'pickup',
  nextVal: boolean
): BusinessStatusConfig {
  const all = readAll();
  const prev = all[truckId] || { isOpen: true, dineInOpen: true, deliveryOpen: true, pickupOpen: true };
  const updated: BusinessStatusConfig = {
    ...prev,
    ...(channel === 'dine_in'
      ? { dineInOpen: nextVal }
      : channel === 'delivery'
      ? { deliveryOpen: nextVal }
      : { pickupOpen: nextVal })
  };
  writeAll({ ...all, [truckId]: updated });
  return updated;
}

export function updateTruckBusinessDetails(
  truckId: string,
  patch: Partial<BusinessStatusConfig>
): BusinessStatusConfig {
  const all = readAll();
  const prev = all[truckId] || { isOpen: true, dineInOpen: true, deliveryOpen: true, pickupOpen: true };
  const updated: BusinessStatusConfig = { ...prev, ...patch };
  writeAll({ ...all, [truckId]: updated });
  return updated;
}
