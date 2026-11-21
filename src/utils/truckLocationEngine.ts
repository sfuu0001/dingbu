export interface TruckConfigItem {
  id: string;
  name: string;
  shortName?: string;
  address?: string;
  status?: string;
  logo?: string;
  image?: string;
}

export const TRUCK_LOCATION_EVENT = 'urbanradar_truck_location_event';
const STORAGE_KEY = 'urbanradar_truck_configs_v2';

const DEFAULT_TRUCKS: TruckConfigItem[] = [
  {
    id: 'truck-01',
    name: '01号旗舰餐车 · 静安嘉里中心广场',
    shortName: '01号静安旗舰车',
    address: '上海市静安区延安中路1218号南广场',
    status: 'active'
  },
  {
    id: 'truck-02',
    name: '02号快闪餐车 · 徐汇滨江滑板公园',
    shortName: '02号徐汇滨江车',
    address: '上海市徐汇区瑞宁路243号滨江步道',
    status: 'active'
  },
  {
    id: 'truck-03',
    name: '03号夜宵餐车 · 大学路创智天地',
    shortName: '03号大学路夜宵车',
    address: '上海市杨浦区大学路288号街角广场',
    status: 'active'
  },
  {
    id: 'truck-04',
    name: '04号园区餐车 · 张江人工智能岛',
    shortName: '04号张江园区车',
    address: '上海市浦东新区海科路55号中庭',
    status: 'active'
  }
];

let memoryTrucks: TruckConfigItem[] = [...DEFAULT_TRUCKS];

export function getAllTruckConfigs(): TruckConfigItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TruckConfigItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryTrucks = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback to memory
  }
  return memoryTrucks;
}

export function saveAllTruckConfigs(list: TruckConfigItem[]): void {
  memoryTrucks = list;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TRUCK_LOCATION_EVENT, { detail: list }));
  }
}
