export type OrdersColumnsPref = 'auto' | 2 | 3 | 4;
export type ButtonDisplayMode = 'always' | 'icon_only';

export interface WorkspacePrefs {
  buttonDisplayMode: ButtonDisplayMode;
  contentWidth: 'compact' | 'standard' | 'wide';
  contentWidthPercent: number;
  windowSafeMargin: number;
  ordersColumns: OrdersColumnsPref;
  marginFloorPercent: number;
  pinnedTabs?: string[];
  userModified?: boolean;
  source?: 'local' | 'cloud';
  updatedAt?: string;
  voice?: Record<string, unknown>;
}

export const RECOMMENDED_PINNED_TABS = [
  'supply_proofing',
  'orders',
  'pos_cashier',
  'calling_screen',
  'gps',
  'menu_manage',
  'inventory',
  'data_fallback'
];

export const DEFAULT_WORKSPACE_PREFS: WorkspacePrefs = {
  buttonDisplayMode: 'always',
  contentWidth: 'wide',
  contentWidthPercent: 100,
  windowSafeMargin: 0,
  ordersColumns: 'auto',
  marginFloorPercent: 50,
  pinnedTabs: [...RECOMMENDED_PINNED_TABS],
  source: 'local'
};

export const WIDTH_RESISTANCE_ANCHORS = [
  { percent: 60, label: '紧凑' },
  { percent: 75, label: '舒适' },
  { percent: 90, label: '沉浸' },
  { percent: 100, label: '全宽' }
];

export const MARGIN_RESISTANCE_ANCHORS = [
  { px: 0, label: '无边距' },
  { px: 8, label: '微距' },
  { px: 16, label: '标准' },
  { px: 24, label: '宽松' }
];

const PREFS_STORAGE_KEY = 'urbanradar_workspace_prefs_v3';
const CLOUD_STORAGE_KEY = 'urbanradar_workspace_prefs_cloud_mirror_v3';

export function applyResistanceSnap(rawVal: number, threshold = 2): number {
  for (const anchor of WIDTH_RESISTANCE_ANCHORS) {
    if (Math.abs(rawVal - anchor.percent) <= threshold) {
      return anchor.percent;
    }
  }
  return Math.min(100, Math.max(50, rawVal));
}

export function applyMarginResistanceSnap(rawVal: number, threshold = 1): number {
  for (const anchor of MARGIN_RESISTANCE_ANCHORS) {
    if (Math.abs(rawVal - anchor.px) <= threshold) {
      return anchor.px;
    }
  }
  return Math.min(32, Math.max(0, rawVal));
}

export function getDefaultPinnedTabs(availableIds: string[]): string[] {
  const valid = RECOMMENDED_PINNED_TABS.filter((id) => availableIds.includes(id));
  return valid.length > 0 ? valid : availableIds.slice(0, 8);
}

export function loadLocalPrefs(): WorkspacePrefs | null {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_WORKSPACE_PREFS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveLocalPrefs(prefs: WorkspacePrefs): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function getWorkspacePrefsSnapshot(): WorkspacePrefs {
  return loadLocalPrefs() ?? { ...DEFAULT_WORKSPACE_PREFS };
}

export function mergeLocalPrefs(patch: Partial<WorkspacePrefs>): WorkspacePrefs {
  const next = { ...getWorkspacePrefsSnapshot(), ...patch, updatedAt: new Date().toISOString() };
  saveLocalPrefs(next);
  return next;
}

export async function fetchPrefsFromCloud(): Promise<WorkspacePrefs | null> {
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_WORKSPACE_PREFS, ...JSON.parse(raw), source: 'cloud' };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function savePrefsToCloud(prefs: WorkspacePrefs): Promise<boolean> {
  try {
    const payload: WorkspacePrefs = {
      ...prefs,
      source: 'cloud',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(payload));
    saveLocalPrefs(payload);
    return true;
  } catch {
    return false;
  }
}
